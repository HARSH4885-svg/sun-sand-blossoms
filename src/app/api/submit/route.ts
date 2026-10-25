import { NextResponse } from "next/server";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { limits, STORAGE_BUCKET } from "@/lib/config";
import { sniffImage, submissionSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Best-effort per-instance throttle. Add edge/WAF rate limiting for stronger protection.
const hits = new Map<string, number[]>();
function throttled(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 6;
}

const fail = (status: number, error: string, fields?: Record<string, string>) =>
  NextResponse.json({ ok: false, error, fields }, { status });

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return fail(503, "Submissions are not open yet. The organizers are still setting things up.");
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (throttled(ip)) return fail(429, "Too many attempts. Please wait a few minutes and try again.");

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, "We couldn't read that upload. Please try again.");
  }

  const parsed = submissionSchema.safeParse({
    fullName: String(form.get("fullName") ?? ""),
    enrollment: String(form.get("enrollment") ?? ""),
    branch: String(form.get("branch") ?? ""),
    email: String(form.get("email") ?? ""),
    caption: String(form.get("caption") ?? ""),
    confirmOwn: form.get("confirmOwn") === "true",
    publicConsent: form.get("publicConsent") === "true",
  });
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    parsed.error.issues.forEach((i) => (fields[String(i.path[0])] ??= i.message));
    return fail(400, "Please fix the highlighted fields.", fields);
  }
  const v = parsed.data;

  const files = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length < 1 || files.length > limits.maxPhotos) {
    return fail(400, `Please upload 1 or ${limits.maxPhotos} photos.`, { photos: "Add at least one photo" });
  }

  const buffers: { bytes: Uint8Array; ext: "jpg" | "png" | "webp" }[] = [];
  for (const file of files) {
    if (file.size > limits.maxUploadBytes) {
      return fail(400, "One of the photos is too large.", { photos: "Each photo must be under 2 MB after resizing" });
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const ext = sniffImage(bytes);
    if (!ext || !limits.mimeTypes.includes(file.type)) {
      return fail(400, "Only JPG, PNG or WebP photos are accepted.", { photos: "Unsupported file type" });
    }
    buffers.push({ bytes, ext });
  }

  const db = createServiceClient();

  // Friendly pre-check; the unique indexes remain the real guarantee.
  const { data: existing, error: lookupErr } = await db
    .from("submissions")
    .select("id")
    .or(`enrollment_number.ilike.${v.enrollment},email.eq.${v.email}`)
    .limit(1);
  if (lookupErr) return fail(500, "Something went wrong on our side. Please try again.");
  if (existing && existing.length > 0) {
    return fail(409, "A submission with this enrollment number or email already exists.");
  }

  const folder = crypto.randomUUID();
  const paths: string[] = [];
  for (let i = 0; i < buffers.length; i++) {
    const { bytes, ext } = buffers[i];
    const path = `${folder}/${i + 1}.${ext}`;
    const { error } = await db.storage.from(STORAGE_BUCKET).upload(path, bytes, {
      contentType: ext === "jpg" ? "image/jpeg" : `image/${ext}`,
      upsert: false,
    });
    if (error) {
      if (paths.length) await db.storage.from(STORAGE_BUCKET).remove(paths);
      return fail(500, "We couldn't store your photos. Please try again.");
    }
    paths.push(path);
  }

  const { data, error } = await db
    .from("submissions")
    .insert({
      full_name: v.fullName,
      enrollment_number: v.enrollment,
      email: v.email,
      branch: v.branch || null,
      caption: v.caption || null,
      image_paths: paths,
      public_consent: v.publicConsent,
      own_photo_confirmed: true,
    })
    .select("look_no")
    .single();

  if (error || !data) {
    await db.storage.from(STORAGE_BUCKET).remove(paths);
    if (error?.code === "23505") {
      return fail(409, "A submission with this enrollment number or email already exists.");
    }
    return fail(500, "We couldn't save your submission. Please try again.");
  }

  return NextResponse.json({ ok: true, lookNo: data.look_no });
}
