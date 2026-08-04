# TGO Flow

A real-time, multi-tenant project & task management SaaS — built by **TGO DevStudio**.

Live app: https://tgo-flow.onrender.com
API: https://tgo-flow-api.onrender.com

---

## What it does

TGO Flow lets teams organize work visually across isolated workspaces:

- **Workspaces** — each team/client gets its own fully isolated space
- **Role-based access** — Owner / Admin / Member, each with different permissions
- **Email invites** — invite teammates by email with a specific role; they receive a real email and join with one click
- **Boards, Lists & Tasks** — Kanban-style boards with drag-and-drop, due dates, labels, assignees, and comments
- **Real-time sync** — task moves, edits, and comments appear instantly for everyone viewing the same board, no refresh needed
- **Password reset** — secure, email-based, self-service
- **Dark / light mode** — built around TGO's brand palette

## Tech stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS v3, TanStack Query, Zustand, React Router, Socket.IO client, `@hello-pangea/dnd`

**Backend:** Node.js, Express 5, TypeScript, MongoDB (Mongoose), Socket.IO, JWT auth (access + refresh token rotation), bcrypt, express-validator

**Infrastructure:** MongoDB Atlas (database), Render (backend web service + frontend static site), Brevo (transactional email)

## Architecture highlights

- **JWT auth with refresh rotation** — short-lived access tokens (15 min) + httpOnly refresh cookies (7 days), with automatic silent refresh on the frontend via an Axios interceptor
- **Real-time layer** — Socket.IO rooms scoped per board; JWT-authenticated socket connections; optimistic UI updates on drag-and-drop with automatic rollback on failure
- **Role-based access control** — enforced server-side on every workspace/board/task route, not just hidden in the UI
- **Cross-origin cookie handling** — `SameSite=None; Secure` in production to support the frontend and backend running on separate origins
- **Code-split frontend** — routes lazy-load independently; the login page ships ~3KB instead of the full app bundle

See [`docs/architecture-decisions.md`](docs/architecture-decisions.md) for specific engineering decisions and trade-offs made during the build (e.g. why the client uses a WASM build of Rollup).

## Project structure

```

tgo-flow/
├── client/          React frontend (Vite)
├── server/          Express API backend
├── shared/          (reserved for shared types)
└── docs/            Architecture decision records
```

## Local development

**Backend:**
```bash
cd server
npm install
cp .env.example .env   # fill in your own values
npm run dev
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```

## Deployment

Both services deploy automatically from `main` via Render:
- Backend: Web Service, root `server/`, build `npm install --include=dev && npm run build`, start `npm start`
- Frontend: Static Site, root `client/`, build `npm install --include=dev && npm run build`, publish `dist`, with an SPA rewrite rule (`/*` → `/index.html`)

## Roadmap / known scope boundaries

Deliberately out of scope for this first version — not oversights, but honest MVP boundaries:

- Billing/subscriptions
- Third-party integrations (Slack, Google Calendar)
- File attachments on tasks

---

Built by Testimony Oluwatimilehin Gboroye — TGO DevStudio.

## Brand & Support Features

Beyond the core product, TGO Flow includes a set of features related to **TGO DevStudio and its founder** — separate from the project's own functionality:

- **Floating brand button (✦)** — a draggable button available on every page, giving access to: sending feedback, contacting the founder directly (WhatsApp/phone), and the founder's GitHub/Facebook/Instagram. For the founder's own account, it also surfaces the private Messages and User Analytics pages, and shows a live unread-message count.
- **Feedback form** (`/feedback`) — sends a message directly and privately to the founder, with full real-time validation.
- **Messages page** (founder-only) — every feedback submission, with read/unread/delete management.
- **User Analytics page** (founder-only) — account creation, login, logout, and app-return activity across all users, separate from any individual workspace's own Activity tab.
- **In-app Help Guide** (`/help`) — a searchable set of articles covering the entire product, with a lightweight public-only view shown to signed-out users on the login page.
- **Command palette** — press `Ctrl+K` / `Cmd+K` anywhere for quick actions (navigation, theme toggle, logout).
- **Self-service account deletion** — available from the floating brand button, protected by a typed confirmation phrase.
