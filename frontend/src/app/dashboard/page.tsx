import { AppLayout } from "@/components/layout/AppLayout";
import { HeroBanner } from "@/components/dashboard/HeroBanner";
import { FeaturedStories } from "@/components/dashboard/FeaturedStories";
import { ContinueListening } from "@/components/dashboard/ContinueListening";
import { Categories } from "@/components/dashboard/Categories";

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-10">
        <HeroBanner />
        <FeaturedStories />
        <ContinueListening />
        <Categories />
      </div>
    </AppLayout>
  );
}