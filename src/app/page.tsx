import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { FinalCta, Footer, HowItWorks, Intro, Rules } from "@/components/Sections";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Intro />
        <HowItWorks />
        <Rules />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
