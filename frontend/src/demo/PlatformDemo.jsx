import React, { useState, useEffect } from 'react';
import { Users, Shield, TrendingUp, Gift, AlertTriangle, CheckCircle, Clock, MapPin, Zap } from 'lucide-react';

const FanOpsPlatform = () => {
  const [view, setView] = useState('fan'); // 'fan' or 'admin'
  const [gatesData, setGatesData] = useState([
    { gateId: 'G1', wait: 7, state: 'yellow', flow: 180, capacity: 200 },
    { gateId: 'G2', wait: 18, state: 'red', flow: 210, capacity: 200 },
    { gateId: 'G3', wait: 4, state: 'green', flow: 150, capacity: 200 },
    { gateId: 'G4', wait: 11, state: 'yellow', flow: 195, capacity: 200 }
  ]);
  const [activePromo, setActivePromo] = useState(null);
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    // Simulation des données en temps réel
    const interval = setInterval(() => {
      setGatesData(prev => prev.map(gate => ({
        ...gate,
        wait: Math.max(2, gate.wait + (Math.random() - 0.5) * 4),
        flow: Math.max(100, Math.min(220, gate.flow + (Math.random() - 0.5) * 20))
      })).map(gate => ({
        ...gate,
        state: gate.wait < 8 ? 'green' : gate.wait < 15 ? 'yellow' : 'red'
      })));
    }, 3000);

    // Simulation promo
    const promoInterval = setInterval(() => {
      const promos = [
        { title: 'Coca-Cola -15%', zone: 'OUEST', confidence: 0.91, icon: '🥤' },
        { title: 'Maroc Telecom Offre Spéciale', zone: 'EST', confidence: 0.87, icon: '📱' },
        { title: 'Inwi Data Gratuite', zone: 'NORD', confidence: 0.93, icon: '🎁' }
      ];
      setActivePromo(promos[Math.floor(Math.random() * promos.length)]);
    }, 8000);

    // Simulation forecast
    setForecast([
      { time: '18:15', attendance: 13120 },
      { time: '18:30', attendance: 15280 },
      { time: '18:45', attendance: 17950 },
      { time: '19:00', attendance: 19200 }
    ]);

    return () => {
      clearInterval(interval);
      clearInterval(promoInterval);
    };
  }, []);

  const getStateColor = (state) => {
    switch(state) {
      case 'green': return 'from-emerald-500 to-green-600';
      case 'yellow': return 'from-amber-500 to-orange-600';
      case 'red': return 'from-red-500 to-rose-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStateIcon = (state) => {
    switch(state) {
      case 'green': return <CheckCircle className="w-5 h-5" />;
      case 'yellow': return <Clock className="w-5 h-5" />;
      case 'red': return <AlertTriangle className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header with Glass Effect */}
      <div className="backdrop-blur-xl bg-white/10 border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">CAN 2025 FanOps</h1>
                <p className="text-sm text-purple-200">Multi-Cloud Platform</p>
              </div>
            </div>
            
            <div className="flex gap-2 bg-white/10 p-1 rounded-lg">
              <button
                onClick={() => setView('fan')}
                className={`px-4 py-2 rounded-md transition-all ${
                  view === 'fan' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Fan App
              </button>
              <button
                onClick={() => setView('admin')}
                className={`px-4 py-2 rounded-md transition-all ${
                  view === 'admin' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4 inline mr-2" />
                Admin Console
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {view === 'fan' ? (
          /* FAN VIEW */
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-8 text-white shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Match: Maroc vs Sénégal</h2>
                  <p className="text-green-100 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Stade Grand Stade d'Agadir • 19:00
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold">67'</div>
                  <div className="text-sm text-green-100">TEMPS DE JEU</div>
                </div>
              </div>
            </div>

            {/* Gates Status - Fan Perspective */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-green-400" />
                Portes d'Entrée en Temps Réel
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {gatesData.map((gate) => (
                  <div
                    key={gate.gateId}
                    className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/20 to-white/5 p-5 border border-white/20 hover:scale-105 transition-transform cursor-pointer"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${getStateColor(gate.state)} opacity-20`}></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-2xl font-bold text-white">{gate.gateId}</span>
                        <div className={`text-${gate.state === 'green' ? 'green' : gate.state === 'yellow' ? 'amber' : 'red'}-400`}>
                          {getStateIcon(gate.state)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/70">Attente:</span>
                          <span className="text-white font-semibold">{Math.round(gate.wait)} min</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${getStateColor(gate.state)} transition-all duration-1000`}
                            style={{ width: `${(gate.flow / gate.capacity) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-white/60 text-center">
                          {Math.round((gate.flow / gate.capacity) * 100)}% capacité
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Recommendation */}
              <div className="mt-6 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold mb-1">Recommandation Intelligente</p>
                    <p className="text-blue-100 text-sm">
                      La porte <strong>G3</strong> est la plus rapide actuellement. 
                      Évitez la porte <strong>G2</strong> (18 min d'attente).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Promotion */}
            {activePromo && (
              <div className="bg-gradient-to-r from-orange-500 to-pink-600 rounded-2xl p-6 text-white shadow-2xl animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{activePromo.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Gift className="w-5 h-5" />
                      <span className="text-sm font-semibold">OFFRE EXCLUSIVE - ZONE {activePromo.zone}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{activePromo.title}</h3>
                    <p className="text-orange-100 text-sm">
                      IA Confidence: {(activePromo.confidence * 100).toFixed(0)}% • Valable 15 minutes
                    </p>
                  </div>
                  <button className="bg-white text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors">
                    Profiter
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ADMIN VIEW */
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Affluence Actuelle', value: '14,250', icon: Users, color: 'from-blue-500 to-cyan-600' },
                { label: 'Billets Validés', value: '12,847', icon: CheckCircle, color: 'from-green-500 to-emerald-600' },
                { label: 'Temps Attente Moy.', value: '10 min', icon: Clock, color: 'from-amber-500 to-orange-600' },
                { label: 'Alertes Sécurité', value: '0', icon: Shield, color: 'from-purple-500 to-pink-600' }
              ].map((stat, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Gates Monitoring */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-purple-400" />
                Monitoring des Portes
              </h3>
              <div className="space-y-3">
                {gatesData.map((gate) => (
                  <div key={gate.gateId} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-3 h-3 rounded-full bg-${gate.state === 'green' ? 'green' : gate.state === 'yellow' ? 'amber' : 'red'}-400 animate-pulse`}></div>
                        <span className="text-white font-bold text-lg">{gate.gateId}</span>
                        <div className="flex-1 max-w-md">
                          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${getStateColor(gate.state)} transition-all duration-1000`}
                              style={{ width: `${(gate.flow / gate.capacity) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-6 text-right">
                        <div>
                          <div className="text-2xl font-bold text-white">{Math.round(gate.wait)}<span className="text-sm">min</span></div>
                          <div className="text-xs text-white/60">Attente</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white">{gate.flow}<span className="text-sm">/min</span></div>
                          <div className="text-xs text-white/60">Flux</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Forecast Chart */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
                Prévision d'Affluence (ML - GCP)
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {forecast.map((point, idx) => (
                  <div key={idx} className="text-center">
                    <div className="bg-gradient-to-t from-cyan-500/20 to-blue-500/20 rounded-lg p-4 border border-cyan-400/30">
                      <div className="text-3xl font-bold text-white mb-2">{point.attendance.toLocaleString()}</div>
                      <div className="text-sm text-cyan-200">{point.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sponsor Analytics */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Gift className="w-6 h-6 text-pink-400" />
                Performance des Sponsors
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Coca-Cola Zone Ouest', impressions: 4250, clicks: 420, ctr: 9.9 },
                  { name: 'Maroc Telecom Zone Est', impressions: 3180, clicks: 285, ctr: 9.0 },
                  { name: 'Inwi Zone Nord', impressions: 5100, clicks: 540, ctr: 10.6 }
                ].map((sponsor, idx) => (
                  <div key={idx} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">{sponsor.name}</span>
                      <span className="text-green-400 font-bold">{sponsor.ctr}% CTR</span>
                    </div>
                    <div className="flex gap-4 text-sm text-white/60">
                      <span>{sponsor.impressions.toLocaleString()} impressions</span>
                      <span>•</span>
                      <span>{sponsor.clicks} clics</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/20 bg-white/5 backdrop-blur-xl mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-white/60">
            <div>Multi-Cloud: Azure (Flow) • AWS (Security) • GCP (Forecast & AI)</div>
            <div>CAN 2025 • Agadir, Morocco</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FanOpsPlatform;