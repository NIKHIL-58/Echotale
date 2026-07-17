"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { categories } from "@/lib/constants";
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
      <section className="w-full max-w-3xl rounded-widget bg-white p-8 shadow-card">
        <h1 className="text-3xl font-bold">Personalize your EchoTale</h1>
        <p className="mt-2 text-textMuted">Choose at least 3 genres to improve recommendations.</p>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          {categories.map((category) => (
            <button
              type="button"
              className={`rounded-card p-5 font-bold ${selected.includes(category) ? "bg-primary text-white" : "bg-soft text-primary"}`}
              key={category}
              onClick={() => toggle(category)}
            >
              {category}
            </button>
          ))}
        </div>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <Button className="mt-8" onClick={continueToHome} disabled={saving}>
          {saving ? "Saving..." : "Continue to Home"}
        </Button>
      </section>
    </main>
  );
}
