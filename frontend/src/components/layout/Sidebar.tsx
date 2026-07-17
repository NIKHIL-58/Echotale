'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Crown, Headphones, Sparkles } from 'lucide-react';
import { navItems } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  return <aside className="fixed left-0 top-0 z-20 hidden h-screen w-[272px] flex-col border-r border-white/[.06] bg-[#0d0a22]/95 px-5 py-6 backdrop-blur-xl lg:flex">
    <Link href="/dashboard" className="mb-8 flex items-center gap-3 rounded-2xl px-2 text-2xl font-bold tracking-[-.03em] text-white"><BookOpen className="h-8 w-8 rounded-lg bg-white/10 p-1 text-[#e7bd69]"/>EchoTale</Link>
    <nav className="flex flex-1 flex-col gap-1">
      {navItems.slice(0,8).map((item)=>{ const active = pathname===item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)); const Icon=item.icon; return <Link key={item.label} href={item.href} className={cn('flex h-11 items-center gap-3 rounded-[14px] px-3 text-sm font-semibold text-white/55 transition-all hover:bg-white/[.07] hover:text-white', active && 'bg-white/[.09] text-[#f1ce82] shadow-[inset_3px_0_0_#e4b95f]')}><Icon className="h-5 w-5"/>{item.label}</Link> })}
      <div className="my-3 h-px bg-white/10"/>
      {navItems.slice(8,10).map((item)=>{ const Icon=item.icon; return <Link key={item.label} href={item.href} className="flex h-11 items-center gap-3 rounded-[14px] px-3 text-sm font-semibold text-white/55 transition-all hover:bg-white/[.07] hover:text-white"><Icon className="h-5 w-5"/>{item.label}</Link> })}
    </nav>
    <Link href="/premium" className="group relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#29204d] to-[#15102e] p-5 text-white shadow-card"><Sparkles className="absolute -right-2 -top-2 h-20 w-20 text-white/[.06]"/><p className="flex items-center gap-2 font-bold"><Crown className="h-4 w-4 text-[#f8ca62]"/>EchoTale Plus</p><p className="mt-2 text-xs text-white/80">Unlimited listening and offline stories.</p><span className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-xs font-bold text-deep transition group-hover:bg-[#fff6df]"><Headphones className="h-4 w-4"/>View plans</span></Link>
  </aside>;
}



