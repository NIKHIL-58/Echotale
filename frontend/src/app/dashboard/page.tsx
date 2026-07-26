import { AppLayout } from "@/components/layout/AppLayout";
import { HeroBanner } from "@/components/dashboard/HeroBanner";
import { FeaturedStories } from "@/components/dashboard/FeaturedStories";
import { ContinueListening } from "@/components/dashboard/ContinueListening";
import { Categories } from "@/components/dashboard/Categories";

export default function DashboardPage() {
  return (
    <AppLayout rightPanel={false}>
      <div className="space-y-8 pb-8">
        <HeroBanner />
        <Categories />
        <ContinueListening />
        <FeaturedStories />
      </div>
    </AppLayout>
  );
}
