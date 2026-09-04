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
 * Horizontal workspace navigation, built as border-separated cells so it reads as
 * chrome rather than as a caption. An earlier pass rendered it as 11px muted text
 * on a transparent strip, which was present in the DOM but invisible as a control.
 *
 * Scrollable rather than collapsed into a menu: the rail this replaced was
 * `hidden lg:flex` and was the only navigation in the app, so phones and tablets
 * had no way to move between screens at all.
 */
export function AppNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Workspace" className="flex items-stretch gap-px overflow-x-auto bg-border" data-app-nav>
      {appNavItems.map((item, index) => (
        <NavItem active={isActive(pathname, item.href)} href={item.href} index={index + 1} key={item.href} label={item.label} />
      ))}

      <span aria-hidden className="min-w-4 flex-1 bg-background" />

      <NavItem active={isActive(pathname, settingsItem.href)} href={settingsItem.href} label={settingsItem.label} />
    </nav>
  );
}

function NavItem({ href, label, index, active }: { href: string; label: string; index?: number; active: boolean }) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={`relative shrink-0 whitespace-nowrap px-4 py-3.5 font-mono text-xs uppercase tracking-[0.16em] transition-colors ${
        active ? "bg-surface-raised text-foreground" : "bg-background text-muted-foreground hover:bg-surface-hover hover:text-foreground"
      }`}
      data-nav-active={active || undefined}
      data-nav-item={label.toLowerCase()}
      href={href}
    >
      {active ? <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-primary" /> : null}
      {index === undefined ? null : (
        <span className={`mr-2 ${active ? "text-primary" : "text-subtle-foreground"}`}>{String(index).padStart(2, "0")}</span>
      )}
      {label}
    </Link>
  );
}

/** `/app` is the overview, so it must match exactly or every child route lights it up too. */
function isActive(pathname: string, href: string) {
  return href === "/app" ? pathname === "/app" : pathname.startsWith(href);
}
