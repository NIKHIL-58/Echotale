import { StoryCard } from '@/components/story/StoryCard';
import { stories } from '@/lib/mock-data';
export function FeaturedStories(){ return <section className="mt-6"><div className="mb-4 flex justify-between"><h2 className="text-lg font-bold">Featured Stories</h2><a className="text-sm text-primary" href="/explore">View all</a></div><div className="flex gap-4 overflow-x-auto pb-2">{stories.slice(0,5).map((s)=><StoryCard key={s.id} story={s}/>)}</div></section> }
