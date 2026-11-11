import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { session } from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Headbacker Proposals" },
      { name: "description", content: "Sign in to submit and track Headbacker proposals." },
      { property: "og:title", content: "Sign in — Headbacker Proposals" },
      { property: "og:description", content: "Sign in to submit and track proposals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Google+Sans:wght@500&display=swap" }],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 text-center shadow-sm">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="mt-6 text-2xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to manage proposals.</p>
        <button
          type="button"
          onClick={() => { session.signIn(); navigate({ to: "/dashboard" }); }}
          className="google-btn mt-8"
        >
          <svg aria-hidden="true" width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
          Continue with Google
        </button>
        <p className="mt-4 text-xs text-muted-foreground">Demo mode — Google sign-in isn't connected yet.</p>
      </div>
    </div>
  );
}
