import { X, Brain, FlaskConical, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { flowService } from '../../services/flowService';

export default function InvestigationModal({ investigationId, onClose }) {
    const [investigation, setInvestigation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('summary');

    useEffect(() => {
        const fetchInvestigation = async () => {
            try {
                const data = await flowService.getInvestigation(investigationId);
                setInvestigation(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to load investigation:', error);
                setLoading(false);
            }
        };

        if (investigationId) {
            fetchInvestigation();
        }
    }, [investigationId]);

    if (!investigationId) return null;

    const tabs = [
        { id: 'summary', label: 'Summary', icon: AlertTriangle },
        { id: 'hypotheses', label: 'Hypotheses', icon: Brain },
        { id: 'evidence', label: 'Evidence', icon: FlaskConical },
        { id: 'reasoning', label: 'AI Reasoning', icon: TrendingUp },
    ];

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-[#0a0a0a] border border-red-900/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-2xl font-bold text-white">🔍 Root Cause Analysis</h2>
                        <p className="text-sm text-white/60 mt-1">AI-Powered Investigation Report</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-white/60" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 px-6 pt-4 border-b border-white/10">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${activeTab === tab.id
                                        ? 'bg-white/10 text-white border-b-2 border-red-500'
                                        : 'text-white/60 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="text-white/60 text-center py-8">Loading investigation...</div>
                    ) : investigation ? (
                        <>
                            {/* Summary Tab */}
                            {activeTab === 'summary' && (
                                <div className="space-y-6">
                                    {/* Investigation Info */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-xs uppercase tracking-wider text-white/60 mb-1">Investigation ID</p>
                                            <p className="text-sm font-mono text-white/80">{investigation.investigation_id}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wider text-white/60 mb-1">Stadium</p>
                                            <p className="text-lg font-semibold text-white">{investigation.stadium_id}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wider text-white/60 mb-1">Gate</p>
                                            <p className="text-lg font-semibold text-white">{investigation.gate_id}</p>
                                        </div>
                                    </div>

                                    {/* Root Cause */}
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                                        <p className="text-xs uppercase tracking-wider text-red-400 mb-2">Root Cause Diagnosis</p>
                                        <p className="text-2xl font-bold text-white mb-3">
                                            {investigation.diagnosis?.root_cause || 'Unknown'}
                                        </p>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-white/60">Confidence: </span>
                                                <span className="font-semibold text-white">
                                                    {((investigation.diagnosis?.confidence || 0) * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-white/60">Anomaly Score: </span>
                                                <span className="font-semibold text-red-400">
                                                    {investigation.anomaly_score?.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mitigation */}
                                    {investigation.mitigation && (
                                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                            <p className="text-xs uppercase tracking-wider text-blue-400 mb-2">Mitigation Plan</p>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-white/60">Priority:</span>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${investigation.mitigation.priority === 'high'
                                                            ? 'bg-red-500/20 text-red-400'
                                                            : investigation.mitigation.priority === 'medium'
                                                                ? 'bg-yellow-500/20 text-yellow-400'
                                                                : 'bg-green-500/20 text-green-400'
                                                        }`}>
                                                        {investigation.mitigation.priority?.toUpperCase()}
                                                    </span>
                                                </div>
                                                {investigation.mitigation.actions && investigation.mitigation.actions.length > 0 && (
                                                    <div>
                                                        <p className="text-white/60 text-sm mb-2">Recommended Actions:</p>
                                                        <ul className="text-white/80 text-sm space-y-1">
                                                            {investigation.mitigation.actions.filter(a => a.trim()).map((action, idx) => (
                                                                <li key={idx} className="flex items-start gap-2">
                                                                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                                                    <span>{action}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Status & Timing */}
                                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                        <div>
                                            <span className="text-white/60 text-sm">Execution Time: </span>
                                            <span className="text-white font-semibold">{investigation.execution_time_ms || 0}ms</span>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${investigation.status === 'completed'
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {investigation.status?.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Hypotheses Tab */}
                            {activeTab === 'hypotheses' && (
                                <div className="space-y-4">
                                    <p className="text-white/60 text-sm">
                                        AI generated {investigation.all_hypotheses?.length || 0} potential root causes using chain-of-thought reasoning.
                                    </p>
                                    {investigation.all_hypotheses && investigation.all_hypotheses.length > 0 ? (
                                        investigation.all_hypotheses.map((hyp, idx) => (
                                            <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className="font-semibold text-white">
                                                        #{idx + 1}. {hyp.hypothesis || hyp.name || 'Unknown'}
                                                    </h3>
                                                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded">
                                                        Score: {((hyp.plausibility || hyp.score || 0) * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                                {hyp.reasoning && (
                                                    <p className="text-white/70 text-sm">{hyp.reasoning}</p>
                                                )}
                                                {hyp.category && (
                                                    <p className="text-white/50 text-xs mt-2">Category: {hyp.category}</p>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-white/60 text-center py-8">No hypotheses data available</p>
                                    )}
                                </div>
                            )}

                            {/* Evidence Tab */}
                            {activeTab === 'evidence' && (
                                <div className="space-y-4">
                                    <p className="text-white/60 text-sm">
                                        Evidence collected through automated tests to support or refute each hypothesis.
                                    </p>
                                    {investigation.tested_hypotheses && investigation.tested_hypotheses.length > 0 ? (
                                        investigation.tested_hypotheses.map((hyp, idx) => (
                                            <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <h3 className="font-semibold text-white">{hyp.hypothesis || hyp.name}</h3>
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded ${hyp.evidence?.verdict === 'SUPPORTS'
                                                            ? 'bg-green-500/20 text-green-400'
                                                            : hyp.evidence?.verdict === 'REFUTES'
                                                                ? 'bg-red-500/20 text-red-400'
                                                                : 'bg-gray-500/20 text-gray-400'
                                                        }`}>
                                                        {hyp.evidence?.verdict || 'NO_EVIDENCE'}
                                                    </span>
                                                </div>
                                                {hyp.evidence?.details && (
                                                    <div className="space-y-2">
                                                        <p className="text-white/70 text-sm">{hyp.evidence.details}</p>
                                                        {hyp.evidence.data && (
                                                            <div className="bg-black/30 rounded p-2 text-xs text-white/60 font-mono">
                                                                {JSON.stringify(hyp.evidence.data, null, 2)}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-white/60 text-center py-8">No evidence data available</p>
                                    )}
                                </div>
                            )}

                            {/* AI Reasoning Tab */}
                            {activeTab === 'reasoning' && (
                                <div className="space-y-4">
                                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                                        <p className="text-xs uppercase tracking-wider text-purple-400 mb-2">Bayesian Analysis</p>
                                        {investigation.bayesian_analysis && Object.keys(investigation.bayesian_analysis).length > 0 ? (
                                            <div className="space-y-2">
                                                {Object.entries(investigation.bayesian_analysis).map(([key, value]) => (
                                                    <div key={key} className="flex justify-between text-sm">
                                                        <span className="text-white/60">{key}:</span>
                                                        <span className="text-white font-mono">
                                                            {typeof value === 'number' ? value.toFixed(3) : JSON.stringify(value)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-white/60 text-sm">No Bayesian analysis data available</p>
                                        )}
                                    </div>

                                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                        <p className="text-xs uppercase tracking-wider text-white/60 mb-2">AI Reasoning Chain</p>
                                        {investigation.diagnosis?.reasoning ? (
                                            <p className="text-white/80 text-sm whitespace-pre-wrap">{investigation.diagnosis.reasoning}</p>
                                        ) : (
                                            <p className="text-white/60 text-sm">No detailed reasoning available</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-white/60 text-center py-8">Investigation not found</div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 flex justify-between items-center">
                    <div className="text-xs text-white/60">
                        Powered by OpenAI GPT-3.5 • Bayesian Reasoning • Evidence Testing
                    </div>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
