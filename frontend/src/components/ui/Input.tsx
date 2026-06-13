import { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) { return <input className={cn('h-12 w-full rounded-input border border-borderSoft bg-white px-4 outline-none focus:border-primary focus:ring-4 focus:ring-soft', className)} {...props}/>; }
