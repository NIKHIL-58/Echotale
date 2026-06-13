import Link from "next/link";

export function RightPanel() {
  return (
    <aside className="hidden w-80 shrink-0 space-y-6 xl:block">
      <section className="rounded-widget bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Your Progress</h3>
          <span className="text-xs text-textMuted">This Week</span>
        </div>

        <div className="mt-8 flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-primary text-white">
            |||
          </div>

          <div>
            <p className="text-xl font-bold">0h 0m</p>
            <p className="text-sm text-textMuted">Time listened</p>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <p>
            <b>0</b>
            <br />
            <span className="text-xs text-textMuted">Stories Completed</span>
          </p>

          <p>
            <b>0</b>
            <br />
            <span className="text-xs text-textMuted">Chapters Finished</span>
          </p>
        </div>

        <div className="mt-6 h-20 rounded-xl bg-gradient-to-t from-soft to-white" />
      </section>

      <section className="rounded-widget bg-white p-5 shadow-soft">
        <div className="mb-4 flex justify-between">
          <h3 className="font-bold">Recommended For You</h3>
          <Link className="text-sm text-primary" href="/explore">
            View all
          </Link>
        </div>

        <p className="text-sm text-textMuted">
          Recommendations will appear here after you upload and listen to
          stories.
        </p>
      </section>

      <section className="rounded-widget bg-white p-5 shadow-soft">
        <div className="mb-4 flex justify-between">
          <h3 className="font-bold">Popular Authors</h3>
          <Link className="text-sm text-primary" href="/explore">
            View all
          </Link>
        </div>

        <p className="text-sm text-textMuted">
          Popular authors will appear here soon.
        </p>
      </section>
    </aside>
  );
}