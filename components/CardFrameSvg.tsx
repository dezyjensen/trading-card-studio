import type { CardTheme, ThemeId } from "@/lib/themes";

type FrameProps = {
  theme: CardTheme;
  accent: string;
  secondary: string;
};

export function CardFrameSvg({ theme, accent, secondary }: FrameProps) {
  const id = theme.id;
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 300 420"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.95" />
          <stop offset="45%" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="100%" stopColor={secondary} stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={`${id}-edge`} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.7" />
          <stop offset="100%" stopColor={secondary} stopOpacity="0.4" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Dual rim like physical card stock */}
      <rect
        x="5"
        y="5"
        width="290"
        height="410"
        rx={theme.radius}
        fill="none"
        stroke={`url(#${id}-rim)`}
        strokeWidth="3.5"
      />
      <rect
        x="11"
        y="11"
        width="278"
        height="398"
        rx={Math.max(theme.radius - 4, 1)}
        fill="none"
        stroke={`url(#${id}-edge)`}
        strokeWidth="1.25"
        opacity="0.85"
      />

      <ThemeOrnaments id={id} accent={accent} secondary={secondary} />
    </svg>
  );
}

function ThemeOrnaments({
  id,
  accent,
  secondary,
}: {
  id: ThemeId;
  accent: string;
  secondary: string;
}) {
  if (id === "aurora") {
    return (
      <g filter={`url(#${id}-glow)`}>
        {/* Crystal facets at corners */}
        <path d="M22 28 L38 18 L54 28 L38 38 Z" fill={accent} opacity="0.55" />
        <path d="M246 28 L262 18 L278 28 L262 38 Z" fill={secondary} opacity="0.5" />
        <path d="M22 392 L38 382 L54 392 L38 402 Z" fill={secondary} opacity="0.45" />
        <path d="M246 392 L262 382 L278 392 L262 402 Z" fill={accent} opacity="0.5" />
        <circle cx="150" cy="14" r="3.5" fill={accent} />
        <circle cx="150" cy="406" r="3.5" fill={secondary} />
        {/* Side gem notches */}
        <path d="M8 210 L16 200 L16 220 Z" fill={accent} opacity="0.7" />
        <path d="M292 210 L284 200 L284 220 Z" fill={secondary} opacity="0.7" />
      </g>
    );
  }

  if (id === "ember") {
    return (
      <g>
        {/* Rivets */}
        {[28, 80, 140, 210, 280, 340, 390].map((y) => (
          <g key={y}>
            <circle cx="16" cy={y} r="3" fill={accent} opacity="0.75" />
            <circle cx="284" cy={y} r="3" fill={accent} opacity="0.75" />
          </g>
        ))}
        {/* Forged chevrons */}
        <path
          d="M30 26 L45 16 L60 26 M240 26 L255 16 L270 26"
          fill="none"
          stroke={accent}
          strokeWidth="2"
          opacity="0.8"
        />
        <path
          d="M30 394 L45 404 L60 394 M240 394 L255 404 L270 394"
          fill="none"
          stroke={secondary}
          strokeWidth="2"
          opacity="0.75"
        />
        <rect x="130" y="8" width="40" height="6" rx="1" fill={accent} opacity="0.6" />
      </g>
    );
  }

  if (id === "noir") {
    return (
      <g stroke={accent} fill="none">
        {/* Filigree corners */}
        <path
          d="M24 24 C40 18, 48 28, 56 24 M24 24 C28 40, 24 48, 28 56"
          strokeWidth="1.2"
          opacity="0.9"
        />
        <path
          d="M276 24 C260 18, 252 28, 244 24 M276 24 C272 40, 276 48, 272 56"
          strokeWidth="1.2"
          opacity="0.9"
        />
        <path
          d="M24 396 C40 402, 48 392, 56 396 M24 396 C28 380, 24 372, 28 364"
          strokeWidth="1.2"
          opacity="0.85"
        />
        <path
          d="M276 396 C260 402, 252 392, 244 396 M276 396 C272 380, 276 372, 272 364"
          strokeWidth="1.2"
          opacity="0.85"
        />
        <rect x="20" y="20" width="260" height="380" strokeWidth="0.6" opacity="0.35" />
        <circle cx="150" cy="24" r="2.5" fill={accent} stroke="none" />
        <circle cx="150" cy="396" r="2.5" fill={accent} stroke="none" />
      </g>
    );
  }

  if (id === "arcade") {
    return (
      <g>
        {/* Pixel corner blocks */}
        <rect x="4" y="4" width="14" height="14" fill={accent} />
        <rect x="282" y="4" width="14" height="14" fill={secondary} />
        <rect x="4" y="402" width="14" height="14" fill={secondary} />
        <rect x="282" y="402" width="14" height="14" fill={accent} />
        {/* Neon ticks */}
        {[50, 120, 210, 300, 370].map((y) => (
          <g key={y}>
            <rect x="2" y={y} width="8" height="3" fill={accent} opacity="0.85" />
            <rect x="290" y={y} width="8" height="3" fill={secondary} opacity="0.85" />
          </g>
        ))}
        <rect x="40" y="6" width="60" height="3" fill={accent} />
        <rect x="200" y="411" width="60" height="3" fill={secondary} />
      </g>
    );
  }

  // garden
  return (
    <g>
      <path
        d="M36 30 C48 12, 72 14, 84 32 C70 26, 52 34, 36 30 Z"
        fill={secondary}
        opacity="0.65"
      />
      <path
        d="M216 30 C228 12, 252 14, 264 32 C250 26, 232 34, 216 30 Z"
        fill={accent}
        opacity="0.55"
      />
      <path
        d="M36 390 C48 408, 72 406, 84 388 C70 394, 52 386, 36 390 Z"
        fill={accent}
        opacity="0.5"
      />
      <path
        d="M216 390 C228 408, 252 406, 264 388 C250 394, 232 386, 216 390 Z"
        fill={secondary}
        opacity="0.55"
      />
      {/* Vine side curves */}
      <path
        d="M14 90 C22 130, 10 170, 18 210 C10 250, 22 290, 14 330"
        fill="none"
        stroke={accent}
        strokeWidth="1.5"
        opacity="0.55"
      />
      <path
        d="M286 90 C278 130, 290 170, 282 210 C290 250, 278 290, 286 330"
        fill="none"
        stroke={secondary}
        strokeWidth="1.5"
        opacity="0.55"
      />
    </g>
  );
}
