import { useState, type CSSProperties, type PointerEvent } from "react";
import ScrambleLinkButton from "@/components/ui/scramble-link-button";
import { Reveal } from "./Reveal";

const LINKS = [
  {
    label: "FA Channel",
    href: "https://www.youtube.com/@theDanyByte",
    kind: "YouTube",
    username: "theDanyByte",
  },
  {
    label: "EN Channel",
    href: "https://www.youtube.com/@DanyByteBug",
    kind: "YouTube",
    username: "DanyByteBug",
  },
  { label: "GitHub", href: "https://github.com/danybyte", kind: "Code", username: "danybyte" },
  {
    label: "Telegram",
    href: "https://t.me/DanyByteCH",
    kind: "Channel",
    username: "DanyByteCH",
  },
  { label: "X", href: "https://x.com/DanyByte11", kind: "Social", username: "danybyte11" },
  {
    label: "Email",
    href: "https://mail.google.com/mail/?view=cm&fs=1&to=thedanybyte@gmail.com",
    kind: "Contact",
    username: "thedanybyte",
  },
];

export function Hero() {
  return (
    <section className="snap-section min-h-svh border-b border-border px-6 pt-24 pb-20 md:pt-32 md:pb-28">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Profile / DanyByte
          </p>
        </Reveal>
        <Reveal delay={80}>
          <HeroName />
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            A curious that make things, learn things, and write about both.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <ul className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-6">
            {LINKS.map((l) => (
              <li key={l.href} className="bg-card">
                <ScrambleLinkButton
                  btnText={l.label}
                  hoverText={l.username}
                  href={l.href}
                  hoverColor="#8be9d4"
                  showLine
                  showArrow
                  eyebrow={l.kind}
                  className="flex h-full w-full flex-col justify-between gap-6 p-5"
                />
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

function HeroName() {
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0, active: false });

  function moveSpotlight(event: PointerEvent<HTMLSpanElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setSpotlight({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      active: true,
    });
  }

  const spotlightStyle = {
    "--hero-spotlight-x": `${spotlight.x}px`,
    "--hero-spotlight-y": `${spotlight.y}px`,
  } as CSSProperties;

  return (
    <h1 className="mt-6 font-display text-[16vw] leading-[0.9] tracking-tight sm:text-[14vw] md:text-[9rem]">
      <span
        className="hero-name group relative -mx-[0.16em] inline-block max-w-full select-none px-[0.16em] py-[0.08em]"
        style={spotlightStyle}
        onPointerEnter={moveSpotlight}
        onPointerMove={moveSpotlight}
        onPointerLeave={() => setSpotlight((current) => ({ ...current, active: false }))}
      >
        <span className="relative z-0 block transition-colors duration-200 group-hover:text-foreground/70">
          DanyByte.
        </span>
        <span
          aria-hidden="true"
          className={`hero-name__disc pointer-events-none absolute z-10 rounded-full bg-white shadow-[0_18px_60px_rgba(255,255,255,0.18)] transition-opacity duration-150 ${
            spotlight.active ? "opacity-100" : "opacity-0"
          }`}
        />
        <span
          aria-hidden="true"
          className={`hero-name__reveal pointer-events-none absolute inset-0 z-20 block whitespace-nowrap px-[0.16em] py-[0.08em] text-black transition-opacity duration-150 ${
            spotlight.active ? "opacity-100" : "opacity-0"
          }`}
        >
          Daniel Asadi.
        </span>
      </span>
    </h1>
  );
}
