import { ListMusic } from "lucide-react";

export function QueueDrawer() {
  return (
    <aside className="rounded-widget bg-white p-5 shadow-soft">
      <h3 className="font-bold">Queue</h3>

      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-bg p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white">
          <ListMusic size={22} className="text-textMuted" />
        </div>

        <div>
          <p className="text-sm font-bold">No queue yet</p>
          <p className="text-xs text-textMuted">
            Audio parts will appear here when you play a story.
          </p>
        </div>
      </div>
    </aside>
  );
}