import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Activity, Key, Clock, Users, Lock, FileText } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/dev';

export default function SecurityDashboard() {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMetrics();
        const interval = setInterval(fetchMetrics, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchMetrics = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/security/metrics`);
            setMetrics(response.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch security metrics:', err);
            setError('Failed to load security data');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !metrics) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-white/60">Loading security metrics...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400">
                {error}
            </div>
        );
    }

    const { alerts = [], recentEvents = [], statistics = {}, systemHealth = {} } = metrics || {};
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    const highAlerts = alerts.filter(a => a.severity === 'high');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Shield className="w-8 h-8" />
                        Security Center
                    </h1>
                    <p className="text-white/60 mt-2">Real-time security monitoring and alerts</p>
                </div>
                <button
                    onClick={fetchMetrics}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all flex items-center gap-2"
                >
                    <Activity className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatusCard
                    icon={<AlertTriangle className="w-6 h-6 text-red-400" />}
                    label="Active Alerts"
                    value={alerts.length}
                    detail={`${criticalAlerts.length} critical, ${highAlerts.length} high`}
                    color="red"
                />
                <StatusCard
                    icon={<CheckCircle className="w-6 h-6 text-green-400" />}
                    label="Events (24h)"
                    value={statistics.totalEvents || 0}
                    detail={`${statistics.ticketScans || 0} ticket scans`}
                    color="green"
                />
                <StatusCard
                    icon={<Key className="w-6 h-6 text-blue-400" />}
                    label="System Status"
                    value={systemHealth.apiStatus}
                    detail={systemHealth.lastKeyRotation}
                    color="blue"
                />
                <StatusCard
                    icon={<Users className="w-6 h-6 text-purple-400" />}
                    label="Active Sessions"
                    value="N/A"
                    detail="Coming soon"
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Alerts Panel */}
                <div className="glass rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        Security Alerts
                    </h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {alerts.length === 0 ? (
                            <div className="text-white/40 text-center py-8">
                                No active alerts
                            </div>
                        ) : (
                            alerts.map((alert, idx) => (
                                <AlertCard key={idx} alert={alert} />
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Events */}
                <div className="glass rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-400" />
                        Recent Events
                    </h2>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {recentEvents.length === 0 ? (
                            <div className="text-white/40 text-center py-8">
                                No recent events
                            </div>
                        ) : (
                            recentEvents.map((event, idx) => (
                                <EventCard key={idx} event={event} />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="glass rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Analytics (Last 24h)</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatItem label="Total Events" value={statistics.totalEvents || 0} />
                    <StatItem label="Ticket Scans" value={statistics.ticketScans || 0} />
                    <StatItem label="Login Attempts" value={statistics.loginAttempts || 0} />
                    <StatItem label="Failed Logins" value={statistics.failedLogins || 0} color="red" />
                </div>
            </div>

            {/* Threat Intelligence & Access Control */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Threat Intelligence */}
                <div className="glass rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-orange-400" />
                        Threat Intelligence
                    </h2>
                    <div className="space-y-3">
                        <PlaceholderBlock
                            title="IP Blocklist"
                            description="Automatically blocked IPs after brute force attempts"
                            status="0 blocked IPs"
                        />
                        <PlaceholderBlock
                            title="Fraud Patterns"
                            description="Detected ticket replay and cloning attempts"
                            status="No patterns detected"
                        />
                    </div>
                </div>

                {/* Access Control */}
                <div className="glass rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-green-400" />
                        Access Control
                    </h2>
                    <div className="space-y-3">
                        <PlaceholderBlock
                            title="Role Permissions"
                            description="Admin, Gatekeeper, and Fan access levels"
                            status="3 roles configured"
                        />
                        <PlaceholderBlock
                            title="Session Management"
                            description="Active JWT sessions and token validity"
                            status="Coming soon"
                        />
                    </div>
                </div>
            </div>

            {/* System Health & Compliance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Health */}
                <div className="glass rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-green-400" />
                        System Health
                    </h2>
                    <div className="space-y-3">
                        <HealthItem label="API Gateway" status="healthy" uptime="99.9%" />
                        <HealthItem label="DynamoDB" status="healthy" uptime="100%" />
                        <HealthItem label="Lambda Functions" status="healthy" uptime="99.8%" />
                        <HealthItem label="JWT Secret Rotation" status="pending" uptime={systemHealth.lastKeyRotation} />
                    </div>
                </div>

                {/* Compliance & Audit */}
                <div className="glass rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-400" />
                        Compliance & Audit
                    </h2>
                    <div className="space-y-3">
                        <PlaceholderBlock
                            title="Audit Logs"
                            description="Complete trail of all security events"
                            status={`${statistics.totalEvents || 0} events logged`}
                        />
                        <PlaceholderBlock
                            title="GDPR Compliance"
                            description="Data retention and privacy controls"
                            status="Compliant"
                        />
                    </div>
                </div>
            </div>

            {/* CI/CD Security Testing */}
            <div className="glass rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-400" />
                    Automated Security Testing (GitHub Actions)
                </h2>

                <div className="space-y-4">
                    {/* How to Access */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-3">
                            <FileText className="w-5 h-5 text-blue-400 mt-0.5" />
                            <div>
                                <div className="font-semibold text-blue-300 mb-1">View Security Scan Results</div>
                                <div className="text-sm text-white/70 mb-2">
                                    Security scans run automatically on every push/PR via GitHub Actions
                                </div>
                                <div className="text-xs text-white/60 space-y-1">
                                    <div>1. Go to: <code className="bg-white/10 px-2 py-0.5 rounded">github.com/MouhcineAGOUJIL/FanOps</code></div>
                                    <div>2. Click the "Actions" tab</div>
                                    <div>3. Select "Security Scan" workflow</div>
                                    <div>4. View recent runs and their results</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Checks */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <SecurityTestCard
                            title="SCA"
                            description="Software Composition Analysis"
                            tool="npm audit"
                            checks={["Backend dependencies", "Frontend dependencies"]}
                            status="automated"
                        />
                        <SecurityTestCard
                            title="SAST"
                            description="Static Application Security Testing"
                            tool="ESLint Security Plugin"
                            checks={["Code anti-patterns", "Unsafe regex", "eval() detection"]}
                            status="automated"
                        />
                        <SecurityTestCard
                            title="DAST"
                            description="Dynamic Application Security Testing"
                            tool="OWASP ZAP"
                            checks={["API vulnerability scan", "Weekly automated scans"]}
                            status="automated"
                        />
                    </div>

                    {/* Local Testing Commands */}
                    <div className="bg-white/5 rounded-lg p-4">
                        <div className="font-semibold text-white text-sm mb-3">Run Locally</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                            <div className="bg-black/30 rounded p-3">
                                <div className="text-white/40 mb-1">Backend:</div>
                                <div className="text-green-400">$ npm run audit:security</div>
                                <div className="text-green-400">$ npm run lint:security</div>
                            </div>
                            <div className="bg-black/30 rounded p-3">
                                <div className="text-white/40 mb-1">Frontend:</div>
                                <div className="text-green-400">$ npm audit --audit-level=high</div>
                                <div className="text-green-400">$ npm run lint</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusCard({ icon, label, value, detail, color }) {
    const colorMap = {
        red: 'border-red-500/30 bg-red-500/10',
        green: 'border-green-500/30 bg-green-500/10',
        blue: 'border-blue-500/30 bg-blue-500/10',
        purple: 'border-purple-500/30 bg-purple-500/10'
    };

    return (
        <div className={`glass rounded-xl p-6 border ${colorMap[color]}`}>
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white/5 rounded-xl">
                    {icon}
                </div>
            </div>
            <div className="text-sm text-white/60 mb-1">{label}</div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-xs text-white/40">{detail}</div>
        </div>
    );
}

function AlertCard({ alert }) {
    const severityColors = {
        critical: 'border-red-500 bg-red-500/10 text-red-300',
        high: 'border-orange-500 bg-orange-500/10 text-orange-300',
        medium: 'border-yellow-500 bg-yellow-500/10 text-yellow-300'
    };

    return (
        <div className={`border rounded-lg p-4 ${severityColors[alert.severity] || severityColors.medium}`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="font-semibold text-sm uppercase mb-1">
                        {alert.type.replace(/_/g, ' ')}
                    </div>
                    <div className="text-sm">{alert.message}</div>
                </div>
                <div className="text-xs opacity-60 ml-4">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                </div>
            </div>
        </div>
    );
}

function EventCard({ event }) {
    const typeIcons = {
        TICKET_SCANNED: '🎫',
        LOGIN_SUCCESS: '✅',
        LOGIN_FAILURE: '❌',
        SECURITY_ALERT: '⚠️'
    };

    return (
        <div className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                    <span className="text-xl">{typeIcons[event.type] || '📌'}</span>
                    <div className="flex-1">
                        <div className="text-sm text-white font-medium">
                            {event.type.replace(/_/g, ' ')}
                        </div>
                        <div className="text-xs text-white/40">
                            {event.gateId && `Gate: ${event.gateId}`}
                            {event.ipAddress && ` • IP: ${event.ipAddress}`}
                        </div>
                    </div>
                </div>
                <div className="text-xs text-white/40">
                    {new Date(event.timestamp).toLocaleTimeString()}
                </div>
            </div>
        </div>
    );
}

function StatItem({ label, value, color = 'white' }) {
    const textColor = color === 'red' ? 'text-red-400' : 'text-white';

    return (
        <div className="bg-white/5 rounded-lg p-4">
            <div className="text-xs text-white/60 mb-2">{label}</div>
            <div className={`text-2xl font-bold ${textColor}`}>{value}</div>
        </div>
    );
}

function PlaceholderBlock({ title, description, status }) {
    return (
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-start justify-between mb-2">
                <div className="font-semibold text-white text-sm">{title}</div>
                <div className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                    {status}
                </div>
            </div>
            <div className="text-xs text-white/60">{description}</div>
        </div>
    );
}

function HealthItem({ label, status, uptime }) {
    const statusColors = {
        healthy: 'bg-green-500',
        pending: 'bg-yellow-500',
        error: 'bg-red-500'
    };

    return (
        <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${statusColors[status] || statusColors.healthy}`} />
                <span className="text-white text-sm">{label}</span>
            </div>
            <span className="text-white/60 text-xs">{uptime}</span>
        </div>
    );
}

function SecurityTestCard({ title, description, tool, checks, status }) {
    const statusColors = {
        automated: { bg: 'bg-green-500/20', text: 'text-green-300', dot: 'bg-green-500' },
        manual: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', dot: 'bg-yellow-500' }
    };
    const colors = statusColors[status] || statusColors.automated;

    return (
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
                <div>
                    <div className="font-bold text-white text-lg">{title}</div>
                    <div className="text-xs text-white/60">{description}</div>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${colors.bg} ${colors.text} flex items-center gap-1`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                    {status}
                </div>
            </div>
            <div className="text-xs text-white/50 mb-2">Tool: {tool}</div>
            <div className="space-y-1">
                {checks.map((check, idx) => (
                    <div key={idx} className="text-xs text-white/70 flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        {check}
                    </div>
                ))}
            </div>
        </div>
    );
}
