export function PopularAuthors() {
  return (
    <section className="rounded-widget bg-white p-5 shadow-soft">
      <h3 className="font-bold">Popular Authors</h3>

      <div className="mt-5 rounded-2xl bg-bg p-4">
        <p className="text-sm font-semibold">No authors yet</p>
        <p className="mt-1 text-xs text-textMuted">
          Authors will appear here when stories are uploaded.
        </p>
      </div>
    </section>
  );
}