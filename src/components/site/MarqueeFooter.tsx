const WORDS = ["Learning", "Browsing", "Coding", "Scrolling", "Reading", "Debugging"];

export function MarqueeFooter() {
  const track = [...WORDS, ...WORDS];
  return (
    <footer className="overflow-hidden bg-card text-card-foreground">
      <div className="border-b border-border px-6 py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          <span>© {new Date().getFullYear()} DanyByte</span>
          <span>Built while learning.</span>
        </div>
      </div>
      <div className="group relative py-16 md:py-24">
        <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-12 whitespace-nowrap group-hover:[animation-play-state:paused]">
          {track.map((w, i) => (
            <span
              key={i}
              className="font-display text-[14vw] leading-none tracking-tight md:text-[10rem]"
            >
              {w} <span className="text-primary">·</span>
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
