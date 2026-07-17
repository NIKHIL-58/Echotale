import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
export function Button({ className, variant='primary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'secondary'|'ghost' }) {
  return <button className={cn('h-12 rounded-[14px] px-5 font-semibold transition-all duration-200 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-55', variant==='primary' && 'bg-gradient-to-r from-primary to-[#805cff] text-white shadow-[0_10px_24px_rgba(108,77,246,.23)] hover:-translate-y-0.5', variant==='secondary' && 'border border-borderSoft bg-white text-primary shadow-sm hover:border-primary/30 hover:bg-soft', variant==='ghost' && 'bg-transparent text-primary hover:bg-soft', className)} {...props} />;
}

