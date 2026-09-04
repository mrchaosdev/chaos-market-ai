"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type ChaosLogoProps = {
  size?: number;
  withWordmark?: boolean;
  className?: string;
  /**
   * Crossfades to the white mark once the page has scrolled. The nav this sits
   * in has a transparent background, so once content moves underneath it the
   * colour mark can camouflage against similarly-toned chart lines; the plain
   * white mark holds contrast against the dark page background regardless of
   * what happens to be scrolling behind it.
   */
  scrollAware?: boolean;
};

export function ChaosLogo({ size = 28, withWordmark = false, className = "", scrollAware = false }: ChaosLogoProps) {
  const scrolled = useScrolled(scrollAware);

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
        <Image
          alt="Chaos Market AI"
          className={`object-contain transition-opacity duration-300 ${scrolled ? "opacity-0" : "opacity-100"}`}
          fill
          priority
          sizes={`${size}px`}
          src="/img/logormbg.png"
        />
        {scrollAware ? (
          <Image
            alt=""
            aria-hidden
            className={`object-contain transition-opacity duration-300 ${scrolled ? "opacity-100" : "opacity-0"}`}
            fill
            sizes={`${size}px`}
            src="/img/logowrmbg.png"
          />
        ) : null}
      </span>
      {withWordmark ? (
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-foreground">Chaos Market AI</span>
      ) : null}
    </span>
  );
}

/** True once the page has scrolled past a hairline threshold; always false when not scroll-aware. */
function useScrolled(enabled: boolean) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const read = () => setScrolled(window.scrollY > 4);
    read();
    window.addEventListener("scroll", read, { passive: true });

    return () => window.removeEventListener("scroll", read);
  }, [enabled]);

  return scrolled;
}
