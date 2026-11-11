import { Link } from "@tanstack/react-router";
export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-serif text-xl font-semibold text-foreground">
      <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-sm text-primary-foreground">H</span>
      Headbacker
    </Link>
  );
}
