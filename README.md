# Marketing Agent Platform

Internal marketing app with multi-agent orchestration for:
- news discovery
- grounded content drafting
- image generation (`gemini-3-pro-image-preview`)
- optional short video generation (`veo-3.1-fast`)
- Teams draft delivery

## Stack
- Frontend: React + `@vibe/core@3.85.0`
- Backend: Node.js + TypeScript + Fastify
- Orchestration: Google ADK (supervisor + worker agents)
- Persistence: Cloud SQL (Postgres) when `DATABASE_URL` is configured
- Blob/media storage integration point: GCS (represented by asset URI pipeline)

## Monorepo Layout
- `apps/api`: backend APIs, orchestration services, repositories
- `apps/web`: dashboard/control center
- `packages/shared`: shared contracts/types

## Quick Start
1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies:
   - `npm install`
3. Run both apps:
   - `npm run dev`
4. Open:
   - Web: `http://localhost:5173`
   - API: `http://localhost:8787/health`

## Core API Endpoints
- `POST /api/runs/daily`
- `POST /api/runs/manual`
- `GET /api/runs`
- `GET /api/runs/:runId`
- `POST /api/runs/:runId/retry-step`
- `POST /api/runs/:runId/post-to-teams`
- `POST /api/uploads`
- `GET /api/logs`
- `GET /api/analytics/summary`
- `GET /api/events` (SSE)

## Notes
- If `DATABASE_URL` is missing, API falls back to in-memory repository.
- `ENABLE_MOCK_GENERATION=true` keeps the app runnable without live model/API dependencies.
- Vertex datastore grounding is done inside Gemini requests via `tools.retrieval.vertexAiSearch`.
- Daily automation trigger should call `POST /api/runs/daily` from Cloud Scheduler.
