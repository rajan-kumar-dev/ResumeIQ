# ResumeIQ Backend — Gradle Edition (Step 1: Project Scaffolding)

Same project as the Maven version, built with Gradle instead.

## What's included so far

- `build.gradle` with all dependencies for the full project: Web, WebFlux
  (WebClient + SSE), JPA, PostgreSQL, Spring Security, JWT (jjwt), PDFBox,
  POI, Lombok
- `User` and `AnalysisResult` JPA entities + repositories
- Full JWT authentication: register/login endpoints, BCrypt password hashing,
  stateless security config, JWT filter
- **Resume upload + text extraction**: `POST /api/resume/upload` accepts a
  PDF or DOCX (multipart, JWT-protected), extracts plain text via PDFBox/POI.
  The file is processed in-memory only — never written to disk or the DB.
- Global exception handler for clean JSON error responses (auth errors,
  validation errors, unreadable/unsupported resume files)
- `application.yml` wired to read secrets from environment variables

## What's NOT built yet

- Claude API integration + streaming AI analysis endpoint
- Saving/retrieving `AnalysisResult` history (entity + repo exist, but no
  service/controller wires them up yet)
- React frontend

## One-time setup: generate the Gradle wrapper

This project ships without `gradlew` / `gradlew.bat` / `gradle-wrapper.jar`
because generating the wrapper requires downloading a binary jar from
`services.gradle.org`, which this sandbox couldn't reach. **You only need to
do this once, on your own machine** (requires Gradle installed locally, or
use your IDE's built-in Gradle):

```bash
gradle wrapper --gradle-version 8.8
```

After that, commit the generated `gradlew`, `gradlew.bat`, and
`gradle/wrapper/` folder, and use `./gradlew` for everything from then on.

If you have IntelliJ IDEA or another IDE with Gradle support, just open the
project folder — it will offer to generate the wrapper automatically.

## Setup

### 1. Create the PostgreSQL database

```sql
CREATE DATABASE resumeiq;
CREATE USER resumeiq_user WITH ENCRYPTED PASSWORD 'resumeiq_pass';
GRANT ALL PRIVILEGES ON DATABASE resumeiq TO resumeiq_user;
```

### 2. Set environment variables

Copy `.env.example` to `.env` (or export directly in your shell):

```
DB_USERNAME=resumeiq_user
DB_PASSWORD=resumeiq_pass
JWT_SECRET=<a long random string, at least 32 characters>
ANTHROPIC_API_KEY=<your key, needed starting Step 4>
```

> Spring Boot doesn't read `.env` files natively — export the vars in your
> shell, add the `spring-dotenv` library, or set them in your IDE's run config.

### 3. Run the app

Once you've generated the wrapper:
```bash
./gradlew bootRun
```

Or, if you have Gradle installed globally and don't want to bother with the
wrapper yet:
```bash
gradle bootRun
```

The app starts on `http://localhost:8080`.

### 4. Test the auth endpoints

**Register:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Both return:
```json
{ "token": "<jwt>", "email": "test@example.com" }
```

### 5. Test resume upload

Using the token from step 4:
```bash
curl -X POST http://localhost:8080/api/resume/upload \
  -H "Authorization: Bearer <your-jwt-token>" \
  -F "file=@/path/to/resume.pdf"
```

Returns:
```json
{ "extractedText": "John Doe\nSoftware Engineer...", "characterCount": 1842 }
```

Supports `.pdf` and `.docx`, up to 5MB. Scanned/image-only PDFs won't work
(no OCR yet) — you'll get a clear 400 error instead of a crash.

## Project structure

```
build.gradle
settings.gradle
src/main/java/com/resumeiq/backend/
├── config/          # Security config
├── controller/       # AuthController, ResumeController
├── dto/              # Request/response records
├── entity/           # User, AnalysisResult (JPA)
├── exception/        # Global exception handling, ResumeParsingException
├── repository/       # Spring Data JPA repositories
├── security/         # JWT filter, JWT util, UserDetailsService
└── service/          # AuthService, ResumeParserService
```

## Next step

Step 4: Claude API integration — send extracted resume text + job description
to Claude, stream the analysis (match score, matching/missing skills,
suggestions) back to the client via Server-Sent Events.
