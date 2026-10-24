# ResumeIQ architecture

## Production topology

ResumeIQ shares the existing AWS Lightsail Ubuntu server with ForgeFlow, but runs in its own Docker Compose project with its own PostgreSQL container and named volume.

~~~mermaid
flowchart TB
    Browser[Browser / user]
    PublicNginx["Host Nginx + Let's Encrypt TLS<br/>Public ports 80 / 443<br/>Lightsail static IP"]
    ForgeFlow["ForgeFlow frontend<br/>127.0.0.1:3000"]
    ResumeFrontend["ResumeIQ frontend<br/>React + Vite build + Nginx<br/>127.0.0.1:3002"]
    ResumeBackend["ResumeIQ backend<br/>Spring Boot 3 / Java 17<br/>host 127.0.0.1:18081 → container 8080"]
    Database[("ResumeIQ PostgreSQL<br/>resumeiq-db:5432")]
    Volume[("Docker volume<br/>resumeiq_postgres_data")]
    OpenRouter["OpenRouter API<br/>outbound HTTPS"]

    Browser --> PublicNginx
    PublicNginx -->|"/"| ForgeFlow
    PublicNginx -->|"/resumeiq/"| ResumeFrontend
    PublicNginx -->|"/resumeiq/api/*; strip /resumeiq"| ResumeBackend
    ResumeFrontend -. "same-origin API calls" .-> PublicNginx
    ResumeBackend --> Database
    Database --- Volume
    ResumeBackend -->|"stream completion request"| OpenRouter
~~~

## Responsibilities

| Component | Responsibility | Exposure |
|---|---|---|
| Host Nginx | HTTPS termination, path routing, reverse proxy | Public ports 80/443 |
| ResumeIQ frontend | Serves the production Vite build and SPA fallback | Host loopback 127.0.0.1:3002 |
| ResumeIQ backend | JWT auth, resume parsing, analysis endpoint, SSE response | Host loopback 127.0.0.1:18081 |
| PostgreSQL | Stores user account records used by authentication | Internal Docker network only |
| Named volume | Persists PostgreSQL data across container recreation | Docker-managed |
| OpenRouter | Generates AI analysis completions | Outbound HTTPS from backend |

ForgeFlow keeps its own Compose project, containers, and data. ResumeIQ uses different service names and host-loopback ports; do not run Compose commands from the ResumeIQ directory against the ForgeFlow project.

## Request paths

- https://3.104.215.198/ routes to ForgeFlow at 127.0.0.1:3000.
- https://3.104.215.198/resumeiq/ routes to ResumeIQ frontend at 127.0.0.1:3002. The Vite build uses /resumeiq/ as its base path.
- https://3.104.215.198/resumeiq/api/* routes to the backend at 127.0.0.1:18081, with the /resumeiq prefix removed before proxying.
- The frontend calls /resumeiq/api/... on the same origin, so browser requests use HTTPS and do not require a public backend port.
- The analysis endpoint is POST /api/analysis/stream. Nginx proxy buffering is disabled for this route so SSE chunks can be forwarded as they arrive.

## Resume analysis flow

~~~mermaid
sequenceDiagram
    actor User
    participant UI as React frontend
    participant N as Host Nginx
    participant API as Spring Boot
    participant Parser as PDFBox / Apache POI
    participant AI as OpenRouter

    User->>UI: Upload PDF/DOCX
    UI->>N: POST /resumeiq/api/resume/upload
    N->>API: POST /api/resume/upload
    API->>Parser: Extract text
    Parser-->>API: Resume text
    API-->>UI: Extracted text
    User->>UI: Enter job description and analyze
    UI->>N: POST /resumeiq/api/analysis/stream
    N->>API: POST /api/analysis/stream
    API->>AI: Stream completion request
    AI-->>API: Text deltas
    API-->>N: SSE response
    N-->>UI: Forward SSE chunks without buffering
    UI-->>User: Match score, gaps, suggestions
~~~

## Runtime and configuration

The production Compose project defines three services:

- resumeiq-frontend: builds React/Vite assets and serves them with container Nginx.
- resumeiq-backend: builds the Java 17 Spring Boot JAR and maps host loopback 18081 to container port 8080.
- resumeiq-db: PostgreSQL 16 with a health check and resumeiq_postgres_data volume.

Secrets live in the server-side root .env and must never be committed. Required entries are DB_PASSWORD, JWT_SECRET, and OPENROUTER_API_KEY. Spring Boot's CORS property uses the environment variable APP_CORS_ALLOWEDORIGIN. Confirm the current docker-compose.yml and DEPLOYMENT.md before applying changes.

## Operational notes

- Back up the Compose and Nginx files before modifying production configuration.
- Validate with sudo docker compose config --quiet and sudo nginx -t before reloads.
- Do not expose PostgreSQL, the backend, or monitoring services directly to the internet.
- Use sudo docker compose logs --tail=100 resumeiq-backend for backend diagnostics and curl http://127.0.0.1:18081/actuator/health from the host for the health check.
- The architecture diagram describes the observed deployment layout; exact resource sizing and availability depend on the running Lightsail instance.
