import Link from "next/link";
import Image from "next/image";
import { Plus, ArrowUpRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { HeroBanner } from "@/components/dashboard/HeroBanner";
import { FeaturedStories } from "@/components/dashboard/FeaturedStories";
import { ContinueListening } from "@/components/dashboard/ContinueListening";
import { Categories } from "@/components/dashboard/Categories";
export default function DashboardPage() {
 return <AppLayout><div className="space-y-8">
  <PageHeader eyebrow="Your daily escape" title="A good day for a great story." description="Discover something new, or return to a world you love." actions={<Link href="/stories/upload" className="action-secondary"><Plus size={17}/>Upload story</Link>}/>
  <HeroBanner />
  <ContinueListening />
  <Categories />
  <FeaturedStories />
  <section className="grid overflow-hidden rounded-2xl border border-[#ece2d5] bg-[#faf3e8] sm:grid-cols-[1fr_240px]"><div className="p-6 sm:p-8"><p className="eyebrow !text-[#836446]">Make it yours</p><h2 className="section-title mt-2">Your own corner of the story world.</h2><p className="mt-2 text-sm text-textMuted">Keep your favorites close and build a library that feels like you.</p><Link href="/library" className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary">Visit my library<ArrowUpRight size={17}/></Link></div><div className="relative hidden sm:block"><Image src="/images/reading-corner.png" alt="Headphones and books beside a comfortable reading chair." fill sizes="240px" className="object-cover"/></div></section>
 </div></AppLayout>;
}
