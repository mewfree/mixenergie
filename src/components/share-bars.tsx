type Segment = {
  key: string;
  share: number;
  color: string;
  title?: string;
};

/** Stacked proportional bar; zero-width segments are skipped. */
export function SegmentBar({
  segments,
  className,
}: {
  segments: Segment[];
  className: string;
}) {
  return (
    <div className={`flex w-full gap-px overflow-hidden bg-wash ${className}`}>
      {segments.map(
        ({ key, share, color, title }) =>
          share > 0 && (
            <span
              key={key}
              style={{ width: `${share}%`, background: color }}
              className="h-full"
              title={title}
            />
          ),
      )}
    </div>
  );
}

/** Square color key, used in place of a round bullet. */
export function Swatch({ color }: { color: string }) {
  return <span className="h-2.5 w-2.5 shrink-0" style={{ background: color }} />;
}

/** Shared heading block for each page section. */
export function SectionHeader({
  title,
  meta,
  aside,
}: {
  title: string;
  meta?: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-ink">{title}</h2>
        {meta ? <p className="mt-1 text-sm text-muted">{meta}</p> : null}
      </div>
      {aside}
    </div>
  );
}
