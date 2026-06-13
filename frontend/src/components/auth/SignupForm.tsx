"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function SignupForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordValid = password.length >= 6;
  const passwordsMatch =
    Boolean(password) &&
    Boolean(confirmPassword) &&
    password === confirmPassword;

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!passwordValid) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Signup failed. Please try again.");
        return;
      }

      localStorage.setItem("access_token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      router.push("/auth/login");
    } catch {
      setError("Backend not connected. Please check Django server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSignup} className="max-w-md space-y-3.5">
      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-bold text-[#10142D]">
          Full name
        </label>

        <Input
          placeholder="Nikhil Dubey"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
          required
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-bold text-[#10142D]">
          Email address
        </label>

        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          required
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-bold text-[#10142D]">
          Password
        </label>

        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Create a secure password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            className="pr-12"
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#6C4DF6]"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>

        <div className="mt-1.5 flex items-center gap-2 text-xs text-[#667085]">
          <CheckCircle2
            size={14}
            className={passwordValid ? "text-green-500" : "text-[#CBD5E1]"}
          />
          Minimum 6 characters
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-bold text-[#10142D]">
          Confirm password
        </label>

        <div className="relative">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setConfirmPassword(e.target.value)
            }
            className="pr-12"
            required
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#6C4DF6]"
            aria-label={
              showConfirmPassword
                ? "Hide confirm password"
                : "Show confirm password"
            }
          >
            {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>

        {confirmPassword && (
          <div className="mt-1.5 flex items-center gap-2 text-xs text-[#667085]">
            <CheckCircle2
              size={14}
              className={passwordsMatch ? "text-green-500" : "text-red-400"}
            />
            {passwordsMatch ? "Passwords match" : "Passwords do not match"}
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="h-[52px] w-full rounded-2xl text-base font-bold shadow-[0_12px_28px_rgba(108,77,246,0.28)]"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={20} className="animate-spin" />
            Creating account...
          </span>
        ) : (
          "Create free account"
        )}
      </Button>

      <p className="pt-1 text-center text-sm text-[#667085]">
        Already have an account?{" "}
        <a
          className="font-bold text-[#6C4DF6] hover:underline"
          href="/auth/login"
        >
          Sign in
        </a>
      </p>
    </form>
  );
}