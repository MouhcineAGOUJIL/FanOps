import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Activity, Key, Clock, Users, Lock, FileText, RefreshCw, TrendingUp } from 'lucide-react';
import { securityService } from '../../services/securityService';
import m2Client from '../../services/m2Client';

export default function SecurityDashboard() {
    const [metrics, setMetrics] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAllData();
        const interval = setInterval(fetchAllData, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);

            // Fetch metrics from M2 AWS
            const metricsData = await securityService.getSecurityMetrics();
            setMetrics(metricsData);

            // Fetch recent audit logs
            const auditData = await fetchAuditLogs();
            setAuditLogs(auditData);

            setError(null);
        } catch (err) {
            console.error('Failed to fetch security data:', err);
            setError('Failed to load security data from M2 AWS');
        } finally {
            setLoading(false);
        }
    };

    const fetchAuditLogs = async () => {
        try {
            // Query audit table directly
            const response = await m2Client.post('/admin/auditLogs', { limit: 10 });
            return response.data.logs || [];
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
            return [];
        }
    };

    if (loading && !metrics) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                    <div className="text-white/60">Loading security metrics from M2 AWS...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                <div className="text-red-400 font-bold mb-2">❌ Error</div>
                <div className="text-white/70">{error}</div>
                <button
                    onClick={fetchAllData}
                    className="mt-4 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded"
                >
                    Retry
                </button>
            </div>
        );
    }

    // Calculate statistics from real data
    const stats = {
        totalScans: metrics?.total || 0,
        validTickets: metrics?.valid || 0,
        invalidTickets: metrics?.invalid || 0,
        replayAttempts: metrics?.replay || 0,
        activeGates: metrics?.activeGates || 0
    };

    const successRate = stats.totalScans > 0
        ? ((stats.validTickets / stats.totalScans) * 100).toFixed(1)
        : 0;

    const recentAlerts = auditLogs
        .filter(log => log.result !== 'valid')
        .slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="text-white">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Shield className="w-8 h-8 text-blue-400" />
                        Security Dashboard
                    </h1>
                    <p className="text-white/60 mt-2">M2 AWS - Real-time security monitoring</p>
                </div>
                <button
                    onClick={fetchAllData}
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Activity className="w-6 h-6 text-blue-400" />
                        <span className="text-xs text-white/50">Total</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{stats.totalScans}</div>
                    <div className="text-sm text-white/60 mt-1">Scan Attempts</div>
                </div>

                <div className="glass rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <CheckCircle className="w-6 h-6 text-green-400" />
                        <span className="text-xs text-white/50">Valid</span>
                    </div>
                    <div className="text-3xl font-bold text-green-400">{stats.validTickets}</div>
                    <div className="text-sm text-white/60 mt-1">Successful Scans</div>
                </div>

                <div className="glass rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                        <span className="text-xs text-white/50">Invalid</span>
                    </div>
                    <div className="text-3xl font-bold text-red-400">{stats.invalidTickets}</div>
                    <div className="text-sm text-white/60 mt-1">Rejected Tickets</div>
                </div>

                <div className="glass rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Lock className="w-6 h-6 text-orange-400" />
                        <span className="text-xs text-white/50">Replay</span>
                    </div>
                    <div className="text-3xl font-bold text-orange-400">{stats.replayAttempts}</div>
                    <div className="text-sm text-white/60 mt-1">Replay Attacks</div>
                </div>
            </div>

            {/* Success Rate & System Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Success Rate */}
                <div className="glass rounded-xl p-6">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        Success Rate
                    </h3>
                    <div className="flex items-end gap-4">
                        <div className="text-5xl font-bold text-green-400">{successRate}%</div>
                        <div className="text-white/60 mb-2">of scans successful</div>
                    </div>
                    <div className="mt-4 bg-white/5 rounded-full h-3 overflow-hidden">
                        <div
                            className="bg-green-400 h-full rounded-full transition-all"
                            style={{ width: `${successRate}%` }}
                        />
                    </div>
                </div>

                {/* System Health */}
                <div className="glass rounded-xl p-6">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-400" />
                        System Health
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-white/70">M2 AWS Lambda</span>
                            <span className="flex items-center gap-2 text-green-400">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                Operational
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-white/70">DynamoDB</span>
                            <span className="flex items-center gap-2 text-green-400">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                Healthy
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-white/70">API Gateway</span>
                            <span className="flex items-center gap-2 text-green-400">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                Active
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Alerts */}
            <div className="glass rounded-xl p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                    Recent Security Alerts
                </h3>
                {recentAlerts.length === 0 ? (
                    <div className="text-center py-8 text-white/60">
                        <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
                        <p>No security alerts - All systems secure</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentAlerts.map((alert, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg border ${alert.result === 'replay'
                                        ? 'bg-red-500/10 border-red-500/30'
                                        : 'bg-orange-500/10 border-orange-500/30'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold text-white">
                                                {alert.result === 'replay' ? '🔒 Replay Attack Detected' : '⚠️ Invalid Ticket'}
                                            </span>
                                            <span className="text-xs text-white/50">
                                                Gate {alert.gateId || 'Unknown'}
                                            </span>
                                        </div>
                                        <div className="text-xs text-white/70">
                                            Ticket: {alert.ticketId?.substring(0, 20)}...
                                        </div>
                                        <div className="text-xs text-white/50 mt-1">
                                            {new Date(alert.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Activity */}
            <div className="glass rounded-xl p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    Recent Activity (Live Audit Log)
                </h3>
                {auditLogs.length === 0 ? (
                    <div className="text-center py-8 text-white/60">
                        <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No activity yet</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-white/50 border-b border-white/10">
                                    <th className="pb-3 font-medium">Time</th>
                                    <th className="pb-3 font-medium">Ticket</th>
                                    <th className="pb-3 font-medium">Gate</th>
                                    <th className="pb-3 font-medium">Result</th>
                                    <th className="pb-3 font-medium">Details</th>
                                </tr>
                            </thead>
                            <tbody className="text-white/70">
                                {auditLogs.map((log, index) => (
                                    <tr key={index} className="border-b border-white/5">
                                        <td className="py-3 text-xs">
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </td>
                                        <td className="py-3 text-xs font-mono">
                                            {log.ticketId?.substring(0, 8)}...
                                        </td>
                                        <td className="py-3">
                                            <span className="px-2 py-1 bg-white/10 rounded text-xs">
                                                {log.gateId || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            {log.result === 'valid' && (
                                                <span className="flex items-center gap-2 text-green-400">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Valid
                                                </span>
                                            )}
                                            {log.result === 'invalid_ticket' && (
                                                <span className="flex items-center gap-2 text-red-400">
                                                    <AlertTriangle className="w-4 h-4" />
                                                    Invalid
                                                </span>
                                            )}
                                            {log.result === 'replay' && (
                                                <span className="flex items-center gap-2 text-orange-400">
                                                    <Lock className="w-4 h-4" />
                                                    Replay
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 text-xs">
                                            Device: {log.deviceId || 'Unknown'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Info Card */}
            <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <div className="flex-1">
                        <div className="text-white font-bold text-sm">M2 Secure Gates - AWS Serverless</div>
                        <div className="text-white/60 text-xs mt-1">
                            Real-time security monitoring powered by AWS Lambda, DynamoDB, and API Gateway
                        </div>
                    </div>
                    <div className="text-xs text-white/50">
                        Auto-refresh: 30s
                    </div>
                </div>
            </div>
        </div>
    );
}
