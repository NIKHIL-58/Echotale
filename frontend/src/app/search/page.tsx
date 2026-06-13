import { AppLayout } from '@/components/layout/AppLayout';
import { SearchInput } from '@/components/ui/SearchInput';
import { Tabs } from '@/components/ui/Tabs';
import { StoryRow } from '@/components/story/StoryRow';
import { stories } from '@/lib/mock-data';
export default function Page(){ return <AppLayout><h1 className="text-3xl font-bold">Search Results</h1><div className="mt-5 rounded-widget bg-white p-5 shadow-soft"><SearchInput/><div className="mt-4"><Tabs tabs={['Stories','Authors','Podcasts','Audiobooks']}/></div></div><div className="mt-6 space-y-4">{stories.map(s=><StoryRow key={s.id} story={s}/>)}</div></AppLayout> }
