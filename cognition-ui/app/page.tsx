import { Nav } from "@/features/marketing/components/Nav";
import { Hero } from "@/features/marketing/components/Hero";
import { DemoPreview } from "@/features/marketing/components/DemoPreview";
import { ArchetypeShowcase } from "@/features/marketing/components/ArchetypeShowcase";
import { HowItWorks } from "@/features/marketing/components/HowItWorks";
import { Footer } from "@/features/marketing/components/Footer";

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg-base)" }}
    >
      <Nav />
      <main className="flex-1">
        <Hero />
        <DemoPreview />
        <ArchetypeShowcase />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
