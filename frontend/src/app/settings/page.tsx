"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Bell, Check, CheckCircle2, ChevronRight, Crown, Globe2, Loader2, PlayCircle, Save, Settings2, ShieldCheck, Target, UserRound } from "lucide-react";
import { getStoredUser } from "@/lib/auth";
import { updateProfile } from "@/services/appService";

const languages = ["English", "Hindi", "Spanish", "French"];
const goalPresets = [15, 30, 60, 90];

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onChange} className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-primary" : "bg-[#d8d3dc]"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-6" : "left-1"}`} /></button>;
}

export default function SettingsPage() {
  const [language, setLanguage] = useState("English");
  const [goal, setGoal] = useState(30);
  const [notifications, setNotifications] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored?.language) setLanguage(stored.language);
    if (stored?.listening_goal) setGoal(Number(stored.listening_goal));
    setNotifications(localStorage.getItem("echotale_notifications") !== "false");
    setAutoplay(localStorage.getItem("echotale_autoplay") !== "false");
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setMessage(""); setError(false);
    try {
      const user = await updateProfile({ language, listening_goal: goal });
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("echotale_notifications", String(notifications));
      localStorage.setItem("echotale_autoplay", String(autoplay));
      setMessage("Your preferences have been saved.");
    } catch {
      setError(true); setMessage("Please sign in to update your settings.");
    } finally { setSaving(false); }
  }

  return (
    <AppLayout rightPanel={false}>
      <form onSubmit={save} className="mx-auto max-w-6xl space-y-6">
        <header className="relative isolate overflow-hidden rounded-2xl bg-[#0d0a22] px-6 py-8 text-white shadow-[0_22px_55px_rgba(24,17,51,.2)] sm:px-8">
          <img src="/images/listening-world.png" alt="" className="absolute inset-0 -z-20 h-full w-full object-cover object-right opacity-20" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0d0a22] via-[#0d0a22]/95 to-[#0d0a22]/65" />
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-[#e5bd6b]"><Settings2 size={23} /></span><div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#e5bd6b]">Your experience</p><h1 className="mt-1 text-3xl font-black tracking-[-.04em]">Settings</h1><p className="mt-1 text-sm text-white/50">Tune EchoTale to the way you listen.</p></div></div>
            <Link href="/profile" className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[.08] px-4 py-2.5 text-sm font-bold text-white/75 transition hover:bg-white/15 hover:text-white"><UserRound size={16} />View profile<ChevronRight size={15} /></Link>
          </div>
        </header>

        {message && <div role="status" className={`flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-semibold ${error ? "border-red-100 bg-red-50 text-red-700" : "border-emerald-100 bg-emerald-50 text-emerald-700"}`}><CheckCircle2 size={18} />{message}</div>}

        <div className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-borderSoft bg-white p-6 shadow-soft sm:p-7">
              <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e9f1ff] text-[#356fd0]"><Globe2 size={19} /></span><div><h2 className="font-extrabold text-textMain">Narration language</h2><p className="mt-1 text-sm text-textMuted">Choose the language you prefer for stories and narration.</p></div></div>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{languages.map((item)=><button key={item} type="button" aria-pressed={language===item} onClick={()=>setLanguage(item)} className={`flex h-12 items-center justify-between rounded-xl border px-4 text-sm font-bold transition ${language===item ? "border-primary bg-soft text-primary shadow-[0_7px_18px_rgba(118,87,211,.12)]" : "border-borderSoft bg-white text-textMuted hover:border-primary/20 hover:text-textMain"}`}>{item}{language===item&&<Check size={16}/>}</button>)}</div>
            </section>

            <section className="rounded-2xl border border-borderSoft bg-white p-6 shadow-soft sm:p-7">
              <div className="flex items-start justify-between gap-4"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#fff0dd] text-[#db742b]"><Target size={19} /></span><div><h2 className="font-extrabold text-textMain">Daily listening goal</h2><p className="mt-1 text-sm text-textMuted">Build a consistent listening habit at your own pace.</p></div></div><div className="rounded-2xl bg-page px-4 py-2 text-right"><b className="text-xl text-textMain">{goal}</b><span className="ml-1 text-xs text-textMuted">min</span></div></div>
              <input aria-label="Daily listening goal in minutes" type="range" min={5} max={180} step={5} value={goal} onChange={(event)=>setGoal(Number(event.target.value))} className="mt-7 w-full accent-primary" />
              <div className="mt-2 flex justify-between text-[11px] font-semibold text-textMuted"><span>5 min</span><span>180 min</span></div>
              <div className="mt-5 flex flex-wrap gap-2">{goalPresets.map((value)=><button key={value} type="button" onClick={()=>setGoal(value)} className={`rounded-xl px-4 py-2 text-xs font-bold transition ${goal===value ? "bg-primary text-white" : "bg-page text-textMuted hover:bg-soft hover:text-primary"}`}>{value} min</button>)}</div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-borderSoft bg-white p-6 shadow-soft">
              <h2 className="font-extrabold text-textMain">Listening preferences</h2><p className="mt-1 text-sm text-textMuted">Control everyday playback behavior.</p>
              <div className="mt-5 divide-y divide-borderSoft">
                <div className="flex items-center justify-between gap-4 py-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-soft text-primary"><Bell size={18} /></span><div><p className="text-sm font-bold text-textMain">Notifications</p><p className="mt-0.5 text-xs text-textMuted">Story and account updates</p></div></div><Toggle checked={notifications} onChange={()=>setNotifications((value)=>!value)} label="Toggle notifications" /></div>
                <div className="flex items-center justify-between gap-4 py-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e9f5ef] text-[#2f8b62]"><PlayCircle size={18} /></span><div><p className="text-sm font-bold text-textMain">Autoplay</p><p className="mt-0.5 text-xs text-textMuted">Continue to the next part</p></div></div><Toggle checked={autoplay} onChange={()=>setAutoplay((value)=>!value)} label="Toggle autoplay" /></div>
              </div>
            </section>

            <Link href="/premium" className="group block overflow-hidden rounded-2xl bg-gradient-to-br from-[#251b4c] to-[#0d0a22] p-6 text-white shadow-card"><div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-[#e5bd6b]"><Crown size={20} /></span><ChevronRight className="text-white/35 transition group-hover:translate-x-1 group-hover:text-white" size={19}/></div><h2 className="mt-5 font-extrabold">EchoTale Premium</h2><p className="mt-2 text-sm leading-6 text-white/55">Unlock unlimited listening, offline stories, and premium narration.</p><span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#e5bd6b]"><ShieldCheck size={14}/>View your plan</span></Link>
          </div>
        </div>

        <footer className="sticky bottom-24 lg:bottom-24 z-10 flex flex-col gap-3 rounded-[22px] border border-borderSoft bg-white/90 p-4 shadow-[0_16px_45px_rgba(26,18,51,.14)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-textMuted">Changes are applied to your EchoTale account.</p><button type="submit" disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-[0_9px_22px_rgba(118,87,211,.22)] disabled:opacity-60">{saving?<><Loader2 size={16} className="animate-spin"/>Saving...</>:<><Save size={16}/>Save preferences</>}</button></footer>
      </form>
    </AppLayout>
  );
}
