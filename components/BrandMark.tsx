type BrandMarkProps = {
  className?: string;
  title?: string;
};

/** Same mark as the browser tab icon — keepsleeve card with foil slash. */
export function BrandMark({
  className = "h-8 w-8",
  title = "Keepsleeve",
}: BrandMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <rect width="32" height="32" rx="7" fill="#101411" />
      <rect x="7" y="3.5" width="18" height="25" rx="3" fill="#c4a35a" />
      <rect x="9" y="5.5" width="14" height="21" rx="2" fill="#171c18" />
      <rect x="11" y="7.5" width="10" height="9" rx="1.5" fill="#2b3530" />
      <path d="M11.5 8h9L15 16h-3.5V8Z" fill="#e4c56f" />
      <rect x="11" y="18.5" width="10" height="2.75" rx="1" fill="#c4a35a" />
      <circle cx="16" cy="23.75" r="1.35" fill="#e4c56f" />
    </svg>
  );
}

type BrandLogoProps = {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  showWordmark?: boolean;
};

/** App logo: icon + Keepsleeve wordmark. */
export function BrandLogo({
  className = "",
  markClassName = "h-8 w-8 shrink-0",
  wordmarkClassName = "font-[family-name:var(--font-brand)] text-base font-extrabold tracking-tight text-[var(--ink)]",
  showWordmark = true,
}: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <BrandMark className={markClassName} />
      {showWordmark && <span className={wordmarkClassName}>Keepsleeve</span>}
    </span>
  );
}
