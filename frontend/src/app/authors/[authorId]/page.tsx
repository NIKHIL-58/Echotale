import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { StoryTile } from '@/components/story/StoryTile';
import { authors, stories } from '@/lib/mock-data';
export default function Page({ params }: { params: { authorId: string } }){ const author=authors.find(a=>a.id===params.authorId)||authors[0]; return <AppLayout><section className="rounded-widget bg-white p-6 shadow-soft"><div className="flex items-center gap-5"><img src={author.avatar} className="h-24 w-24 rounded-full object-cover"/><div><h1 className="text-3xl font-bold">{author.name}</h1><p className="mt-2 text-textMuted">Author and narrator of immersive audio stories.</p><Button className="mt-4">Follow</Button></div></div></section><h2 className="mb-4 mt-8 text-xl font-bold">Top Stories</h2><div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">{stories.slice(0,4).map(s=><StoryTile key={s.id} story={s}/>)}</div></AppLayout> }
