"use client";

import { useFormState } from "react-dom";
import { loginAction, type LoginActionState } from "@/lib/admin/actions/auth-actions";
import { SubmitButton } from "@/components/admin/SubmitButton";

const initialState: LoginActionState = {};

export function LoginForm() {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-body-sm font-medium text-text-secondary">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className="rounded-md border border-border-subtle bg-bg-surface-1 px-3.5 py-2.5 text-body text-text-primary outline-none transition-colors duration-fast placeholder:text-text-tertiary focus:border-accent"
          placeholder="you@aiuniverse.com"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-body-sm font-medium text-text-secondary">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-md border border-border-subtle bg-bg-surface-1 px-3.5 py-2.5 text-body text-text-primary outline-none transition-colors duration-fast placeholder:text-text-tertiary focus:border-accent"
          placeholder="••••••••"
        />
      </div>

      {state.error && (
        <p role="alert" className="rounded-md border border-error/30 bg-error/10 px-3.5 py-2.5 text-body-sm text-error">
          {state.error}
        </p>
      )}

      <SubmitButton className="w-full justify-center">Log in</SubmitButton>
    </form>
  );
}
