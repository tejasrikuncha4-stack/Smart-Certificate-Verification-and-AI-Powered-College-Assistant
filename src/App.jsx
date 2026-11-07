import React, { useEffect, useMemo, useRef, useState } from "react";
import { ShieldCheck, LayoutDashboard, FileCheck2, Upload, Users, Building2, Settings, Search, Bell, LogOut, Menu, X, ArrowUpRight, CheckCircle2, Clock3, AlertTriangle, FileText, Sparkles, ChevronRight, Download, UserRound, BriefcaseBusiness, ScanText, Network, LockKeyhole, Plus, Eye, Camera } from "lucide-react";
import Tesseract from "tesseract.js";
const API = "/api";
const demoUsers = [
  { email:"student@codenova.demo", password:"demo123", role:"student", name:"Ananya Sharma" },
  { email:"hr@codenova.demo", password:"demo123", role:"hr", name:"Priya HR" },
  { email:"employer@codenova.demo", password:"demo123", role:"employer", name:"Nimbus Employer" },
  { email:"admin@codenova.demo", password:"demo123", role:"admin", name:"CODENOVA Admin" }
];
const statusLabel = s => s === "VERIFIED" ? "Verified" : s === "INVALID" ? "Invalid" : "Needs review";
const Status = ({value}) => <span className={`status ${value?.toLowerCase()}`}>{value === "VERIFIED" ? <CheckCircle2 size={13}/> : value === "INVALID" ? <AlertTriangle size={13}/> : <Clock3 size={13}/>} {statusLabel(value)}</span>;
const fmt = d => new Date(d).toLocaleDateString();

