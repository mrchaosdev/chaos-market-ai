import Link from "next/link";

const navItems = [
  { label: "Overview", href: "/app" },
  { label: "Analyze", href: "/app/analyze" },
  { label: "Compare", href: "/app/compare" },
  { label: "Agent", href: "/app/agent" },
  { label: "History", href: "/app/history" },
];

export function NavRail() {
  return (
    <aside className="hidden border-r border-border bg-surface lg:flex lg:flex-col lg:items-center lg:justify-between lg:py-5">
      <Link className="font-mono text-xs font-semibold tracking-[0.24em] text-primary" href="/">CM</Link>
      <nav className="flex flex-col gap-5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground [writing-mode:vertical-rl]">
        {navItems.map((item) => (
          <Link className="transition-colors hover:text-foreground" href={item.href} key={item.href}>{item.label}</Link>
        ))}
      </nav>
      <Link className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground [writing-mode:vertical-rl]" href="/app/settings">Settings</Link>
    </aside>
  );
}
