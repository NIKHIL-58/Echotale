import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";

type CategoryPageProps = {
  params: Promise<{
    category: string;
  }>;
};

export default async function Page({ params }: CategoryPageProps) {
  const { category } = await params;
  const readableCategory = decodeURIComponent(category);

  return (
    <AppLayout>
      <h1 className="text-3xl font-bold capitalize">{readableCategory}</h1>

      <section className="mt-6 rounded-widget bg-white p-6 shadow-soft">
        <h2 className="text-xl font-bold">Category stories</h2>
        <p className="mt-2 text-textMuted">
          Stories for this category will appear here soon.
        </p>

        <Link
          href="/explore"
          className="mt-4 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white"
        >
          Back to Explore
        </Link>
      </section>
    </AppLayout>
  );
}