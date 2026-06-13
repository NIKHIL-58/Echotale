import { AppLayout } from '@/components/layout/AppLayout';
import { StoryTile } from '@/components/story/StoryTile';
import { stories } from '@/lib/mock-data';
export default function Page({ params }: { params: { category: string } }){ const title=params.category; return <AppLayout><h1 className="mb-6 text-3xl font-bold capitalize">{title} Stories</h1><div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">{stories.map(s=><StoryTile key={s.id} story={s}/>)}</div></AppLayout> }
