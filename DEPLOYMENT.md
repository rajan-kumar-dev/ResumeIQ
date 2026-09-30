# ResumeIQ — Render Deployment

## Architecture

- Frontend: React + Vite → Render Static Site
- Backend: Spring Boot + Gradle → Render Web Service
- Database: PostgreSQL → Render Postgres
- AI: OpenRouter API
- Authentication: JWT + BCrypt

## 1. Push this repository to GitHub

From the project root:

```bash
git init
git add .
git commit -m "Prepare ResumeIQ for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ResumeIQ.git
git push -u origin main
```

Do NOT commit real `.env` files or API keys.

## 2. Deploy with Render Blueprint

Open Render and choose:

New → Blueprint

Select the GitHub repository containing `render.yaml`.

Render will create:
- resumeiq-backend
- resumeiq-frontend
- resumeiq-db

## 3. Backend secret

When Render asks for `OPENROUTER_API_KEY`, enter your OpenRouter API key.

`JWT_SECRET` is generated automatically by Render.

## 4. Connect frontend and backend

After the first deployment, Render will give URLs similar to:

Frontend:
https://resumeiq-frontend.onrender.com

Backend:
https://resumeiq-backend.onrender.com

In the FRONTEND service environment variables, set:

```text
VITE_API_BASE_URL=https://resumeiq-backend.onrender.com
```

In the BACKEND service environment variables, set:

```text
APP_CORS_ALLOWED_ORIGIN=https://resumeiq-frontend.onrender.com
```

Then redeploy both services.

## 5. Test

Backend health:
```text
https://resumeiq-backend.onrender.com/actuator/health
```

The expected response contains:

```json
{"status":"UP"}
```

Then open the frontend URL, register an account, log in, upload a PDF/DOCX resume, and run an analysis.

## Important

The AI integration in this project uses OpenRouter's OpenAI-compatible chat-completions endpoint, even though the Java class is named `AnthropicClient`. The deployment therefore uses `OPENROUTER_API_KEY`, not `ANTHROPIC_API_KEY`.

Never put the OpenRouter key in the React frontend. It must remain a backend environment variable.
