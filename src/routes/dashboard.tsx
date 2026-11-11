import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowUpDown, LogOut, Plus, Trash2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, session } from "@/lib/api";
import { byOwner, daysToDecision, isOpen, summarize } from "@/lib/analytics";
import { STATUSES, type AppUser, type Proposal, type Status } from "@/lib/types";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Dashboard — Headbacker Proposals" },
      { name: "description", content: "Submit proposals, manage users and view proposal analytics." },
      { property: "og:title", content: "Dashboard — Headbacker Proposals" },
      { property: "og:description", content: "Submit proposals, manage users and view analytics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const reload = () => {
    api.listProposals().then(setProposals).catch((e) => toast.error(e.message));
    api.listUsers().then(setUsers).catch((e) => toast.error(e.message));
  };
  useEffect(() => {
    if (!session.get()) { navigate({ to: "/login" }); return; }
    reload();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo />
          <Button variant="ghost" size="sm" onClick={() => { session.signOut(); navigate({ to: "/" }); }}>
            <LogOut className="mr-2 h-4 w-4" />Sign out
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Tabs defaultValue="proposals">
          <TabsList>
            <TabsTrigger value="proposals">Proposals</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          <TabsContent value="proposals" className="mt-6"><ProposalsTab proposals={proposals} users={users} onChange={reload} /></TabsContent>
          <TabsContent value="analytics" className="mt-6"><AnalyticsTab proposals={proposals} /></TabsContent>
          <TabsContent value="users" className="mt-6"><UsersTab users={users} onChange={reload} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function StatusBadge({ s }: { s: Status }) {
  const v = s === "Declined" ? "destructive" : s === "Approved" || s === "Implemented" ? "default" : "secondary";
  return <Badge variant={v}>{s}</Badge>;
}

const today = () => new Date().toISOString().slice(0, 10);

function ProposalsTab({ proposals, users, onChange }: { proposals: Proposal[]; users: AppUser[]; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ proposal: "", owner: "", submittedBy: "", dateSubmitted: today() });
  const [editing, setEditing] = useState<Proposal | null>(null);

  const submit = async () => {
    if (!form.proposal.trim() || !form.owner || !form.submittedBy.trim()) { toast.error("Please fill in all fields"); return; }
    await api.createProposal({ ...form, status: "Submitted", decisionDate: null, rationale: "" });
    toast.success("Proposal submitted");
    setOpen(false); setForm({ proposal: "", owner: "", submittedBy: "", dateSubmitted: today() }); onChange();
  };
  const saveEdit = async () => {
    if (!editing) return;
    await api.updateProposal(editing.id, editing);
    toast.success("Proposal updated"); setEditing(null); onChange();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div><h2 className="text-2xl font-semibold">Proposal log</h2><p className="text-sm text-muted-foreground">Click a row to update its status or decision.</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Submit proposal</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New proposal</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Proposal</Label><Textarea value={form.proposal} maxLength={500} onChange={(e) => setForm({ ...form, proposal: e.target.value })} /></div>
              <div><Label>Owner</Label>
                <Select value={form.owner} onValueChange={(v) => setForm({ ...form, owner: v })}>
                  <SelectTrigger><SelectValue placeholder="Choose owner" /></SelectTrigger>
                  <SelectContent>{users.map((u) => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Submitted by</Label><Input value={form.submittedBy} maxLength={120} onChange={(e) => setForm({ ...form, submittedBy: e.target.value })} /></div>
              <div><Label>Date submitted</Label><Input type="date" value={form.dateSubmitted} onChange={(e) => setForm({ ...form, dateSubmitted: e.target.value })} /></div>
              <Button className="w-full" onClick={submit}>Submit</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader><TableRow>
            <TableHead>#</TableHead><TableHead>Proposal</TableHead><TableHead>Owner</TableHead><TableHead>Status</TableHead>
            <TableHead>Decision date</TableHead><TableHead>Submitted by</TableHead><TableHead>Date submitted</TableHead>
            <TableHead>Decision & rationale</TableHead><TableHead>Days</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {proposals.map((p) => (
              <TableRow key={p.id} className="cursor-pointer" onClick={() => setEditing({ ...p })}>
                <TableCell>{p.id}</TableCell><TableCell className="max-w-xs font-medium">{p.proposal}</TableCell><TableCell>{p.owner}</TableCell>
                <TableCell><StatusBadge s={p.status} /></TableCell><TableCell>{p.decisionDate ?? "—"}</TableCell><TableCell>{p.submittedBy}</TableCell>
                <TableCell>{p.dateSubmitted}</TableCell><TableCell className="max-w-xs text-muted-foreground">{p.rationale || "—"}</TableCell>
                <TableCell>{daysToDecision(p) ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update proposal #{editing?.id}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <p className="text-sm">{editing.proposal}</p>
              <div><Label>Status</Label>
                <Select value={editing.status} onValueChange={(v) => setEditing({ ...editing, status: v as Status, decisionDate: editing.decisionDate ?? (v === "Submitted" || v === "Under review" ? null : today()) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Decision date</Label><Input type="date" value={editing.decisionDate ?? ""} onChange={(e) => setEditing({ ...editing, decisionDate: e.target.value || null })} /></div>
              <div><Label>Decision & rationale</Label><Textarea value={editing.rationale} maxLength={1000} onChange={(e) => setEditing({ ...editing, rationale: e.target.value })} /></div>
              <Button className="w-full" onClick={saveEdit}>Save</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

type SortKey = "id" | "proposal" | "owner" | "status" | "submittedBy" | "dateSubmitted" | "decisionDate" | "days";
const ALL = "__all";

function AnalyticsTab({ proposals }: { proposals: Proposal[] }) {
  const [dateField, setDateField] = useState<"dateSubmitted" | "decisionDate">("dateSubmitted");
  const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const [owner, setOwner] = useState(ALL); const [status, setStatus] = useState(ALL); const [by, setBy] = useState(ALL);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "dateSubmitted", dir: -1 });

  const owners = [...new Set(proposals.map((p) => p.owner))];
  const submitters = [...new Set(proposals.map((p) => p.submittedBy))];

  const filtered = useMemo(() => proposals.filter((p) => {
    const d = p[dateField];
    if ((from || to) && !d) return false;
    if (from && d! < from) return false;
    if (to && d! > to) return false;
    return (owner === ALL || p.owner === owner) && (status === ALL || p.status === status) && (by === ALL || p.submittedBy === by);
  }), [proposals, dateField, from, to, owner, status, by]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    const va = sort.key === "days" ? daysToDecision(a) ?? -1 : a[sort.key] ?? "";
    const vb = sort.key === "days" ? daysToDecision(b) ?? -1 : b[sort.key] ?? "";
    return (va < vb ? -1 : va > vb ? 1 : 0) * sort.dir;
  }), [filtered, sort]);

  const s = summarize(filtered);
  const owner_rows = byOwner(filtered);
  const statusData = STATUSES.map((st) => ({ status: st, count: filtered.filter((p) => p.status === st).length }));
  const timeData = Object.entries(filtered.reduce<Record<string, number>>((acc, p) => {
    const m = p.dateSubmitted.slice(0, 7); acc[m] = (acc[m] ?? 0) + 1; return acc;
  }, {})).sort().map(([month, count]) => ({ month, count }));

  const SortHead = ({ k, label }: { k: SortKey; label: string }) => (
    <TableHead>
      <button className="inline-flex items-center gap-1" onClick={() => setSort({ key: k, dir: sort.key === k ? (-sort.dir as 1 | -1) : 1 })}>
        {label}<ArrowUpDown className="h-3 w-3" />
      </button>
    </TableHead>
  );
  const pick = (label: string, value: string, set: (v: string) => void, opts: readonly string[]) => (
    <div className="min-w-40"><Label className="text-xs">{label}</Label>
      <Select value={value} onValueChange={set}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value={ALL}>All</SelectItem>{opts.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4">
        <div className="min-w-40"><Label className="text-xs">Date field</Label>
          <Select value={dateField} onValueChange={(v) => setDateField(v as typeof dateField)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="dateSubmitted">Date submitted</SelectItem><SelectItem value="decisionDate">Decision date</SelectItem></SelectContent>
          </Select>
        </div>
        <div><Label className="text-xs">From</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div><Label className="text-xs">To</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        {pick("Owner", owner, setOwner, owners)}
        {pick("Status", status, setStatus, STATUSES)}
        {pick("Submitted by", by, setBy, submitters)}
        <Button variant="ghost" onClick={() => { setFrom(""); setTo(""); setOwner(ALL); setStatus(ALL); setBy(ALL); }}>Reset</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {([["Open", s.open], ["Closed", s.closed], ["Total proposals", s.total], ["Avg days to decision", s.avgDays ?? "—"]] as const).map(([l, v]) => (
          <div key={l} className="rounded-lg border bg-card p-5"><div className="font-serif text-3xl font-semibold">{v}</div><div className="text-sm text-muted-foreground">{l}</div></div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-4"><h3 className="mb-3 font-semibold">By status</h3>
          <ResponsiveContainer width="100%" height={220}><BarChart data={statusData}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="status" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Bar dataKey="count" fill="var(--chart-1)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
        </div>
        <div className="rounded-lg border bg-card p-4"><h3 className="mb-3 font-semibold">Submissions per month</h3>
          <ResponsiveContainer width="100%" height={220}><LineChart data={timeData}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="month" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Line dataKey="count" stroke="var(--chart-2)" strokeWidth={2} /></LineChart></ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border bg-card"><h3 className="p-4 pb-0 font-semibold">By owner</h3>
        <Table><TableHeader><TableRow><TableHead>Owner</TableHead><TableHead>Open</TableHead><TableHead>Closed</TableHead><TableHead>Total</TableHead><TableHead>Avg days to decision</TableHead></TableRow></TableHeader>
          <TableBody>{owner_rows.map((o) => <TableRow key={o.owner}><TableCell>{o.owner}</TableCell><TableCell>{o.open}</TableCell><TableCell>{o.closed}</TableCell><TableCell>{o.total}</TableCell><TableCell>{o.avgDays ?? "—"}</TableCell></TableRow>)}</TableBody>
        </Table>
      </div>

      <div className="rounded-lg border bg-card"><h3 className="p-4 pb-0 font-semibold">Filtered proposals ({sorted.length})</h3>
        <Table><TableHeader><TableRow>
          <SortHead k="id" label="#" /><SortHead k="proposal" label="Proposal" /><SortHead k="owner" label="Owner" /><SortHead k="status" label="Status" />
          <SortHead k="submittedBy" label="Submitted by" /><SortHead k="dateSubmitted" label="Submitted" /><SortHead k="decisionDate" label="Decided" /><SortHead k="days" label="Days" />
        </TableRow></TableHeader>
          <TableBody>{sorted.map((p) => (
            <TableRow key={p.id}><TableCell>{p.id}</TableCell><TableCell className="max-w-xs">{p.proposal}</TableCell><TableCell>{p.owner}</TableCell>
              <TableCell><StatusBadge s={p.status} /></TableCell><TableCell>{p.submittedBy}</TableCell><TableCell>{p.dateSubmitted}</TableCell>
              <TableCell>{p.decisionDate ?? "—"}</TableCell><TableCell>{daysToDecision(p) ?? (isOpen(p) ? "open" : "—")}</TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </div>
    </div>
  );
}

function UsersTab({ users, onChange }: { users: AppUser[]; onChange: () => void }) {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [role, setRole] = useState<AppUser["role"]>("Member");
  const add = async () => {
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email)) { toast.error("Enter a name and valid email"); return; }
    await api.createUser({ name: name.trim(), email: email.trim(), role });
    setName(""); setEmail(""); toast.success("User added"); onChange();
  };
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Users</h2>
      <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4">
        <div><Label className="text-xs">Name</Label><Input value={name} maxLength={100} onChange={(e) => setName(e.target.value)} /></div>
        <div><Label className="text-xs">Email</Label><Input type="email" value={email} maxLength={255} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="w-36"><Label className="text-xs">Role</Label>
          <Select value={role} onValueChange={(v) => setRole(v as AppUser["role"])}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="Admin">Admin</SelectItem><SelectItem value="Member">Member</SelectItem></SelectContent></Select>
        </div>
        <Button onClick={add}><Plus className="mr-2 h-4 w-4" />Add user</Button>
      </div>
      <div className="rounded-lg border bg-card">
        <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>{users.map((u) => (
            <TableRow key={u.id}><TableCell className="font-medium">{u.name}</TableCell><TableCell>{u.email}</TableCell>
              <TableCell className="w-36">
                <Select value={u.role} onValueChange={async (v) => { await api.updateUser(u.id, { role: v as AppUser["role"] }); onChange(); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Admin">Admin</SelectItem><SelectItem value="Member">Member</SelectItem></SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-right"><Button variant="ghost" size="icon" aria-label={`Remove ${u.name}`} onClick={async () => { await api.deleteUser(u.id); toast.success("User removed"); onChange(); }}><Trash2 className="h-4 w-4" /></Button></TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </div>
    </div>
  );
}
