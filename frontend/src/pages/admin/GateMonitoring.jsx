import { useState, useEffect } from 'react';
import { flowService } from '../../services/flowService';
import { Activity, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import InvestigationModal from '../../components/admin/InvestigationModal';

export default function GateMonitoring() {
  const [gates, setGates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvestigation, setSelectedInvestigation] = useState(null);

  useEffect(() => {
    fetchGates();
    // Real-time updates every 3 seconds
    const unsubscribe = flowService.subscribeToGateUpdates('AGADIR', (data) => {
      setGates(data.gates);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchGates = async () => {
    try {
      const data = await flowService.getGateStatus('AGADIR');
      setGates(data.gates);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch gates:', err);
      setError('Unable to load gate data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Gate Monitoring</h1>
        <div className="glass-card p-6 text-white/70">Loading live gate data from M1...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Gate Monitoring</h1>
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Activity className="w-4 h-4 animate-pulse text-green-500" />
          Real-time updates (3s)
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg">
          {error}
        </div>
      )}

      {gates.length === 0 ? (
        <div className="glass-card p-6 text-white/70">
          No gate telemetry loaded. Send data via M1 /flow/ingest endpoint.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {gates.map((gate) => (
            <div
              key={gate.gateId}
              className={`glass-card p-5 ${gate.anomaly ? 'border-2 border-red-500/30' : ''}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/60">Gate</p>
                  <h3 className="text-2xl font-semibold text-white">{gate.gateId}</h3>
                </div>

                {/* Traffic Light Status */}
                <div className="flex items-center gap-2">
                  {gate.state === 'green' && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-xs font-semibold text-green-400 uppercase">Green</span>
                    </div>
                  )}
                  {gate.state === 'yellow' && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                      <span className="text-xs font-semibold text-yellow-400 uppercase">Yellow</span>
                    </div>
                  )}
                  {gate.state === 'red' && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                      <span className="text-xs font-semibold text-red-400 uppercase">Red</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ML Prediction */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Wait Time (ML)</span>
                  <span className="text-lg font-bold text-white">
                    {gate.wait?.toFixed(1)} min
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Queue Length</span>
                  <span className="text-lg font-semibold text-white">
                    {gate.queueLength || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Anomaly Detection */}
              {gate.anomaly ? (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-semibold text-red-400">Anomaly Detected</span>
                  </div>
                  <p className="text-xs text-white/60">Score: {gate.anomalyScore?.toFixed(2)}</p>
                  {gate.root_cause && (
                    <p className="text-sm text-white mt-2">
                      <span className="font-semibold">RCA:</span> {gate.root_cause}
                    </p>
                  )}
                  {gate.investigation_id && (
                    <button
                      onClick={() => setSelectedInvestigation(gate.investigation_id)}
                      className="mt-2 text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                    >
                      View Investigation Details →
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-2 text-sm text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  Normal operation
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Investigation Modal */}
      {selectedInvestigation && (
        <InvestigationModal
          investigationId={selectedInvestigation}
          onClose={() => setSelectedInvestigation(null)}
        />
      )}
    </div>
  );
}
