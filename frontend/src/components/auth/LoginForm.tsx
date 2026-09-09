"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail, Server } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { API_URL } from "@/lib/api";

const wait = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

async function readJson(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) return null;
  try { return await response.json(); } catch { return null; }
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Free Render services can sleep. Start waking the API as soon as login opens.
    fetch(`${API_URL}/health/`, { cache: "no-store" }).catch(() => undefined);
  }, []);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("");
    setLoading(true);

    try {
      for (let attempt = 0; attempt < 8; attempt += 1) {
        let response: Response | null = null;
        try {
          response = await fetch(`${API_URL}/auth/login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ email, password }),
          });
        } catch {
          response = null;
        }

        const data = response ? await readJson(response) : null;
        const serverIsStarting = !response || !data || response.status === 502 || response.status === 503 || response.status === 504;

        if (serverIsStarting && attempt < 7) {
          setStatus(`Waking EchoTale server… Attempt ${attempt + 2} of 8`);
          await wait(5000);
          continue;
        }

        if (serverIsStarting) {
          setError("EchoTale server is taking longer than expected to start. Please wait a minute and try again.");
          return;
        }

        if (!response!.ok || !data.success) {
          setError(data.message || "We could not sign you in. Check your email and password.");
          return;
        }

        localStorage.setItem("access_token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        const next = new URLSearchParams(window.location.search).get("next");
        router.replace(next && next.startsWith("/") ? next : "/dashboard");
        return;
      }
    } finally {
      setLoading(false);
      setStatus("");
    }
  }

  return <form onSubmit={handleLogin} className="max-w-md space-y-4">
    {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}
    {status && <p role="status" className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800"><Server size={17} className="animate-pulse"/>{status}</p>}
    <div><label htmlFor="login-email" className="mb-1.5 block text-sm font-bold text-[#17162B]">Email address</label><div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9993a5]" size={18}/><Input id="login-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} className="pl-11" required/></div></div>
    <div><div className="mb-1.5 flex items-center justify-between"><label htmlFor="login-password" className="text-sm font-bold text-[#17162B]">Password</label><Link className="text-xs font-bold text-primary hover:underline" href="/auth/forgot-password">Forgot password?</Link></div><div className="relative"><LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9993a5]" size={18}/><Input id="login-password" type={show?"text":"password"} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={e=>setPassword(e.target.value)} className="px-11" required/><button type="button" onClick={()=>setShow(!show)} className="absolute right-1 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-lg text-[#777181]" aria-label={show?"Hide password":"Show password"}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></div>
    <Button type="submit" disabled={loading} className="h-12 w-full text-sm font-semibold">{loading?<span className="flex items-center gap-2"><Loader2 size={18} className="animate-spin"/>{status?"Starting server…":"Signing in…"}</span>:"Sign in to EchoTale"}</Button>
    <p className="text-center text-sm text-textMuted">New to EchoTale? <Link className="font-bold text-primary hover:underline" href="/auth/signup">Create free account</Link></p>
  </form>;
}
