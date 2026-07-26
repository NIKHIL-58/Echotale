"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { AlertCircle, Check, CheckCircle2, ChevronDown, Crown, Download, Headphones, Infinity, Loader2, Lock, Mic2, ShieldCheck, Sparkles, Star, WandSparkles, Zap } from "lucide-react";
import { choosePlan, getCurrentSubscription, getPlans, type Plan, type Subscription } from "@/services/appService";
import { getStoredUser, getToken } from "@/lib/auth";

const benefits = [
  { icon: Infinity, title: "Unlimited listening", text: "Enjoy every story and chapter without limits." },
  { icon: Download, title: "Offline stories", text: "Save favorites for journeys without a connection." },
  { icon: Mic2, title: "Premium voices", text: "Immersive narration that brings each world alive." },
  { icon: WandSparkles, title: "Smart discovery", text: "Recommendations shaped around your listening." },
];
const faqs = [
  ["Can I cancel anytime?", "Yes. Premium remains active until the end of your current billing period."],
  ["Does Premium work on mobile?", "Yes. Your plan follows your EchoTale account across supported devices."],
  ["What happens to saved stories?", "Your library remains safe. Premium access follows the status of your plan."],
];

function formatPrice(plan: Plan) {
  if (plan.id === "free" || plan.amount === 0) return "Free";
  try { return new Intl.NumberFormat("en-IN", { style: "currency", currency: plan.currency || "INR", maximumFractionDigits: 0 }).format(plan.amount); }
  catch { return `${plan.currency === "INR" ? String.fromCodePoint(0x20b9) : plan.currency} ${plan.amount}`; }
}
function planCopy(id: string) {
  if (id === "free") return "A simple way to begin.";
  if (id.includes("yearly")) return "Best value for devoted listeners.";
  return "Flexible premium listening.";
}

