"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  getNotifications,
  markNotificationRead,
  type Notification,
} from "@/services/appService";
import { getToken } from "@/lib/auth";

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [error, setError] = useState("");

  function load(unread = unreadOnly) {
    if (!getToken()) {
      setError("Please sign in to view notifications.");
      return;
    }
    getNotifications(unread).then(setItems).catch(() => setError("Unable to load notifications."));
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(item: Notification) {
    if (item.is_read) return;
    const updated = await markNotificationRead(item.id);
    setItems((current) => current.map((entry) => entry.id === item.id ? updated : entry));
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <button
          type="button"
          onClick={() => {
            const next = !unreadOnly;
            setUnreadOnly(next);
            load(next);
          }}
          className="rounded-full bg-soft px-5 py-2 font-semibold text-primary"
        >
          {unreadOnly ? "Show all" : "Unread only"}
        </button>
      </div>
      {error && <p className="mt-6 rounded-card bg-red-50 p-4 text-red-600">{error}</p>}
      {!error && items.length === 0 && (
        <p className="mt-6 rounded-card bg-white p-6 text-textMuted shadow-soft">No notifications.</p>
      )}
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => markRead(item)}
            className="block w-full rounded-card bg-white p-5 text-left shadow-soft"
          >
            <div className="flex items-center gap-3">
              {!item.is_read && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
              <b>{item.title}</b>
            </div>
            <p className="mt-2 text-sm text-textMuted">{item.message}</p>
          </button>
        ))}
      </div>
    </AppLayout>
  );
}
