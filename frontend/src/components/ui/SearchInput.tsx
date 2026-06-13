'use client';
import { Search } from 'lucide-react';
import { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
export function SearchInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) { return <div className={cn('relative', className)}><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-textMuted"/><input className="h-12 w-full rounded-input border border-borderSoft bg-white pl-12 pr-4 outline-none focus:border-primary focus:ring-4 focus:ring-soft" placeholder="Search stories, authors, podcasts..." {...props}/></div>; }
