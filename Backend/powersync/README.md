# PowerSync — Medicare offline dashboard setup

This directory holds the PowerSync **service** configuration. The application
code (backend token/write endpoints and the frontend client) is already wired;
this README is what you need to stand up the PowerSync service and point it at
the app's MongoDB Atlas cluster.

> Nothing here touches the Aadhaar/KYC auth flow. PowerSync only covers the
> dashboard sidebar features. If the service is not configured, the app runs
> online-only exactly as before (graceful fallback).

## Overview

```
 React dashboard ──(fetchCredentials)──► GET  /api/powersync/token   (mint per-user JWT)
       │  local SQLite (encrypted)
       ▼
 PowerSync Service ──(change streams)──► MongoDB Atlas (Patient DB)
       ▲  upload queue
       └──(uploadData)────────────────► POST /api/powersync/write   (apply offline mutations)
```

## 1. Prerequisites

- MongoDB Atlas cluster (already used by the app). Change streams require a
  replica set — Atlas provides this by default.
- A PowerSync instance: **PowerSync Cloud** (https://powersync.com) or
  self-hosted via Docker (`journeyapps/powersync-service`).

## 2. Configure the MongoDB connector (in the PowerSync dashboard/config)

Point the connector at the **Patient** database (the one derived from
`MONGODB_URI` with db name `Patient`). Use a read-capable user.

Connection URI example (note the `/Patient` db name):
```
mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/Patient?retryWrites=true&w=majority
```

### The Doctor DB (`prescriptions`) — two supported options

`prescriptions` lives in the **Doctor** database, but a PowerSync MongoDB
connector targets a single database. Choose one:

- **Option A (recommended, simplest):** run a **second PowerSync instance**
  whose connector targets the `Doctor` db, using a sync-rules file that
  contains only the `user_prescriptions` bucket. The client can connect to two
  PowerSync endpoints, or you point both instances at the same storage. Simplest
  operationally: one instance per source DB.
- **Option B:** replicate/duplicate the `prescriptions` collection into the
  Patient DB (e.g. a small change-stream mirror) so a single instance covers
  everything. Avoids a second instance at the cost of a mirror job.

If you defer prescriptions offline support, simply remove the
`user_prescriptions` bucket from `sync-rules.yaml` — the client already falls
back to the online axios path for any collection it hasn't synced.

## 3. Upload the sync rules

Upload `sync-rules.yaml` in the PowerSync dashboard (Cloud) or mount it in the
self-hosted config. Every bucket is scoped by `request.user_id()`, which comes
from the `sub` claim of the client JWT.

## 4. Configure client auth (JWT verification)

The backend mints an HS256 JWT (see `controllers/User/powersync.controller.js`).
In the PowerSync instance settings, add a **shared-secret (HS256)** client auth
key that matches `POWERSYNC_JWT_SECRET`, with:
- `kid` = `POWERSYNC_JWT_KID` (default `medicare-powersync-hs256`)
- audience = `POWERSYNC_URL`

For production, prefer **RS256 + JWKS**: publish a public key at
`GET /api/powersync/jwks` and switch the token endpoint to RS256 (the code has a
documented seam for this).

## 5. Set environment variables

Backend (`Backend/.env`): see `Backend/.env.powersync.example`
- `POWERSYNC_JWT_SECRET`, `POWERSYNC_URL`, `POWERSYNC_JWT_TTL_SECONDS`, `POWERSYNC_JWT_KID`

Frontend (`Frontend/.env`): see `Frontend/.env.powersync.example`
- `VITE_POWERSYNC_URL` (the instance URL). Leave blank to keep online-only mode.

## 6. Write path (offline mutations)

The PowerSync client batches offline writes and POSTs them to
`/api/powersync/write`. The backend allowlist permits only:
- `notifications`: toggle `read`, delete (own rows)
- `reports`: metadata edits — `category`, `inEmergencyFolder`, `description`,
  `tags`, `available_offline` (own rows). File blobs are NEVER written here;
  they go through the existing S3 upload endpoint when online.

`prescriptions`, `familyvaults`, `familyvaultinvites`, `reportshares`, and
`medicalinfos` are **read-only** from the client (server version wins; rejected
writes are logged).

## 7. Storage / quota

Only metadata is synced (no file blobs), so offline caching stays small and the
50 MB free-tier quota is respected. The client computes usage locally by summing
synced `reports.fileSize`, mirroring `Backend/utils/checkStorageLimit.js`.
Full files are fetched on demand online; a per-report "available offline" toggle
opts a specific report into full-file caching.
