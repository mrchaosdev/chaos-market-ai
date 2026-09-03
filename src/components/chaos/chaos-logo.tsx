import Image from "next/image";

/** Intrinsic size of public/img/logo.png — kept so the rendered box never changes the aspect ratio. */
const logoWidth = 1283;
const logoHeight = 1226;

type ChaosLogoProps = {
  size?: number;
  withWordmark?: boolean;
  className?: string;
};

export function ChaosLogo({ size = 28, withWordmark = false, className = "" }: ChaosLogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Image
        alt="Chaos Market AI"
        className="shrink-0"
        height={Math.round(size * (logoHeight / logoWidth))}
        priority
        src="/img/logo.png"
        width={size}
      />
      {withWordmark ? (
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-foreground">Chaos Market AI</span>
      ) : null}
    </span>
  );
}
