import { useStore } from '../../useStore/useStore';

export default function SponsorAnalytics() {
  const { operationsData } = useStore();
  const sponsors = operationsData?.sponsors?.topPartners ?? [];
  const inventory = operationsData?.sponsors?.inventory;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Sponsor Analytics</h1>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h2 className="text-white text-xl font-semibold mb-4">Top Partners</h2>
          {sponsors.length === 0 ? (
            <p className="text-white/70">No partner data.</p>
          ) : (
            <div className="space-y-4">
              {sponsors.map((partner) => (
                <div key={partner.name} className="rounded-2xl border border-white/10 p-4 text-white/80">
                  <h3 className="text-lg font-semibold text-white">{partner.name}</h3>
                  <p className="text-sm uppercase tracking-[0.3em] text-white/60">{partner.category}</p>
                  <p className="mt-2 text-white/70">{partner.activation}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="text-white text-xl font-semibold mb-4">Inventory Snapshot</h2>
          {inventory ? (
            <div className="space-y-4 text-white">
              {Object.entries(inventory).map(([key, value]) => (
                <div key={key} className="rounded-2xl border border-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.4em] text-white/60">{key}</p>
                  <p className="text-2xl font-bold mt-2">
                    {value.sold ?? value.booked ?? 0}/{value.packages ?? value.spots ?? 0}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/70">No inventory data.</p>
          )}
        </div>
      </div>
    </div>
  );
}

