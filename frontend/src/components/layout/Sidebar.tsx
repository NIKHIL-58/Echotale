'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { navItems } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  return <aside className="fixed left-0 top-0 z-20 hidden h-screen w-60 flex-col bg-white p-6 shadow-soft lg:flex">
    <Link href="/dashboard" className="mb-8 flex items-center gap-3 text-2xl font-bold"><BookOpen className="h-8 w-8 text-primary"/>EchoTale</Link>
    <nav className="flex flex-1 flex-col gap-2">
      {navItems.slice(0,8).map((item)=>{ const active = pathname===item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)); const Icon=item.icon; return <Link key={item.label} href={item.href} className={cn('flex h-12 items-center gap-3 rounded-[14px] px-3 text-sm font-medium text-textMuted', active && 'bg-soft text-primary')}><Icon className="h-5 w-5"/>{item.label}</Link> })}
      <div className="my-3 h-px bg-borderSoft"/>
      {navItems.slice(8,10).map((item)=>{ const Icon=item.icon; return <Link key={item.label} href={item.href} className="flex h-12 items-center gap-3 rounded-[14px] px-3 text-sm font-medium text-textMuted"><Icon className="h-5 w-5"/>{item.label}</Link> })}
    </nav>
    <Link href="/premium" className="rounded-[20px] bg-gradient-to-br from-[#5D3FD3] to-[#A855F7] p-5 text-white"><p className="font-bold">Go Premium</p><p className="mt-2 text-xs text-white/80">Unlock unlimited stories and offline listening.</p><button className="mt-5 rounded-xl bg-white px-5 py-3 text-sm font-bold text-primary">Upgrade Now</button></Link>
  </aside>;
}
