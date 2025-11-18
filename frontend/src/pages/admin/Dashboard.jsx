import { useStore } from '../../useStore/useStore';

const fallbackMetrics = [
  { label: 'Total Gates', value: 0, detail: 'Awaiting data' },
  { label: 'Active Visitors', value: 0, detail: 'Awaiting data' },
  { label: 'Queue Length', value: 0, detail: 'Awaiting data' },
  { label: 'Avg Wait', value: 0, detail: 'Awaiting data' },
];

export default function AdminDashboard() {
  const { operationsData } = useStore();
  const metrics = operationsData?.dashboard?.metrics ?? fallbackMetrics;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Operations Suite · Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="glass-card p-6"
          >
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">{metric.label}</p>
            <p className="text-4xl font-bold text-white mt-2">
              {metric.value}
              {metric.unit ? <span className="text-lg text-white/70 ml-1">{metric.unit}</span> : null}
            </p>
            <p className="text-sm text-white/60 mt-2">{metric.detail ?? metric.trend}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

