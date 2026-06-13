import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs } from '@/components/ui/Tabs';
import { StoryRow } from '@/components/story/StoryRow';
import { stories } from '@/lib/mock-data';
export default function Page(){ return <AppLayout><h1 className="text-3xl font-bold">Bookmarks</h1><div className="mt-5"><Tabs tabs={['Stories','Moments','Notes']}/></div><div className="mt-6 space-y-4">{stories.slice(0,4).map(s=><StoryRow key={s.id} story={s}/>)}</div></AppLayout> }
