# GEN - Global Education Network

Website for the Global Education Network, an NGO dedicated to providing free, quality education to students in medium and lower income countries.

## Stack

- TypeScript
- Vite

## Local Development

### Prerequisites

- Node.js

### Setup

```bash
npm install
```

Optionally create a `.env` file to enable registration:

```
VITE_BACKEND_URL=http://localhost:8000
```

If `VITE_BACKEND_URL` is not set, the website works normally but registration will show an unavailable message.

### Run

```bash
npm run dev
```

Open `http://localhost:5173`

## Production Build

```bash
npm run build    # Output → dist/
```

The `dist/` folder is a static site that can be served by any web server.

## Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start Vite dev server |
| `build` | Build static site to `dist/` |
| `preview` | Preview production build |
