"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

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
 *
 * A second underline tracks the pointer and slides between items on hover. Every
 * click here is a full Next.js navigation — AppNav unmounts and remounts on the
 * new route — so a shared-element slide across the *active* change (the way
 * ChaoUi's AnimatedTabs does it with Motion's layoutId) has no "before" position
 * to animate from once the new page mounts. The hover slide sidesteps that
 * entirely: it only ever animates within one mounted instance, in direct
 * response to the pointer, so it never has to survive a route change.
 */
export function AppNav() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const contextSafeRef = useRef<ReturnType<typeof useGSAP>["contextSafe"] | null>(null);

  const { contextSafe } = useGSAP({ scope: navRef });

  // contextSafe's identity can change between renders; refs are for reading
  // outside render, so the write itself happens in an effect, not inline here.
  useEffect(() => {
    contextSafeRef.current = contextSafe;
  }, [contextSafe]);

  const moveIndicator = useCallback((target: HTMLElement | null) => {
    const indicator = indicatorRef.current;
    const safe = contextSafeRef.current;

    if (!indicator || !safe) {
      return;
    }

    // The active item already has its own permanent underline; sliding a second
    // one on top of it would just double-paint the same rectangle.
    const showAt = target && target.dataset.navActive === undefined ? target : null;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tween = reduced ? gsap.set : gsap.to;

    safe(() => {
      if (!showAt) {
        tween(indicator, { opacity: 0, duration: reduced ? 0 : 0.16, ease: "power2.out" });
        return;
      }

      // offsetLeft/offsetWidth are layout-space, not viewport-space, so this
      // stays correct while the nav is mid-scroll on narrow screens — no
      // scrollLeft math needed.
      tween(indicator, {
        x: showAt.offsetLeft,
        width: showAt.offsetWidth,
        opacity: 1,
        duration: reduced ? 0 : 0.26,
        ease: "power2.out",
      });
    })();
  }, []);

  return (
    <nav
      aria-label="Workspace"
      className="cm-app-nav relative flex w-full items-center justify-start gap-7 overflow-x-auto sm:justify-center"
      data-app-nav
      onMouseLeave={() => moveIndicator(null)}
      ref={navRef}
    >
      <span
        aria-hidden
        className="cm-app-nav__hover-indicator pointer-events-none absolute bottom-0 left-0 h-0.5 w-0 bg-foreground/35 opacity-0"
        ref={indicatorRef}
      />

      {appNavItems.map((item) => (
        <NavItem active={isActive(pathname, item.href)} href={item.href} key={item.href} label={item.label} onHover={moveIndicator} />
      ))}

      <NavItem active={isActive(pathname, settingsItem.href)} href={settingsItem.href} label={settingsItem.label} onHover={moveIndicator} />
    </nav>
  );
}

function NavItem({
  href,
  label,
  active,
  onHover,
  className = "",
}: {
  href: string;
  label: string;
  active: boolean;
  onHover: (target: HTMLElement) => void;
  className?: string;
}) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={`cm-app-nav__item cm-app-nav__item--${label.toLowerCase()} relative shrink-0 whitespace-nowrap py-2 text-sm transition-colors ${
        active ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
      } ${className}`}
      data-nav-active={active || undefined}
      data-nav-item={label.toLowerCase()}
      href={href}
      onMouseEnter={(event) => onHover(event.currentTarget)}
    >
      {label}
      {active ? <span aria-hidden className="cm-app-nav__active-indicator absolute inset-x-0 bottom-0 h-0.5 bg-primary" /> : null}
    </Link>
  );
}

/** `/app` is the overview, so it must match exactly or every child route lights it up too. */
function isActive(pathname: string, href: string) {
  return href === "/app" ? pathname === "/app" : pathname.startsWith(href);
}
