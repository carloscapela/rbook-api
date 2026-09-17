const GRID_LEFT = [
  ["sage-2", "sage-1", "sage-3", "sage-3"],
  ["sage-3", "sage-2", "sage-1", "sage-3"],
  ["sage-4", "sage-1", "sage-2", "sage-3"],
  ["sage-2", "sage-1", "sage-3", "sage-2"],
] as const;

const GRID_RIGHT = [
  ["sage-3", "sage-3", "sage-2", "sage-3"],
  ["sage-3", "sage-1", "sage-3", "sage-2"],
  ["sage-3", "sage-2", "sage-3", "sage-5"],
  ["sage-3", "sage-3", "sage-3", "sage-4"],
] as const;

const CELL = 13;
const GAP = 3;
const STEP = CELL + GAP;

function Page({ cols, startX }: { cols: readonly (readonly string[])[]; startX: number }) {
  return (
    <>
      {cols.map((row, rowIndex) =>
        row.map((tone, colIndex) => (
          <rect
            key={`${rowIndex}-${colIndex}`}
            x={startX + colIndex * STEP}
            y={45 + rowIndex * STEP}
            width={CELL}
            height={CELL}
            rx={3}
            fill={`var(--${tone})`}
          />
        ))
      )}
    </>
  );
}

export function BookMark({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={(size * 160) / 200}
      viewBox="0 0 200 160"
      role="img"
      aria-label="rbook"
    >
      <path
        d="M100,32 C100,32 72,22 42,27 C27,29 20,37 20,47 L20,118 C20,128 27,136 42,134 C72,139 100,128 100,128 Z"
        fill="none"
        stroke="var(--foreground)"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <path
        d="M100,32 C100,32 128,22 158,27 C173,29 180,37 180,47 L180,118 C180,128 173,136 158,134 C128,139 100,128 100,128 Z"
        fill="none"
        stroke="var(--foreground)"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <path
        d="M92,130 Q100,138 108,130"
        fill="none"
        stroke="var(--foreground)"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Page cols={GRID_LEFT} startX={30} />
      <Page cols={GRID_RIGHT} startX={109} />
    </svg>
  );
}

export function BookLogo({
  size = 40,
  withWordmark = true,
}: {
  size?: number;
  withWordmark?: boolean;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.625rem",
      }}
    >
      <BookMark size={size} />
      {withWordmark && (
        <span
          style={{
            fontFamily: "var(--font-wordmark)",
            fontSize: `${size * 0.5}px`,
            color: "var(--foreground)",
          }}
        >
          rbook
        </span>
      )}
    </span>
  );
}
