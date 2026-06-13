import Link from 'next/link';
import type { Story } from '@/types/story';
export function StoryTile({ story }: { story: Story }){ return <Link href={`/stories/${story.id}`} className="rounded-card bg-white p-3 shadow-soft"><img src={story.cover} className="h-44 w-full rounded-xl object-cover"/><h3 className="mt-3 font-bold">{story.title}</h3><p className="text-sm text-textMuted">{story.author}</p></Link> }