export default function App() {
  const [user,setUser] = useState(null);
  const [page,setPage] = useState("Overview");
  const [certs,setCerts] = useState([]);
  const [stats,setStats] = useState({total:0,verified:0,invalid:0,review:0,institutions:0});
  const [institutions,setInstitutions] = useState([]);
  const [mobile,setMobile] = useState(false);
  const [selected,setSelected] = useState(null);
  const [notice,setNotice] = useState("");
  const [search,setSearch] = useState("");
  const [loginRole,setLoginRole] = useState("student");

  const refresh = async () => {
    try {
      const [c,s,i] = await Promise.all([fetch(`${API}/certificates`).then(r=>r.json()),fetch(`${API}/stats`).then(r=>r.json()),fetch(`${API}/institutions`).then(r=>r.json())]);
      setCerts(c); setStats(s); setInstitutions(i);
    } catch { setNotice("Cannot reach the CODENOVA server. Start it with npm run dev."); }
  };
  useEffect(()=>{ refresh(); },[]);
  const nav = [
    ["Overview",LayoutDashboard],["Verify Certificate",FileCheck2],["My Documents",FileText],
    ["Candidates",Users],["Institutions",Building2],["Evidence Graph",Network],["Settings",Settings]
  ];
  const visibleCerts = useMemo(()=>certs.filter(c => [c.studentName,c.institution,c.category,c.certificateId].join(" ").toLowerCase().includes(search.toLowerCase())),[certs,search]);

  const login = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      const r = await fetch(`${API}/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:fd.get("email"),password:fd.get("password"),role:loginRole})});
      const d = await r.json(); if(!r.ok) throw new Error(d.error);
      setUser(d.user); setPage("Overview"); setNotice("Welcome to CODENOVA demo workspace."); refresh();
    } catch(err) { setNotice(err.message); }
  };
  const logout = ()=>{setUser(null);setSelected(null);setNotice("");};
  const uploadCertificate = async (payload) => {
    const r = await fetch(`${API}/certificates`,{method:"POST",body:payload});
    const d = await r.json(); if(!r.ok) throw new Error(d.error);
    await refresh(); setSelected(d); setPage("Verification Report"); setNotice("Document uploaded and analyzed.");
  };
  const review = async (id,status) => {
    const r = await fetch(`${API}/certificates/${id}/review`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({status,note:"Reviewed in CODENOVA demo workspace."})});
    const d=await r.json(); if(!r.ok) return setNotice(d.error);
    await refresh(); setSelected(d); setNotice("Review status updated.");
  };

  if (!user) return <Login onSubmit={login} role={loginRole} setRole={setLoginRole} notice={notice}/>;

  return <div className="app-shell">
    <aside className={`sidebar ${mobile?"show":""}`}>
      <div className="brand"><div className="brand-mark"><ShieldCheck size={22}/></div><div><b>CODENOVA</b><small>TRUST EVERY CREDENTIAL</small></div><button className="mobile-close" onClick={()=>setMobile(false)}><X/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{nav.map(([label,Icon])=><button key={label} className={`nav-item ${page===label?"active":""}`} onClick={()=>{setPage(label);setSelected(null);setMobile(false)}}><Icon size={18}/><span>{label}</span>{label==="Verify Certificate"&&<span className="nav-dot"/>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><Sparkles size={18}/><b>AI credential insights</b><p>Turn documents into trusted evidence.</p></div><div className="user-mini"><div className="avatar">{user.name.slice(0,1)}</div><div className="user-meta"><b>{user.name}</b><small>{user.role.toUpperCase()}</small></div><button title="Log out" onClick={logout}><LogOut size={17}/></button></div></div>
    </aside>
    <main className="main">
      <header className="topbar"><button className="hamburger" onClick={()=>setMobile(true)}><Menu/></button><div className="crumb">Workspace <ChevronRight size={14}/> <b>{page}</b></div><div className="top-actions"><span className="demo-pill"><span/> DEMO MODE</span><button className="icon-btn"><Bell size={18}/></button><div className="avatar small">{user.name.slice(0,1)}</div></div></header>
      <div className="content">
        {notice && <div className="notice" onClick={()=>setNotice("")}>{notice}<button>×</button></div>}
        {page==="Overview" && <Overview user={user} stats={stats} certs={certs} setPage={setPage} setSelected={setSelected}/>}
        {page==="Verify Certificate" && <UploadPage user={user} institutions={institutions} onUpload={uploadCertificate}/>}
        {page==="My Documents" && <Documents certs={visibleCerts} search={search} setSearch={setSearch} setSelected={setSelected} setPage={setPage}/>}
        {page==="Candidates" && <Candidates certs={visibleCerts} search={search} setSearch={setSearch} setSelected={setSelected} setPage={setPage}/>}
        {page==="Institutions" && <Institutions institutions={institutions} refresh={refresh} setNotice={setNotice}/>}
        {page==="Evidence Graph" && <Graph certs={certs}/>}
        {page==="Settings" && <SettingsPage user={user}/>}
        {page==="Verification Report" && selected && <Report cert={selected} review={review} user={user} onBack={()=>setPage("My Documents")}/>}
      </div>
    </main>
  </div>;
}

function Login({onSubmit,role,setRole,notice}) {
 return <div className="login-page"><div className="login-left"><div className="brand light"><div className="brand-mark"><ShieldCheck/></div><div><b>CODENOVA</b><small>TRUST EVERY CREDENTIAL</small></div></div><div className="login-hero"><span className="eyebrow"><Sparkles size={14}/> AI-POWERED TRUST PLATFORM</span><h1>Every achievement<br/><em>deserves to be trusted.</em></h1><p>Verify academic, professional and employment credentials with intelligent document analysis and evidence-led workflows.</p><div className="login-proof"><span><ShieldCheck/> Evidence-led verification</span><span><ScanText/> Smart document extraction</span></div></div><div className="login-foot">© 2026 CODENOVA · Credential intelligence platform</div></div><div className="login-right"><form className="login-card" onSubmit={onSubmit}><div className="card-icon"><LockKeyhole/></div><span className="eyebrow">WELCOME BACK</span><h2>Sign in to CODENOVA</h2><p>Choose your workspace and continue securely.</p><label>Workspace role</label><div className="role-select">{["student","hr","employer","admin"].map(r=><button type="button" className={role===r?"chosen":""} onClick={()=>setRole(r)}>{r==="hr"?"HR":r[0].toUpperCase()+r.slice(1)}</button>)}</div><label>Email address</label><input key={role} name="email" type="email" defaultValue={`${role==="hr"?"hr":role==="employer"?"employer":role==="admin"?"admin":"student"}@codenova.demo`} required/><label>Password</label><input name="password" type="password" defaultValue="demo123" required/><button className="primary full">Sign in <ArrowUpRight size={17}/></button>{notice&&<div className="form-error">{notice}</div>}<div className="demo-note"><b>Demo access</b><br/>Select a role above. Password for all demo accounts: <code>demo123</code></div></form></div></div>
}

function PageHeading({eyebrow,title,desc,action}) { return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{desc}</p></div>{action}</div>; }
function Overview({user,stats,certs,setPage,setSelected}) {
 const recent=certs.slice(0,5);
 return <><PageHeading eyebrow={`${user.role.toUpperCase()} WORKSPACE`} title={`Good to see you, ${user.name.split(" ")[0]}`} desc="Here is your credential verification overview." action={<button className="primary" onClick={()=>setPage("Verify Certificate")}><Plus size={17}/> New verification</button>}/>
 <div className="hero-banner"><div><span className="banner-tag"><Sparkles size={13}/> CREDENTIAL INTELLIGENCE</span><h2>Make every credential<br/>count with confidence.</h2><p>One workspace for document evidence, issuer checks and transparent verification.</p><button className="banner-btn" onClick={()=>setPage("Verify Certificate")}>Verify a certificate <ArrowUpRight size={16}/></button></div><div className="banner-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="shield-big"><ShieldCheck size={72}/></div><div className="float-card"><CheckCircle2 size={16}/> Evidence mapped</div></div></div>
 <div className="stat-grid"><Stat icon={FileText} label="Total documents" value={stats.total} tone="blue"/><Stat icon={CheckCircle2} label="Verified" value={stats.verified} tone="green"/><Stat icon={Clock3} label="Needs review" value={stats.review} tone="amber"/><Stat icon={Building2} label="Institutions" value={stats.institutions} tone="purple"/></div>
 <div className="section-row"><div><h2>Recent documents</h2><p>Latest credential activity across your workspace.</p></div><button className="text-btn" onClick={()=>setPage("My Documents")}>View all <ArrowUpRight size={15}/></button></div>
 <div className="table-card"><table><thead><tr><th>DOCUMENT</th><th>STUDENT</th><th>INSTITUTION</th><th>STATUS</th><th>DATE</th><th></th></tr></thead><tbody>{recent.length?recent.map(c=><tr key={c.id}><td><div className="doc-cell"><div className="doc-icon"><FileText size={17}/></div><div><b>{c.category}</b><small>{c.originalName}</small></div></div></td><td>{c.studentName}</td><td>{c.institution}</td><td><Status value={c.status}/></td><td>{fmt(c.createdAt)}</td><td><button className="row-action" onClick={()=>{setSelected(c);setPage("Verification Report")}}><Eye size={16}/></button></td></tr>):<tr><td colSpan="6"><Empty text="No documents yet. Upload a certificate to begin verification."/></td></tr>}</tbody></table></div>
 <div className="disclaimer"><ShieldCheck size={17}/><span><b>Evidence-first verification.</b> AI indicators are decision support, not proof of fraud. Issuer confirmation is required for authoritative results.</span></div></>;
}
function Stat({icon:Icon,label,value,tone}) {return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={19}/></div><div><small>{label}</small><strong>{value}</strong></div><ArrowUpRight className="stat-arrow" size={16}/></div>}
function UploadPage({user,institutions,onUpload}) {
 const [file,setFile]=useState(null),[busy,setBusy]=useState(false),[ocr,setOcr]=useState(false),[form,setForm]=useState({studentName:user.role==="student"?user.name:"",institution:"",category:"Academic",certificateId:"",rollNumber:"",qualification:""}),[ocrText,setOcrText]=useState("");
 const videoRef = useRef(null);
const streamRef = useRef(null);
const [cameraOpen, setCameraOpen] = useState(false);
const [cameraError, setCameraError] = useState("");

useEffect(() => {
  if (cameraOpen && videoRef.current && streamRef.current) {
    videoRef.current.srcObject = streamRef.current;
  }
}, [cameraOpen]);

useEffect(() => {
  return () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
  };
}, []);

const startCamera = async () => {
  try {
    setCameraError("");

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false
    });

    streamRef.current = stream;
    setCameraOpen(true);
  } catch (error) {
    setCameraError(
      "Camera access unavailable. Please allow camera permission or upload an image."
    );
  }
};

const stopCamera = () => {
  streamRef.current?.getTracks().forEach(track => track.stop());
  streamRef.current = null;
  setCameraOpen(false);
};

const capturePhoto = () => {
  const video = videoRef.current;
  if (!video || !video.videoWidth) return;

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0);

  canvas.toBlob(blob => {
    if (!blob) {
      setCameraError("Could not capture image. Please try again.");
      return;
    }

    const imageFile = new File(
      [blob],
      `codenova-scan-${Date.now()}.jpg`,
      { type: "image/jpeg" }
    );

    setFile(imageFile);
    setOcrText("");
    stopCamera();
  }, "image/jpeg", 0.92);
};
 const change=(k,v)=>setForm(p=>({...p,[k]:v}));
 const runOCR=async()=>{if(!file)return;setOcr(true);try{if(file.type.startsWith("image/")){const result=await Tesseract.recognize(file,"eng");setOcrText(result.data.text);const t=result.data.text;const id=t.match(/(?:certificate|cert\\.?\\s*id|id)\\s*[:#-]?\\s*([A-Z0-9/-]{5,})/i);if(id&&!form.certificateId)change("certificateId",id[1]);}else{setOcrText("PDF selected. This starter build stores the PDF and lets you enter details manually. Add a PDF text extraction service for automated PDF OCR.");}}catch(e){setOcrText("OCR could not read this file. Please enter details manually.");}setOcr(false);};
 const submit=async e=>{e.preventDefault();if(!file)return alert("Please select a certificate file.");setBusy(true);try{const fd=new FormData();Object.entries(form).forEach(([k,v])=>fd.append(k,v));fd.append("userId",user.id);fd.append("file",file);fd.append("extractedText",ocrText);await onUpload(fd);}catch(e){alert(e.message);}finally{setBusy(false);}};
 return <><PageHeading eyebrow="DOCUMENT INTAKE" title="Verify a certificate" desc="Upload a credential, review extracted details and check available issuer evidence."/><div className="upload-layout"><form className="form-card" onSubmit={submit}><div className="form-section-title"><span>01</span><div><b>Upload document</b><small>PDF, JPG or PNG · Maximum 10 MB</small></div></div><label className="dropzone">{file?<><div className="upload-symbol"><FileCheck2/></div><b>{file.name}</b><small>{(file.size/1024/1024).toFixed(2)} MB · Ready to process</small></>:<><div className="upload-symbol"><Upload/></div><b>Drop your certificate here</b><small>or click to browse from your device</small><span className="browse-btn">Browse files</span></>}<input type="file" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" onChange={e=>setFile(e.target.files[0])}/></label>{file&&<button type="button" className="secondary full" onClick={runOCR}><ScanText size={17}/>{ocr?"Reading document…":"Extract text with OCR"}</button>}{ocrText&&<div className="ocr-preview"><b>OCR / extraction notes</b><p>{ocrText.slice(0,450)}{ocrText.length>450?"…":""}</p></div>}
 <div className="form-section-title space-top"><span>02</span><div><b>Credential information</b><small>Confirm details before submitting.</small></div></div><div className="input-grid"><Field label="Student / candidate name" value={form.studentName} onChange={v=>change("studentName",v)} required/><Field label="Certificate ID" value={form.certificateId} onChange={v=>change("certificateId",v)}/><div className="field"><label>Institution</label><input list="institutions" value={form.institution} onChange={e=>change("institution",e.target.value)} placeholder="Enter issuing institution" required/><datalist id="institutions">{institutions.map(i=><option key={i.id} value={i.name}/>)}</datalist></div><Field label="Roll / registration number" value={form.rollNumber} onChange={v=>change("rollNumber",v)}/><div className="field"><label>Certificate category</label><select value={form.category} onChange={e=>change("category",e.target.value)}>{["Academic","Internship","Training","Professional Certification","Employment"].map(x=><option>{x}</option>)}</select></div><Field label="Course / qualification" value={form.qualification} onChange={v=>change("qualification",v)}/></div><button className="primary full submit-btn" disabled={busy}>{busy?"Submitting…":"Submit for verification"} <ArrowUpRight size={17}/></button><p className="privacy-line"><LockKeyhole size={13}/> Documents are stored in this local demo workspace.</p></form>
 <aside className="process-card"><span className="eyebrow">HOW IT WORKS</span><h3>From document to evidence.</h3><div className="process-step"><div className="step-icon"><Upload/></div><div><b>Upload credential</b><p>Add a PDF or image of the certificate.</p></div></div><div className="process-line"/><div className="process-step"><div className="step-icon"><ScanText/></div><div><b>Extract information</b><p>OCR helps capture document text for review.</p></div></div><div className="process-line"/><div className="process-step"><div className="step-icon"><ShieldCheck/></div><div><b>Check available evidence</b><p>Compare against configured local issuer records.</p></div></div><div className="process-line"/><div className="process-step"><div className="step-icon"><FileCheck2/></div><div><b>View result</b><p>See verified, invalid or needs-review status.</p></div></div><div className="warning-note"><AlertTriangle size={16}/><p>External college and DigiLocker access is not configured by default. Missing records are marked for review, not assumed fake.</p></div></aside></div></>;
}
function Field({label,value,onChange,required}) {return <div className="field"><label>{label}</label><input value={value} onChange={e=>onChange(e.target.value)} required={required} placeholder={`Enter ${label.toLowerCase()}`}/></div>}
function Documents({certs,search,setSearch,setSelected,setPage}) {return <><PageHeading eyebrow="CREDENTIAL LIBRARY" title="My documents" desc="Review uploaded certificates and their current verification status." action={<button className="primary" onClick={()=>setPage("Verify Certificate")}><Plus size={17}/> Upload document</button>}/><SearchBar value={search} setValue={setSearch}/><div className="document-grid">{certs.map(c=><div className="document-card" key={c.id}><div className="document-top"><div className="doc-icon large"><FileText/></div><Status value={c.status}/></div><h3>{c.category} certificate</h3><p>{c.originalName}</p><div className="document-meta"><span>{c.studentName}</span><span>{fmt(c.createdAt)}</span></div><button className="secondary full" onClick={()=>{setSelected(c);setPage("Verification Report")}}>View verification report <ArrowUpRight size={15}/></button></div>)}{!certs.length&&<Empty text="No certificates uploaded yet."/>}</div></>}
function SearchBar({value,setValue}) {return <div className="searchbar"><Search size={18}/><input value={value} onChange={e=>setValue(e.target.value)} placeholder="Search candidate, institution or certificate ID…"/></div>}
function Candidates({certs,search,setSearch,setSelected,setPage}) {return <><PageHeading eyebrow="TALENT VERIFICATION" title="Candidate records" desc="Search credential submissions and review evidence for each candidate."/><SearchBar value={search} setValue={setSearch}/><div className="table-card"><table><thead><tr><th>CANDIDATE</th><th>CREDENTIAL</th><th>INSTITUTION</th><th>STATUS</th><th></th></tr></thead><tbody>{certs.map(c=><tr><td><b>{c.studentName}</b></td><td>{c.category}</td><td>{c.institution}</td><td><Status value={c.status}/></td><td><button className="row-action" onClick={()=>{setSelected(c);setPage("Verification Report")}}><Eye/></button></td></tr>)}</tbody></table>{!certs.length&&<Empty text="No candidate records available yet."/>}</div></>}
function Institutions({institutions,refresh,setNotice}) {const [name,setName]=useState(""),[code,setCode]=useState(""),[university,setUniversity]=useState("");const add=async e=>{e.preventDefault();const r=await fetch(`${API}/institutions`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,code,university})});const d=await r.json();if(!r.ok)return setNotice(d.error);setName("");setCode("");setUniversity("");refresh();setNotice("Institution added to local directory.");};return <><PageHeading eyebrow="ISSUER DIRECTORY" title="Institutions" desc="Manage the local demo directory. These records are not live college database connections."/><form className="inline-add" onSubmit={add}><input value={name} onChange={e=>setName(e.target.value)} placeholder="Institution name" required/><input value={code} onChange={e=>setCode(e.target.value)} placeholder="Institution code" required/><input value={university} onChange={e=>setUniversity(e.target.value)} placeholder="Affiliated university"/><button className="primary"><Plus size={16}/> Add</button></form><div className="institution-grid">{institutions.map(i=><div className="institution-card"><div className="institution-logo"><Building2/></div><div><b>{i.name}</b><p>{i.university||"University not specified"}</p><small>Institution code: {i.code}</small></div><span className="directory-tag">LOCAL DIRECTORY</span></div>)}</div></>}
function Graph({certs}) {return <><PageHeading eyebrow="RELATIONSHIP INTELLIGENCE" title="Credential evidence graph" desc="A lightweight view of how candidate identity and submitted credentials relate."/><div className="graph-card"><div className="graph-center"><UserRound/><b>Candidate identity</b><small>Credential owner</small></div><div className="graph-branches">{["Academic records","Internship","Training","Professional skills","Employment"].map((x,i)=><div className="graph-node"><div className="node-icon"><FileCheck2/></div><b>{x}</b><small>{certs.filter(c=>c.category.toLowerCase().includes(x.split(" ")[0].toLowerCase())).length} linked records</small></div>)}</div><div className="graph-caption"><Network size={16}/> Relationship map preview · records are linked after upload</div></div><div className="disclaimer"><AlertTriangle size={17}/><span>Graph relationships are organizational aids. A connection does not independently prove that a credential is authentic.</span></div></>}
function SettingsPage({user}) {return <><PageHeading eyebrow="PREFERENCES" title="Workspace settings" desc="Account and environment information for this local CODENOVA instance."/><div className="settings-card"><div className="settings-row"><div className="avatar">{user.name[0]}</div><div><b>{user.name}</b><p>{user.email}</p></div><span className="demo-pill">DEMO ACCOUNT</span></div><div className="settings-row"><div><b>External integrations</b><p>DigiLocker and live institution APIs require authorized credentials and partner access.</p></div><span className="status needs_review">Not configured</span></div><div className="settings-row"><div><b>Data storage</b><p>Local JSON database and uploaded files on this machine.</p></div><span className="status verified">Local</span></div></div></>}
function Report({cert,review,user,onBack}) {return <><PageHeading eyebrow="VERIFICATION REPORT" title="Credential assessment" desc={`Reference ${cert.id.slice(0,8).toUpperCase()} · Submitted ${fmt(cert.createdAt)}`} action={<button className="secondary" onClick={onBack}>Back to documents</button>}/><div className="report-layout"><div className="report-main"><div className="result-card"><div className={`result-symbol ${cert.status.toLowerCase()}`}>{cert.status==="VERIFIED"?<CheckCircle2/>:cert.status==="INVALID"?<AlertTriangle/>:<Clock3/>}</div><div><span className="eyebrow">CURRENT RESULT</span><h2>{statusLabel(cert.status).toUpperCase()}</h2><p>{cert.status==="VERIFIED"?"Details matched a seeded local demo issuer record.":cert.status==="INVALID"?"An authorized reviewer marked this record invalid.":"There is not enough authoritative evidence to confirm this credential."}</p></div><Status value={cert.status}/></div><div className="report-section"><h3>Credential details</h3><div className="detail-grid">{[["Candidate",cert.studentName],["Institution",cert.institution],["Category",cert.category],["Certificate ID",cert.certificateId||"Not supplied"],["Roll number",cert.rollNumber||"Not supplied"],["Qualification",cert.qualification||"Not supplied"],["File",cert.originalName],["SHA-256",cert.sha256?.slice(0,24)+"…"]].map(([a,b])=><div><small>{a}</small><b>{b}</b></div>)}</div></div><div className="report-section"><h3>Evidence and findings</h3><div className="evidence-source"><ShieldCheck size={17}/><div><b>{cert.source}</b><small>Evidence source</small></div></div>{cert.findings.map(f=><div className="finding"><AlertTriangle size={16}/>{f}</div>)}</div></div><aside className="report-side"><div className="risk-card"><span className="eyebrow">INDICATIVE RISK SCORE</span><strong>{cert.riskScore}<small>/100</small></strong><div className="risk-track"><span style={{width:`${cert.riskScore}%`}}/></div><p>Rule-based demo indicator. Not a probability of fraud.</p></div>{user.role==="admin"&&<div className="review-card"><h3>Admin review</h3><p>Use only when you have independent, authoritative evidence.</p><button className="review-yes" onClick={()=>review(cert.id,"VERIFIED")}><CheckCircle2 size={15}/> Mark verified</button><button className="review-no" onClick={()=>review(cert.id,"INVALID")}><AlertTriangle size={15}/> Mark invalid</button><button className="review-pending" onClick={()=>review(cert.id,"NEEDS_REVIEW")}><Clock3 size={15}/> Needs review</button></div>}<div className="report-note"><LockKeyhole size={16}/><p>Private credential data should only be shared with candidate consent and authorized access.</p></div></aside></div></>}
function Empty({text}) {return <div className="empty"><FileText size={25}/><p>{text}</p></div>}
