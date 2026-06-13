import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { RightPanel } from './RightPanel';
import { BottomPlayer } from './BottomPlayer';
import { MobileBottomNav } from './MobileBottomNav';
export function AppLayout({ children, rightPanel = true }: { children: React.ReactNode; rightPanel?: boolean }){ return <div><Sidebar/><main className="min-h-screen px-5 pb-28 pt-5 lg:ml-60 lg:px-8"><Topbar/><div className="flex gap-6"><section className="min-w-0 flex-1">{children}</section>{rightPanel && <RightPanel/>}</div></main><BottomPlayer/><MobileBottomNav/></div> }
