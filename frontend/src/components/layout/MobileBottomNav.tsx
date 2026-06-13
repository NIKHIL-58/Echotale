'use client';
import Link from 'next/link';
import { Home, Compass, Library, Bookmark, User } from 'lucide-react';
const items=[['/dashboard','Home',Home],['/explore','Explore',Compass],['/library','Library',Library],['/bookmarks','Saved',Bookmark],['/profile','Profile',User]] as const;
export function MobileBottomNav(){ return <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-[72px] justify-around border-t border-borderSoft bg-white lg:hidden">{items.map(([href,label,Icon])=><Link href={href} key={href} className="flex flex-col items-center justify-center gap-1 text-xs text-textMuted"><Icon className="h-5 w-5"/>{label}</Link>)}</nav> }
