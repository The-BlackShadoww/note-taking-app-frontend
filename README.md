# Notes: frontend

A small React app for the Secure Note-Taking API. It exists to show every backend feature working;
the backend (indexes, aggregations, auth) is the focus of the task.

| | |
|---|---|
| Live app | https://note-taking-app-frontend-pied.vercel.app |
| Backend API | https://note-taking-app-backend-lac.vercel.app |
| Backend repository (indexing and aggregation details) | https://github.com/The-BlackShadoww/note-taking-app-backend |

Demo accounts: `alice@example.com` and `bob@example.com`, password `password123`.

## Built by hand

Only `react`, `react-dom` and `vite`: **no router library, no UI kit, no CSS framework, no template**.

- `src/router.jsx`: a tiny router written on the History API (`Link`, `NavLink`, `Redirect`, `matchPath`).
- `src/api.js`: one `api()` helper that adds the JWT, parses JSON and turns errors into exceptions;
  a rejected token logs the user out.
- `src/auth.jsx`: the logged-in user, shared through React context.
- `src/hooks.js`: `useApi(path)` loads data for a page.
- `src/components/`: Layout, PageHeader, Pagination, Field, TitleContentForm, Alert/Loading/EmptyState/InfoBox.
- `src/styles.css`: plain CSS.

## Pages

| Path | What it shows |
|---|---|
| `/login`, `/register` | Sign in / create an account (with interests) |
| `/` | Dashboard: what each part of the app does |
| `/notes`, `/notes/new`, `/notes/:id` | My notes (paginated), create, view / edit / delete |
| `/posts`, `/posts/new` | Everyone's posts (paginated), create |
| `/users/:id/posts` | **Scenario 2**: one user's posts (`$lookup`) |
| `/interests` | **Scenario 1**: users grouped by interest, with a filter |
| `/profile` | Name, interests, password |
| `/admin/users`, `/admin/users/new`, `/admin/users/:id` | Admin: users table, create, edit / delete |
| `/admin/notes`, `/admin/notes/:id` | Admin: everyone's notes (read-only) |

Each main page has a "How this works" box explaining the API call and the index behind it.
Admin pages are hidden from normal users for convenience only: the server enforces access (403).

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173
```

The backend must be running on `http://localhost:3000` with `http://localhost:5173` in its
`CLIENT_URL`. `src/api.js` picks the local API on localhost and the deployed API everywhere else.

## Deploy

Vercel builds it with Vite (`vercel.json`: `npm run build` → `dist/`) and sends every path to
`index.html`, so the routes above also work after a page refresh.
