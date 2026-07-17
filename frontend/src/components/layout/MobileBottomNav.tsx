'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Library, Bookmark, User } from 'lucide-react';
import { cn } from '@/lib/utils';
const items=[['/dashboard','Home',Home],['/explore','Explore',Compass],['/library','Library',Library],['/bookmarks','Saved',Bookmark],['/profile','Profile',User]] as const;
export function MobileBottomNav(){
  const pathname=usePathname();
  return <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-[74px] justify-around border-t border-borderSoft bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(25,20,55,.07)] backdrop-blur-xl lg:hidden">{items.map(([href,label,Icon])=>{const active=pathname===href||pathname.startsWith(`${href}/`);return <Link href={href} key={href} className={cn('relative flex min-w-14 flex-col items-center justify-center gap-1 text-[11px] font-semibold text-textMuted transition',active&&'text-primary')}><span className={cn('grid h-8 w-11 place-items-center rounded-full transition',active&&'bg-soft')}><Icon className="h-[19px] w-[19px]"/></span>{label}{active&&<span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary"/>}</Link>})}</nav>
}
