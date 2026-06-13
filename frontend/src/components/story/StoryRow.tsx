import Link from 'next/link';
import { Play } from 'lucide-react';
import type { Story } from '@/types/story';
export function StoryRow({ story }: { story: Story }){ return <Link href={`/stories/${story.id}`} className="flex items-center gap-4 rounded-card bg-white p-4 shadow-soft"><img src={story.cover} className="h-16 w-16 rounded-xl object-cover"/><div className="flex-1"><h3 className="font-bold">{story.title}</h3><p className="text-sm text-textMuted">{story.author} • {story.duration} min</p></div><button className="grid h-11 w-11 place-items-center rounded-full bg-soft text-primary"><Play/></button></Link> }
