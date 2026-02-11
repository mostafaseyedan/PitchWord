# Cloud SQL + GCS Integration Notes

## Cloud SQL (Postgres)
Use Cloud SQL for workflow/state tables:
- `runs`
- `agent_step_logs`

Schema source:
- `apps/api/src/db/schema.sql`

Connection:
- set `DATABASE_URL` in API runtime
- API auto-runs schema migration at startup (`PostgresRunRepository.migrate()`)

## GCS
Use GCS for durable blobs:
- generated images
- generated videos
- uploaded source files (if retained)

Current code stores asset URIs in `runs.assets` and is ready for GCS-backed URIs.

## Cloud Run Deployment
- Deploy `apps/api` and `apps/web` as separate Cloud Run services.
- Set API env vars in Cloud Run service config.
- Configure Cloud Scheduler to call:
  - `POST /api/runs/daily`
