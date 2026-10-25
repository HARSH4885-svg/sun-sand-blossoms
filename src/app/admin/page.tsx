import type { Metadata } from "next";
import { Download, LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/supabase/server";
import { STORAGE_BUCKET } from "@/lib/config";
import { setStatus, signOut } from "./actions";

export const metadata: Metadata = { title: "Organizer dashboard · Best Outfit", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Row = {
  id: string;
  look_no: number;
  full_name: string;
  enrollment_number: string;
  email: string;
  branch: string | null;
  caption: string | null;
  image_paths: string[];
  public_consent: boolean;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

const FILTERS = ["all", "pending", "approved", "rejected"] as const;

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const status = FILTERS.includes(sp.status as (typeof FILTERS)[number]) ? sp.status! : "all";
  const q = (sp.q ?? "").replace(/[%,()*\\]/g, " ").trim().slice(0, 60);

  const count = async (s?: string) => {
    let query = supabase.from("submissions").select("id", { count: "exact", head: true });
    if (s) query = query.eq("status", s);
    return (await query).count ?? 0;
  };
  const [total, pending, approved, rejected] = await Promise.all([count(), count("pending"), count("approved"), count("rejected")]);

  let list = supabase
    .from("submissions")
    .select("id, look_no, full_name, enrollment_number, email, branch, caption, image_paths, public_consent, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (status !== "all") list = list.eq("status", status);
  if (q) list = list.or(`full_name.ilike.%${q}%,enrollment_number.ilike.%${q}%,email.ilike.%${q}%`);
  const { data, error } = await list;
  const rows = (data ?? []) as Row[];

  const signed = new Map<string, string>();
  const allPaths = rows.flatMap((r) => r.image_paths);
  if (allPaths.length) {
    const { data: urls } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrls(allPaths, 3600);
    urls?.forEach((u) => u.path && u.signedUrl && signed.set(u.path, u.signedUrl));
  }

  const stats = [
    ["Total", total],
    ["Pending", pending],
    ["Approved", approved],
    ["Rejected", rejected],
  ] as const;

  return (
    <main id="main" className="min-h-svh bg-ivory px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Organizers · IIITA Freshers 2026</p>
            <h1 className="text-4xl font-medium">Best Outfit submissions</h1>
          </div>
          <div className="flex gap-3">
            <a href="/api/admin/export" className="btn-line !py-2.5"><Download size={16} aria-hidden="true" /> Export CSV</a>
            <form action={signOut}><button className="btn-line !py-2.5"><LogOut size={16} aria-hidden="true" /> Sign out</button></form>
          </div>
        </header>

        <dl className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map(([label, n]) => (
            <div key={label} className="rounded-card bg-sand/50 p-5">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-cocoa/70">{label}</dt>
              <dd className="mt-1 font-display text-4xl">{n}</dd>
            </div>
          ))}
        </dl>

        <form className="mt-8 flex flex-wrap gap-3" role="search">
          <label className="sr-only" htmlFor="q">Search submissions</label>
          <input id="q" name="q" defaultValue={q} placeholder="Search name, enrollment or email" className="field max-w-sm" />
          <label className="sr-only" htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={status} className="field w-auto">
            {FILTERS.map((f) => <option key={f} value={f}>{f[0].toUpperCase() + f.slice(1)}</option>)}
          </select>
          <button className="btn-leaf !py-3">Apply</button>
        </form>

        {error && <p role="alert" className="mt-6 text-[#b3261e]">Couldn&apos;t load submissions.</p>}
        {!error && rows.length === 0 && <p className="mt-10 text-cocoa/70">No submissions match.</p>}

        <ul className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((r) => {
            const live = r.status === "approved" && r.public_consent;
            return (
              <li key={r.id} className="overflow-hidden rounded-card border border-cocoa/10 bg-white/60">
                <div className="grid grid-cols-2 gap-1 bg-sand/40">
                  {r.image_paths.map((p) => (
                    <a key={p} href={signed.get(p)} target="_blank" rel="noreferrer" className="block aspect-[3/4]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={signed.get(p)} alt={`Photo from ${r.full_name}`} className="h-full w-full object-cover" loading="lazy" />
                    </a>
                  ))}
                </div>
                <div className="space-y-1 p-5 text-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl">{r.full_name}</h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      r.status === "approved" ? "bg-tropical text-ivory" : r.status === "rejected" ? "bg-cocoa text-ivory" : "bg-sunset text-cocoa"
                    }`}>{r.status}</span>
                  </div>
                  <p className="text-cocoa/70">{r.enrollment_number} · {r.branch ?? "—"}</p>
                  <p className="break-all text-cocoa/70">{r.email}</p>
                  {r.caption && <p className="italic">“{r.caption}”</p>}
                  <p className="pt-1 text-xs">
                    Public consent: <strong>{r.public_consent ? "Yes" : "No"}</strong> · Cleared for official channels: <strong>{live ? "Yes" : "No"}</strong>
                  </p>
                  <form action={setStatus} className="flex flex-wrap gap-2 pt-3">
                    <input type="hidden" name="id" value={r.id} />
                    <button name="status" value="approved" className="btn-leaf !px-4 !py-2" disabled={r.status === "approved"}>Approve</button>
                    <button name="status" value="rejected" className="btn-line !px-4 !py-2" disabled={r.status === "rejected"}>Reject</button>
                    {r.status !== "pending" && <button name="status" value="pending" className="btn !px-4 !py-2 underline">Reset</button>}
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
