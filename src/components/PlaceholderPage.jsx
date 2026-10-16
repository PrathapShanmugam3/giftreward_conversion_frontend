// Stand-in for pages not yet built in the current phase. Keeps the router
// fully wired end-to-end (Phase 0 goal) without faking real data.
export default function PlaceholderPage({ title }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      <p className="mt-2 text-sm text-gray-500">This page will be built in a later phase.</p>
    </div>
  );
}