export default function PremiumClient() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [current, setCurrent] = useState<Subscription | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success"|"error"|"info">("info");
  const [loadingPlan, setLoadingPlan] = useState("");
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    getPlans().then(setPlans).catch(() => { setMessageType("error"); setMessage("Unable to load plans right now."); });
    if (getToken()) getCurrentSubscription().then(setCurrent).catch(() => undefined);
  }, []);

  async function selectPlan(plan: Plan) {
    if (!getToken()) { setMessageType("info"); setMessage("Please sign in before choosing a plan."); return; }
    try {
      setLoadingPlan(plan.id); setMessage("");
      const subscription = await choosePlan(plan.id);
      setCurrent(subscription);
      const user = getStoredUser();
      if (user) { user.is_premium = plan.id !== "free"; localStorage.setItem("user", JSON.stringify(user)); }
      setMessageType("success"); setMessage(`${plan.name} is now active on your account.`);
    } catch {
      setMessageType("error"); setMessage("We could not activate this plan. Please try again.");
    } finally { setLoadingPlan(""); }
  }

  return <AppLayout rightPanel={false}>
    <div className="space-y-10 pb-8">
      <section className="relative isolate min-h-[410px] overflow-hidden rounded-[30px] bg-[#100929] px-6 py-9 text-white shadow-[0_25px_65px_rgba(25,14,70,.25)] sm:px-10 lg:px-12">
        <img src="/premium-story-world.png" alt="A magical storybook becoming an audio world" className="absolute inset-0 -z-20 h-full w-full object-cover object-right" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#090619] via-[#100929]/95 to-[#100929]/10" />
        <div className="flex min-h-[330px] max-w-xl flex-col justify-center">
          <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[.15em] backdrop-blur"><Crown size={15} className="text-[#f3cb75]"/>EchoTale Premium</span>
          <h1 className="text-4xl font-black leading-[1.02] tracking-[-.05em] sm:text-5xl lg:text-[56px]">Every story.<br/><span className="bg-gradient-to-r from-[#fff0b9] to-[#cbb9ff] bg-clip-text text-transparent">No limits.</span></h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/65">Unlimited listening, premium narration, and stories that travel with you.</p>
          <div className="mt-7 flex flex-wrap gap-3"><a href="#plans" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#342164] shadow-xl transition hover:-translate-y-0.5"><Sparkles size={16}/>View plans</a><span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white/75"><ShieldCheck size={16}/>Cancel anytime</span></div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{benefits.map(({icon:Icon,title,text})=><article key={title} className="flex gap-4 rounded-[22px] border border-borderSoft bg-white p-5 shadow-soft"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-soft text-primary"><Icon size={19}/></span><div><h2 className="text-sm font-extrabold text-textMain">{title}</h2><p className="mt-1 text-xs leading-5 text-textMuted">{text}</p></div></article>)}</section>

      <section id="plans" className="scroll-mt-8">
        <div className="mx-auto max-w-2xl text-center"><span className="text-[11px] font-bold uppercase tracking-[.18em] text-primary">Simple pricing</span><h2 className="mt-2 text-3xl font-black tracking-[-.04em]">Choose your listening plan</h2><p className="mt-2 text-sm text-textMuted">No hidden fees. Change or cancel anytime.</p></div>
        {message && <div className={`mx-auto mt-6 flex max-w-2xl items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-center text-sm font-semibold ${messageType==="error"?"border-red-100 bg-red-50 text-red-700":messageType==="success"?"border-emerald-100 bg-emerald-50 text-emerald-700":"border-primary/15 bg-soft text-primary"}`}>{messageType==="error"?<AlertCircle size={17}/>:messageType==="success"?<CheckCircle2 size={17}/>:<ShieldCheck size={17}/>} {message}</div>}
        <div className="mx-auto mt-8 grid max-w-5xl items-stretch gap-4 md:grid-cols-3">
          {plans.length===0&&!message&&<div className="col-span-full flex justify-center py-12"><Loader2 className="animate-spin text-primary"/></div>}
          {plans.map((plan,index)=>{const featured=plan.id!=="free"&&(index===1||plans.length===2);const active=current?.plan===plan.id;return <article key={plan.id} className={`relative flex flex-col rounded-[24px] border p-6 transition hover:-translate-y-1 ${featured?"border-primary bg-[#17103d] text-white shadow-[0_22px_50px_rgba(46,28,108,.22)]":"border-borderSoft bg-white shadow-soft"}`}>{featured&&<span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#f4c76d] to-[#ffe9a9] px-4 py-1.5 text-[10px] font-black uppercase tracking-[.13em] text-[#3f2b08]">Most popular</span>}<div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-extrabold">{plan.name}</h3><p className={`mt-1 text-xs ${featured?"text-white/50":"text-textMuted"}`}>{planCopy(plan.id)}</p></div>{active&&<span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">Active</span>}</div><p className="mt-6"><span className="text-3xl font-black tracking-[-.04em]">{formatPrice(plan)}</span>{plan.id!=="free"&&<span className={`ml-1 text-xs ${featured?"text-white/45":"text-textMuted"}`}>{plan.id.includes("yearly")?"/ year":"/ month"}</span>}</p><ul className="my-6 flex-1 space-y-2.5">{["Curated story library",plan.id==="free"?"Standard listening":"Unlimited listening",plan.id==="free"?"Online access":"Offline downloads",plan.id==="free"?"Community voices":"Premium narration"].map(item=><li key={item} className={`flex items-center gap-2.5 text-xs ${featured?"text-white/75":"text-textMuted"}`}><span className={`grid h-5 w-5 place-items-center rounded-full ${featured?"bg-white/10 text-[#f7ce74]":"bg-soft text-primary"}`}><Check size={12}/></span>{item}</li>)}</ul><Button className={`w-full ${featured?"!bg-white !text-[#3d2677]":""}`} variant={active?"secondary":"primary"} disabled={active||loadingPlan===plan.id} onClick={()=>selectPlan(plan)}>{active?"Current plan":loadingPlan===plan.id?"Activating...":plan.id==="free"?"Choose free":"Choose plan"}</Button></article>})}
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold text-textMuted"><span className="flex items-center gap-1.5"><Lock size={14}/>Secure checkout</span><span className="flex items-center gap-1.5"><Zap size={14}/>Instant access</span><span className="flex items-center gap-1.5"><ShieldCheck size={14}/>Cancel anytime</span></div>
      </section>

      <section className="grid overflow-hidden rounded-[26px] bg-soft lg:grid-cols-[.9fr_1.1fr]"><div className="flex flex-col justify-center p-7 sm:p-9"><div className="flex gap-1 text-[#f0ad35]">{[1,2,3,4,5].map(i=><Star key={i} size={15} fill="currentColor"/>)}</div><blockquote className="mt-4 text-xl font-extrabold leading-8 tracking-[-.03em]">“EchoTale turns my commute into a new adventure. The narration feels genuinely cinematic.”</blockquote><p className="mt-4 text-sm font-bold">Maya R. <span className="font-normal text-textMuted">— Premium listener</span></p></div><div className="relative min-h-[240px] bg-[#17103d]"><img src="/premium-story-world.png" alt="Immersive audiobook worlds" className="absolute inset-0 h-full w-full object-cover object-right opacity-80"/><div className="absolute inset-0 bg-gradient-to-r from-[#17103d] to-transparent"/><div className="absolute bottom-5 left-5 rounded-xl border border-white/10 bg-white/10 p-3 text-white backdrop-blur"><Headphones size={20} className="text-[#f7ce74]"/><p className="mt-1 text-sm font-bold">Your world. Your pace.</p></div></div></section>

      <section className="mx-auto max-w-3xl"><div className="text-center"><span className="text-[11px] font-bold uppercase tracking-[.18em] text-primary">Questions</span><h2 className="mt-2 text-3xl font-black tracking-[-.04em]">Good to know</h2></div><div className="mt-6 space-y-2">{faqs.map(([q,a],i)=><button key={q} onClick={()=>setOpenFaq(openFaq===i?-1:i)} className="w-full rounded-[18px] border border-borderSoft bg-white px-5 py-4 text-left shadow-sm"><span className="flex items-center justify-between gap-4 text-sm font-bold">{q}<ChevronDown size={18} className={`shrink-0 text-primary transition ${openFaq===i?"rotate-180":""}`}/></span>{openFaq===i&&<p className="mt-3 pr-8 text-sm leading-6 text-textMuted">{a}</p>}</button>)}</div></section>
    </div>
  </AppLayout>;
}
