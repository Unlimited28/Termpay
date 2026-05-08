# TermPay Backend

School fees payment intelligence platform for Nigerian private schools.

## Setup

### Step 1 — Environment Variables
Copy .env.example to .env and fill in your Supabase credentials.

### Step 2 — Run Database Schema
1. Go to your Supabase dashboard
2. Click SQL Editor
3. Copy the entire contents of src/database/schema.sql
4. Paste into the SQL editor and click Run
5. Confirm all tables are created in the Table Editor

### Step 3 — Install Dependencies
```bash
npm install
```

### Step 4 — Seed Demo Data
```bash
npm run seed
```

### Step 5 — Start Development Server
```bash
npm run dev
```

### Step 6 — Verify Health Check
```bash
curl http://localhost:3001/health
```

## Project Structure

- `src/config`: Environment and client configurations
- `src/controllers`: Request handlers
- `src/database`: SQL schema and seed scripts
- `src/middleware`: Custom Express middlewares
- `src/routes`: API route definitions
- `src/services`: Business logic and external integrations
- `src/types`: TypeScript interfaces and types
- `src/server.ts`: Entry point
