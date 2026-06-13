import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
export function Button({ className, variant='primary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'secondary'|'ghost' }) {
  return <button className={cn('h-12 rounded-xl px-5 font-semibold transition active:scale-95', variant==='primary' && 'bg-primary text-white shadow-soft', variant==='secondary' && 'bg-white text-primary border border-borderSoft', variant==='ghost' && 'bg-transparent text-primary', className)} {...props} />;
}
