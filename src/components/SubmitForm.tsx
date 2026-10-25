"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, Check, ImagePlus, Loader2, Replace, X } from "lucide-react";
import { limits } from "@/lib/config";
import { consentSchema, detailsSchema, lookSchema } from "@/lib/validation";

type Fields = { fullName: string; enrollment: string; branch: string; email: string; caption: string };
type Errors = Partial<Record<string, string>>;
type Photo = { file: File; preview: string };

const steps = ["Your details", "Your look", "Review & submit"];

/** Resize in the browser so uploads stay small and fast. Falls back to the original file. */
async function shrink(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const max = 1800;
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    for (const q of [0.86, 0.72, 0.6]) {
      const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/jpeg", q));
      if (blob && blob.size <= limits.maxUploadBytes) {
        return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
      }
    }
  } catch {
    /* use original */
  }
  return file;
}

function zodErrors(issues: { path: (string | number)[]; message: string }[]): Errors {
  const out: Errors = {};
  issues.forEach((i) => (out[String(i.path[0])] ??= i.message));
  return out;
}

export function SubmitForm() {
  const [step, setStep] = useState(0);
  const [f, setF] = useState<Fields>({ fullName: "", enrollment: "", branch: "", email: "", caption: "" });
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [confirmOwn, setConfirmOwn] = useState(false);
  const [publicConsent, setPublicConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState<{ lookNo: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const replaceIndex = useRef<number | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step, done]);

  useEffect(() => {
    const urls = photos.map((p) => p.preview);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [photos]);

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    const issues: string[] = [];
    const ok: Photo[] = [];
    for (const file of picked) {
      if (!limits.mimeTypes.includes(file.type)) issues.push(`${file.name}: use a JPG, PNG or WebP image.`);
      else if (file.size > limits.maxRawBytes) issues.push(`${file.name}: larger than ${limits.maxRawBytes / 1048576} MB.`);
      else {
        const small = await shrink(file);
        if (small.size > limits.maxUploadBytes) issues.push(`${file.name}: still too large after resizing.`);
        else ok.push({ file: small, preview: URL.createObjectURL(small) });
      }
    }
    setPhotos((prev) => {
      const next = [...prev];
      const at = replaceIndex.current;
      replaceIndex.current = null;
      if (at !== null && ok[0]) next[at] = ok[0];
      else ok.forEach((p) => next.length < limits.maxPhotos && next.push(p));
      return next;
    });
    setErrors((p) => ({ ...p, photos: issues[0] ?? "" }));
  }

  function next() {
    setServerError(null);
    if (step === 0) {
      const r = detailsSchema.safeParse(f);
      if (!r.success) return setErrors(zodErrors(r.error.issues));
    }
    if (step === 1) {
      const r = lookSchema.safeParse(f);
      const e = r.success ? {} : zodErrors(r.error.issues);
      if (photos.length < 1) e.photos = "Add at least one photo of your outfit";
      if (Object.keys(e).length) return setErrors(e);
    }
    setErrors({});
    setStep((s) => s + 1);
  }

  function submit() {
    setServerError(null);
    const r = consentSchema.safeParse({ confirmOwn, publicConsent });
    if (!r.success) return setErrors(zodErrors(r.error.issues));
    setErrors({});

    const body = new FormData();
    Object.entries(f).forEach(([k, v]) => body.append(k, v));
    body.append("confirmOwn", String(confirmOwn));
    body.append("publicConsent", String(publicConsent));
    photos.forEach((p) => body.append("photos", p.file));

    setBusy(true);
    setProgress(0);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/submit");
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
    };
    xhr.onerror = () => {
      setBusy(false);
      setServerError("Network problem. Check your connection and try again. Your details are still here.");
    };
    xhr.onload = () => {
      setBusy(false);
      let json: { ok?: boolean; error?: string; fields?: Errors; lookNo?: number } = {};
      try {
        json = JSON.parse(xhr.responseText);
      } catch {
        /* ignore */
      }
      if (xhr.status === 200 && json.ok && json.lookNo) return setDone({ lookNo: json.lookNo });
      setServerError(json.error ?? "Something went wrong. Please try again.");
      if (json.fields) {
        setErrors(json.fields);
        const detailKeys = ["fullName", "enrollment", "branch", "email"];
        if (Object.keys(json.fields).some((k) => detailKeys.includes(k))) setStep(0);
        else if (json.fields.photos || json.fields.caption) setStep(1);
      }
    };
    xhr.send(body);
  }

  if (done) {
    return (
      <div className="mt-10 rounded-card bg-ivory p-8 shadow-soft sm:p-12" role="status">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-tropical text-ivory">
          <Check aria-hidden="true" />
        </span>
        <h2 ref={headingRef} tabIndex={-1} className="mt-6 text-4xl font-medium outline-none">
          You&apos;re in. Your look is entered.
        </h2>
        <p className="mt-4 leading-relaxed text-cocoa/80">
          Your reference is <strong>Look № {String(done.lookNo).padStart(3, "0")}</strong>. Organizers review every
          submission.{" "}
          {publicConsent
            ? "Because you agreed to public display, your photos may be shown on official event channels once approved."
            : "You chose not to display your photos publicly, so they will stay private to the organizers."}
        </p>
        <Link href="/" className="btn-leaf mt-8">Back to the celebration</Link>
      </div>
    );
  }

  const err = (k: string) => errors[k];
  const input = (
    k: keyof Fields,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
    hint?: string,
  ) => (
    <div>
      <label htmlFor={k} className="mb-1.5 block text-sm font-semibold">{label}</label>
      <input
        id={k}
        name={k}
        value={f[k]}
        onChange={set(k)}
        className={`field ${err(k) ? "field-error" : ""}`}
        aria-invalid={Boolean(err(k))}
        aria-describedby={err(k) ? `${k}-err` : hint ? `${k}-hint` : undefined}
        {...props}
      />
      {hint && !err(k) && <p id={`${k}-hint`} className="mt-1.5 text-xs text-cocoa/60">{hint}</p>}
      {err(k) && (
        <p id={`${k}-err`} className="mt-1.5 flex items-center gap-1.5 text-sm text-[#b3261e]">
          <AlertCircle size={14} aria-hidden="true" /> {err(k)}
        </p>
      )}
    </div>
  );

  return (
    <div className="mt-10 rounded-card bg-ivory/95 p-6 shadow-soft sm:p-10">
      <ol className="mb-8 flex gap-2" aria-label="Progress">
        {steps.map((s, i) => (
          <li key={s} className="flex-1" aria-current={i === step ? "step" : undefined}>
            <div className={`h-1.5 rounded-full transition-colors ${i <= step ? "bg-sunset" : "bg-sand"}`} />
            <p className={`mt-2 text-xs font-semibold ${i === step ? "text-cocoa" : "text-cocoa/50"}`}>
              {i + 1}. {s}
            </p>
          </li>
        ))}
      </ol>

      <h2 ref={headingRef} tabIndex={-1} className="text-3xl font-medium outline-none">{steps[step]}</h2>

      <form
        noValidate
        className="mt-6 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 2) next();
          else submit();
        }}
      >
        {step === 0 && (
          <>
            {input("fullName", "Full name", { autoComplete: "name" })}
            {input("enrollment", "Enrollment number", { autoCapitalize: "characters", autoComplete: "off" })}
            {input("branch", "Branch / department", { autoComplete: "off", placeholder: "e.g. IT, ECE" })}
            {input(
              "email",
              "College email",
              { type: "email", autoComplete: "email", inputMode: "email", placeholder: `you@${limits.allowedEmailDomain}` },
              `Must end in @${limits.allowedEmailDomain}`,
            )}
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <p className="mb-1.5 text-sm font-semibold">
                Outfit photos <span className="font-normal text-cocoa/60">(1–{limits.maxPhotos}, JPG/PNG/WebP)</span>
              </p>
              <input ref={inputRef} type="file" accept={limits.mimeTypes.join(",")} multiple={photos.length === 0} className="sr-only" id="photos" onChange={onPick} />
              <ul className="grid grid-cols-2 gap-4">
                {photos.map((p, i) => (
                  <li key={p.preview} className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-sand">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.preview} alt={`Selected outfit photo ${i + 1}`} className="h-full w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-cocoa/80 p-2">
                      <button
                        type="button"
                        className="rounded-full bg-ivory/90 p-2"
                        aria-label={`Replace photo ${i + 1}`}
                        onClick={() => {
                          replaceIndex.current = i;
                          inputRef.current?.click();
                        }}
                      >
                        <Replace size={16} />
                      </button>
                      <button
                        type="button"
                        className="rounded-full bg-ivory/90 p-2"
                        aria-label={`Remove photo ${i + 1}`}
                        onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </li>
                ))}
                {photos.length < limits.maxPhotos && (
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        replaceIndex.current = null;
                        inputRef.current?.click();
                      }}
                      className={`grid aspect-[3/4] w-full place-items-center rounded-2xl border-2 border-dashed text-center transition hover:bg-blossom/20 ${
                        err("photos") ? "border-[#b3261e]" : "border-cocoa/30"
                      }`}
                    >
                      <span>
                        <ImagePlus className="mx-auto text-tropical" aria-hidden="true" />
                        <span className="mt-2 block text-sm font-semibold">Add photo</span>
                      </span>
                    </button>
                  </li>
                )}
              </ul>
              {err("photos") && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-[#b3261e]">
                  <AlertCircle size={14} aria-hidden="true" /> {err("photos")}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="caption" className="mb-1.5 block text-sm font-semibold">
                Caption <span className="font-normal text-cocoa/60">(optional)</span>
              </label>
              <input
                id="caption"
                value={f.caption}
                onChange={set("caption")}
                maxLength={limits.captionMax}
                className={`field ${err("caption") ? "field-error" : ""}`}
                placeholder="One line about your look"
              />
              {err("caption") && <p className="mt-1.5 text-sm text-[#b3261e]">{err("caption")}</p>}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <dl className="divide-y divide-cocoa/10 rounded-2xl border border-cocoa/15 bg-white/60 text-sm">
              {[
                ["Name", f.fullName],
                ["Enrollment", f.enrollment.toUpperCase()],
                ["Branch", f.branch],
                ["Email", f.email.toLowerCase()],
                ["Caption", f.caption || "—"],
                ["Photos", `${photos.length} selected`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 px-4 py-3">
                  <dt className="text-cocoa/60">{k}</dt>
                  <dd className="break-all text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="flex gap-2">
              {photos.map((p) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={p.preview} src={p.preview} alt="" className="h-20 w-16 rounded-xl object-cover" />
              ))}
            </div>

            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" className="mt-1 h-5 w-5 accent-[#315B46]" checked={confirmOwn} onChange={(e) => setConfirmOwn(e.target.checked)} aria-invalid={Boolean(err("confirmOwn"))} />
              <span className="text-sm leading-relaxed">
                <strong>Required.</strong> I confirm these photos show me in my own outfit and that I have permission to submit them.
              </span>
            </label>
            {err("confirmOwn") && (
              <p className="flex items-center gap-1.5 text-sm text-[#b3261e]"><AlertCircle size={14} aria-hidden="true" /> {err("confirmOwn")}</p>
            )}
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" className="mt-1 h-5 w-5 accent-[#315B46]" checked={publicConsent} onChange={(e) => setPublicConsent(e.target.checked)} />
              <span className="text-sm leading-relaxed">
                <strong>Optional.</strong> I agree to my photos being displayed on official event channels if approved. Your entry counts either way.
              </span>
            </label>

            {busy && (
              <div role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress">
                <div className="h-2 overflow-hidden rounded-full bg-sand">
                  <div className="h-full bg-sunset transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-2 text-xs text-cocoa/70">{progress < 100 ? `Uploading… ${progress}%` : "Saving your entry…"}</p>
              </div>
            )}
          </>
        )}

        {serverError && (
          <div role="alert" className="flex items-start gap-2 rounded-2xl border border-[#b3261e]/40 bg-[#b3261e]/5 p-4 text-sm text-[#7a1a15]">
            <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" /> {serverError}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          {step > 0 ? (
            <button type="button" className="btn-line" disabled={busy} onClick={() => { setErrors({}); setServerError(null); setStep((s) => s - 1); }}>
              <ArrowLeft size={16} aria-hidden="true" /> Back
            </button>
          ) : (
            <span />
          )}
          <button type="submit" className="btn-sun" disabled={busy}>
            {busy ? (
              <><Loader2 className="animate-spin" size={18} aria-hidden="true" /> Submitting</>
            ) : step < 2 ? (
              <>Continue <ArrowRight size={18} aria-hidden="true" /></>
            ) : (
              "Submit my look"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
