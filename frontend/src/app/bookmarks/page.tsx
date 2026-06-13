import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs } from "@/components/ui/Tabs";

export default function Page() {
  return (
    <AppLayout>
      <h1 className="text-3xl font-bold">Bookmarks</h1>

      <div className="mt-5">
        <Tabs tabs={["Stories", "Moments", "Notes"]} />
      </div>

      <section className="mt-6 rounded-widget bg-white p-6 shadow-soft">
        <h2 className="text-xl font-bold">Saved stories</h2>
        <p className="mt-2 text-textMuted">
          Your bookmarked stories will appear here soon.
        </p>
      </section>
    </AppLayout>
  );
}