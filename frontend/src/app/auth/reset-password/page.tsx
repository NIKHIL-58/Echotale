"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { resetPassword } from "@/services/appService";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") || "");
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!token) {
      setMessage("This reset link is invalid.");
      return;
    }
    if (password.length < 6 || password !== confirm) {
      setMessage("Passwords must match and contain at least 6 characters.");
      return;
    }
    try {
      await resetPassword(token, password);
      setMessage("Password updated. Redirecting to sign in...");
      setTimeout(() => router.push("/auth/login"), 800);
    } catch {
      setMessage("The reset link is invalid or expired.");
    }
  }

  return (
    <AuthLayout title="Reset password">
      <form onSubmit={submit} className="space-y-4">
        <Input type="password" placeholder="New password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        <Input type="password" placeholder="Confirm password" value={confirm} onChange={(event) => setConfirm(event.target.value)} required />
        <Button type="submit" className="w-full">Update password</Button>
        {message && <p className="text-sm text-textMuted">{message}</p>}
      </form>
    </AuthLayout>
  );
}
