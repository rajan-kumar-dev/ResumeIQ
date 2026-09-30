# ResumeIQ Frontend

React + Vite frontend for ResumeIQ. Upload a resume, paste a job description,
and watch the AI analysis stream in — match score, matching/missing skills,
and suggestions.

## Design

A "case file" concept: ink-navy background, parchment-colored document
panels for the resume and job description, and the match score rendered as
a stamped verdict badge rather than a generic chart. See the component
files for the full token system (`tailwind.config.js`).

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Point it at your backend

Copy `.env.example` to `.env`:

```
VITE_API_BASE_URL=http://localhost:8080
```

### 3. Run it

```bash
npm run dev
```

Opens on `http://localhost:5173` by default — this matches the CORS origin
already whitelisted in the backend's `SecurityConfig`. If you run the
frontend on a different port, update `SecurityConfig.corsConfigurationSource()`
in the backend to match.

### 4. Build for production

```bash
npm run build
```

Outputs static files to `dist/`.

## How the streaming works

The backend's `/api/analysis/stream` endpoint returns Server-Sent Events.
Native `EventSource` can't send a POST body or custom `Authorization` header,
so `src/api/analysis.js` reads the response body as a raw stream and parses
SSE frames manually. Each text chunk is appended to a buffer and re-parsed
against the fixed markdown structure the backend's prompt enforces (`## Match
Score`, `## Matching Skills`, `## Missing Skills`, `## Suggestions`), so the
score badge and skill chips update live as the model streams.

## Project structure

```
src/
├── api/            # client.js (fetch helper), auth.js, resume.js, analysis.js
├── context/        # AuthContext (JWT stored in localStorage)
├── components/      # AuthScreen, TopBar, ResumePanel, JobDescriptionPanel,
│                     # ReportPanel, ScoreStamp, SkillChips
├── pages/           # Dashboard
├── App.jsx
└── main.jsx
```

## Known limitations

- No resume/analysis history view yet (the backend has the `AnalysisResult`
  entity and repository, but nothing writes to it yet — that's the next
  backend step).
- No file size/type feedback beyond what the backend returns; very large
  PDFs may take a few seconds to extract.
- If the Anthropic API key isn't set on the backend, the error appears
  inline in the report panel rather than as a toast/alert.
