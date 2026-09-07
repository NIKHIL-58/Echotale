'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Crown, Sparkles } from 'lucide-react';
import { navItems } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { EchoTaleLogo } from '@/components/brand/EchoTaleLogo';

export function Sidebar() {
  const pathname = usePathname();
  return <aside className="fixed left-0 top-0 z-20 hidden h-screen w-[272px] flex-col overflow-hidden border-r border-white/[.07] bg-[#100c25] px-5 py-6 shadow-[18px_0_60px_rgba(20,14,45,.08)] lg:flex">
    <div className="pointer-events-none absolute -left-20 top-[-90px] h-64 w-64 rounded-full bg-[#7556d4]/20 blur-[80px]" />
    <Link href="/dashboard" className="relative mb-7 rounded-2xl px-2 py-1"><EchoTaleLogo inverse /></Link>
    <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-white/30">Discover</p>
    <nav className="relative flex flex-1 flex-col gap-1">
      {navItems.slice(0,8).map((item)=>{ const active = pathname===item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)); const Icon=item.icon; return <Link key={item.label} href={item.href} className={cn('flex h-11 items-center gap-3 rounded-[14px] px-3 text-sm font-semibold text-white/52 transition-all hover:bg-white/[.07] hover:text-white', active && 'bg-white/[.09] text-[#f1ce82] shadow-[inset_3px_0_0_#e4b95f]')}><Icon className="h-5 w-5"/>{item.label}</Link> })}
      <div className="my-3 h-px bg-white/[.08]"/>
      <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-white/30">Account</p>
      {navItems.slice(8,10).map((item)=>{ const active=pathname===item.href; const Icon=item.icon; return <Link key={item.label} href={item.href} className={cn("flex h-11 items-center gap-3 rounded-[14px] px-3 text-sm font-semibold text-white/52 transition-all hover:bg-white/[.07] hover:text-white", active && "bg-white/[.09] text-[#f1ce82] shadow-[inset_3px_0_0_#e4b95f]")}><Icon className="h-5 w-5"/>{item.label}</Link> })}
    </nav>
    <Link href="/premium" className="group relative overflow-hidden rounded-[20px] border border-white/10 bg-gradient-to-br from-[#2b2252] to-[#18122f] p-4 text-white shadow-[0_18px_45px_rgba(0,0,0,.2)]"><Sparkles className="absolute -right-3 -top-3 h-20 w-20 text-white/[.05]"/><p className="flex items-center gap-2 text-sm font-bold"><Crown className="h-4 w-4 text-[#f8ca62]"/>EchoTale Plus</p><p className="mt-1.5 max-w-[170px] text-[11px] leading-5 text-white/55">Offline stories and unlimited listening.</p><span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#f2ce7b]">Explore plans <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"/></span></Link>
  </aside>;
}