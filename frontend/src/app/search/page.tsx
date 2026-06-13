import { AppLayout } from "@/components/layout/AppLayout";
import { SearchInput } from "@/components/ui/SearchInput";
import { Tabs } from "@/components/ui/Tabs";

export default function Page() {
  return (
    <AppLayout>
      <h1 className="text-3xl font-bold">Search Results</h1>

      <div className="mt-5 rounded-widget bg-white p-5 shadow-soft">
        <SearchInput />

        <div className="mt-4">
          <Tabs tabs={["Stories", "Authors", "Podcasts", "Audiobooks"]} />
        </div>
      </div>

      <section className="mt-6 rounded-widget bg-white p-6 shadow-soft">
        <h2 className="text-xl font-bold">No search results yet</h2>
        <p className="mt-2 text-textMuted">
          Search results from your uploaded stories will appear here soon.
        </p>
      </section>
    </AppLayout>
  );
}