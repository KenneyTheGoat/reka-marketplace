"use client";

import { useActionState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { login, registerCustomer } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Fields";

export function LoginForm({ callbackUrl = "/" }: { callbackUrl?: string }) {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <Field label="Email">
        <input className={inputClass} name="email" type="email" required />
      </Field>
      <Field label="Password">
        <input className={inputClass} name="password" type="password" minLength={8} required />
      </Field>
      {"error" in (state ?? {}) ? <p className="text-sm font-medium text-clay">{state?.error}</p> : null}
      <Button disabled={pending}>
        <LogIn size={18} /> Sign in
      </Button>
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerCustomer, null);
  return (
    <form action={action} className="grid gap-4">
      <Field label="Full name">
        <input className={inputClass} name="name" required />
      </Field>
      <Field label="Email">
        <input className={inputClass} name="email" type="email" required />
      </Field>
      <Field label="Password">
        <input className={inputClass} name="password" type="password" minLength={8} required />
      </Field>
      {"error" in (state ?? {}) ? <p className="text-sm font-medium text-clay">{state?.error}</p> : null}
      <Button disabled={pending}>
        <UserPlus size={18} /> Create account
      </Button>
    </form>
  );
}

