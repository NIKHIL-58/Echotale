"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { requestPasswordReset } from "@/services/appService";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetToken, setResetToken] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const result = await requestPasswordReset(email);
      setResetToken(result.reset_token || "");
      setMessage("If the account exists, reset instructions are ready.");
    } catch {
      setMessage("Unable to request a reset right now.");
    }
  }

  return (
    <AuthLayout title="Forgot password">
      <form onSubmit={submit} className="space-y-4">
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Button type="submit" className="w-full">Send reset link</Button>
        {message && <p className="text-sm text-textMuted">{message}</p>}
        {resetToken && (
          <Link className="block text-sm font-semibold text-primary" href={`/auth/reset-password?token=${encodeURIComponent(resetToken)}`}>
            Continue to password reset
          </Link>
        )}
      </form>
    </AuthLayout>
  );
}
