import Link from "next/link";
import Image from "next/image";
import { RefreshCw, WifiOff } from "lucide-react";
import { EchoTaleLogo } from "@/components/brand/EchoTaleLogo";
export default function OfflinePage() {
 return <main className="flex min-h-screen items-center justify-center p-5"><section className="surface grid w-full max-w-3xl overflow-hidden sm:grid-cols-2"><div className="relative min-h-52"><Image src="/images/reading-corner.png" alt="A quiet reading corner with books and headphones." fill sizes="(max-width:640px) 100vw, 384px" className="object-cover"/></div><div className="p-7 sm:p-9"><EchoTaleLogo/><div className="mt-8 flex items-center gap-2 text-sm text-textMuted"><WifiOff size={17}/>Connection lost</div><h1 className="page-title mt-3">Take a quiet moment.</h1><p className="page-subtitle">You are offline. Previously cached pages may still be available. Reconnect to discover new stories or update your account.</p><a href="/" className="action-primary mt-6"><RefreshCw size={16}/>Try reconnecting</a><Link href="/library" className="mt-3 block py-2 text-sm font-semibold text-primary">Go to my library</Link></div></section></main>;
}

