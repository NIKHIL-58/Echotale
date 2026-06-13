import { AppLayout } from "@/components/layout/AppLayout";

export default function Page() {
  return (
    <AppLayout>
      <h1 className="text-3xl font-bold">History</h1>

      <section className="mt-6 rounded-widget bg-white p-6 shadow-soft">
        <h2 className="text-xl font-bold">Listening history</h2>
        <p className="mt-2 text-textMuted">
          Your recently played stories will appear here soon.
        </p>
      </section>
    </AppLayout>
  );
}