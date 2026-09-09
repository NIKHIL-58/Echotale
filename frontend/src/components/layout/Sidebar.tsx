'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Crown } from 'lucide-react';
import { navItems } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { EchoTaleLogo } from '@/components/brand/EchoTaleLogo';
export function Sidebar() {
  const pathname = usePathname();
  const groups = [{ label: 'Discover', items: navItems.slice(0, 5) }, { label: 'Your space', items: navItems.slice(5, 8) }, { label: 'Account', items: navItems.slice(8, 10) }];
  return <aside className="fixed inset-y-0 left-0 z-20 hidden w-[240px] flex-col border-r border-white/5 bg-[#19132d] lg:flex">
    <Link href="/dashboard" aria-label="EchoTale home" className="mx-5 mb-3 mt-7 rounded-xl"><EchoTaleLogo inverse /></Link>
    <nav aria-label="Main navigation" className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5">
      {groups.map(group => <div key={group.label}><p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.16em] text-[#a59aBA]">{group.label}</p><div className="space-y-1">{group.items.map(item => {
        const active = pathname === item.href || (item.href === '/stories' ? pathname.startsWith('/stories/') : item.href === '/explore' && pathname.startsWith('/explore/'));
        const Icon = item.icon;
        return <Link key={item.label} href={item.href} aria-current={active ? 'page' : undefined} className={cn('flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-[#b9b0cb] transition hover:bg-white/[.06] hover:text-white', active && 'bg-[#33264c] text-[#f4d590]')}><Icon size={18} aria-hidden="true" />{item.label}</Link>;
      })}</div></div>)}
    </nav>
    <Link href="/premium" className="mx-4 mb-5 flex shrink-0 items-center gap-3 rounded-xl border border-[#4a3c62] bg-[#2c2141] p-3.5 text-white transition hover:bg-[#3b2a58]"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#f4d590]/10 text-[#f4d590]"><Crown size={18}/></span><span className="flex-1"><span className="block text-sm font-semibold">EchoTale Premium</span><span className="text-xs text-[#bbb0cd]">Explore membership</span></span><ArrowUpRight size={16} /></Link>
  </aside>;
}
