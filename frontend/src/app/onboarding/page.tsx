"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { categories } from "@/lib/constants";
import { EchoTaleLogo } from "@/components/brand/EchoTaleLogo";
import { Button } from "@/components/ui/Button";
import { updateProfile } from "@/services/appService";

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function toggle(category: string) {
    setSelected((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  }

  async function continueToHome() {
    if (selected.length < 3) {
      setError("Choose at least three genres.");
      return;
    }
    try {
      setSaving(true);
      const user = await updateProfile({ favorite_genres: selected });
      localStorage.setItem("user", JSON.stringify(user));
      router.push("/dashboard");
    } catch {
      setError("Please sign in before saving your preferences.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section className="surface w-full max-w-2xl overflow-hidden p-5 sm:p-8"><EchoTaleLogo className="mb-6"/><img src="/images/reading-corner.png" alt="" className="mb-6 h-36 w-full rounded-xl object-cover object-center"/>
        <h1 className="page-title">Personalize your EchoTale</h1>
        <p className="mt-2 text-textMuted">Choose at least 3 genres to improve recommendations.</p>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          {categories.map((category) => (
            <button
              type="button"
              className={`min-h-14 rounded-xl border border-borderSoft p-4 text-sm font-semibold ${selected.includes(category) ? "bg-primary text-white" : "bg-soft text-primary"}`}
              aria-pressed={selected.includes(category)}
              key={category}
              onClick={() => toggle(category)}
            >
              {category}
            </button>
          ))}
        </div>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <p className="mt-5 text-sm text-textMuted" aria-live="polite">{selected.length} of 3 minimum genres selected</p><Button className="mt-5 w-full" onClick={continueToHome} disabled={saving}>
          {saving ? "Saving..." : "Continue to Home"}
        </Button>
      </section>
    </main>
  );
}
