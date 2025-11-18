import { useStore } from '../../useStore/useStore';

export default function Promotions() {
  const { promotions } = useStore();
  const list = promotions ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <p
          style={{
            textTransform: 'uppercase',
            letterSpacing: '0.4em',
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          Fan Experience
        </p>
        <h1 style={{ fontSize: '2.4rem', margin: '6px 0 0', fontWeight: 700 }}>Promotions</h1>
      </div>

      {list.length === 0 ? (
        <div
          style={{
            padding: '32px',
            borderRadius: '24px',
            background: 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <p style={{ color: 'rgba(255,255,255,0.75)', margin: 0 }}>
            No active promotions at the moment. Check back soon for exclusive CAF Morocco 2025
            experiences.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((promo) => (
            <div key={promo.title} className="glass-card p-6">
              <h3 className="text-2xl font-semibold text-white">{promo.title}</h3>
              <p className="text-white/70 mt-2">{promo.description}</p>
              <div className="text-sm text-white/60 mt-4 flex justify-between items-center">
                <span>{promo.sponsor ? `Sponsor · ${promo.sponsor}` : ''}</span>
                <span>
                  Valid until{' '}
                  {promo.validUntil ? new Date(promo.validUntil).toLocaleString() : 'TBC'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

