import { useState, useEffect } from 'react';
import { flowService } from '../../services/flowService';
import { Activity, Users, Clock, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMetrics();
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const data = await flowService.getGateStatus('AGADIR');

      // Calculate metrics from gate data
      const totalGates = data.gates.length;
      const totalQueueLength = data.gates.reduce((sum, gate) => sum + (gate.queueLength || 0), 0);
      const avgWait = data.gates.reduce((sum, gate) => sum + gate.wait, 0) / totalGates;
      const anomalyCount = data.gates.filter(gate => gate.anomaly).length;

      setMetrics({
        totalGates,
        activeVisitors: totalQueueLength,
        avgWait: avgWait.toFixed(1),
        anomalies: anomalyCount
      });

      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
      setError('Unable to load data');
      setLoading(false);
    }
  };

  if (loading && !metrics) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Operations Suite · Dashboard</h1>
        <div className="glass-card p-6 text-white/70">Loading metrics from M1...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Operations Suite · Dashboard</h1>
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Activity className="w-4 h-4 animate-pulse text-green-500" />
          Live from M1
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Gates */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Total Gates</p>
          </div>
          <p className="text-4xl font-bold text-white mt-2">
            {metrics?.totalGates || 0}
          </p>
          <p className="text-sm text-white/60 mt-2">Active monitoring</p>
        </div>

        {/* Active Visitors */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Queue Length</p>
          </div>
          <p className="text-4xl font-bold text-white mt-2">
            {metrics?.activeVisitors || 0}
          </p>
          <p className="text-sm text-white/60 mt-2">Total in queues</p>
        </div>

        {/* Average Wait */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Avg Wait</p>
          </div>
          <p className="text-4xl font-bold text-white mt-2">
            {metrics?.avgWait || '0'}
            <span className="text-lg text-white/70 ml-1">min</span>
          </p>
          <p className="text-sm text-white/60 mt-2">ML predicted</p>
        </div>

        {/* Anomalies */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 ${metrics?.anomalies > 0 ? 'bg-red-500/10' : 'bg-green-500/10'} rounded-lg`}>
              <AlertTriangle className={`w-5 h-5 ${metrics?.anomalies > 0 ? 'text-red-400' : 'text-green-400'}`} />
            </div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Anomalies</p>
          </div>
          <p className={`text-4xl font-bold mt-2 ${metrics?.anomalies > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {metrics?.anomalies || 0}
          </p>
          <p className="text-sm text-white/60 mt-2">
            {metrics?.anomalies > 0 ? 'RCA investigating' : 'All normal'}
          </p>
        </div>
      </div>
    </div>
  );
}
