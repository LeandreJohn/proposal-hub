# Headbacker Proposal Management — Frontend

Frontend only, built to talk to your FastAPI backend later. Until the backend is ready, the app runs on sample data from your spreadsheet stored in the browser, behind one swappable API layer.

## Pages
1. **Landing (/)** — short hero ("Track every proposal from idea to decision"), 3 feature blurbs, small live stats strip (Open, Closed, Total, Avg Days to Decision), "Sign in" button.
2. **Login (/login)** — "Continue with Google" button (proper Google styling). Not wired to Google yet: clicking it signs you in as a demo user and opens the dashboard.
3. **Dashboard (/dashboard)** with three tabs:
   - **Proposals** — table of the Proposal Log fields: #, Proposal, Owner, Status, Decision Date, Submitted By, Date Submitted, Decision & Rationale, Days to Decision (auto-calculated). "Submit proposal" form; edit status/decision inline. Status options: Submitted, Under review, Approved, Declined, Implemented.
   - **Analytics** — mirrors the Summary sheet: cards for Open / Closed / Total / Avg Days to Decision, plus per-owner table (Open, Closed, Total, Avg Days). Filters: date range (submitted or decision date), owner, status, submitted by; sortable by any column. Small bar chart of proposals by status and a line of submissions over time.
   - **Users** — simple list (name, email, role: Admin/Member), add, change role, remove.

Open = Submitted/Under review; Closed = Approved/Declined/Implemented.

## Design
Clean, editorial look: warm off-white background, deep ink text, one confident accent (teal), serif headings + sans body. No purple gradients.

## Technical details
- `src/lib/api.ts`: all data calls (`listProposals`, `createProposal`, `updateProposal`, `listUsers`, ...). Uses `VITE_API_BASE_URL` (FastAPI) when set, else localStorage mock seeded from the xlsx rows.
- `src/lib/analytics.ts` pure functions for open/closed/avg-days + per-owner summary, with vitest tests.
- Routes: `index.tsx`, `login.tsx`, `dashboard.tsx`; dashboard guarded client-side by demo session. Recharts for charts. Each route gets its own head metadata.
- Document expected FastAPI endpoints in AGENTS.md.
