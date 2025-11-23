import { useState, useEffect } from 'react';
import { flowService } from '../../services/flowService';
import { Activity, AlertTriangle, CheckCircle, Clock, Brain, RefreshCw, TrendingUp, Zap } from 'lucide-react';

export default function FlowManagement() {
    const [gateStatus, setGateStatus] = useState(null);
    const [aiInsights, setAIInsights] = useState(null);
    const [loading, setLoading] = useState(false);
    const [stadiumId] = useState('AGADIR');

    // Testing states
    const [testResults, setTestResults] = useState({});
    const [testLoading, setTestLoading] = useState({});

    const [testData, setTestData] = useState({
        stadiumId: 'AGADIR',
        gateId: 'G1',
        ts: new Date().toISOString(),
        perMinuteCount: 45,
        avgProcessingTime: 3.2,
        queueLength: 120
    });

    // Test scenario presets
    const scenarios = {
        normal: { perMinuteCount: 30, avgProcessingTime: 3.0, queueLength: 50, description: '🟢 Normal Flow' },
        moderate: { perMinuteCount: 55, avgProcessingTime: 4.5, queueLength: 120, description: '🟡 Moderate Flow' },
        congested: { perMinuteCount: 80, avgProcessingTime: 6.0, queueLength: 200, description: '🔴 Congested' },
        critical: { perMinuteCount: 120, avgProcessingTime: 8.0, queueLength: 350, description: '🚨 Critical' },
        vip: { perMinuteCount: 25, avgProcessingTime: 2.5, queueLength: 30, description: '⭐ VIP Gate' }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [status, insights] = await Promise.all([
                flowService.getGateStatus(stadiumId),
                flowService.getAIInsights(stadiumId)
            ]);
            setGateStatus(status);
            setAIInsights(insights);
        } catch (error) {
            console.error('Failed to fetch flow data:', error);
            setGateStatus({ error: 'Failed to connect to M1 Flow Service' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    // Individual endpoint testers
    const testEndpoint = async (endpointName, testFn) => {
        setTestLoading(prev => ({ ...prev, [endpointName]: true }));
        setTestResults(prev => ({ ...prev, [endpointName]: null }));

        try {
            const startTime = Date.now();
            const result = await testFn();
            const duration = Date.now() - startTime;

            setTestResults(prev => ({
                ...prev,
                [endpointName]: {
                    success: true,
                    message: `✅ Success (${duration}ms)`,
                    data: result
                }
            }));
        } catch (error) {
            setTestResults(prev => ({
                ...prev,
                [endpointName]: {
                    success: false,
                    message: `❌ ${error.message}`,
                    error: {
                        message: error.message,
                        status: error.response?.status,
                        statusText: error.response?.statusText,
                        data: error.response?.data,
                        code: error.code
                    }
                }
            }));
        } finally {
            setTestLoading(prev => ({ ...prev, [endpointName]: false }));
        }
    };

    const updateTestField = (field, value) => {
        setTestData(prev => ({ ...prev, [field]: value }));
    };

    const loadScenario = (scenarioKey) => {
        const scenario = scenarios[scenarioKey];
        setTestData(prev => ({
            ...prev,
            ...scenario,
            ts: new Date().toISOString()
        }));
    };

    const getStateColor = (state) => {
        switch (state) {
            case 'green': return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50' };
            case 'yellow': return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' };
            case 'red': return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' };
            default: return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/50' };
        }
    };

    const getStateIcon = (state) => {
        switch (state) {
            case 'green': return <CheckCircle className="w-5 h-5" />;
            case 'yellow': return <Clock className="w-5 h-5" />;
            case 'red': return <AlertTriangle className="w-5 h-5" />;
            default: return <Activity className="w-5 h-5" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-white">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Activity className="w-8 h-8 text-blue-400" />
                    Smart Stadium Flow Control
                </h1>
                <p className="text-white/60 mt-2">AI-Powered Gate Management - M1 (Azure)</p>
            </div>

            {/* Endpoint Testing Interface */}
            <div className="glass rounded-xl p-6 border-2 border-blue-500/30">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-400" />
                    API Endpoint Testing
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Test GET /status */}
                    <div className="bg-white/5 rounded-lg p-4">
                        <div className="text-white font-bold mb-2">GET /status</div>
                        <div className="text-white/60 text-xs mb-3">Get gate status with ML predictions</div>
                        <button
                            onClick={() => testEndpoint('status', () => flowService.getGateStatus(stadiumId))}
                            disabled={testLoading.status}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold disabled:opacity-50"
                        >
                            {testLoading.status ? 'Testing...' : 'Test Status'}
                        </button>
                        {testResults.status && (
                            <div className={`mt-3 p-2 rounded text-xs ${testResults.status.success ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                {testResults.status.message}
                            </div>
                        )}
                    </div>

                    {/* Test GET /ai-insights */}
                    <div className="bg-white/5 rounded-lg p-4">
                        <div className="text-white font-bold mb-2">GET /ai-insights</div>
                        <div className="text-white/60 text-xs mb-3">Query AI agent decisions</div>
                        <button
                            onClick={() => testEndpoint('insights', () => flowService.getAIInsights(stadiumId))}
                            disabled={testLoading.insights}
                            className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm font-bold disabled:opacity-50"
                        >
                            {testLoading.insights ? 'Testing...' : 'Test AI Insights'}
                        </button>
                        {testResults.insights && (
                            <div className={`mt-3 p-2 rounded text-xs ${testResults.insights.success ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                {testResults.insights.message}
                            </div>
                        )}
                    </div>

                    {/* Test POST /ingest */}
                    <div className="bg-white/5 rounded-lg p-4">
                        <div className="text-white font-bold mb-2">POST /ingest</div>
                        <div className="text-white/60 text-xs mb-3">Send test gate data</div>
                        <button
                            onClick={() => testEndpoint('ingest', () => flowService.ingestGateData(testData))}
                            disabled={testLoading.ingest}
                            className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-bold disabled:opacity-50"
                        >
                            {testLoading.ingest ? 'Testing...' : 'Test Ingest'}
                        </button>
                        {testResults.ingest && (
                            <div className={`mt-3 p-2 rounded text-xs ${testResults.ingest.success ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                {testResults.ingest.message}
                            </div>
                        )}
                    </div>
                </div>

                {/* Detailed Error Display */}
                {Object.entries(testResults).map(([endpoint, result]) => (
                    result && !result.success && (
                        <div key={endpoint} className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <div className="text-red-400 font-bold mb-2">{endpoint.toUpperCase()} Error Details:</div>
                            <div className="text-white/70 text-xs font-mono bg-black/30 p-3 rounded max-h-40 overflow-auto">
                                {JSON.stringify(result.error, null, 2)}
                            </div>
                        </div>
                    )
                ))}

                {/* Scenario Presets */}
                <div className="border-t border-white/10 pt-4 mt-4">
                    <label className="text-white/70 text-sm block mb-2">Quick Test Scenarios:</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {Object.entries(scenarios).map(([key, scenario]) => (
                            <button
                                key={key}
                                onClick={() => loadScenario(key)}
                                className={`bg-white/10 hover:bg-white/20 border border-white/30 text-white px-3 py-2 rounded text-xs font-bold`}
                            >
                                {scenario.description}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Test Data Inputs */}
                <div className="border-t border-white/10 pt-4 mt-4">
                    <label className="text-white/70 text-sm block mb-2">Test Data Parameters:</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div>
                            <label className="text-white/50">Gate ID</label>
                            <select
                                value={testData.gateId}
                                onChange={(e) => updateTestField('gateId', e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white mt-1"
                            >
                                <option value="G1">G1</option>
                                <option value="G2">G2</option>
                                <option value="G3">G3</option>
                                <option value="G4">G4</option>
                                <option value="G5">G5</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-white/50">Per Minute Count</label>
                            <input
                                type="number"
                                value={testData.perMinuteCount}
                                onChange={(e) => updateTestField('perMinuteCount', parseInt(e.target.value))}
                                className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-white/50">Queue Length</label>
                            <input
                                type="number"
                                value={testData.queueLength}
                                onChange={(e) => updateTestField('queueLength', parseInt(e.target.value))}
                                className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white mt-1"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Refresh Button */}
            <div className="flex justify-end">
                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Refreshing...' : 'Refresh Data'}
                </button>
            </div>

            {/* Summary Stats */}
            {gateStatus?.gates && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="glass rounded-xl p-4">
                        <div className="text-white/60 text-sm mb-1">Total Gates</div>
                        <div className="text-3xl font-bold text-white">{gateStatus.gates.length}</div>
                    </div>
                    <div className="glass rounded-xl p-4">
                        <div className="text-white/60 text-sm mb-1">Green Status</div>
                        <div className="text-3xl font-bold text-green-400">
                            {gateStatus.gates.filter(g => g.state === 'green').length}
                        </div>
                    </div>
                    <div className="glass rounded-xl p-4">
                        <div className="text-white/60 text-sm mb-1">Anomalies</div>
                        <div className="text-3xl font-bold text-red-400">
                            {gateStatus.gates.filter(g => g.anomaly).length}
                        </div>
                    </div>
                    <div className="glass rounded-xl p-4">
                        <div className="text-white/60 text-sm mb-1">Avg Wait Time</div>
                        <div className="text-3xl font-bold text-white">
                            {(gateStatus.gates.reduce((sum, g) => sum + g.wait, 0) / gateStatus.gates.length).toFixed(1)} min
                        </div>
                    </div>
                </div>
            )}

            {/* Gates Status Grid */}
            {gateStatus?.gates && (
                <div className="glass rounded-xl p-6">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Gate Status - {gateStatus.stadiumId}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {gateStatus.gates.map((gate) => {
                            const colors = getStateColor(gate.state);
                            return (
                                <div
                                    key={gate.gateId}
                                    className={`${colors.bg} border ${colors.border} rounded-lg p-4 transition-all hover:scale-105`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-white font-bold text-xl">{gate.gateId}</h4>
                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${colors.bg} ${colors.text} font-bold text-sm`}>
                                            {getStateIcon(gate.state)}
                                            {gate.state.toUpperCase()}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-white/60 text-sm flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                Wait Time
                                            </span>
                                            <span className="text-white font-bold text-lg">{gate.wait.toFixed(1)} min</span>
                                        </div>

                                        {gate.anomalyScore >= 0 && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-white/60 text-sm">Anomaly Score</span>
                                                <span className={`font-bold ${gate.anomaly ? 'text-red-400' : 'text-white'}`}>
                                                    {gate.anomalyScore.toFixed(2)}
                                                </span>
                                            </div>
                                        )}

                                        {gate.anomaly && (
                                            <div className="mt-3 p-2 bg-red-500/20 border border-red-500/50 rounded text-xs">
                                                <div className="flex items-center gap-2 text-red-400 font-bold mb-1">
                                                    <AlertTriangle className="w-4 h-4" />
                                                    ANOMALY DETECTED
                                                </div>
                                                {gate.root_cause && (
                                                    <div className="text-white">
                                                        <strong>Root Cause:</strong> {gate.root_cause}
                                                    </div>
                                                )}
                                                {gate.investigation_id && (
                                                    <div className="text-white/70 mt-1">
                                                        Investigation: {gate.investigation_id}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* AI Agent Insights */}
            {aiInsights?.latest_decision && aiInsights.latest_decision.decision !== "No decisions yet" && (
                <div className="glass rounded-xl p-6">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-400" />
                        AI Agent Decision (GPT-Powered)
                    </h3>
                    <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-2 border-purple-500/30 rounded-lg p-6">
                        <div className="mb-4">
                            <div className="text-xs text-purple-300 mb-2">LATEST DECISION</div>
                            <p className="text-white text-lg font-medium mb-3">{aiInsights.latest_decision.decision}</p>
                        </div>

                        <div className="mb-4">
                            <div className="text-xs text-white/50 mb-1">REASONING</div>
                            <p className="text-white/70 text-sm">{aiInsights.latest_decision.reasoning}</p>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="bg-black/30 rounded px-3 py-1">
                                <span className="text-white/60">Confidence: </span>
                                <span className="text-white font-bold">{(aiInsights.latest_decision.confidence * 100).toFixed(0)}%</span>
                            </div>
                            <div className="bg-black/30 rounded px-3 py-1">
                                <span className="text-white/60">Cost: </span>
                                <span className="text-white font-bold">${aiInsights.latest_decision.cost_usd?.toFixed(4) || '0.0000'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error State */}
            {gateStatus?.error && (
                <div className="glass rounded-xl p-6 border-2 border-red-500/50 bg-red-500/5">
                    <p className="text-red-400 text-center">{gateStatus.error}</p>
                    <p className="text-white/60 text-center text-sm mt-2">
                        Make sure M1 Flow service is running and accessible
                    </p>
                </div>
            )}

            {/* Info Card */}
            <div className="glass rounded-xl p-4">
                <h3 className="text-white font-bold mb-3">About M1 Flow Management</h3>
                <p className="text-white/70 text-sm mb-4">
                    M1 uses machine learning (LightGBM, R²=0.9948) deployed on Azure Functions to predict wait times
                    and manage crowd flow. The AI agent (GPT-powered) makes autonomous decisions every 2 minutes.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="bg-white/5 rounded p-3">
                        <div className="text-white/50 mb-1">ML Model</div>
                        <div className="text-white font-bold">LightGBM</div>
                    </div>
                    <div className="bg-white/5 rounded p-3">
                        <div className="text-white/50 mb-1">Accuracy</div>
                        <div className="text-white font-bold">99.48%</div>
                    </div>
                    <div className="bg-white/5 rounded p-3">
                        <div className="text-white/50 mb-1">AI Agent</div>
                        <div className="text-white font-bold">GPT-3.5</div>
                    </div>
                    <div className="bg-white/5 rounded p-3">
                        <div className="text-white/50 mb-1">Platform</div>
                        <div className="text-white font-bold">Azure</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
