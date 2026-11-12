import type { AppUser, Proposal } from "./types";

// Set VITE_API_BASE_URL to your FastAPI server (e.g. http://localhost:8000) to use it instead of local demo data.
const BASE = import.meta.env['VITE_API_BASE_URL'] as string | undefined;

const SEED_PROPOSALS: Proposal[] = [
  { id: 1, proposal: "Reduce weekly check-in frequency for tenured Cyberbackers (example)", owner: "Jane Dela Cruz", status: "Approved", decisionDate: "2026-11-01", submittedBy: "Headbacker team (survey feedback)", dateSubmitted: "2026-10-20", rationale: "Approved in principle; rollout criteria being defined with Ops." },
  { id: 2, proposal: "Add a Career Team rep to the PIP review process (example)", owner: "John Dela Cruz", status: "Under review", decisionDate: null, submittedBy: "Pauline Panuncio", dateSubmitted: "2026-10-27", rationale: "" },
];
const SEED_USERS: AppUser[] = [
  { id: "u1", name: "Jane Dela Cruz", email: "jane@headbacker.com", role: "Admin" },
  { id: "u2", name: "John Dela Cruz", email: "john@headbacker.com", role: "Member" },
  { id: "u3", name: "Pauline Panuncio", email: "pauline@headbacker.com", role: "Member" },
];

function load<T>(key: string, seed: T): T {
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw) as T;
  localStorage.setItem(key, JSON.stringify(seed));
  return seed;
}
const save = (key: string, v: unknown) => localStorage.setItem(key, JSON.stringify(v));

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.status === 204 ? (undefined as T) : res.json();
}

export const api = {
  async listProposals(): Promise<Proposal[]> {
    if (BASE) return http("/proposals");
    return load("hb_proposals", SEED_PROPOSALS);
  },
  async createProposal(p: Omit<Proposal, "id">): Promise<Proposal> {
    if (BASE) return http("/proposals", { method: "POST", body: JSON.stringify(p) });
    const list = load("hb_proposals", SEED_PROPOSALS);
    const created = { ...p, id: Math.max(0, ...list.map((x) => x.id)) + 1 };
    save("hb_proposals", [...list, created]);
    return created;
  },
  async updateProposal(id: number, patch: Partial<Proposal>): Promise<Proposal> {
    if (BASE) return http(`/proposals/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
    const list = load("hb_proposals", SEED_PROPOSALS).map((x) => (x.id === id ? { ...x, ...patch } : x));
    save("hb_proposals", list);
    return list.find((x) => x.id === id)!;
  },
  async listUsers(): Promise<AppUser[]> {
    if (BASE) return http("/users");
    return load("hb_users", SEED_USERS);
  },
  async createUser(u: Omit<AppUser, "id">): Promise<AppUser> {
    if (BASE) return http("/users", { method: "POST", body: JSON.stringify(u) });
    const created = { ...u, id: crypto.randomUUID() };
    save("hb_users", [...load("hb_users", SEED_USERS), created]);
    return created;
  },
  async updateUser(id: string, patch: Partial<AppUser>): Promise<void> {
    if (BASE) return http(`/users/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
    save("hb_users", load("hb_users", SEED_USERS).map((u) => (u.id === id ? { ...u, ...patch } : u)));
  },
  async deleteUser(id: string): Promise<void> {
    if (BASE) return http(`/users/${id}`, { method: "DELETE" });
    save("hb_users", load("hb_users", SEED_USERS).filter((u) => u.id !== id));
  },
};

export const session = {
  get: (): { name: string; email: string; role: AppUser["role"] } | null => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("hb_session");
    if (!raw) return null;
    try {
      const value = JSON.parse(raw) as { name?: unknown; email?: unknown; role?: unknown };
      if (typeof value.name !== "string" || typeof value.email !== "string") return null;
      return {
        name: value.name,
        email: value.email,
        role: value.role === "Member" ? "Member" : "Admin",
      };
    } catch {
      return null;
    }
  },
  signIn: () => localStorage.setItem("hb_session", JSON.stringify({ name: "Demo User", email: "demo@headbacker.com", role: "Admin" })),
  signOut: () => localStorage.removeItem("hb_session"),
};
