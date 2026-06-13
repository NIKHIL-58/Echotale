import { AppLayout } from '@/components/layout/AppLayout';
const groups=['Account','Audio preferences','Notifications','Privacy','Billing','Accessibility'];
export default function Page(){ return <AppLayout><h1 className="text-3xl font-bold">Settings</h1><div className="mt-6 space-y-4">{groups.map(g=><section key={g} className="rounded-card bg-white p-5 shadow-soft"><h2 className="font-bold">{g}</h2><p className="mt-1 text-sm text-textMuted">Update {g.toLowerCase()} settings.</p></section>)}</div></AppLayout> }
