import { z } from "zod";
import { limits } from "./config";

const clean = (s: string) => s.trim().replace(/\s+/g, " ");

export const detailsSchema = z.object({
  fullName: z
    .string()
    .transform(clean)
    .pipe(z.string().min(2, "Please enter your full name").max(80, "That name is too long")),
  enrollment: z
    .string()
    .transform((s) => s.trim().toUpperCase())
    .pipe(z.string().regex(/^[A-Z0-9]{5,20}$/, "Use 5–20 letters or digits, no spaces")),
  branch: limits.requireBranch
    ? z.string().transform(clean).pipe(z.string().min(2, "Please enter your branch").max(60))
    : z.string().transform(clean).pipe(z.string().max(60)),
  email: z
    .string()
    .transform((s) => s.trim().toLowerCase())
    .pipe(
      z
        .string()
        .email("Enter a valid email address")
        .max(120)
        .refine((e) => e.endsWith("@" + limits.allowedEmailDomain), `Use your @${limits.allowedEmailDomain} email`),
    ),
});

export const lookSchema = z.object({
  caption: z.string().transform(clean).pipe(z.string().max(limits.captionMax, `Keep it under ${limits.captionMax} characters`)),
});

export const consentSchema = z.object({
  confirmOwn: z.literal(true, { errorMap: () => ({ message: "Please confirm the photos show you" }) }),
  publicConsent: z.boolean(),
});

export const submissionSchema = detailsSchema.merge(lookSchema).merge(consentSchema);

export type SubmissionInput = z.infer<typeof submissionSchema>;

/** Detect real image type from magic bytes (never trust the declared MIME type). */
export function sniffImage(bytes: Uint8Array): "jpg" | "png" | "webp" | null {
  if (bytes.length > 12 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png";
  if (
    bytes.length > 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  )
    return "webp";
  return null;
}
