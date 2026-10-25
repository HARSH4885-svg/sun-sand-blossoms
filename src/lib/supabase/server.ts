import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/** Per-request client acting as the signed-in user, so database RLS applies. */
export async function createUserClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list: Array<{ name: string; value: string; options: CookieOptions }>) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component: middleware refreshes the session instead.
        }
      },
    },
  });
}

/** Returns the client + user only if the caller is a listed organizer; otherwise null. */
export async function getAdmin() {
  const supabase = await createUserClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) return null;
  return { supabase, user: data.user };
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
