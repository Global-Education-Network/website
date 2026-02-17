# GEN - Global Education Network

Website for the Global Education Network, an NGO dedicated to providing free, quality education to students in medium and lower income countries.

## Stack

- TypeScript
- Vite (frontend)
- Express (API)
- Prisma + PostgreSQL (database)

## Local Development

### Prerequisites

- Node.js
- PostgreSQL database (e.g. Supabase)

### Setup

```bash
npm install
```

Create a `.env` file in the project root:

```
GEN_DB_URL=postgresql://user:password@host:5432/dbname
```

Generate the Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### Run

Start both servers in separate terminals:

```bash
npm run dev:server    # Express API on :3000
npm run dev:client    # Vite dev server on :5173
```

Open `http://localhost:5173`

## Production Build

```bash
npm run build          # Frontend → dist/
npm run build:server   # Server → dist-server/
node dist-server/index.js
```

## Scripts

| Script | Description |
|--------|-------------|
| `dev:client` | Start Vite dev server |
| `dev:server` | Start Express with hot reload |
| `build` | Build frontend |
| `build:server` | Compile server TypeScript |
| `db:generate` | Generate Prisma client |
| `db:migrate` | Run Prisma migrations |
| `start` | Run production server |
