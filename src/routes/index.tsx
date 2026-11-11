import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ClipboardList, BarChart3, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { api } from "@/lib/api";
import { summarize } from "@/lib/analytics";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Headbacker Proposals — Track every proposal to a decision" },
      { name: "description", content: "Submit, track and analyze Headbacker proposals from idea to decision." },
      { property: "og:title", content: "Headbacker Proposals" },
      { property: "og:description", content: "Submit, track and analyze proposals from idea to decision." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const features = [
  { icon: ClipboardList, title: "Submit in seconds", text: "One simple form captures the proposal, owner and who raised it." },
  { icon: BarChart3, title: "See where things stand", text: "Open vs closed, days to decision, and a per-owner breakdown." },
  { icon: Users, title: "Keep the team in sync", text: "Manage who can submit and who decides." },
];

function Index() {
  const [stats, setStats] = useState<ReturnType<typeof summarize> | null>(null);
  useEffect(() => { api.listProposals().then((l) => setStats(summarize(l))).catch(() => {}); }, []);
  const items = [
    ["Open", stats?.open], ["Closed", stats?.closed], ["Total proposals", stats?.total], ["Avg days to decision", stats?.avgDays ?? "—"],
  ] as const;
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <Button asChild><Link to="/login">Sign in</Link></Button>
      </header>
      <main className="mx-auto max-w-6xl px-6">
        <section className="py-20 md:py-28">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">Proposal log</p>
          <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-foreground md:text-6xl">
            Track every proposal from idea to decision.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            A clear, shared record of what was proposed, who owns it, and what was decided — and why.
          </p>
          <div className="mt-8 flex gap-3">
            <Button size="lg" asChild><Link to="/login">Get started</Link></Button>
          </div>
        </section>
        <section className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-4">
          {items.map(([label, value]) => (
            <div key={label} className="bg-card p-6">
              <div className="font-serif text-4xl font-semibold text-foreground">{value ?? "–"}</div>
              <div className="mt-1 text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </section>
        <section className="grid gap-10 py-20 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title}>
              <f.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </section>
      </main>
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">© 2026 Headbacker</footer>
    </div>
  );
}
