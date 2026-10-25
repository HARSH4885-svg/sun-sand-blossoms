"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createUserClient, getAdmin } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export type LoginState = { error?: string };

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!isSupabaseConfigured()) return { error: "Backend is not configured. See the README." };
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createUserClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Sign-in failed. Check your details." };

  const { data: ok } = await supabase.rpc("is_admin");
  if (ok !== true) {
    await supabase.auth.signOut();
    return { error: "This account is not authorised for the organizer area." };
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createUserClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function setStatus(formData: FormData) {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id) || !["pending", "approved", "rejected"].includes(status)) return;

  // Runs as the signed-in user, so the RLS "admins moderate submissions" policy applies again.
  await admin.supabase
    .from("submissions")
    .update({
      status,
      reviewed_at: status === "pending" ? null : new Date().toISOString(),
      reviewed_by: status === "pending" ? null : admin.user.email,
    })
    .eq("id", id);

  revalidatePath("/admin");
}
