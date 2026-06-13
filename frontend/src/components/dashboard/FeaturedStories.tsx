export function FeaturedStories() {
  return (
    <section className="mt-6">
      <div className="mb-4 flex justify-between">
        <h2 className="text-lg font-bold">Featured Stories</h2>
        <a className="text-sm text-primary" href="/explore">
          View all
        </a>
      </div>

      <div className="rounded-widget bg-white p-5 shadow-soft">
        <p className="font-semibold">No featured stories yet</p>
        <p className="mt-1 text-sm text-textMuted">
          Uploaded stories will appear here after deployment.
        </p>
      </div>
    </section>
  );
}