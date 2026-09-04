"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const appNavItems = [
  { label: "Overview", href: "/app" },
  { label: "Analyze", href: "/app/analyze" },
  { label: "Compare", href: "/app/compare" },
  { label: "Entry", href: "/app/entry" },
  { label: "Agent", href: "/app/agent" },
  { label: "History", href: "/app/history" },
];

const settingsItem = { label: "Settings", href: "/app/settings" };

/**
 * Plain text navigation. An earlier pass boxed every item and numbered them 01-06,
 * which stacked a third bordered band onto a header that already had two and
 * implied an order the screens do not have. Spacing and a single underline carry
 * it instead, which is what DESIGN_SYSTEM §13 asks for before reaching for a box.
 */
export function AppNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Workspace" className="flex w-full items-center justify-start gap-7 overflow-x-auto sm:justify-center" data-app-nav>
      {appNavItems.map((item) => (
        <NavItem active={isActive(pathname, item.href)} href={item.href} key={item.href} label={item.label} />
      ))}

      <NavItem active={isActive(pathname, settingsItem.href)} href={settingsItem.href} label={settingsItem.label} />
    </nav>
  );
}

function NavItem({ href, label, active, className = "" }: { href: string; label: string; active: boolean; className?: string }) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={`relative shrink-0 whitespace-nowrap py-2 text-sm transition-colors ${
        active ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
      } ${className}`}
      data-nav-active={active || undefined}
      data-nav-item={label.toLowerCase()}
      href={href}
    >
      {label}
      {active ? <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" /> : null}
    </Link>
  );
}

/** `/app` is the overview, so it must match exactly or every child route lights it up too. */
function isActive(pathname: string, href: string) {
  return href === "/app" ? pathname === "/app" : pathname.startsWith(href);
}
