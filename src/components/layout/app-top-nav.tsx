import Link from "next/link";
import { ChaosLogo } from "@/components/chaos/chaos-logo";
import { AppNav } from "./app-nav";

/** 20px inset (scrollbar) + 50px scrollbar width — see chaos-scrollbar.tsx. */
export const leftGutterWidth = 70;

/** Shared thickness for both rails: the nav's height and the scrollbar's width. */
export const railThickness = 50;

/**
 * The floating top nav. It renders as a single shared component rather than being
 * duplicated between the workspace shell and the landing page, because the two
 * copies drifted out of sync more than once when only one side got edited.
 *
 * The bar is exactly `railThickness` (50px) tall — the same thickness as the
 * scroll gutter is wide — so the two rails read as one continuous frame of even
 * weight rather than two bars that happen to sit near each other. Background is
 * transparent by design: it is a frame, not a filled panel.
 *
 * The logo sits in a cell exactly as wide as the scroll gutter (20px offset +
 * 50px bar), with 20px of its own left padding, so it lands centred directly
 * above the scrollbar's rectangle — the corner where the nav and the gutter
 * cross. The bar pins 20px below the top of the viewport, matching the
 * scrollbar's own left inset, so both float the same distance off the edge.
 *
 * The leading spacer is load-bearing, not decoration: a sticky element that is
 * the first thing in the flow has a natural (unscrolled) position of y=0, which
 * is already above its `top-5` threshold, so the browser sticks it immediately —
 * but flow layout still reserves space at the *unstuck* position, y=0. Without
 * the spacer the nav paints at y=20 while the next sibling starts at y=0, and
 * the nav renders directly over the first 20px of the title band beneath it.
 * The spacer gives the nav a real y=20 natural position, so stuck and natural
 * agree and nothing overlaps.
 */
export function AppTopNav() {
  return (
    <>
      <div aria-hidden className="h-5" />
      <div className="sticky top-5 z-50 flex h-[50px] border-b border-t border-border bg-transparent" data-sticky-nav>
        <Link
          aria-label="Chaos Market AI home"
          className="flex w-[70px] shrink-0 items-center justify-center border-r border-border pl-5 transition-opacity hover:opacity-80"
          href="/"
        >
          <ChaosLogo scrollAware size={30} />
        </Link>
        <div className="flex min-w-0 flex-1 items-center px-5 lg:pr-8">
          <AppNav />
        </div>
      </div>
    </>
  );
}
