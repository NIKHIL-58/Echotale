'use client';
import { categories } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
export default function Page(){ return <main className="grid min-h-screen place-items-center p-6"><section className="w-full max-w-3xl rounded-widget bg-white p-8 shadow-card"><h1 className="text-3xl font-bold">Personalize your EchoTale</h1><p className="mt-2 text-textMuted">Choose at least 3 genres to improve recommendations.</p><div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">{categories.map(c=><button className="rounded-card bg-soft p-5 font-bold text-primary" key={c}>{c}</button>)}</div><Button className="mt-8">Continue to Home</Button></section></main> }
