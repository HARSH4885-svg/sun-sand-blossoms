import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SubmitForm } from "@/components/SubmitForm";
import { Blossom, Leaf } from "@/components/Botanicals";
import { event } from "@/lib/config";

export const metadata: Metadata = {
  title: "Submit Your Look · IIITA Freshers 2026 Best Outfit",
  description: "Enter the Best Outfit competition for the IIITA Freshers Party 2026.",
};

export default function SubmitPage() {
  return (
    <main id="main" className="relative min-h-svh overflow-hidden bg-gradient-to-b from-ivory via-[#FFEFD9] to-[#FBD9B5] px-5 pb-20 pt-6 sm:px-8">
      <Blossom className="pointer-events-none absolute -right-12 top-24 w-52 opacity-60 sm:w-72" />
      <Leaf className="pointer-events-none absolute -left-8 bottom-10 hidden h-64 rotate-12 opacity-25 sm:block" />
      <div className="relative mx-auto max-w-2xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-cocoa/75 hover:text-cocoa">
          <ArrowLeft size={16} aria-hidden="true" /> Back to {event.wordmark}
        </Link>
        <header className="mt-8">
          <p className="eyebrow">{event.label} · Best Outfit</p>
          <h1 className="mt-3 text-5xl font-medium leading-none sm:text-6xl">Submit your look.</h1>
          <p className="mt-4 text-cocoa/80">Three quick steps. Deadline: {event.deadline}.</p>
        </header>
        <SubmitForm />
      </div>
    </main>
  );
}
