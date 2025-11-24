import { useState, useEffect } from 'react';
import { flowService } from '../../services/flowService';
import { securityService } from '../../services/securityService';
import { Activity, Users, Clock, AlertTriangle, Shield, CheckCircle, XCircle, Lock, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [m2Metrics, setM2Metrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMetrics();
    fetchM2Metrics();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchMetrics();
      fetchM2Metrics();
    }, 30000);
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
      console.error('Failed to fetch M1 metrics:', err);
      setError('Unable to load M1 data');
      setLoading(false);
    }
  };

  const fetchM2Metrics = async () => {
    try {
      const data = await securityService.getSecurityMetrics();

      // Calculate success rates
      const ticketSuccessRate = data.statistics.ticketScans > 0
        ? ((data.valid / data.statistics.ticketScans) * 100).toFixed(1)
        : 0;

      const loginSuccessRate = data.statistics.loginAttempts > 0
        ? ((data.statistics.successfulLogins / data.statistics.loginAttempts) * 100).toFixed(1)
        : 0;

      setM2Metrics({
        ticketScans: data.statistics.ticketScans || 0,
        validScans: data.valid || 0,
        invalidScans: data.invalid || 0,
        replayAttempts: data.replay || 0,
        loginAttempts: data.statistics.loginAttempts || 0,
        successfulLogins: data.statistics.successfulLogins || 0,
        failedLogins: data.statistics.failedLogins || 0,
        ticketSuccessRate,
        loginSuccessRate,
        activeGates: data.activeGates || 0
      });
    } catch (err) {
      console.error('Failed to fetch M2 metrics:', err);
      // Don't set error to avoid breaking the dashboard if M2 is down
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

      {/* M2 Security Summary */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-400" />
            M2 Security Summary
          </h2>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Activity className="w-4 h-4 animate-pulse text-blue-500" />
            Live from AWS
          </div>
        </div>

        {m2Metrics ? (
          <>
            {/* Ticket Scanning Metrics */}
            <div>
              <h3 className="text-sm font-medium text-white/70 mb-3">Ticket Scanning (Last 24h)</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Scans */}
                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Activity className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-xs uppercase tracking-[0.4em] text-white/60">Total Scans</p>
                  </div>
                  <p className="text-4xl font-bold text-white mt-2">
                    {m2Metrics.ticketScans}
                  </p>
                  <p className="text-sm text-white/60 mt-2">Verification attempts</p>
                </div>

                {/* Valid Scans */}
                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-xs uppercase tracking-[0.4em] text-white/60">Valid</p>
                  </div>
                  <p className="text-4xl font-bold text-green-400 mt-2">
                    {m2Metrics.validScans}
                  </p>
                  <p className="text-sm text-white/60 mt-2">Successful entries</p>
                </div>

                {/* Invalid Scans */}
                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <XCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <p className="text-xs uppercase tracking-[0.4em] text-white/60">Invalid</p>
                  </div>
                  <p className="text-4xl font-bold text-red-400 mt-2">
                    {m2Metrics.invalidScans}
                  </p>
                  <p className="text-sm text-white/60 mt-2">Rejected tickets</p>
                </div>

                {/* Replay Attacks */}
                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <Lock className="w-5 h-5 text-orange-400" />
                    </div>
                    <p className="text-xs uppercase tracking-[0.4em] text-white/60">Replay</p>
                  </div>
                  <p className="text-4xl font-bold text-orange-400 mt-2">
                    {m2Metrics.replayAttempts}
                  </p>
                  <p className="text-sm text-white/60 mt-2">Security threats</p>
                </div>
              </div>
            </div>

            {/* Success Rates & Login Metrics */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Ticket Success Rate */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/60">Ticket Success</p>
                </div>
                <p className="text-4xl font-bold text-green-400">
                  {m2Metrics.ticketSuccessRate}%
                </p>
                <div className="mt-4 bg-white/5 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-green-400 h-full rounded-full transition-all"
                    style={{ width: `${m2Metrics.ticketSuccessRate}%` }}
                  />
                </div>
              </div>

              {/* Login Success Rate */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/60">Login Success</p>
                </div>
                <p className="text-4xl font-bold text-purple-400">
                  {m2Metrics.loginSuccessRate}%
                </p>
                <p className="text-sm text-white/60 mt-2">
                  {m2Metrics.successfulLogins}/{m2Metrics.loginAttempts} successful
                </p>
              </div>

              {/* System Health */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Shield className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/60">System Health</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">AWS Lambda</span>
                    <span className="flex items-center gap-2 text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">DynamoDB</span>
                    <span className="flex items-center gap-2 text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      Healthy
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">Active Gates</span>
                    <span className="text-white font-bold">{m2Metrics.activeGates}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="glass-card p-6 text-white/60 text-center">
            Loading M2 security metrics...
          </div>
        )}
      </div>
    </div>
  );
}
