import { ContinueListeningCard } from '@/components/story/ContinueListeningCard';
import { stories } from '@/lib/mock-data';
export function ContinueListening(){ return <section className="mt-6"><div className="mb-4 flex justify-between"><h2 className="text-lg font-bold">Continue Listening</h2><a className="text-sm text-primary" href="/history">View all</a></div><div className="flex gap-4 overflow-x-auto pb-2">{stories.slice(0,4).map((s)=><ContinueListeningCard key={s.id} story={s}/>)}</div></section> }
