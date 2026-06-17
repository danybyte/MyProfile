import { Reveal } from "./Reveal";

const LINKS = [
  { label: "FA Channel", href: "https://www.youtube.com/@theDanyByte", kind: "YouTube" },
  { label: "EN Channel", href: "https://www.youtube.com/@DanyByteBug", kind: "YouTube" },
  { label: "GitHub", href: "https://github.com/danybyte", kind: "Code" },
  { label: "Telegram", href: "https://t.me/DanyByteCH", kind: "Channel" },
  { label: "X", href: "https://x.com/DanyByte11", kind: "Social" },
];

export function Hero() {
  return (
    <section className="border-b border-black/10 px-6 pt-24 pb-20 md:pt-32 md:pb-28">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-black/60">
            Profile / DanyByte
          </p>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mt-6 font-display text-[14vw] leading-[0.9] tracking-tight md:text-[9rem]">
            DanyByte.
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-black/70 md:text-xl">
            A curious that make things, learn things, and write about both.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <ul className="mt-12 grid gap-px border border-black/10 bg-black/10 sm:grid-cols-2 lg:grid-cols-5">
            {LINKS.map((l) => (
              <li key={l.href} className="bg-white">
                <a
                  href={l.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group flex h-full flex-col justify-between gap-6 p-5 transition-colors duration-300 hover:bg-black hover:text-white"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/50 transition-colors group-hover:text-white/60">
                    {l.kind}
                  </span>
                  <span className="font-display text-xl">
                    {l.label}
                    <span className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1">
                      ↗
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
