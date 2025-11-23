import { useState, useEffect } from 'react';
import { flowService } from '../../services/flowService';
import { Activity, AlertTriangle, CheckCircle, Clock, Brain, RefreshCw, TrendingUp, Zap, Send } from 'lucide-react';

export default function FlowManagement() {
    const [gateStatus, setGateStatus] = useState(null);
    const [aiInsights, setAIInsights] = useState(null);
    const [loading, setLoading] = useState(false);
    const [stadiumId] = useState('AGADIR');

    // Individual test states
    const [statusTest, setStatusTest] = useState({ loading: false, result: null });
    const [insightsTest, setInsightsTest] = useState({ loading: false, result: null });
    const [ingestTest, setIngestTest] = useState({ loading: false, result: null });

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
        normal: { perMinuteCount: 30, avgProcessingTime: 3.0, queueLength: 50, description: '🟢 Normal' },
        moderate: { perMinuteCount: 55, avgProcessingTime: 4.5, queueLength: 120, description: '🟡 Moderate' },
        congested: { perMinuteCount: 80, avgProcessingTime: 6.0, queueLength: 200, description: '🔴 Congested' },
        critical: { perMinuteCount: 120, avgProcessingTime: 8.0, queueLength: 350, description: '🚨 Critical' },
        vip: { perMinuteCount: 25, avgProcessingTime: 2.5, queueLength: 30, description: '⭐ VIP' }
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

    // Test GET /status
    const testGetStatus = async () => {
        setStatusTest({ loading: true, result: null });
        try {
            const startTime = Date.now();
            const result = await flowService.getGateStatus(stadiumId);
            const duration = Date.now() - startTime;
            setStatusTest({
                loading: false,
                result: {
                    success: true,
                    message: `✅ Success (${duration}ms)`,
                    data: result
                }
            });
        } catch (error) {
            setStatusTest({
                loading: false,
                result: {
                    success: false,
                    message: `❌ ${error.message}`,
                    error: error
                }
            });
        }
    };

    // Test GET /ai-insights
    const testGetInsights = async () => {
        setInsightsTest({ loading: true, result: null });
        try {
            const startTime = Date.now();
            const result = await flowService.getAIInsights(stadiumId);
            const duration = Date.now() - startTime;
            setInsightsTest({
                loading: false,
                result: {
                    success: true,
                    message: `✅ Success (${duration}ms)`,
                    data: result
                }
            });
        } catch (error) {
            setInsightsTest({
                loading: false,
                result: {
                    success: false,
                    message: `❌ ${error.message}`,
                    error: error
                }
            });
        }
    };

    // Test POST /ingest
    const testPostIngest = async () => {
        setIngestTest({ loading: true, result: null });
        try {
            const startTime = Date.now();
            const result = await flowService.ingestGateData(testData);
            const duration = Date.now() - startTime;
            setIngestTest({
                loading: false,
                result: {
                    success: true,
                    message: `✅ Success (${duration}ms)`,
                    data: result
                }
            });
            setTimeout(fetchData, 2000); // Refresh after ingest
        } catch (error) {
            setIngestTest({
                loading: false,
                result: {
                    success: false,
                    message: `❌ ${error.message}`,
                    error: error
                }
            });
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
                    M1 Flow Management - API Testing
                </h1>
                <p className="text-white/60 mt-2">Test each Azure Functions endpoint individually</p>
            </div>

            {/* API Testing Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Test 1: GET /status */}
                <div className="glass rounded-xl p-6 border-2 border-blue-500/30">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-blue-400" />
                        <h3 className="text-white font-bold">GET /status</h3>
                    </div>
                    <p className="text-white/60 text-sm mb-4">Get gate status with ML predictions</p>

                    <button
                        onClick={testGetStatus}
                        disabled={statusTest.loading}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        {statusTest.loading ? 'Testing...' : 'Test Endpoint'}
                    </button>

                    {statusTest.result && (
                        <div className={`mt-4 p-3 rounded ${statusTest.result.success ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                            <div className="font-bold text-sm mb-1">{statusTest.result.message}</div>
                            {statusTest.result.success && statusTest.result.data && (
                                <div className="text-xs opacity-80">
                                    Found {statusTest.result.data.gates?.length || 0} gates
                                </div>
                            )}
                            {!statusTest.result.success && (
                                <div className="text-xs mt-2 bg-black/30 p-2 rounded font-mono max-h-32 overflow-auto">
                                    {statusTest.result.error?.message || 'Unknown error'}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Test 2: GET /ai-insights */}
                <div className="glass rounded-xl p-6 border-2 border-purple-500/30">
                    <div className="flex items-center gap-2 mb-4">
                        <Brain className="w-5 h-5 text-purple-400" />
                        <h3 className="text-white font-bold">GET /ai-insights</h3>
                    </div>
                    <p className="text-white/60 text-sm mb-4">Query AI agent decisions (GPT-3.5)</p>

                    <button
                        onClick={testGetInsights}
                        disabled={insightsTest.loading}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        {insightsTest.loading ? 'Testing...' : 'Test Endpoint'}
                    </button>

                    {insightsTest.result && (
                        <div className={`mt-4 p-3 rounded ${insightsTest.result.success ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                            <div className="font-bold text-sm mb-1">{insightsTest.result.message}</div>
                            {insightsTest.result.success && insightsTest.result.data && (
                                <div className="text-xs opacity-80">
                                    Decisions: {insightsTest.result.data.total_decisions || 0}
                                </div>
                            )}
                            {!insightsTest.result.success && (
                                <div className="text-xs mt-2 bg-black/30 p-2 rounded font-mono max-h-32 overflow-auto">
                                    {insightsTest.result.error?.message || 'Unknown error'}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Test 3: POST /ingest */}
                <div className="glass rounded-xl p-6 border-2 border-green-500/30">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-5 h-5 text-green-400" />
                        <h3 className="text-white font-bold">POST /ingest</h3>
                    </div>
                    <p className="text-white/60 text-sm mb-4">Send test gate data</p>

                    <button
                        onClick={testPostIngest}
                        disabled={ingestTest.loading}
                        className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        {ingestTest.loading ? 'Testing...' : 'Test Endpoint'}
                    </button>

                    {ingestTest.result && (
                        <div className={`mt-4 p-3 rounded ${ingestTest.result.success ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                            <div className="font-bold text-sm mb-1">{ingestTest.result.message}</div>
                            {ingestTest.result.success && ingestTest.result.data && (
                                <div className="text-xs opacity-80">
                                    Status: {ingestTest.result.data.status} ✓
                                </div>
                            )}
                            {!ingestTest.result.success && (
                                <div className="text-xs mt-2 bg-black/30 p-2 rounded font-mono max-h-32 overflow-auto">
                                    {ingestTest.result.error?.message || 'CORS Error - Need OPTIONS/POST in Azure'}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Test Data Configuration for POST */}
            <div className="glass rounded-xl p-6">
                <h3 className="text-white font-bold mb-4">POST Test Data Configuration</h3>

                {/* Scenario Presets */}
                <div className="mb-4">
                    <label className="text-white/70 text-sm block mb-2">Quick Scenarios:</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {Object.entries(scenarios).map(([key, scenario]) => (
                            <button
                                key={key}
                                onClick={() => loadScenario(key)}
                                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-3 py-2 rounded text-xs font-bold"
                            >
                                {scenario.description}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Parameters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                        <label className="text-white/50">Gate ID</label>
                        <select
                            value={testData.gateId}
                            onChange={(e) => updateTestField('gateId', e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded px-2 py-2 text-white mt-1"
                        >
                            <option value="G1">G1</option>
                            <option value="G2">G2</option>
                            <option value="G3">G3</option>
                            <option value="G4">G4</option>
                            <option value="G5">G5</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-white/50">Per Min Count</label>
                        <input
                            type="number"
                            value={testData.perMinuteCount}
                            onChange={(e) => updateTestField('perMinuteCount', parseInt(e.target.value))}
                            className="w-full bg-white/10 border border-white/20 rounded px-2 py-2 text-white mt-1"
                        />
                    </div>
                    <div>
                        <label className="text-white/50">Avg Process (sec)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={testData.avgProcessingTime}
                            onChange={(e) => updateTestField('avgProcessingTime', parseFloat(e.target.value))}
                            className="w-full bg-white/10 border border-white/20 rounded px-2 py-2 text-white mt-1"
                        />
                    </div>
                    <div>
                        <label className="text-white/50">Queue Length</label>
                        <input
                            type="number"
                            value={testData.queueLength}
                            onChange={(e) => updateTestField('queueLength', parseInt(e.target.value))}
                            className="w-full bg-white/10 border border-white/20 rounded px-2 py-2 text-white mt-1"
                        />
                    </div>
                </div>

                <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-300">
                    💡 <strong>Tip:</strong> Click a scenario button to auto-fill values, then test POST endpoint
                </div>
            </div>

            {/* Live Gate Status Display */}
            <div className="flex justify-between items-center">
                <h2 className="text-white font-bold text-xl">Live Gate Status</h2>
                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Refreshing...' : 'Refresh'}
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

            {/* Gates Grid */}
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
                                    className={`${colors.bg} border ${colors.border} rounded-lg p-4`}
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
                                            <span className="text-white/60 text-sm">Wait Time</span>
                                            <span className="text-white font-bold">{gate.wait.toFixed(1)} min</span>
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
                                                    ANOMALY
                                                </div>
                                                {gate.root_cause && (
                                                    <div className="text-white">
                                                        <strong>Cause:</strong> {gate.root_cause}
                                                    </div>
                                                )}
                                                {gate.investigation_id && (
                                                    <div className="text-white/70 mt-1">
                                                        ID: {gate.investigation_id}
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
                        AI Agent Decision (GPT-3.5)
                    </h3>
                    <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-2 border-purple-500/30 rounded-lg p-6">
                        <p className="text-white text-lg font-medium mb-3">{aiInsights.latest_decision.decision}</p>
                        <p className="text-white/70 text-sm mb-4">{aiInsights.latest_decision.reasoning}</p>
                        <div className="flex gap-4 text-sm">
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
                </div>
            )}
        </div>
    );
}
