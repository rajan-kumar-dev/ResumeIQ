# ResumeIQ deployment — AWS Lightsail

This guide describes the current layout where ResumeIQ runs next to ForgeFlow on the same Ubuntu-based AWS Lightsail instance. ResumeIQ is isolated in its own Docker Compose project and reaches the public internet only through the host Nginx HTTPS entry point.

**Live app:** [https://3.104.215.198/resumeiq/](https://3.104.215.198/resumeiq/)

## Services and ports

| Service | Host binding | Purpose |
|---|---|---|
| Host Nginx | Public TCP 80 / 443 | HTTP redirect, TLS, reverse proxy |
| ResumeIQ frontend | 127.0.0.1:3002 → 80 | React/Vite build served by container Nginx |
| ResumeIQ backend | 127.0.0.1:18081 → 8080 | Spring Boot API and SSE |
| ResumeIQ PostgreSQL | Docker network only, port 5432 | App data, not public |
| ForgeFlow frontend | 127.0.0.1:3000 → 80 | Existing root site; keep its routes intact |

The backend and frontend container ports are bound to host loopback. Do not add public Lightsail firewall rules for 3002 or 18081. PostgreSQL should not have a public port mapping.

## Environment variables

Create the root .env on the server only and restrict its permissions:

~~~dotenv
DB_PASSWORD=<unique database password>
JWT_SECRET=<long random signing secret>
OPENROUTER_API_KEY=<OpenRouter API key>
~~~

Use unique production secrets. Do not commit this file to Git. Compose maps the database and AI settings into the backend container. Keep the API key backend-only; it must not be included in any VITE_* variable.

## Build and run

From the server's cloned repository directory:

~~~bash
chmod 600 .env
sudo docker compose config --quiet
sudo docker compose build resumeiq-backend resumeiq-frontend
sudo docker compose up -d
sudo docker compose ps
sudo docker compose logs --tail=100 resumeiq-backend
~~~

Check the backend locally on the host:

~~~bash
curl -i --max-time 10 http://127.0.0.1:18081/actuator/health
~~~

Expected response body:

~~~json
{"status":"UP"}
~~~

The Compose volume resumeiq_postgres_data keeps database files when containers are recreated. Avoid docker compose down -v unless intentionally deleting the database.

## Host Nginx routing

The existing HTTPS server block routes:

- / → http://127.0.0.1:3000 (ForgeFlow)
- /resumeiq/ → http://127.0.0.1:3002/ (ResumeIQ frontend)
- /resumeiq/api/ → http://127.0.0.1:18081/api/ (ResumeIQ backend)

The API location disables proxy buffering so the streamed analysis is forwarded without waiting for the entire response. The Vite production build uses /resumeiq/ as the base path and /resumeiq as the API base URL.

Before changing Nginx, back up the active site file. Always run sudo nginx -t and reload only when the test passes. Keep the existing ACME challenge location, HTTP→HTTPS redirect, certificate paths, and ForgeFlow root location intact.

## Updating the server

The deployed code should match the committed repository revision. Before pulling updates, check the working tree and make sure server-only files such as .env are ignored:

~~~bash
git status --short --branch
git log -1 --oneline
~~~

After pulling intentional code changes, rebuild only the affected ResumeIQ services, check logs, and verify the frontend and backend. Avoid rebuilding or restarting the ForgeFlow Compose project for ResumeIQ changes.

## Troubleshooting

- Frontend does not load: check sudo docker compose logs --tail=100 resumeiq-frontend and verify the built asset URLs start with /resumeiq/.
- API returns 502: inspect backend status/logs and test curl http://127.0.0.1:18081/actuator/health.
- AI analysis fails: confirm OPENROUTER_API_KEY is set in server-side .env, then inspect backend logs without printing secret values.
- Stream appears delayed: confirm proxy_buffering off; remains in the /resumeiq/api/ Nginx location.
- Nginx reload fails: do not reload until sudo nginx -t succeeds; restore the backup if needed.

## Alternate deployment

The repository still contains render.yaml and the earlier Render deployment notes for reference. The live deployment described here is AWS Lightsail; review the service-specific environment variables before using the Render Blueprint.
