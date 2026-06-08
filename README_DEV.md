Development notes and quick start

1. Create database and run init SQL

Run (assuming Postgres and psql are installed):

```bash
createdb waste_management
psql -d waste_management -f db/init.sql
```

Or use your preferred DB GUI to run `db/init.sql`.

2. Environment

Copy `.env.example` to `.env` and set `JWT_SECRET` and DB credentials (or set `DATABASE_URL`).

3. Install & run

```bash
cd my-ts-project
npm install
# Run frontend (Next.js)
npm run dev

# (optional) Run backend express server
cd backend
node server.js
```

4. Test API manually

Use the curl examples in the project's documentation or the earlier assistant message.
