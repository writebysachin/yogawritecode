export default function ProjectLoading() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse space-y-6 pb-20 pt-2">
      <div className="h-8 w-56 rounded-lg bg-surface-subtle" />
      <div className="mt-4 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-7 w-24 rounded-full bg-surface-subtle" />
        ))}
      </div>
      <div className="h-40 rounded-card bg-surface-subtle" />
      <div className="h-64 rounded-card bg-surface-subtle" />
      <div className="h-48 rounded-card bg-surface-subtle" />
    </div>
  );
}
