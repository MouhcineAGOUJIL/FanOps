import { useParams } from 'react-router-dom';
import { useStore } from '../../useStore/useStore';

export default function GateStatus() {
  const { gateId } = useParams();
  const { gates } = useStore();
  
  const gate = gates.find((g) => g.gateId === gateId);

  if (!gate) {
    return (
      <div className="text-white">
        <h1 className="text-3xl font-bold mb-4">Gate Not Found</h1>
        <p>Gate {gateId} does not exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">
        {gate.name || `Gate ${gate.gateId}`}
      </h1>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
        <div className="space-y-4">
          <div>
            <span className="text-white/70">Status:</span>
            <span className="ml-2 text-white font-semibold">{gate.status || 'Unknown'}</span>
          </div>
          {gate.queueLength !== undefined && (
            <div>
              <span className="text-white/70">Queue Length:</span>
              <span className="ml-2 text-white font-semibold">{gate.queueLength} people</span>
            </div>
          )}
          {gate.waitTime !== undefined && (
            <div>
              <span className="text-white/70">Estimated Wait Time:</span>
              <span className="ml-2 text-white font-semibold">{gate.waitTime} minutes</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

