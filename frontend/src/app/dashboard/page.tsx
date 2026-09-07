import { AppLayout } from "@/components/layout/AppLayout";
import { HeroBanner } from "@/components/dashboard/HeroBanner";
import { FeaturedStories } from "@/components/dashboard/FeaturedStories";
import { ContinueListening } from "@/components/dashboard/ContinueListening";
import { Categories } from "@/components/dashboard/Categories";
import { Headphones, Library, Sparkles } from "lucide-react";

export default function DashboardPage() {
  return (
    <AppLayout rightPanel={false}>
      <div className="space-y-9 pb-8">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-primary"><Sparkles size={14} /> Your listening space</div>
            <h1 className="text-3xl font-black tracking-[-.045em] text-textMain sm:text-[38px]">Stories worth your time.</h1>
            <p className="mt-2 text-sm text-textMuted">Discover something new or return to a story you already love.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-2 text-xs font-bold text-textMuted shadow-sm backdrop-blur"><Headphones size={15} className="text-primary" /> Immersive audio</span>
            <span className="hidden items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-2 text-xs font-bold text-textMuted shadow-sm backdrop-blur sm:inline-flex"><Library size={15} className="text-primary" /> Personal library</span>
          </div>
        </section>
        <HeroBanner />
        <Categories />
        <ContinueListening />
        <FeaturedStories />
      </div>
    </AppLayout>
  );
}