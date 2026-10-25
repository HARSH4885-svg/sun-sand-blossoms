import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { event } from "@/lib/config";

export const metadata: Metadata = { title: "Organizer sign-in · Best Outfit", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <main id="main" className="grid min-h-svh place-items-center bg-gradient-to-b from-ivory to-[#FBD9B5] px-5">
      <div className="w-full max-w-sm rounded-card bg-ivory p-8 shadow-soft">
        <p className="eyebrow">{event.label}</p>
        <h1 className="mt-2 text-3xl font-medium">Organizer sign-in</h1>
        {!isSupabaseConfigured() && (
          <p role="alert" className="mt-4 rounded-2xl bg-sand/60 p-3 text-sm">
            Supabase is not configured yet. Add the environment variables from <code>.env.example</code>.
          </p>
        )}
        <LoginForm />
      </div>
    </main>
  );
}
