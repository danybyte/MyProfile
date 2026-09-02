import { Reveal } from "./Reveal";

export function About() {
  return (
    <section id="about" className="snap-section border-b border-border px-6 py-24 md:py-32">
      <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-[1fr_2fr] md:gap-20">
        <Reveal>
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            About me
          </h2>
        </Reveal>
        <div className="space-y-6 text-lg leading-relaxed md:text-xl">
          <Reveal delay={80}>
            <p>
              Hello everyone, I am <span className="font-display font-medium">Daniel</span>. Born on
              September 11, 2011, I was interested in consoles and computers childhood and I always
              tried to make my console and computer more special.
            </p>
          </Reveal>
          <Reveal delay={160}>
            <p>
              Later I realized that I really like the world of technology. In 2023, my father
              enrolled me in a training school to learn Python and from there I realized my love for
              programming. I like to learn more and more programming languages.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <dl className="mt-10 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3">
              {[
                ["Born", "Sep 11, 2011"],
                ["Started coding", "2023"],
                ["First language", "Python"],
              ].map(([k, v]) => (
                <div key={k} className="bg-card p-4">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    {k}
                  </dt>
                  <dd className="mt-2 font-display text-base">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
