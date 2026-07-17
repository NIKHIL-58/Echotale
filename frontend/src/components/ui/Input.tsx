import { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) { return <input className={cn('h-12 w-full rounded-[14px] border border-[#e2e0ea] bg-white px-4 text-textMain outline-none transition placeholder:text-[#aaa6b5] hover:border-[#cbc6dc] focus:border-primary/60 focus:ring-4 focus:ring-primary/10', className)} {...props}/>; }

