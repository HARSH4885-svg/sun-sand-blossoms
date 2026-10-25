import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Prevent spreadsheet formula injection from user-supplied text.
function cell(value: unknown): string {
  let s = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  if (!isSupabaseConfigured()) return new NextResponse("Not configured", { status: 503 });
  const admin = await getAdmin();
  if (!admin) return new NextResponse("Unauthorized", { status: 401 });

  const { data, error } = await admin.supabase
    .from("submissions")
    .select("look_no, full_name, enrollment_number, email, branch, caption, public_consent, status, created_at")
    .order("created_at", { ascending: true });
  if (error) return new NextResponse("Export failed", { status: 500 });

  const head = ["look_no", "full_name", "enrollment_number", "email", "branch", "caption", "public_consent", "status", "created_at"];
  const rows = (data ?? []).map((r) => head.map((h) => cell((r as Record<string, unknown>)[h])).join(","));
  const csv = [head.join(","), ...rows].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="best-outfit-submissions.csv"',
      "Cache-Control": "no-store",
    },
  });
}
