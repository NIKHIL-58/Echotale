import { PlayerControls } from './PlayerControls';
import { ProgressBar } from './ProgressBar';
import { stories } from '@/lib/mock-data';
export function ExpandedPlayer(){ const story=stories[0]; return <section className="rounded-[32px] bg-deep p-8 text-white shadow-card"><div className="grid gap-8 md:grid-cols-[280px_1fr]"><img src={story.cover} className="h-[340px] w-full rounded-[24px] object-cover"/><div className="flex flex-col justify-center"><p className="text-white/70">Now Playing</p><h1 className="mt-2 text-4xl font-bold">{story.title}</h1><p className="mt-2 text-white/70">by {story.author}</p><div className="my-10"><ProgressBar value={52}/></div><PlayerControls/></div></div></section> }
