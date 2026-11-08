export default function ProjectLoading() {
  return (
    <div className="max-w-4xl mx-auto pb-20 pt-2">
      {/* Page header skeleton */}
      <div className="animate-pulse space-y-2 border-b border-line pb-6">
        <div className="h-7 w-48 rounded-lg bg-surface-subtle" />
        <div className="h-4 w-64 rounded bg-surface-subtle" />
      </div>

      {/* Step pills skeleton */}
      <div className="mt-6 flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse h-8 w-28 rounded-full bg-surface-subtle" />
        ))}
      </div>

      {/* Section card skeleton 1 — analysis */}
      <div className="animate-pulse mt-10 rounded-card border border-line bg-surface p-6 sm:p-8 space-y-4">
        <div className="h-3 w-20 rounded bg-surface-subtle" />
        <div className="h-6 w-44 rounded-lg bg-surface-subtle" />
        <div className="mt-4 space-y-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border-b border-line pb-4 space-y-2">
              <div className="h-3 w-32 rounded bg-surface-subtle" />
              <div className="h-4 w-full rounded bg-surface-subtle" />
              <div className="h-4 w-3/4 rounded bg-surface-subtle" />
            </div>
          ))}
        </div>
      </div>

      {/* Section card skeleton 2 — opportunities */}
      <div className="animate-pulse mt-10 rounded-card border border-line bg-surface p-6 sm:p-8 space-y-4">
        <div className="h-3 w-24 rounded bg-surface-subtle" />
        <div className="h-6 w-52 rounded-lg bg-surface-subtle" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-line bg-surface-subtle p-4 space-y-2">
              <div className="h-4 w-3/4 rounded bg-surface" />
              <div className="h-3 w-full rounded bg-surface" />
              <div className="flex gap-2 mt-2">
                <div className="h-5 w-16 rounded-full bg-surface" />
                <div className="h-5 w-16 rounded-full bg-surface" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
