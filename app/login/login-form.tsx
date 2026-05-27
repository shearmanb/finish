"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login, type LoginState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? "Unlocking…" : "Enter"}
    </Button>
  );
}

export function LoginForm({ from }: { from: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(login, {});

  return (
    <Card>
      <CardContent className="pt-5">
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="from" value={from} />
          <div className="flex flex-col gap-2">
            <Input
              name="password"
              type="password"
              placeholder="Password"
              autoFocus
              autoComplete="current-password"
              aria-label="Password"
            />
            {state.error ? (
              <p className="text-sm text-destructive">{state.error}</p>
            ) : null}
          </div>
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
