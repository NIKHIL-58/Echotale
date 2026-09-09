import Link from 'next/link';
import { AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';

export function EmptyState({ title, description, href = '/explore', action = 'Explore stories', compact = false }: { title: string; description: string; href?: string; action?: string; compact?: boolean }) {
  return <div className={`surface flex flex-col items-center justify-center gap-5 overflow-hidden p-6 text-center ${compact ? 'sm:flex-row sm:text-left' : 'py-10'}`}>
    <img src="/images/reading-corner.png" alt="" loading="lazy" width={240} height={160} className={`${compact ? 'h-28 w-40' : 'h-36 w-56'} rounded-2xl object-cover`} />
    <div className="max-w-md"><h2 className="section-title">{title}</h2><p className="mt-2 text-sm leading-6 text-textMuted">{description}</p>
      <Link className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary hover:underline" href={href}>{action}<ArrowRight size={16} /></Link>
    </div>
  </div>;
}
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div role="alert" className="flex flex-wrap items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-5 text-red-800"><AlertCircle size={20} className="shrink-0" /><p className="flex-1 text-sm">{message}</p>{onRetry && <button type="button" onClick={onRetry} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-red-200 px-3 text-sm font-semibold hover:bg-white"><RefreshCw size={15} />Try again</button>}</div>;
}
export function StorySkeletons({ count = 3 }: { count?: number }) {
  return <div role="status" aria-label="Loading stories" className="story-grid"><span className="sr-only">Loading stories…</span>{Array.from({ length: count }, (_, i) => <div key={i} className="surface animate-pulse overflow-hidden"><div className="h-48 bg-soft" /><div className="space-y-3 p-5"><div className="h-4 w-3/4 rounded bg-soft" /><div className="h-3 w-1/2 rounded bg-soft" /><div className="h-3 rounded bg-page" /></div></div>)}</div>;
}
