# Supabase Free Migration Guide

This project now supports Supabase Postgres using `SUPABASE_DB_URL`.

## 1. Create a free Supabase project
1. Open https://supabase.com and create a project on the Free plan.
2. Wait for the database to finish provisioning.

## 2. Get the pooled Postgres connection string
1. In Supabase, go to Project Settings -> Database.
2. Find Connection string and choose Transaction pooler (port `6543`).
3. Copy the URI format and insert your DB password.

Example format:
`postgresql://postgres:[YOUR_DB_PASSWORD]@[PROJECT-REF].pooler.supabase.com:6543/postgres`

## 3. Set environment variables
### On Render
Set these variables in your web service:
- `SUPABASE_DB_URL` = your Supabase pooled URI
- `DATABASE_URL` = optional fallback (can be blank)

### Local
Create `.env` (or export env vars in terminal):
- `SUPABASE_DB_URL=...`

## 4. Deploy/restart
Redeploy your app or restart service so server uses new env vars.

## 5. Verify
1. Open `/health` in your deployed app.
2. Confirm:
   - `db.connected` is `true`
   - `db.provider` is `"supabase"`

## Notes
- The app keeps using `/api/state/:id`; no frontend changes required for Supabase migration.
- Table `app_state` is auto-created by the server if missing.
