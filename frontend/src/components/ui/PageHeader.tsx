import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

export function PageHeader({ title, description, eyebrow, actions, back }: { title: string; description?: string; eyebrow?: string; actions?: ReactNode; back?: { href: string; label: string } }) {
  return <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      {back && <Link href={back.href} className="mb-3 inline-flex min-h-8 items-center gap-2 text-sm text-textMuted hover:text-primary"><ArrowLeft size={15} />{back.label}</Link>}
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <h1 className="page-title">{title}</h1>
      {description && <p className="page-subtitle">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
  </header>;
}
