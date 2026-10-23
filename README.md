# ResumeIQ — AI-Powered Resume Analyzer

ResumeIQ helps job seekers compare their resume with a job description and understand how well their experience matches the role. It analyzes resume content and presents a match score, matching skills, missing skills, and suggestions for improvement.

## Features

- **User authentication** with registration/login and JWT-based access.
- **Resume upload and text extraction** from PDF and DOCX files.
- **AI-powered resume analysis** against a pasted job description.
- **Live analysis updates** streamed to the frontend using Server-Sent Events (SSE).
- **Match report** with a match score, matching skills, missing skills, and suggestions.
- **Responsive web interface** built with React and Tailwind CSS.

## Tech Stack

| Area | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS, JavaScript |
| Backend | Java 17, Spring Boot, Spring Security |
| Authentication | JWT, BCrypt |
| Database | PostgreSQL, Spring Data JPA / Hibernate |
| AI integration | OpenRouter API (configured model: `meta-llama/llama-3.3-70b-instruct`) |
| Resume parsing | Apache PDFBox, Apache POI |
| Streaming | Server-Sent Events (SSE) |
| Build tools | npm, Gradle |

## Architecture

```text
User
 |
 v
React + Vite frontend
 |
 | REST API / streamed SSE response
 v
Spring Boot backend
 |          |             |
 v          v             v
PostgreSQL  Resume parser OpenRouter API
             (PDF/DOCX)   (AI analysis)
```

## Project Structure

```text
ResumeIQ/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
└── backend/
    ├── src/main/java/
    ├── src/main/resources/
    │   └── application.yml
    ├── .env.example
    ├── build.gradle
    └── settings.gradle
```

## Prerequisites

Install the following before running the project:

- Java 17 or later
- Node.js and npm (use a version compatible with the Vite version in `frontend/package.json`)
- PostgreSQL
- Gradle 8.x, or use the included Gradle wrapper if it is configured and working
- An OpenRouter API key for AI analysis

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
```

Replace the repository URL with your GitHub repository URL.

### 2. Configure PostgreSQL

Create a database for the application:

```sql
CREATE DATABASE resumeiq;
```

If you use a dedicated database user, create that user and grant it the necessary privileges. Update the database username and password through environment variables.

### 3. Configure the backend

Set these environment variables in your terminal or IDE run configuration:

```bash
export DB_USERNAME="your_database_username"
export DB_PASSWORD="your_database_password"
export JWT_SECRET="replace_with_a_long_random_secret_at_least_32_characters"
export OPENROUTER_API_KEY="your_openrouter_api_key"
```

The backend configuration uses PostgreSQL at `localhost:5432/resumeiq` by default and starts on port `8080`.

**Important:** The project configuration reads environment variables; Spring Boot does not automatically load a `.env` file by itself. Set the variables in your shell, IDE, or deployment platform.

Start the backend from the `backend` directory:

```bash
cd backend
gradle bootRun
```

If the Gradle wrapper is available and configured, you can use `./gradlew bootRun` instead.

### 4. Configure and start the frontend

Open another terminal:

```bash
cd frontend
cp .env.example .env
```

The default frontend environment setting is:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

### 5. Create a production frontend build

From the `frontend` directory:

```bash
npm run build
```

The production files are generated in `frontend/dist/`.

## How Analysis Works

1. The user signs in and uploads a PDF or DOCX resume.
2. The backend extracts readable text from the document.
3. The user provides a job description.
4. The backend sends the relevant content to the configured AI provider.
5. The analysis is streamed to the frontend, which displays the match score, matching and missing skills, and suggestions.

## API Overview

The application includes authentication, resume-upload, and analysis functionality. The analysis streaming endpoint is:

```http
POST /api/analysis/stream
```

The resume upload endpoint accepts a PDF or DOCX file and requires authentication. Check the backend controller classes for the exact request/response formats and other available routes.

## Security Notes

- Never commit real API keys, database passwords, JWT secrets, or production environment files.
- Keep `.env` files out of Git; commit only safe example files such as `.env.example`.
- Use a strong, randomly generated JWT secret.
- Configure production database credentials and CORS origins before deploying.
- Resume files may contain personal information. Handle uploaded resumes and extracted text responsibly.

## Current Limitations

- Resume parsing extracts text from PDF/DOCX files; scanned image-only PDFs may require OCR.
- AI results depend on the configured model and the quality of the resume and job description.
- Confirm the backend's currently implemented routes and features before relying on them in production.

## Future Improvements

- Save and revisit previous resume analyses.
- Export analysis reports.
- Add OCR support for scanned resumes.
- Add more detailed keyword and job-skill recommendations.
- Add automated tests and production deployment workflows.

## Contributing

Contributions and suggestions are welcome. Fork the repository, create a feature branch, and open a pull request with a clear description of the change.

## License

No license has been specified yet. Add a `LICENSE` file if you want to define how others may use, modify, and distribute this project.
