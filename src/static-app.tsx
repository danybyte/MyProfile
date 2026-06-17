import { About } from "@/components/site/About";
import { Hero } from "@/components/site/Hero";
import { MarqueeFooter } from "@/components/site/MarqueeFooter";
import { StaticMonitoring } from "@/components/site/StaticMonitoring";

export function StaticApp() {
  return (
    <main className="min-h-screen bg-white text-black antialiased">
      <Hero />
      <About />
      <StaticMonitoring />
      <MarqueeFooter />
    </main>
  );
}
