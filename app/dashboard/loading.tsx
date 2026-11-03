export default function DashboardLoading() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse space-y-6 pb-20 pt-2">
      <div className="h-8 w-48 rounded-lg bg-surface-subtle" />
      <div className="h-4 w-72 rounded bg-surface-subtle" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-card bg-surface-subtle" />
        ))}
      </div>
      <div className="h-48 rounded-card bg-surface-subtle" />
      <div className="h-48 rounded-card bg-surface-subtle" />
    </div>
  );
}
