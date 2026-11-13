import type { AppUser, Proposal } from "./types";
import { auth } from "./firebase";
import { access } from "node:fs";

// Set VITE_API_BASE_URL to your FastAPI server (e.g. http://localhost:8000) to use it instead of local demo data.
const BASE = import.meta.env['VITE_API_BASE_URL'] as string | undefined;

const REFRESH_KEY = "hb_refresh_token";

const SESSION_KEY = "hb_session";
const TOKEN_KEY = "hb_token";

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
  const token = typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    if (res.status === 401) {
      // Token missing or expired: clear the local session so the dashboard sends the user back to /login.
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_KEY);
    }
    const body = await res.json().catch(() => null);
    throw new Error(typeof body?.detail === "string" ? body.detail : `Request failed (${res.status})`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export const api = {
  async listProposals(): Promise<Proposal[]> {
    if (BASE) return http("/api/hb/proposals");
    return load("hb_proposals", SEED_PROPOSALS);
  },
  async createProposal(p: Omit<Proposal, "id">): Promise<Proposal> {
    if (BASE) return http("/api/hb/proposals", { method: "POST", body: JSON.stringify(p) });
    const list = load("hb_proposals", SEED_PROPOSALS);
    const created = { ...p, id: Math.max(0, ...list.map((x) => x.id)) + 1 };
    save("hb_proposals", [...list, created]);
    return created;
  },
  async updateProposal(id: number, patch: Partial<Proposal>): Promise<Proposal> {
    if (BASE) return http(`/api/hb/proposals/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
    const list = load("hb_proposals", SEED_PROPOSALS).map((x) => (x.id === id ? { ...x, ...patch } : x));
    save("hb_proposals", list);
    return list.find((x) => x.id === id)!;
  },
  async listUsers(): Promise<AppUser[]> {
    if (BASE) return http("/api/hb/users");
    return load("hb_users", SEED_USERS);
  },
  async createUser(u: Omit<AppUser, "id">): Promise<AppUser> {
    if (BASE) return http("/api/hb/users", { method: "POST", body: JSON.stringify(u) });
    const created = { ...u, id: crypto.randomUUID() };
    save("hb_users", [...load("hb_users", SEED_USERS), created]);
    return created;
  },
  async updateUser(id: string, patch: Partial<AppUser>): Promise<void> {
    if (BASE) return http(`/api/hb/users/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
    save("hb_users", load("hb_users", SEED_USERS).map((u) => (u.id === id ? { ...u, ...patch } : u)));
  },
  async deleteUser(id: string): Promise<void> {
    if (BASE) return http(`/api/hb/users/${id}`, { method: "DELETE" });
    save("hb_users", load("hb_users", SEED_USERS).filter((u) => u.id !== id));
  },
};

export type SessionUser = {
  id?: string;
  name: string;
  email: string;
  role: AppUser["role"];
  avatarUrl?: string;
};

export const session = {
  get: (): SessionUser | null => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      const value = JSON.parse(raw) as Partial<SessionUser>;
      if (typeof value.name !== "string" || typeof value.email !== "string") return null;
      return {
        id: typeof value.id === "string" ? value.id : undefined,
        name: value.name,
        email: value.email,
        // Anything that isn't exactly "Admin" is treated as Member.
        role: value.role === "Admin" ? "Admin" : "Member",
        avatarUrl: typeof value.avatarUrl === "string" ? value.avatarUrl : undefined,
      };
    } catch {
      return null;
    }
  },

  // Exchanges the Firebase ID token for the app's user + tokens.
  // With VITE_API_BASE_URL set, the backend verifies the token and returns the user and role from the database.
  async signInWithToken(
    idToken: string,
    profile: { name: string; email: string; avatarUrl?: string },
  ): Promise<void> {
    if (BASE) {
      const data = await http<{
        access_token?: string;
        accessToken?: string;
        refresh_token?: string;
        refreshToken?: string;
        user: AppUser;
      }>("/api/hb/auth/login", {
        method: "POST",
        body: JSON.stringify({ id_token: idToken }),
      });

      const access = data.access_token ?? data.accessToken;
      if (!access) throw new Error("Login response did not include an access token");
      localStorage.setItem(TOKEN_KEY, access);

      const refresh = data.refresh_token ?? data.refreshToken;
      if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
      else localStorage.removeItem(REFRESH_KEY);

      save(SESSION_KEY, { ...data.user, avatarUrl: profile.avatarUrl ?? "" });
      return;
    }

    // Demo mode (no backend): use the local users list as a stand-in for the database.
    // A first-time email is added as Admin here so the whole dashboard can be tested. Backend mode never does this.
    const users = load("hb_users", SEED_USERS);
    let user = users.find((u) => u.email.toLowerCase() === profile.email.toLowerCase());
    if (!user) {
      user = { id: crypto.randomUUID(), name: profile.name, email: profile.email, role: "Admin" };
      save("hb_users", [...users, user]);
    }
    save(SESSION_KEY, { ...user, avatarUrl: profile.avatarUrl ?? "" });
  },

  signOut: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const refresh = localStorage.getItem(REFRESH_KEY);

    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);

    // Ask the backend to revoke the tokens. Best effort: signing out locally never waits on this.
    if (BASE && token) {
      fetch(`${BASE}/api/hb/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          ...(refresh ? { "refresh-token": refresh } : {}),
        },
      }).catch(() => {});
    }

    auth.signOut().catch(() => {});
  },
};