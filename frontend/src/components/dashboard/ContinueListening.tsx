export function ContinueListening() {
  return (
    <section className="mt-6">
      <div className="mb-4 flex justify-between">
        <h2 className="text-lg font-bold">Continue Listening</h2>
        <a className="text-sm text-primary" href="/history">
          View all
        </a>
      </div>

      <div className="rounded-widget bg-white p-5 shadow-soft">
        <p className="font-semibold">No listening progress yet</p>
        <p className="mt-1 text-sm text-textMuted">
          Start playing a story and it will appear here.
        </p>
      </div>
    </section>
  );
}