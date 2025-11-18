import { Link } from 'react-router-dom';

export const GateCard = ({ gate }) => {
  const statusTokens = {
    open: { color: '#15a657', label: 'Open' },
    busy: { color: '#fbbf24', label: 'Busy' },
    closed: { color: '#f87171', label: 'Closed' },
  };

  const status = statusTokens[gate.status?.toLowerCase()] || {
    color: 'rgba(255,255,255,0.4)',
    label: gate.status || 'Unknown',
  };

  return (
    <Link
      to={`/fan/gates/${gate.gateId}`}
      className="animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '24px',
        borderRadius: '20px',
        textDecoration: 'none',
        background: 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 18px 45px rgba(0,0,0,0.45)',
        color: '#fff',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ opacity: 0.6, marginBottom: '4px', fontSize: '0.85rem', letterSpacing: '0.2em' }}>
            Gate
          </p>
          <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>
            {gate.name || `Gate ${gate.gateId}`}
          </h3>
        </div>
        <span
          className="pill"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: `1px solid ${status.color}`,
            color: status.color,
            padding: '0.35rem 1.4rem',
            fontSize: '0.75rem',
          }}
        >
          {status.label}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '18px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
        <span>
          Queue:{' '}
          <strong style={{ color: '#fff' }}>
            {gate.queueLength !== undefined ? `${gate.queueLength} ppl` : '—'}
          </strong>
        </span>
        <span>
          Wait:{' '}
          <strong style={{ color: '#fff' }}>
            {gate.waitTime !== undefined ? `${gate.waitTime} min` : 'Live'}
          </strong>
        </span>
      </div>
    </Link>
  );
};

