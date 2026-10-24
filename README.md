# ResumeIQ — AI-Powered Resume Analyzer

ResumeIQ helps job seekers compare a resume with a job description and understand how well their experience matches a role. It extracts text from PDF/DOCX files, streams an AI-generated analysis, and presents a match score, matching skills, missing skills, and actionable suggestions.

**Live demo:** [https://3.104.215.198/resumeiq/](https://3.104.215.198/resumeiq/)  
**Deployment:** AWS Lightsail · Docker Compose · Nginx · HTTPS

## Features

- JWT-based registration and login with BCrypt password hashing
- PDF and DOCX resume text extraction
- AI-powered resume-to-job-description comparison through OpenRouter
- Streaming analysis using Server-Sent Events (SSE)
- Match score, matching skills, missing skills, and improvement suggestions
- Responsive React interface

## Tech stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Java 17, Spring Boot 3, Spring Security |
| Authentication | JWT, BCrypt |
| Database | PostgreSQL, Spring Data JPA / Hibernate |
| AI | OpenRouter API |
| Resume parsing | Apache PDFBox, Apache POI |
| Streaming | Server-Sent Events (SSE) |
| Deployment | AWS Lightsail, Docker Compose, Nginx, Let's Encrypt |

## Architecture

The application runs alongside ForgeFlow on the same Lightsail VM. Host-level Nginx is the single public entry point and routes requests by path. ResumeIQ has a separate Docker Compose project and database volume.

**Architecture diagrams:** [Deployment topology and request flow](docs/architecture.md)

For the request flow, deployment details, network boundaries, and Mermaid source diagrams, see [docs/architecture.md](docs/architecture.md).

### Request flow

1. The user signs in and uploads a PDF/DOCX resume.
2. The backend extracts text using PDFBox or Apache POI.
3. The user enters a job description and starts an analysis.
4. The backend sends the resume and job description to OpenRouter.
5. The model response streams through Spring Boot and Nginx to the frontend.
6. ResumeIQ displays the score, skill gaps, and suggestions.

## Project structure

~~~text
ResumeIQ/
├── backend/
│   ├── src/main/java/com/resumeiq/backend/
│   ├── src/main/resources/application.yml
│   ├── Dockerfile
│   ├── build.gradle
│   └── gradlew
├── frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
├── docs/
│   ├── architecture.md
│   ├── architecture.md
│   └── screenshots/
├── docker-compose.yml
├── DEPLOYMENT.md
└── render.yaml
~~~

## Run locally

### Prerequisites

- Java 17+
- Node.js compatible with the Vite version in frontend/package.json
- Docker and Docker Compose, or a local PostgreSQL instance
- An OpenRouter API key for AI analysis

### Start the backend

The backend reads configuration from environment variables; Spring Boot does not automatically load a .env file. From the repository root, configure the required variables in your shell or IDE:

~~~bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=resumeiq
export DB_USERNAME=your_database_user
export DB_PASSWORD=your_database_password
export JWT_SECRET=replace_with_a_long_random_secret
export OPENROUTER_API_KEY=your_openrouter_api_key

cd backend
./gradlew bootRun
~~~

Create the PostgreSQL database resumeiq first and ensure the database credentials match the environment variables.

### Start the frontend

In another terminal:

~~~bash
cd frontend
cp .env.example .env
npm ci
npm run dev
~~~

The local frontend defaults to http://localhost:5173 and the local backend to http://localhost:8080.

### Run with Docker Compose

For a local Compose run, create a root .env file containing DB_PASSWORD, JWT_SECRET, and OPENROUTER_API_KEY, then start the stack:

~~~bash
docker compose up --build -d
docker compose ps
docker compose logs --tail=100
~~~

The production Compose configuration uses host-loopback ports and a /resumeiq/ path prefix. See [DEPLOYMENT.md](DEPLOYMENT.md) before deploying or adapting the Compose file.

## API overview

The analysis streaming endpoint is:

~~~http
POST /api/analysis/stream
Content-Type: application/json
Authorization: Bearer <JWT>
~~~

The request contains resumeText and jobDescription. Authentication and resume upload routes are implemented under /api/auth and /api/resume; see the controllers under backend/src/main/java/com/resumeiq/backend/controller for details.

## Security and privacy

- Never commit real API keys, JWT secrets, database passwords, or production .env files.
- Keep production database ports private; only the HTTPS entry point should be public.
- Use strong, unique credentials for the database and JWT signing key.
- Uploaded resumes can contain personal information; handle, retain, and share resume content responsibly.
- The deployed host currently serves the app under an IP-based HTTPS URL; a custom domain can be configured later.

## Documentation and screenshots

- [Deployment guide](DEPLOYMENT.md)
- [Architecture notes and diagrams](docs/architecture.md)
- [Screenshot gallery guidance](docs/screenshots/README.md)

Add fresh screenshots from the corrected live UI to docs/screenshots/ after hiding personal resume content and any private information. The early debugging captures showed the pre-fix text-spacing issue and should not be used as portfolio screenshots.

## Current limitations

- Text extraction does not perform OCR on scanned image-only PDFs.
- AI output may vary between runs; the scoring rubric and lower-variance model settings improve consistency but do not guarantee identical results.
- The project does not currently specify an open-source license.

## Future improvements

- Persist and revisit previous analyses
- Export reports
- Add OCR for scanned PDFs
- Add automated tests and CI deployment checks
- Add database migrations and explicit data-retention controls
