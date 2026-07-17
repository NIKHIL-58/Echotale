"use client";

import { FormEvent, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getStoredUser } from "@/lib/auth";
import { updateProfile } from "@/services/appService";

export default function SettingsPage() {
  const stored = getStoredUser();
  const [language, setLanguage] = useState(stored?.language || "English");
  const [goal, setGoal] = useState(String(stored?.listening_goal || 30));
  const [message, setMessage] = useState("");

  async function save(event: FormEvent) {
    event.preventDefault();
    try {
      const user = await updateProfile({
        language,
        listening_goal: Number(goal),
      });
      localStorage.setItem("user", JSON.stringify(user));
      setMessage("Settings saved.");
    } catch {
      setMessage("Please sign in to update settings.");
    }
  }

  return (
    <AppLayout>
      <h1 className="text-3xl font-bold">Settings</h1>
      <form onSubmit={save} className="mt-6 max-w-xl space-y-5 rounded-widget bg-white p-6 shadow-soft">
        <div>
          <label className="mb-2 block font-bold">Language</label>
          <Input value={language} onChange={(event) => setLanguage(event.target.value)} />
        </div>
        <div>
          <label className="mb-2 block font-bold">Daily listening goal (minutes)</label>
          <Input type="number" min={1} max={1440} value={goal} onChange={(event) => setGoal(event.target.value)} />
        </div>
        <Button type="submit">Save settings</Button>
        {message && <p className="text-sm text-textMuted">{message}</p>}
      </form>
    </AppLayout>
  );
}
