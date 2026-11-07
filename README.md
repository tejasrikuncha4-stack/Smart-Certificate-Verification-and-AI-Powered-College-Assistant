# CODENOVA — AI Credential Verification Platform

A local full-stack starter application for a hackathon MVP. It includes a React/Vite frontend, Express API, local JSON persistence, certificate uploads, SHA-256 duplicate detection, image OCR, seeded institution records, role-specific demo login, and evidence-led verification statuses.

## Requirements
- Node.js 18.18+ (Node.js 20 LTS recommended)
- npm
- VS Code

## Run on Windows
1. Extract the ZIP.
2. Open the extracted `CODENOVA` folder in VS Code.
3. Open Terminal → New Terminal.
4. Run:

```bash
npm install
npm run dev
```

5. Open http://localhost:5173

The API runs at http://localhost:5000. Health check: http://localhost:5000/api/health

## Demo logins
All demo accounts use password `demo123`.

| Role | Email |
|---|---|
| Student | student@codenova.demo |
| HR | hr@codenova.demo |
| Employer | employer@codenova.demo |
| Admin | admin@codenova.demo |

## Included features
- Landing page and role selection
- Student, HR, Employer and Admin demo workspaces
- Certificate upload (PDF/JPG/PNG, max 10 MB)
- Browser-side OCR for images using Tesseract.js
- Manual data entry for PDFs in this starter build
- SHA-256 duplicate-file detection
- Seeded local institution directory
- Evidence-based `VERIFIED`, `INVALID` and `NEEDS_REVIEW` statuses
- Admin review workflow
- Candidate/document search
- Institution directory management
- Credential evidence graph overview
- Local verification reports and risk indicator
- Responsive desktop/mobile interface

## Important limitations
This is a hackathon MVP starter, not a production identity or fraud-detection service.

- Demo passwords are plain text in the local JSON seed for easy local demonstration. Replace this with password hashing, sessions/JWT, authorization middleware and secure secrets before any real deployment.
- Local JSON persistence is for a single-user local demo, not concurrent or production use.
- OCR is enabled for images. PDF text extraction is not implemented in this starter; enter PDF details manually.
- AI-assisted Gemini analysis is not connected by default. The current checks are deterministic rules and local demo-record matching.
- The institution directory contains sample data only. A listed institution does not mean CODENOVA has live access to that institution.
- DigiLocker and live college APIs require official authorization, API credentials and user consent. They are not connected in this package.
- `INVALID` should only be set by an authorized reviewer with reliable issuer evidence. A mismatch or AI suspicion alone is not proof of fraud.
- Do not upload real sensitive student records into this demo build.

## Reset demo data
Stop the server, then delete `server/data/db.json`. Restart `npm run dev`; the server recreates the seeded demo database.

## Build frontend
```bash
npm run build
```

## Troubleshooting
- If `npm` is not recognized, install Node.js LTS and restart VS Code.
- If port 5173 or 5000 is busy, close the other app using it or change the port.
- If OCR language data cannot load, ensure internet access on first OCR use.
