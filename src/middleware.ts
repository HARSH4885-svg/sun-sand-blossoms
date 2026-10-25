import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// First line of defence for /admin. Pages, actions and the CSV route re-check
// is_admin() on the server, and database RLS enforces it again.
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isLogin = request.nextUrl.pathname === "/admin/login";

  if (!url || !anon) {
    return isLogin ? NextResponse.next() : NextResponse.redirect(new URL("/admin/login", request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list: Array<{ name: string; value: string; options: CookieOptions }>) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  if (!data.user && !isLogin) return NextResponse.redirect(new URL("/admin/login", request.url));
  return response;
}

export const config = { matcher: ["/admin/:path*"] };
