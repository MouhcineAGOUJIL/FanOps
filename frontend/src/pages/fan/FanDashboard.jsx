import { useRealtimeGates } from '../../hooks/useRealtimeGates';
import { useStore } from '../../useStore/useStore';
import { GateCard } from '../../components/fan/GateCard';

const fallbackMetrics = [
  { label: 'Active Gates', value: '24', detail: 'Across 3 stadiums' },
  { label: 'Avg Wait', value: '08 min', detail: 'Live rolling avg' },
  { label: 'Fan Flow', value: '32.4K', detail: 'Visitors in last hour' },
];

export default function FanDashboard() {
  const { gates, stadiumId, fanMetrics, promotions, activePromo } = useStore();
  useRealtimeGates(stadiumId);

  const metricsToRender = fanMetrics?.length ? fanMetrics : fallbackMetrics;
  const promoList = promotions?.length ? promotions : activePromo ? [activePromo] : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <section
        style={{
          borderRadius: '32px',
          padding: '40px',
          background:
            'linear-gradient(135deg, rgba(177, 16, 12, 0.95), rgba(85, 3, 2, 0.9))',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 45px 80px rgba(0,0,0,0.45)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '26px',
          alignItems: 'center',
        }}
      >
        <div>
          <p
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.45em',
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.65)',
            }}
          >
            Live Ops
          </p>
          <h1 style={{ fontSize: '2.8rem', margin: '8px 0', fontWeight: 700, lineHeight: 1.1 }}>
            Stadium access intelligence dashboard
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '20px' }}>
            Monitor gate pressure, deploy volunteers, and inspire fans with real-time CAF Morocco
            2025 data.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <span
              className="pill"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              Stadium · {stadiumId}
            </span>
            <span
              className="pill"
              style={{ background: 'rgba(21, 166, 87, 0.2)', border: '1px solid rgba(21,166,87,0.5)' }}
            >
              Fan Pulse Live
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {metricsToRender.map((metric) => (
            <div key={metric.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', letterSpacing: '0.2em', opacity: 0.65 }}>
                  {metric.label}
                </p>
                <h3 style={{ margin: '4px 0 0', fontSize: '2rem' }}>
                  {metric.value}
                  {metric.unit ? ` ${metric.unit}` : ''}
                </h3>
              </div>
              <p style={{ margin: 0, alignSelf: 'flex-end', opacity: 0.7 }}>
                {metric.detail ?? metric.delta ?? ''}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.6rem' }}>Gate performance</h2>
          <span style={{ fontSize: '0.85rem', opacity: 0.65 }}>Tap a gate to drill down</span>
        </div>

        {gates.length === 0 ? (
          <div
            style={{
              padding: '30px',
              borderRadius: '24px',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)' }}>Loading gate telemetry…</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '18px',
            }}
          >
            {gates.map((gate) => (
              <GateCard key={gate.gateId} gate={gate} />
            ))}
          </div>
        )}
      </section>

      {promoList.length > 0 && (
        <section style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {promoList.map((promo) => (
            <div
              key={promo.title}
              style={{
                padding: '24px',
                borderRadius: '24px',
                background: 'linear-gradient(120deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02))',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div>
                <p style={{ letterSpacing: '0.35em', fontSize: '0.75rem', opacity: 0.65 }}>Spotlight</p>
                <h3 style={{ margin: '6px 0 0', fontSize: '1.4rem' }}>{promo.title}</h3>
              </div>
              <p style={{ opacity: 0.75 }}>{promo.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>
                  {promo.sponsor ? `Sponsor · ${promo.sponsor}` : ''}
                </span>
                <button
                  style={{
                    borderRadius: '999px',
                    border: '1px solid rgba(255,255,255,0.3)',
                    padding: '0.65rem 1.4rem',
                    background: 'transparent',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Activate
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}