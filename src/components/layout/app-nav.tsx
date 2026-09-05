"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Menu, X } from "lucide-react";

export const appNavItems = [
  { label: "Overview", href: "/app" },
  { label: "Analyze", href: "/app/analyze" },
  { label: "Compare", href: "/app/compare" },
  { label: "Entry", href: "/app/entry" },
  { label: "Agent", href: "/app/agent" },
  { label: "History", href: "/app/history" },
];

const settingsItem = { label: "Settings", href: "/app/settings" };

/** Settings is listed last but is not special: one list keeps the row and the mobile panel in step. */
const allNavItems = [...appNavItems, settingsItem];

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
    <>
      <nav
        aria-label="Workspace"
        className="cm-app-nav relative hidden w-full items-center justify-start gap-7 overflow-x-auto md:flex md:justify-center"
        data-app-nav
        onMouseLeave={() => moveIndicator(null)}
        ref={navRef}
      >
        <span
          aria-hidden
          className="cm-app-nav__hover-indicator pointer-events-none absolute bottom-0 left-0 h-0.5 w-0 bg-foreground/35 opacity-0"
          ref={indicatorRef}
        />

        {allNavItems.map((item) => (
          <NavItem active={isActive(pathname, item.href)} href={item.href} key={item.href} label={item.label} onHover={moveIndicator} />
        ))}
      </nav>

      <MobileNav pathname={pathname} />
    </>
  );
}

/**
 * The seven items need about 530px of bar. Measured across widths rather than
 * guessed: at 390px only four of them were on screen, the rest behind a
 * horizontal scroll nobody would think to try, and 640px fit them only to the
 * pixel — the last item still clipped by 4px. So the row waits for `md`, where
 * 530px of items sit in a 658px bar with room to spare, and below that the items
 * move behind this button instead.
 */
function MobileNav({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!open || !panelRef.current) {
        return;
      }

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(panelRef.current, { opacity: 1, y: 0 });
        return;
      }

      gsap.from(panelRef.current, { opacity: 0, y: -8, duration: 0.2, ease: "power2.out" });
    },
    { dependencies: [open] },
  );

  // A menu that cannot be dismissed by the two gestures everyone already tries —
  // Escape, and a tap outside it — reads as stuck rather than open.
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div className="cm-mobile-nav flex w-full items-center justify-end md:hidden">
      <button
        aria-controls="cm-mobile-nav-panel"
        aria-expanded={open}
        aria-label={open ? "Close navigation" : "Open navigation"}
        className="cm-mobile-nav__toggle flex items-center justify-center border border-border p-2.5 text-muted-foreground transition-colors hover:bg-surface-hover"
        data-mobile-nav-toggle
        onClick={() => setOpen((previous) => !previous)}
        ref={buttonRef}
        type="button"
      >
        {/* Icon only. The `aria-label` above is what carries the name now, so it
            has to stay: without it the button announces as nothing at all. */}
        {open ? <X aria-hidden className="size-4" /> : <Menu aria-hidden className="size-4" />}
      </button>

      {open ? (
        // Fixed, not absolute: the bar pins at y=20 and is 50px tall, so its
        // underside is always y=70 — and an absolute child would be clipped by
        // the row's own `overflow-x-auto`.
        <div
          className="cm-mobile-nav__panel fixed inset-x-0 top-[70px] z-50 border-b border-border bg-background"
          data-mobile-nav-panel
          id="cm-mobile-nav-panel"
          ref={panelRef}
        >
          <nav aria-label="Workspace" className="cm-mobile-nav__list flex flex-col divide-y divide-border">
            {allNavItems.map((item) => {
              const active = isActive(pathname, item.href);

              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={`cm-mobile-nav__item flex items-center justify-between px-5 py-4 text-sm transition-colors ${
                    active ? "font-medium text-foreground" : "text-muted-foreground"
                  }`}
                  data-nav-active={active || undefined}
                  data-nav-item={item.label.toLowerCase()}
                  href={item.href}
                  key={item.href}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                  {active ? <span aria-hidden className="cm-mobile-nav__active-indicator h-1.5 w-1.5 bg-primary" /> : null}
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </div>
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
