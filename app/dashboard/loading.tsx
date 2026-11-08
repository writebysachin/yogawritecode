export default function DashboardLoading() {
  return (
    <div className="min-w-0">
      {/* Header */}
      <div className="animate-pulse flex flex-wrap items-end justify-between gap-4 pb-2">
        <div className="space-y-2">
          <div className="h-7 w-40 rounded-lg bg-surface-subtle" />
          <div className="h-4 w-64 rounded bg-surface-subtle" />
        </div>
        <div className="h-10 w-28 rounded-field bg-surface-subtle" />
      </div>

      {/* KPI cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-card border border-line bg-surface px-5 py-4 space-y-2">
            <div className="h-3 w-24 rounded bg-surface-subtle" />
            <div className="h-8 w-16 rounded bg-surface-subtle" />
            <div className="h-3 w-32 rounded bg-surface-subtle" />
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] animate-pulse">
        {/* Opportunities table */}
        <div className="rounded-card border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div className="h-4 w-40 rounded bg-surface-subtle" />
            <div className="h-3 w-14 rounded bg-surface-subtle" />
          </div>
          <div className="divide-y divide-line">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-3/4 rounded bg-surface-subtle" />
                  <div className="h-3 w-1/3 rounded bg-surface-subtle" />
                </div>
                <div className="h-5 w-14 rounded-full bg-surface-subtle" />
                <div className="h-5 w-12 rounded-full bg-surface-subtle" />
              </div>
            ))}
          </div>
        </div>

        {/* Next actions sidebar */}
        <div className="rounded-card border border-line bg-surface p-5 space-y-3">
          <div className="h-4 w-32 rounded bg-surface-subtle" />
          <div className="mt-2 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-control border border-line px-4 py-3 space-y-1.5">
                <div className="h-3.5 w-3/4 rounded bg-surface-subtle" />
                <div className="h-3 w-1/2 rounded bg-surface-subtle" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
