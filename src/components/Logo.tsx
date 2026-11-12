import { Link } from "@tanstack/react-router";
import logo from "@/assets/cyberbacker-logo-dark.png";
export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3 font-serif text-lg font-semibold text-foreground">
      <img src={logo} alt="Cyberbacker" className="h-8 w-auto" />
      <span className="hidden border-l pl-3 sm:inline">HB Proposal Hub</span>
    </Link>
  );
}
