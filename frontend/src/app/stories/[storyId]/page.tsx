import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ChapterRow } from '@/components/story/ChapterRow';
import { chapters, stories } from '@/lib/mock-data';
export default function Page({ params }: { params: { storyId: string } }){ const story=stories.find(s=>s.id===params.storyId) || stories[0]; return <AppLayout><section className="grid gap-6 rounded-widget bg-white p-6 shadow-soft md:grid-cols-[260px_1fr]"><img src={story.cover} className="h-[340px] w-full rounded-widget object-cover"/><div><Badge>{story.category}</Badge><h1 className="mt-4 text-4xl font-bold">{story.title}</h1><p className="mt-2 text-textMuted">by {story.author} • {story.duration} min • ★ 4.8</p><p className="mt-5 max-w-2xl text-textMuted">{story.description}</p><div className="mt-6 flex gap-3"><Button>Play Now</Button><Button variant="secondary">Save</Button></div></div></section><h2 className="mb-4 mt-8 text-xl font-bold">Chapters</h2><div className="space-y-3">{chapters.map(c=><ChapterRow key={c.id} title={c.title} duration={c.duration}/>)}</div></AppLayout> }
