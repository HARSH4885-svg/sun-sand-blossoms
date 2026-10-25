"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { signIn, type LoginState } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, {});
  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field" />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      {state.error && <p role="alert" className="text-sm text-[#b3261e]">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-leaf w-full">
        {pending ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : "Sign in"}
      </button>
    </form>
  );
}
