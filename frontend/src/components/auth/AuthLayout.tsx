import Image from "next/image";
import Link from "next/link";
import { BookOpen, Headphones } from "lucide-react";
import { EchoTaleLogo } from "@/components/brand/EchoTaleLogo";
export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
 return <main className="flex min-h-screen items-center justify-center bg-[#f5f2f7] p-4 sm:p-8">
  <div className="grid w-full max-w-[1120px] overflow-hidden rounded-3xl border border-borderSoft bg-white shadow-card lg:grid-cols-2">
   <section className="flex flex-col justify-center px-5 py-8 sm:px-12 sm:py-12">
    <Link href="/auth/login" className="mb-9 w-fit rounded-xl" aria-label="EchoTale sign in"><EchoTaleLogo/></Link>
    <div className="mb-7"><h1 className="text-[30px] font-bold leading-tight tracking-[-.04em] sm:text-[36px]">{title}</h1>{subtitle && <p className="mt-3 max-w-md text-sm leading-6 text-textMuted">{subtitle}</p>}</div>
    {children}
    <p className="mt-7 border-t border-borderSoft pt-5 text-xs text-textMuted">Your next chapter begins here.</p>
   </section>
   <section className="relative hidden min-h-[660px] overflow-hidden bg-[#201a30] text-white lg:flex lg:flex-col">
    <div className="relative z-10 p-10 pb-0"><p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[.12em] text-[#dec4f0]"><Headphones size={16}/>Read. Listen. Escape.</p><h2 className="mt-6 max-w-sm text-4xl font-semibold leading-[1.15] tracking-[-.035em]">A whole world.<br/><span className="text-[#f3d59b]">One story away.</span></h2><p className="mt-4 max-w-sm text-sm leading-6 text-[#c7bed4]">A personal space for the stories you love, and the ones you have yet to discover.</p></div>
    <div className="relative min-h-[330px] flex-1"><Image src="/images/listening-world.png" alt="A moonlit library rises from the pages of an open book." fill priority sizes="560px" className="object-cover"/><div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#201a30] to-transparent"/></div>
    <div className="relative flex items-center gap-2 px-10 py-6 text-xs text-[#c7bed4]"><BookOpen size={16}/>Stories that stay with you.</div>
   </section>
  </div>
 </main>;
}
