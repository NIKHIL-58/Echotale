import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { authors } from "@/lib/mock-data";

type AuthorPageProps = {
  params: Promise<{
    authorId: string;
  }>;
};

export default async function Page({ params }: AuthorPageProps) {
  const { authorId } = await params;

  const author = authors.find((a) => a.id === authorId) || authors[0];

  return (
    <AppLayout>
      <section className="rounded-widget bg-white p-6 shadow-soft">
        <div className="flex items-center gap-5">
          <img
            src={author.avatar}
            alt={author.name}
            className="h-24 w-24 rounded-full object-cover"
          />

          <div>
            <h1 className="text-3xl font-bold">{author.name}</h1>
            <p className="mt-2 text-textMuted">
              Author and narrator of immersive audio stories.
            </p>
            <Button className="mt-4">Follow</Button>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-widget bg-white p-6 shadow-soft">
        <h2 className="text-xl font-bold">Top Stories</h2>
        <p className="mt-2 text-textMuted">
          Stories by this author will appear here soon.
        </p>
      </section>
    </AppLayout>
  );
}