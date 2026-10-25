import Link from "next/link";
import { ArrowRight, Camera, Shirt, Sparkles } from "lucide-react";
import { copy, event, rules } from "@/lib/config";
import { Blossom, Leaf } from "./Botanicals";

export function Intro() {
  return (
    <section id="competition" className="relative overflow-hidden bg-ivory px-5 py-24 sm:px-8 lg:py-36">
      <Blossom className="absolute -right-10 top-10 w-48 opacity-70 sm:w-72" />
      <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <div>
          <p className="eyebrow">The Competition</p>
          <h2 className="mt-4 text-5xl font-medium leading-[1.02] sm:text-6xl lg:text-7xl">{copy.intro.headline}</h2>
        </div>
        <div className="self-end">
          <p className="font-display text-2xl leading-relaxed text-cocoa/90 sm:text-3xl">{copy.intro.body}</p>
          <Link href="/submit" className="btn-leaf mt-8">
            Submit Your Look <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

const icons = [Shirt, Camera, Sparkles];

export function HowItWorks() {
  return (
    <section id="how" className="bg-sand/45 px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow">How it works</p>
        <h2 className="mt-4 text-4xl font-medium sm:text-5xl">Three steps to the spotlight.</h2>
        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {copy.steps.map((s, i) => {
            const Icon = icons[i];
            return (
              <li
                key={s.title}
                className="group relative overflow-hidden rounded-card bg-ivory p-8 transition duration-500 hover:-translate-y-1.5 hover:shadow-soft"
              >
                <span className="absolute -right-2 -top-6 font-display text-[9rem] font-semibold leading-none text-blossom/30 transition duration-500 group-hover:text-sunset/30">
                  {i + 1}
                </span>
                <Icon className="relative text-tropical" size={28} aria-hidden="true" />
                <h3 className="relative mt-10 text-3xl font-medium">{s.title}</h3>
                <p className="relative mt-3 leading-relaxed text-cocoa/80">{s.body}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export function Rules() {
  return (
    <section id="rules" className="relative overflow-hidden bg-tropical px-5 py-24 text-ivory sm:px-8">
      <Leaf className="absolute -left-10 bottom-0 h-72 rotate-[20deg] opacity-30" color="#FFF9F0" />
      <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blossom">Rules</p>
          <h2 className="mt-4 text-4xl font-medium sm:text-5xl">Fair play, good light.</h2>
          <p className="mt-4 text-ivory/80">
            Submission closes: <span className="font-semibold text-ivory">{event.deadline}</span>
          </p>
        </div>
        <ol className="divide-y divide-ivory/15 border-y border-ivory/15">
          {rules.map((r, i) => (
            <li key={r} className="flex gap-5 py-4">
              <span className="font-display text-xl text-blossom">{String(i + 1).padStart(2, "0")}</span>
              <span className="leading-relaxed">{r}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FBD9B5] to-blossom/70 px-5 py-28 text-center sm:px-8 lg:py-40">
      <Blossom className="absolute -left-10 top-6 w-40 -rotate-12 opacity-80 sm:w-60" color="#FFF9F0" center="#F28C45" />
      <Blossom className="absolute -right-8 bottom-6 w-44 rotate-12 opacity-80 sm:w-64" color="#F28C45" center="#FFF9F0" />
      <div className="relative mx-auto max-w-3xl">
        <h2 className="text-5xl font-medium leading-none sm:text-7xl lg:text-8xl">{copy.cta.headline}</h2>
        <p className="mx-auto mt-6 max-w-md text-lg text-cocoa/85">{copy.cta.body}</p>
        <Link href="/submit" className="btn-leaf mt-10">
          Submit Your Look <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-cocoa px-5 py-14 text-ivory sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl font-semibold tracking-wide">{event.wordmark}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.3em] text-blossom">{event.fullName}</p>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ivory/70">{copy.privacy}</p>
        </div>
        <nav aria-label="Footer">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ivory/60">Explore</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className="hover:text-blossom" href="/#competition">The Competition</Link></li>
            <li><Link className="hover:text-blossom" href="/#how">How It Works</Link></li>
            <li><Link className="hover:text-blossom" href="/#rules">Rules</Link></li>
            <li><Link className="hover:text-blossom" href="/submit">Submit Your Look</Link></li>
          </ul>
        </nav>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ivory/60">Organizers</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className="hover:text-blossom" href="/admin">Organizer sign-in</Link></li>
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-12 max-w-6xl border-t border-ivory/10 pt-6 text-xs text-ivory/50">
        © 2026 IIITA Freshers Party. Sun, Sand &amp; Blossoms.
      </p>
    </footer>
  );
}
