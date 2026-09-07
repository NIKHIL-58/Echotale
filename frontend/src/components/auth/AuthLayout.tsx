import { CheckCircle2, Headphones, ShieldCheck, Sparkles } from "lucide-react";
import { EchoTaleLogo } from "@/components/brand/EchoTaleLogo";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,rgba(121,87,216,.11),transparent_30%),linear-gradient(135deg,#faf8f4,#f1edf6)] p-3 sm:p-5 lg:p-7">
      <div className="mx-auto grid min-h-[calc(100vh-24px)] w-full max-w-[1240px] overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_28px_80px_rgba(23,17,47,.13)] sm:min-h-[calc(100vh-40px)] lg:min-h-[calc(100vh-56px)] lg:grid-cols-[.82fr_1.18fr]">
        <section className="flex flex-col justify-center px-6 py-8 sm:px-10 lg:px-12 lg:py-9">
          <EchoTaleLogo className="mb-7" />
          <div className="mb-6"><h1 className="max-w-md text-[38px] font-extrabold leading-[1.04] tracking-[-.045em] text-[#17162B] sm:text-[44px]">{title}</h1>{subtitle && <p className="mt-2.5 max-w-md text-sm leading-6 text-[#6E6A7C]">{subtitle}</p>}</div>
          {children}
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#eeeaf1] pt-4 text-[11px] font-semibold text-[#827d8d]"><span className="inline-flex items-center gap-1.5"><ShieldCheck size={13} /> Secure access</span><span className="inline-flex items-center gap-1.5"><CheckCircle2 size={13} /> Free to begin</span></div>
        </section>
        <section className="relative hidden overflow-hidden bg-[#09071d] text-white lg:block"><img src="/premium-story-world.png" alt="A magical audiobook story world" className="absolute inset-0 h-full w-full object-cover object-center" /><div className="absolute inset-0 bg-gradient-to-r from-[#09071d]/75 via-[#09071d]/32 to-transparent" /><div className="absolute inset-0 bg-gradient-to-b from-[#09071d]/10 via-transparent to-[#09071d]/90" />
          <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-12"><div><div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white/80 backdrop-blur"><Sparkles size={15} /> Stories chosen for you</div><h2 className="mt-8 max-w-[560px] text-[46px] font-extrabold leading-[1.04] tracking-[-.045em] xl:text-[54px]">Turn quiet moments into unforgettable worlds.</h2><p className="mt-4 max-w-md text-sm leading-6 text-white/65">Discover immersive stories, thoughtful narration, and a library that travels with you.</p></div>
          <div className="grid max-w-lg grid-cols-2 gap-3"><div className="rounded-2xl border border-white/10 bg-[#17112f]/65 p-4 backdrop-blur"><Headphones className="text-[#edca7b]" size={19} /><p className="mt-2 text-sm font-bold">Listen anywhere</p><p className="mt-1 text-xs text-white/50">Your stories, always close.</p></div><div className="rounded-2xl border border-white/10 bg-[#17112f]/65 p-4 backdrop-blur"><Sparkles className="text-[#edca7b]" size={19} /><p className="mt-2 text-sm font-bold">Made for your taste</p><p className="mt-1 text-xs text-white/50">Personal discovery that improves.</p></div></div></div>
        </section>
      </div>
    </main>
  );
}
