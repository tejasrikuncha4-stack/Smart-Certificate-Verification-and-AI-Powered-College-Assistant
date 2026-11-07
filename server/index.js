import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { v4 as uuid } from "uuid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;
const dataDir = path.join(__dirname, "data");
const uploadDir = path.join(__dirname, "uploads");
fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(uploadDir, { recursive: true }); 

const dbPath = path.join(dataDir, "db.json");
const seed = {
  users: [
    { id: "u-student", name: "Ananya Sharma", email: "student@codenova.demo", password: "demo123", role: "student" },
    { id: "u-hr", name: "Priya HR", email: "hr@codenova.demo", password: "demo123", role: "hr" },
    { id: "u-employer", name: "Nimbus Employer", email: "employer@codenova.demo", password: "demo123", role: "employer" },
    { id: "u-admin", name: "CODENOVA Admin", email: "admin@codenova.demo", password: "demo123", role: "admin" }
  ],
  institutions: [
    { id: "inst-001", name: "Bapatla Women's Engineering College", code: "BWEC", university: "JNTUK", records: [
      { studentName: "Ananya Sharma", rollNumber: "22CSEAI001", qualification: "B.Tech CSE AIML", certificateId: "BWEC-2026-001" }
    ]},
    { id: "inst-002", name: "Andhra University", code: "AU", university: "Andhra University", records: [] }
  ],
  certificates: [],
  auditLogs: []
};
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify(seed, null, 2));
const readDB = () => JSON.parse(fs.readFileSync(dbPath, "utf8"));
const writeDB = (db) => fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const ok = ["application/pdf", "image/png", "image/jpeg"].includes(file.mimetype);
    cb(ok ? null : new Error("Only PDF, PNG and JPG files are allowed."), ok);
  }
});

app.get("/api/health", (_, res) => res.json({ ok: true, name: "CODENOVA API" }));
app.get("/api/stats", (_, res) => {
  const db = readDB();
  const all = db.certificates;
  res.json({
    total: all.length,
    verified: all.filter(x => x.status === "VERIFIED").length,
    invalid: all.filter(x => x.status === "INVALID").length,
    review: all.filter(x => x.status === "NEEDS_REVIEW").length,
    institutions: db.institutions.length
  });
});
app.get("/api/institutions", (_, res) => res.json(readDB().institutions.map(({ records, ...x }) => x)));
app.post("/api/login", (req, res) => {
  const { email, password, role } = req.body || {};
  const user = readDB().users.find(u => u.email.toLowerCase() === String(email || "").toLowerCase() && u.password === password && (!role || u.role === role));
  if (!user) return res.status(401).json({ error: "Invalid login details or role." });
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser, demoMode: true });
});
app.get("/api/certificates", (req, res) => {
  const db = readDB();
  const userId = req.query.userId;
  res.json(db.certificates.filter(c => !userId || c.userId === userId).sort((a,b) => b.createdAt.localeCompare(a.createdAt)));
});
app.post("/api/certificates", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Please select a PDF or image." });
  const { userId, studentName, institution, category, certificateId, rollNumber, qualification, extractedText = "" } = req.body;
  const db = readDB();
  const hash = crypto.createHash("sha256").update(fs.readFileSync(req.file.path)).digest("hex");
  const duplicate = db.certificates.find(c => c.sha256 === hash);
  if (duplicate) {
    fs.unlinkSync(req.file.path);
    return res.status(409).json({ error: "This exact document was already uploaded.", duplicateId: duplicate.id });
  }
  const issuer = db.institutions.find(i => i.name.toLowerCase() === String(institution || "").trim().toLowerCase());
  let status = "NEEDS_REVIEW";
  let findings = ["No authoritative issuer confirmation has been received."];
  let source = "Local demo institution directory";
  if (issuer) {
    const match = issuer.records.find(r =>
      r.studentName.toLowerCase() === String(studentName || "").trim().toLowerCase() &&
      (!certificateId || r.certificateId === certificateId.trim()) &&
      (!rollNumber || r.rollNumber.toLowerCase() === rollNumber.trim().toLowerCase())
    );
    if (match) {
      status = "VERIFIED";
      findings = ["Student name and supplied credential identifiers match a seeded demo institution record."];
      source = "CODENOVA seeded demo institution record";
    } else if (issuer.records.length > 0) {
      status = "NEEDS_REVIEW";
      findings = ["The supplied details did not match the available demo record. This is not sufficient by itself to declare the certificate invalid."];
    } else {
      findings = ["Institution is listed, but no student record is available in the local demo database."];
    }
  }
  const suspicious = [];
  if (!studentName?.trim()) suspicious.push("Student name was not provided.");
  if (!institution?.trim()) suspicious.push("Institution name was not provided.");
  if (!certificateId?.trim()) suspicious.push("Certificate ID is missing.");
  if (suspicious.length) findings = [...findings, ...suspicious];
  const cert = {
    id: uuid(), userId: userId || "u-student", studentName: studentName || "Not provided",
    institution: institution || "Not provided", category: category || "Academic",
    certificateId: certificateId || "", rollNumber: rollNumber || "",
    qualification: qualification || "", originalName: req.file.originalname,
    fileName: path.basename(req.file.path), mimeType: req.file.mimetype, sha256: hash,
    extractedText: String(extractedText).slice(0, 12000), status, findings, source,
    riskScore: status === "VERIFIED" ? 5 : Math.min(95, 35 + suspicious.length * 15),
    createdAt: new Date().toISOString()
  };
  db.certificates.push(cert);
  db.auditLogs.push({ id: uuid(), action: "CERTIFICATE_UPLOADED", certificateId: cert.id, at: cert.createdAt });
  writeDB(db);
  res.status(201).json(cert);
});
app.get("/api/certificates/:id", (req, res) => {
  const cert = readDB().certificates.find(c => c.id === req.params.id);
  if (!cert) return res.status(404).json({ error: "Certificate not found." });
  res.json(cert);
});
app.post("/api/certificates/:id/review", (req, res) => {
  const db = readDB();
  const cert = db.certificates.find(c => c.id === req.params.id);
  if (!cert) return res.status(404).json({ error: "Certificate not found." });
  const { status, note } = req.body || {};
  if (!["VERIFIED", "INVALID", "NEEDS_REVIEW"].includes(status)) return res.status(400).json({ error: "Invalid status." });
  cert.status = status;
  cert.findings = [...cert.findings, `Authorized demo admin review: ${note || "No additional note."}`];
  cert.reviewedAt = new Date().toISOString();
  writeDB(db);
  res.json(cert);
});
app.post("/api/institutions", (req, res) => {
  const db = readDB();
  const { name, code, university } = req.body || {};
  if (!name?.trim() || !code?.trim()) return res.status(400).json({ error: "Institution name and code are required." });
  const item = { id: uuid(), name: name.trim(), code: code.trim(), university: university || "", records: [] };
  db.institutions.push(item); writeDB(db);
  res.status(201).json({ id: item.id, name: item.name, code: item.code, university: item.university });
});
app.use((err, _, res, __) => res.status(400).json({ error: err.message || "Request failed." }));
app.listen(PORT, () => console.log(`CODENOVA API running at http://localhost:${PORT}`));
