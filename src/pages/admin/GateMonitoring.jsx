import { useStore } from '../../useStore/useStore';

export default function GateMonitoring() {
  const { operationsData } = useStore();
  const gates = operationsData?.gateMonitoring ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Gate Monitoring</h1>

      {gates.length === 0 ? (
        <div className="glass-card p-6 text-white/70">No gate telemetry loaded.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {gates.map((gate) => (
            <div key={gate.gateId} className="glass-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/60">Gate</p>
                  <h3 className="text-2xl font-semibold text-white">{gate.name}</h3>
                  <p className="text-white/60">#{gate.gateId}</p>
                </div>
                <span
                  className="pill"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                  }}
                >
                  {gate.status?.toUpperCase()}
                </span>
              </div>
              <div className="mt-4 space-y-2 text-white/80">
                <p>
                  Queue Length: <span className="font-semibold text-white">{gate.queueLength}</span>
                </p>
                <p>
                  Wait Time:{' '}
                  <span className="font-semibold text-white">
                    {gate.waitTime}
                    {gate.waitTime !== undefined ? ' min' : ''}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

