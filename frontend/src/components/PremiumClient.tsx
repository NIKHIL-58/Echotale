"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Check, ChevronDown, Crown, Download, Headphones, Infinity, Loader2, Lock, Mic2, ShieldCheck, Sparkles, Star, WandSparkles, Zap } from "lucide-react";
import { choosePlan, getCurrentSubscription, getPlans, type Plan, type Subscription } from "@/services/appService";
import { getStoredUser, getToken } from "@/lib/auth";

const benefits = [
  { icon: Infinity, title: "Listen without limits", text: "Every story, every chapter, whenever inspiration strikes." },
  { icon: Download, title: "Take stories offline", text: "Save your favorites and listen wherever the day takes you." },
  { icon: Mic2, title: "Premium narration", text: "Immersive voices designed to make every world feel alive." },
  { icon: WandSparkles, title: "Smarter discovery", text: "Personal recommendations that learn what keeps you listening." },
];

const faqs = [
  ["Can I cancel anytime?", "Yes. Your premium access remains active until the end of the current billing period."],
  ["Does Premium work on mobile?", "Yes. Your subscription follows your EchoTale account across desktop and mobile."],
  ["What happens to saved stories?", "Your library stays safe. Offline and premium-only access follows your active plan."],
];

function planDescription(id: string) {
  if (id === "free") return "A simple way to start listening.";
  if (id.toLowerCase().includes("year")) return "Our best value for devoted listeners.";
  return "Everything you need for unlimited stories.";
}

