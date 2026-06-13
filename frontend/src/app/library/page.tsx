import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs } from '@/components/ui/Tabs';
import { StoryTile } from '@/components/story/StoryTile';
import { stories } from '@/lib/mock-data';
export default function Page(){ return <AppLayout><h1 className="text-3xl font-bold">My Library</h1><div className="mt-5"><Tabs tabs={['All','Downloaded','Playlists','Completed']}/></div><div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">{stories.map(s=><StoryTile key={s.id} story={s}/>)}</div></AppLayout> }
