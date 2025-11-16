import { useRealtimeGates } from '../../hooks/useRealtimeGates';
import { useStore } from '../../useStore/useStore';
import { GateCard } from '../../components/fan/GateCard';

export default function FanDashboard() {
  const { gates, stadiumId, activePromo } = useStore();
  
  // Hook qui met à jour automatiquement les gates
  useRealtimeGates(stadiumId);

  return (
    <div 
      className="space-y-6"
      style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
    >
      <h1 
        className="text-3xl font-bold text-white"
        style={{ fontSize: '30px', fontWeight: 'bold', color: 'white', margin: 0 }}
      >
        Fan Dashboard
      </h1>
      
      {gates.length === 0 ? (
        <div 
          className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '24px'
          }}
        >
          <p 
            className="text-white/70"
            style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}
          >
            No gates available. Loading...
          </p>
        </div>
      ) : (
        <div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px' 
          }}
        >
          {gates.map((gate) => (
            <GateCard key={gate.gateId} gate={gate} />
          ))}
        </div>
      )}

      {activePromo && (
        <div 
          className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '16px'
          }}
        >
          <h2 
            className="text-xl font-semibold text-white mb-2"
            style={{ fontSize: '20px', fontWeight: '600', color: 'white', margin: '0 0 8px 0' }}
          >
            Active Promotion
          </h2>
          <p 
            className="text-white/70"
            style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}
          >
            {activePromo.title || 'Special Offer'}
          </p>
        </div>
      )}
    </div>
  );
}