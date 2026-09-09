import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
export function Button({ className, variant = 'primary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  return <button className={cn('inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50', variant === 'primary' && 'bg-primary text-white shadow-sm hover:bg-[#5b40ab]', variant === 'secondary' && 'border border-borderSoft bg-white text-textMain hover:border-primary/40 hover:bg-soft', variant === 'ghost' && 'text-primary hover:bg-soft', className)} {...props} />;
}

