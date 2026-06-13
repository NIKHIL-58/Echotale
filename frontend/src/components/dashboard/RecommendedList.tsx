import { StoryRow } from '@/components/story/StoryRow';
import { stories } from '@/lib/mock-data';
export function RecommendedList(){ return <section className="space-y-3">{stories.slice(0,4).map((s)=><StoryRow key={s.id} story={s}/>)}</section> }
