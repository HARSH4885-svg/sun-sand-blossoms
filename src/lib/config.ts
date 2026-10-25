// Single place for editable event copy, rules and limits.
// Dates and venue come from environment variables; nothing is invented.

export const TBA = "To be announced";

export const event = {
  wordmark: "SUN, SAND & BLOSSOMS",
  label: "IIITA FRESHERS 2026",
  fullName: "IIITA Freshers Party 2026",
  badge: "SUN • SAND • BLOSSOMS",
  // Defaults supplied by the organizers; env vars can still override them.
  date: process.env.NEXT_PUBLIC_EVENT_DATE || "25 October 2026",
  venue: process.env.NEXT_PUBLIC_EVENT_VENUE || "Auditorium, IIIT Allahabad",
  deadline: process.env.NEXT_PUBLIC_SUBMISSION_DEADLINE || "3:00 PM",
};

export const copy = {
  hero: {
    headline: "Your Look. Your Moment.",
    sub: "Step into the sunshine. Bring your style to the bloom.",
  },
  intro: {
    headline: "A Little Sunshine. A Lot of Style.",
    body: "From effortless elegance to bold statement fits, bring the look that feels unmistakably you. Celebrate your individuality, own your moment, and let your style bloom.",
  },
  steps: [
    { title: "Style It", body: "Put together your best outfit inspired by your own style and the event vibe." },
    { title: "Capture It", body: "Upload your best outfit photo." },
    { title: "Own the Spotlight", body: "Your submission enters the Best Outfit competition." },
  ],
  cta: {
    headline: "Let Your Style Bloom.",
    body: "The spotlight is yours. Make your entrance count.",
  },
  privacy:
    "Photos are shown publicly only with the participant's explicit consent. Email addresses and enrollment numbers are never displayed.",
};

export const rules: string[] = [
  "Participation is open to eligible IIITA freshers.",
  "Each participant may submit up to two photos, subject to organizer rules.",
  "Photos must feature the participant's own outfit.",
  "Inappropriate, misleading or unauthorized submissions may be rejected.",
  "Participants must confirm that they have permission to submit the photos.",
  "Photos will only be displayed publicly with the participant's explicit consent.",
  "The organizers' published judging criteria and decisions will govern the competition.",
];

export const limits = {
  maxPhotos: 2,
  /** Raw file the user may pick. It is resized in the browser before upload. */
  maxRawBytes: 12 * 1024 * 1024,
  /** Per-file size accepted by the server (keeps two photos under typical 4.5MB host body limits). */
  maxUploadBytes: 2 * 1024 * 1024,
  mimeTypes: ["image/jpeg", "image/png", "image/webp"] as string[],
  captionMax: 140,
  requireBranch: true,
  allowedEmailDomain: (process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN || "iiita.ac.in").toLowerCase(),
};

/**
 * Judging is intentionally separate from collection and OFF by default.
 * "judges"   -> private judge scoring (see judge_scores table in the migration)
 * "audience" -> public vote (not implemented; needs an identity system first)
 */
export type JudgingMode = "off" | "judges" | "audience";
export const judgingMode: JudgingMode = "off";

export const STORAGE_BUCKET = "submissions";
