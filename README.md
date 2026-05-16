# Peblo Synapse

**AI Collaborative Notes Workspace**

Peblo Synapse is a premium AI-powered collaborative note workspace built for intelligent knowledge management, productivity analytics, and real-time collaborative workflows.

---

## Features

- **Secure Authentication** — email + password sign-in with session persistence
- **Collaborative Notes** — fast, autosaving markdown editor with version history
- **AI Summaries** — executive summaries generated on demand
- **Action Extraction** — pull concrete to-dos out of any note
- **Smart Titles** — one-click titling for unnamed notes
- **Search + Filters** — instant full-workspace search via the ⌘K command palette
- **Public Sharing** — one-toggle read-only share links
- **Productivity Analytics** — edit trends, AI usage, top tags, productivity score
- **Version History** — snapshot timeline with one-click restore
- **Export Options** — Markdown and PDF export
- **Premium 3D Interface** — cinematic aurora background and glassmorphic surfaces

---

## Tech Stack

**Frontend**
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- React Three Fiber

**Backend**
- TanStack Start server functions (edge-runtime RPC)

**Database**
- PostgreSQL with Row-Level Security

**AI**
- Google Gemini 3 Flash

**Authentication**
- Email + password with JWT sessions

**Realtime**
- Postgres change-data-capture channels

---

## Setup

```bash
bun install
bun run dev
```

Then open the local preview URL printed in the terminal.

Environment variables are managed automatically by the platform and exposed to the app at build time. No manual `.env` editing is required.

Security note: A local `.env` file containing credentials was previously committed and has been removed from this repository. Do not commit real secrets. Use the provided `.env.example` to populate your local environment and rotate any exposed keys if you cloned the repository earlier.

---

## Architecture

```
src/
├─ routes/
│  ├─ __root.tsx              # Shell, providers, head metadata
│  ├─ index.tsx               # Public landing page
│  ├─ login.tsx               # Authentication
│  ├─ shared.$shareId.tsx     # Public read-only share page
│  └─ _authenticated/
│     ├─ dashboard.tsx        # Activity overview
│     ├─ notes.tsx            # Editor workspace
│     └─ analytics.tsx        # Productivity analytics
│
├─ components/
│  ├─ brand/                  # Brand mark and logo
│  ├─ visual/                 # 3D backdrop and visual effects
│  ├─ CommandPalette.tsx      # ⌘K palette
│  ├─ ThemeToggle.tsx         # Light / dark switcher
│  └─ ui/                     # Reusable primitives
│
├─ lib/
│  ├─ auth-context.tsx        # Session provider
│  ├─ theme-context.tsx       # Theme provider
│  ├─ notes.functions.ts      # Notes CRUD, versions, share, analytics
│  └─ ai.functions.ts         # AI generation endpoints
│
├─ integrations/              # Database client and types
├─ start.ts                   # Server bootstrap
└─ styles.css                 # Design tokens and utilities
```

**Data flow**

1. The browser holds the user's session and queries the database under Row-Level Security.
2. Server functions are validated with Zod and run on the edge with the user's bearer token.
3. Public share pages use a server-side admin client filtered strictly by `share_id` and `is_public = true`.
4. AI calls are made server-side and never expose model credentials to the browser.

---

## License

Proprietary — © Peblo.
