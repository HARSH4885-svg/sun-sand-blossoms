"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CalendarDays, Clock, MapPin } from "lucide-react";
import { copy, event } from "@/lib/config";
import { Blossom, Leaf, Palm, SandWave, Sun } from "./Botanicals";

const petals = [
  { left: "8%", size: 22, delay: 0, dur: 14 },
  { left: "24%", size: 16, delay: 3, dur: 17 },
  { left: "46%", size: 20, delay: 6, dur: 15 },
  { left: "68%", size: 14, delay: 1.5, dur: 18 },
  { left: "88%", size: 24, delay: 8, dur: 16 },
];

export function Hero() {
  const reduce = useReducedMotion();
  const rise = (delay: number) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 28 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] as const } };

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-ivory via-[#FFEFD9] to-[#FBD9B5] pt-24">
      {!reduce &&
        petals.map((p, i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            className="pointer-events-none absolute top-0 -z-0 block"
            style={{ left: p.left, width: p.size, height: p.size }}
            animate={{ y: ["-5vh", "95vh"], x: [0, 30, -20, 10], rotate: [0, 160, 320] }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "linear" }}
          >
            <Blossom className="h-full w-full opacity-60" />
          </motion.span>
        ))}

      <div className="mx-auto grid min-h-[calc(100svh-6rem)] max-w-7xl items-center gap-10 px-5 pb-16 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-6">
        <div className="relative z-10">
          <motion.p {...rise(0.05)} className="eyebrow">
            {event.fullName.toUpperCase()}
          </motion.p>
          <motion.span
            {...rise(0.12)}
            className="mt-4 inline-block rounded-full border border-tropical/40 px-4 py-1.5 text-[11px] font-semibold tracking-[0.25em] text-tropical"
          >
            {event.badge}
          </motion.span>
          <motion.h1 {...rise(0.2)} className="mt-6 text-[clamp(3rem,10vw,7.25rem)] font-medium leading-[0.92] tracking-tight">
            Your Look.
            <br />
            <span className="italic text-tropical">Your Moment.</span>
          </motion.h1>
          <motion.p {...rise(0.32)} className="mt-6 max-w-md text-lg leading-relaxed text-cocoa/85">
            {copy.hero.sub}
          </motion.p>
          <motion.div {...rise(0.44)} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/submit" className="btn-sun">
              Enter the Competition <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link href="/#how" className="btn-line">
              See How It Works
            </Link>
          </motion.div>

          <motion.dl {...rise(0.56)} className="mt-12 grid max-w-xl grid-cols-1 gap-4 border-t border-cocoa/15 pt-6 sm:grid-cols-3">
            {[
              { icon: CalendarDays, label: "Date", value: event.date },
              { icon: MapPin, label: "Venue", value: event.venue },
              { icon: Clock, label: "Submit by", value: event.deadline },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 sm:block">
                <Icon size={16} className="mt-1 text-tropical sm:mb-2" aria-hidden="true" />
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.25em] text-cocoa/60">{label}</dt>
                  <dd className="font-display text-lg leading-snug">{value}</dd>
                </div>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Editorial composition: arch window with sun, dunes and layered botanicals */}
        <motion.div
          {...(reduce ? {} : { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 1, delay: 0.25 } })}
          className="relative mx-auto aspect-[4/5] w-full max-w-md lg:max-w-none"
          aria-hidden="true"
        >
          <div className="absolute inset-0 overflow-hidden rounded-t-[999px] rounded-b-[2rem] bg-gradient-to-b from-[#FFD9A0] via-[#F9A66A] to-[#F2A6B3] shadow-soft">
            <Sun className="absolute left-1/2 top-[14%] w-[62%] -translate-x-1/2" />
            <SandWave className="absolute inset-x-0 bottom-[8%] h-[34%] w-full" color="#E8D4B5" />
            <SandWave className="absolute inset-x-0 bottom-0 h-[26%] w-full" color="#D9BC93" />
            <Palm className="absolute -left-[8%] bottom-[10%] w-[58%]" />
          </div>
          <Leaf className="absolute -left-4 bottom-8 h-40 w-auto -rotate-12 sm:-left-8 sm:h-56" />
          <Blossom className="absolute -right-3 top-[18%] w-24 rotate-12 sm:-right-8 sm:w-36" />
          <Blossom className="absolute bottom-[14%] right-[6%] w-20 -rotate-[20deg] sm:w-28" color="#F28C45" center="#FFF9F0" />
          <Blossom className="absolute left-[4%] top-[40%] w-14 sm:w-20" color="#FFF9F0" center="#F28C45" />
        </motion.div>
      </div>

      <SandWave className="absolute inset-x-0 bottom-0 -z-0 h-16 w-full" color="#FFF9F0" />
    </section>
  );
}