export default function PremiumClient() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [current, setCurrent] = useState<Subscription | null>(null);
  const [message, setMessage] = useState("");
  const [loadingPlan, setLoadingPlan] = useState("");
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    getPlans().then(setPlans).catch(() => setMessage("Unable to load plans right now."));
    if (getToken()) getCurrentSubscription().then(setCurrent).catch(() => undefined);
  }, []);

  async function selectPlan(plan: Plan) {
    if (!getToken()) { setMessage("Please sign in before choosing a plan."); return; }
    try {
      setLoadingPlan(plan.id); setMessage("");
      const subscription = await choosePlan(plan.id);
      setCurrent(subscription);
      const user = getStoredUser();
      if (user) { user.is_premium = plan.id !== "free"; localStorage.setItem("user", JSON.stringify(user)); }
      setMessage("Welcome to your new plan — your subscription is active.");
    } catch { setMessage("Payment verification failed. Please try again."); }
    finally { setLoadingPlan(""); }
  }

  return (
    <AppLayout rightPanel={false}>
      <div className="space-y-16 pb-10">
        <section className="relative isolate min-h-[520px] overflow-hidden rounded-[32px] bg-[#100929] px-6 py-12 text-white shadow-[0_30px_80px_rgba(25,14,70,.28)] sm:px-10 lg:px-14">
          <img src="/premium-story-world.png" alt="A magical storybook becoming an audio world" className="absolute inset-0 -z-20 h-full w-full object-cover object-center lg:object-right" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0b071f] via-[#100929]/95 to-[#100929]/15" />
          <div className="absolute left-[52%] top-14 h-2 w-2 animate-ping rounded-full bg-[#f4c76d]" />
          <div className="absolute right-[18%] top-24 h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          <div className="relative flex min-h-[420px] max-w-xl flex-col justify-center">
            <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.14em] backdrop-blur-md"><Crown className="h-4 w-4 text-[#f7ce74]" /> EchoTale Premium</span>
            <h1 className="text-4xl font-black leading-[1.04] tracking-[-.05em] sm:text-5xl lg:text-6xl">Every story.<br/><span className="bg-gradient-to-r from-[#fff1bd] to-[#cbb9ff] bg-clip-text text-transparent">No limits.</span></h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/70 sm:text-lg">Step into immersive worlds with unlimited listening, premium voices, and stories that travel with you.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#plans" className="inline-flex items-center gap-2 rounded-[14px] bg-white px-6 py-3.5 text-sm font-extrabold text-[#3a226f] shadow-xl transition hover:-translate-y-0.5"><Sparkles className="h-4 w-4"/>Explore plans</a>
              <span className="inline-flex items-center gap-2 rounded-[14px] border border-white/15 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white/80 backdrop-blur"><ShieldCheck className="h-4 w-4"/>Cancel anytime</span>
            </div>
            <div className="mt-9 flex items-center gap-4 text-xs text-white/60"><div className="flex -space-x-2">{["#a78bfa","#f9a8d4","#fde68a","#93c5fd"].map((color,i)=><span key={i} className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#17103d] text-[10px] font-bold text-deep" style={{background:color}}>{["A","M","R","S"][i]}</span>)}</div><span><b className="text-white">Loved by listeners</b><br/>Join the EchoTale community</span></div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{benefits.map(({icon:Icon,title,text})=><article key={title} className="group surface p-6 transition duration-300 hover:-translate-y-1 hover:shadow-card"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-soft to-[#e5dcff] text-primary transition group-hover:scale-110"><Icon className="h-5 w-5"/></span><h2 className="mt-5 font-extrabold tracking-[-.02em]">{title}</h2><p className="mt-2 text-sm leading-6 text-textMuted">{text}</p></article>)}</section>

        <section id="plans" className="scroll-mt-8">
          <div className="mx-auto max-w-2xl text-center"><span className="text-xs font-bold uppercase tracking-[.18em] text-primary">Simple pricing</span><h2 className="mt-3 text-3xl font-black tracking-[-.04em] sm:text-4xl">Choose how your story unfolds</h2><p className="mt-3 text-textMuted">Clear plans with no hidden fees. Upgrade, downgrade, or cancel anytime.</p></div>
          {message && <div className="mx-auto mt-7 max-w-2xl rounded-2xl border border-primary/15 bg-soft p-4 text-center text-sm font-semibold text-primary">{message}</div>}
          <div className="mx-auto mt-10 grid max-w-5xl items-stretch gap-5 md:grid-cols-3">
            {plans.length===0 && !message && <div className="col-span-full flex justify-center py-14"><Loader2 className="animate-spin text-primary"/></div>}
            {plans.map((plan,index)=>{const featured=plan.id!=="free"&&(index===1||plans.length===2);const active=current?.plan===plan.id;return <article key={plan.id} className={`relative flex flex-col rounded-[26px] border p-7 transition hover:-translate-y-1 ${featured?'border-primary bg-[#17103d] text-white shadow-[0_24px_55px_rgba(46,28,108,.24)]':'border-[#e9e6f0] bg-white shadow-soft'}`}>{featured&&<span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#f4c76d] to-[#ffe9a9] px-4 py-1.5 text-[10px] font-black uppercase tracking-[.14em] text-[#3f2b08]">Most popular</span>}<div className="flex items-center justify-between"><h3 className="text-xl font-extrabold">{plan.name}</h3>{active&&<span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">Active</span>}</div><p className={`mt-3 text-sm leading-6 ${featured?'text-white/60':'text-textMuted'}`}>{planDescription(plan.id)}</p><p className="mt-7 flex items-end gap-1"><span className="text-4xl font-black tracking-[-.05em]">{plan.currency === "INR" ? "?" : plan.currency === "USD" ? "$" : plan.currency} {plan.amount}</span>{plan.id!=="free"&&<span className={`pb-1 text-sm ${featured?'text-white/50':'text-textMuted'}`}>/ plan</span>}</p><ul className="my-7 flex-1 space-y-3">{["Curated story library",plan.id==="free"?"Standard listening":"Unlimited listening",plan.id==="free"?"Online access":"Offline downloads",plan.id==="free"?"Community voices":"Premium narration"].map(item=><li key={item} className={`flex items-center gap-3 text-sm ${featured?'text-white/80':'text-textMuted'}`}><span className={`grid h-5 w-5 place-items-center rounded-full ${featured?'bg-white/10 text-[#f7ce74]':'bg-soft text-primary'}`}><Check className="h-3 w-3"/></span>{item}</li>)}</ul><Button className={`w-full ${featured?'!bg-white !text-[#3d2677]':''}`} variant={active?"secondary":"primary"} disabled={active||loadingPlan===plan.id} onClick={()=>selectPlan(plan)}>{active?"Your current plan":loadingPlan===plan.id?"Activating...":plan.id==="free"?"Start free":"Go Premium"}</Button></article>})}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold text-textMuted"><span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5"/>Secure checkout</span><span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5"/>Instant access</span><span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5"/>Cancel anytime</span></div>
        </section>

        <section className="grid overflow-hidden rounded-[30px] bg-[#f0ecff] lg:grid-cols-[.85fr_1.15fr]"><div className="flex flex-col justify-center p-8 sm:p-12"><div className="flex gap-1 text-[#f0ad35]">{Array.from({length:5}).map((_,i)=><Star key={i} className="h-4 w-4 fill-current"/>)}</div><blockquote className="mt-5 text-2xl font-extrabold leading-9 tracking-[-.03em]">“EchoTale turns my commute into a new adventure every day. The narration feels genuinely cinematic.”</blockquote><p className="mt-5 text-sm font-bold">Maya R. <span className="font-normal text-textMuted">— Premium listener</span></p></div><div className="relative min-h-[290px] overflow-hidden bg-[#17103d]"><img src="/premium-story-world.png" alt="Immersive audiobook worlds" className="absolute inset-0 h-full w-full scale-125 object-cover object-right opacity-80"/><div className="absolute inset-0 bg-gradient-to-r from-[#17103d] to-transparent"/><div className="absolute bottom-7 left-7 rounded-2xl border border-white/10 bg-white/10 p-4 text-white backdrop-blur-md"><Headphones className="h-6 w-6 text-[#f7ce74]"/><p className="mt-2 font-bold">Your world. Your pace.</p></div></div></section>

        <section className="mx-auto max-w-3xl"><div className="text-center"><span className="text-xs font-bold uppercase tracking-[.18em] text-primary">Questions</span><h2 className="mt-3 text-3xl font-black tracking-[-.04em]">Good to know</h2></div><div className="mt-8 space-y-3">{faqs.map(([q,a],i)=><button key={q} onClick={()=>setOpenFaq(openFaq===i?-1:i)} className="surface w-full p-5 text-left"><span className="flex items-center justify-between gap-4 font-bold">{q}<ChevronDown className={`h-5 w-5 shrink-0 text-primary transition ${openFaq===i?'rotate-180':''}`}/></span>{openFaq===i&&<p className="mt-3 pr-8 text-sm leading-6 text-textMuted">{a}</p>}</button>)}</div></section>
      </div>
    </AppLayout>
  );
}

