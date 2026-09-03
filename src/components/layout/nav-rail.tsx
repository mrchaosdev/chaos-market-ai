import Link from "next/link";
import { ChaosLogo } from "@/components/chaos/chaos-logo";

const navItems = [
  { label: "Overview", href: "/app" },
  { label: "Analyze", href: "/app/analyze" },
  { label: "Compare", href: "/app/compare" },
  { label: "Entry", href: "/app/entry" },
  { label: "Agent", href: "/app/agent" },
  { label: "History", href: "/app/history" },
];

export function NavRail() {
  return (
    <aside className="hidden border-r border-border bg-surface lg:flex lg:flex-col lg:items-center lg:justify-between lg:gap-6 lg:py-5">
      <Link aria-label="Chaos Market AI home" className="transition-opacity hover:opacity-80" href="/">
        <ChaosLogo size={30} />
      </Link>
      <nav className="flex flex-col items-center gap-6 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {navItems.map((item) => (
          <Link className="[writing-mode:vertical-rl] transition-colors hover:text-foreground" href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <Link className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground [writing-mode:vertical-rl]" href="/app/settings">
        Settings
      </Link>
    </aside>
  );
}
