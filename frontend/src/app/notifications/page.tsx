import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs } from '@/components/ui/Tabs';
const notes=['New story released by Meera Shah','Your weekly goal is almost complete','Premium offer available today'];
export default function Page(){ return <AppLayout><h1 className="text-3xl font-bold">Notifications</h1><div className="mt-5"><Tabs tabs={['All','Unread','Releases','Reminders']}/></div><div className="mt-6 space-y-4">{notes.map(n=><div key={n} className="rounded-card bg-white p-5 shadow-soft"><div className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-primary"/><b>{n}</b></div><p className="mt-2 text-sm text-textMuted">Just now</p></div>)}</div></AppLayout> }
