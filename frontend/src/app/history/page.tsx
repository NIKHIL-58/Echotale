import { AppLayout } from '@/components/layout/AppLayout';
import { StoryRow } from '@/components/story/StoryRow';
import { stories } from '@/lib/mock-data';
export default function Page(){ return <AppLayout><h1 className="text-3xl font-bold">History</h1>{['Today','Yesterday','This week'].map((group,i)=><section key={group} className="mt-7"><h2 className="mb-3 font-bold">{group}</h2><div className="space-y-3">{stories.slice(i,i+2).map(s=><StoryRow key={`${group}-${s.id}`} story={s}/>)}</div></section>)}</AppLayout> }
