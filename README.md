# McCauley Stoneworks & Craft – website

Node 20 + Express + SQLite (better-sqlite3).

## Run
    cp .env.example .env     # set ADMIN_PASSWORD, SESSION_SECRET, NOTIFY_EMAIL, SMTP_*
    npm install
    npm start                # http://localhost:3000

- Public site: `/`   Lead dashboard: `/admin` (user `admin`, password from `.env`)
- Quote form -> SQLite (`data/leads.db`) + email to NOTIFY_EMAIL (logged to console if SMTP is blank)
- Business details: `lib/site.js`. Social icons: set SOCIAL_INSTAGRAM / SOCIAL_TIKTOK / SOCIAL_YOUTUBE in `.env`.
- Hosting: needs a persistent disk for `data/` (set DATA_DIR) – e.g. Render disk, Railway volume, or a VPS.
