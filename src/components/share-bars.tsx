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
    <div className={`flex w-full gap-0.5 overflow-hidden rounded-md bg-paper ${className}`}>
      {segments.map(
        ({ key, share, color, title }) =>
          share > 0 && (
            <span
              key={key}
              style={{ width: `${share}%`, background: color }}
              className="h-full transition-all duration-300 first:rounded-l-sm last:rounded-r-sm"
              title={title}
            />
          ),
      )}
    </div>
  );
}

/** Thin single-value bar, always visible when the share is non-zero. */
export function MiniBar({ share, color }: { share: number; color: string }) {
  return (
    <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-paper sm:block">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${Math.max(share, share > 0 ? 1 : 0)}%`, background: color }}
      />
    </div>
  );
}
