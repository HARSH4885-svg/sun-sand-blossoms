"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { event } from "@/lib/config";

const links = [
  { href: "/#competition", label: "The Competition" },
  { href: "/submit", label: "Submit Your Look" },
  { href: "/#rules", label: "Rules" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition duration-300 ${
        scrolled || open ? "bg-ivory/90 shadow-[0_1px_0_rgba(52,37,31,0.08)] backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <nav aria-label="Primary" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="leading-tight" onClick={() => setOpen(false)}>
          <span className="block font-display text-lg font-semibold tracking-wide">{event.wordmark}</span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.3em] text-tropical">{event.label}</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.slice(0, 1).concat(links.slice(2)).map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-cocoa/80 transition hover:text-cocoa">
              {l.label}
            </Link>
          ))}
          <Link href="/submit" className="btn-sun !px-5 !py-2.5">
            Submit Your Look
          </Link>
        </div>

        <button
          type="button"
          className="rounded-full p-2 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-cocoa/10 bg-ivory px-5 pb-6 pt-3 md:hidden">
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-cocoa/10 py-4 font-display text-2xl"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
