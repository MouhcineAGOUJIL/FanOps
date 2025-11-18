import { useParams } from 'react-router-dom';
import { useStore } from '../../useStore/useStore';

export default function GateStatus() {
  const { gateId } = useParams();
  const { gates } = useStore();
  
  const gate = gates.find((g) => g.gateId === gateId);

  if (!gate) {
    return (
      <div>
        <h1 style={{ fontSize: '2.4rem', marginBottom: '12px' }}>Gate Not Found</h1>
        <p>Gate {gateId} does not exist.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <p style={{ textTransform: 'uppercase', letterSpacing: '0.4em', opacity: 0.6 }}>
          Live Detail
        </p>
        <h1 style={{ fontSize: '2.6rem', margin: '6px 0 0' }}>
          {gate.name || `Gate ${gate.gateId}`}
        </h1>
      </div>

      <div
        style={{
          padding: '32px',
          borderRadius: '28px',
          background: 'linear-gradient(150deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'grid',
          gap: '18px',
        }}
      >
        <Stat label="Status" value={gate.status || 'Unknown'} />
        <Stat
          label="Queue Length"
          value={
            gate.queueLength !== undefined ? `${gate.queueLength} supporters` : 'Tracking...'
          }
        />
        <Stat
          label="Estimated Wait"
          value={gate.waitTime !== undefined ? `${gate.waitTime} min` : 'Live monitoring'}
        />
      </div>
    </div>
  );
}

const Stat = ({ label, value }) => (
  <div>
    <p style={{ margin: 0, opacity: 0.6, letterSpacing: '0.3em', fontSize: '0.75rem' }}>{label}</p>
    <p style={{ margin: '4px 0 0', fontSize: '1.5rem', fontWeight: 600 }}>{value}</p>
  </div>
);

