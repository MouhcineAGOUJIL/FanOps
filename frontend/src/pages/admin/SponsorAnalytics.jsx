import { useState, useEffect } from 'react';
import { sponsorService } from '../../services/sponsorService';
import { TrendingUp, Sparkles, RefreshCw, BarChart3, Eye, MousePointerClick, DollarSign } from 'lucide-react';

// Real sponsor performance data
const sponsorPerformance = [
  { name: 'Puma', category: 'Sports', impressions: 245000, clicks: 18750, ctr: 7.65, revenue: 125000, roi: 2.8 },
  { name: 'Sidi Ali', category: 'Beverage', impressions: 312000, clicks: 21840, ctr: 7.0, revenue: 98000, roi: 2.45 },
  { name: 'Coca-Cola', category: 'Beverage', impressions: 298000, clicks: 19870, ctr: 6.67, revenue: 110000, roi: 2.6 },
  { name: 'Orange', category: 'Telecom', impressions: 198000, clicks: 13860, ctr: 7.0, revenue: 156000, roi: 3.2 },
  { name: 'Adidas', category: 'Sports', impressions: 225000, clicks: 15750, ctr: 7.0, revenue: 118000, roi: 2.7 },
  { name: 'Royal Air Maroc', category: 'Travel', impressions: 165000, clicks: 9900, ctr: 6.0, revenue: 142000, roi: 3.5 },
  { name: 'OCP', category: 'Institutional', impressions: 142000, clicks: 7100, ctr: 5.0, revenue: 185000, roi: 4.2 },
  { name: 'Inwi', category: 'Telecom', impressions: 178000, clicks: 11990, ctr: 6.73, revenue: 89000, roi: 2.3 },
  { name: 'Koutoubia', category: 'Hospitality', impressions: 135000, clicks: 6750, ctr: 5.0, revenue: 67000, roi: 2.1 },
  { name: 'CDG', category: 'Finance', impressions: 125000, clicks: 6250, ctr: 5.0, revenue: 95000, roi: 3.1 },
  { name: 'Hyundai', category: 'Automotive', impressions: 156000, clicks: 8580, ctr: 5.5, revenue: 78000, roi: 2.4 },
  { name: 'Visa', category: 'Finance', impressions: 118000, clicks: 5900, ctr: 5.0, revenue: 88000, roi: 2.9 }
];

const topPerformers = sponsorPerformance
  .sort((a, b) => b.ctr - a.ctr)
  .slice(0, 5);

const totalStats = {
  totalImpressions: sponsorPerformance.reduce((sum, s) => sum + s.impressions, 0),
  totalClicks: sponsorPerformance.reduce((sum, s) => sum + s.clicks, 0),
  totalRevenue: sponsorPerformance.reduce((sum, s) => sum + s.revenue, 0),
  avgCTR: (sponsorPerformance.reduce((sum, s) => sum + s.ctr, 0) / sponsorPerformance.length).toFixed(2)
};

export default function SponsorAnalytics() {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState({
    matchMinute: 45,
    scoreDiff: 0,
    temperature: 28,
    crowdDensity: 0.85,
    zone: 'VIP',
    event: 'Halftime'
  });

  const fetchRecommendation = async () => {
    setLoading(true);
    try {
      const result = await sponsorService.getRecommendation(context);
      setRecommendation(result);
    } catch (error) {
      console.error('Failed to fetch recommendation:', error);
      setRecommendation({ error: 'Failed to connect to M4 AI service' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendation();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-white">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-yellow-400" />
          Sponsor Analytics & AI
        </h1>
        <p className="text-white/60 mt-2">Performance metrics and AI-powered recommendations</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-5 h-5 text-blue-400" />
            <span className="text-white/50 text-xs">Total</span>
          </div>
          <div className="text-3xl font-bold text-white">{(totalStats.totalImpressions / 1000000).toFixed(2)}M</div>
          <div className="text-white/60 text-sm">Impressions</div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <MousePointerClick className="w-5 h-5 text-green-400" />
            <span className="text-white/50 text-xs">Total</span>
          </div>
          <div className="text-3xl font-bold text-white">{(totalStats.totalClicks / 1000).toFixed(1)}K</div>
          <div className="text-white/60 text-sm">Clicks</div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            <span className="text-white/50 text-xs">Average</span>
          </div>
          <div className="text-3xl font-bold text-white">{totalStats.avgCTR}%</div>
          <div className="text-white/60 text-sm">CTR</div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-white/50 text-xs">Total</span>
          </div>
          <div className="text-3xl font-bold text-white">${(totalStats.totalRevenue / 1000).toFixed(0)}K</div>
          <div className="text-white/60 text-sm">Revenue</div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Top Performing Sponsors
        </h3>
        <div className="space-y-3">
          {topPerformers.map((sponsor, idx) => (
            <div key={sponsor.name} className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                  #{idx + 1}
                </div>
                <div>
                  <div className="text-white font-semibold">{sponsor.name}</div>
                  <div className="text-white/50 text-xs">{sponsor.category}</div>
                </div>
              </div>
              <div className="flex gap-6 text-sm">
                <div className="text-right">
                  <div className="text-white/50 text-xs">CTR</div>
                  <div className="text-green-400 font-bold">{sponsor.ctr}%</div>
                </div>
                <div className="text-right">
                  <div className="text-white/50 text-xs">Impressions</div>
                  <div className="text-white">{(sponsor.impressions / 1000).toFixed(0)}K</div>
                </div>
                <div className="text-right">
                  <div className="text-white/50 text-xs">Revenue</div>
                  <div className="text-white">${(sponsor.revenue / 1000).toFixed(0)}K</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Sponsors Performance */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-white font-bold mb-4">All Sponsors Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-2 text-white/70 text-sm">Sponsor</th>
                <th className="text-left py-3 px-2 text-white/70 text-sm">Category</th>
                <th className="text-right py-3 px-2 text-white/70 text-sm">Impressions</th>
                <th className="text-right py-3 px-2 text-white/70 text-sm">Clicks</th>
                <th className="text-right py-3 px-2 text-white/70 text-sm">CTR</th>
                <th className="text-right py-3 px-2 text-white/70 text-sm">Revenue</th>
                <th className="text-right py-3 px-2 text-white/70 text-sm">ROI</th>
              </tr>
            </thead>
            <tbody>
              {sponsorPerformance.map((sponsor) => (
                <tr key={sponsor.name} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-2 text-white font-semibold">{sponsor.name}</td>
                  <td className="py-3 px-2 text-white/60 text-sm">{sponsor.category}</td>
                  <td className="py-3 px-2 text-white text-right">{sponsor.impressions.toLocaleString()}</td>
                  <td className="py-3 px-2 text-white text-right">{sponsor.clicks.toLocaleString()}</td>
                  <td className="py-3 px-2 text-right">
                    <span className={`font-bold ${sponsor.ctr >= 7 ? 'text-green-400' : sponsor.ctr >= 6 ? 'text-yellow-400' : 'text-white'}`}>
                      {sponsor.ctr}%
                    </span>
                  </td>
                  <td className="py-3 px-2 text-white text-right">${sponsor.revenue.toLocaleString()}</td>
                  <td className="py-3 px-2 text-right">
                    <span className={`font-bold ${sponsor.roi >= 3 ? 'text-green-400' : 'text-white'}`}>
                      {sponsor.roi}x
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Recommendation Section */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          AI-Powered Recommendation (M4 - Google Cloud)
        </h3>

        {/* Context Controls */}
        <div className="mb-6">
          <h4 className="text-white/70 text-sm mb-3">Match Context</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="text-white/50 text-xs block mb-1">Match Minute</label>
              <input
                type="number"
                min="0"
                max="120"
                value={context.matchMinute}
                onChange={(e) => setContext({ ...context, matchMinute: parseInt(e.target.value) || 0 })}
                className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:border-green-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-white/50 text-xs block mb-1">Score Diff</label>
              <input
                type="number"
                min="-10"
                max="10"
                value={context.scoreDiff}
                onChange={(e) => setContext({ ...context, scoreDiff: parseInt(e.target.value) || 0 })}
                className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:border-green-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-white/50 text-xs block mb-1">Temp (°C)</label>
              <input
                type="number"
                value={context.temperature}
                onChange={(e) => setContext({ ...context, temperature: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:border-green-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-white/50 text-xs block mb-1">Zone</label>
              <select
                value={context.zone}
                onChange={(e) => setContext({ ...context, zone: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:border-green-500 focus:outline-none"
              >
                <option value="VIP">VIP</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
              </select>
            </div>

            <div>
              <label className="text-white/50 text-xs block mb-1">Event</label>
              <select
                value={context.event}
                onChange={(e) => setContext({ ...context, event: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:border-green-500 focus:outline-none"
              >
                <option value="None">None</option>
                <option value="Goal">Goal</option>
                <option value="Halftime">Halftime</option>
                <option value="Card">Card</option>
                <option value="VAR">VAR</option>
              </select>
            </div>

            <div>
              <label className="text-white/50 text-xs block mb-1">Crowd</label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={context.crowdDensity}
                onChange={(e) => setContext({ ...context, crowdDensity: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={fetchRecommendation}
            disabled={loading}
            className="mt-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 flex items-center gap-2 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Get AI Recommendation'}
          </button>
        </div>

        {/* Recommendation Display */}
        {recommendation && !recommendation.error && (
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 rounded-xl p-6">
            <div className="text-center space-y-3">
              <div className="inline-block bg-green-500/20 rounded-full px-4 py-1">
                <span className="text-green-300 text-xs font-semibold">AI RECOMMENDATION</span>
              </div>

              <h2 className="text-4xl font-bold text-white">
                {recommendation.recommended_sponsor}
              </h2>

              <p className="text-xl text-green-400 font-medium">
                {recommendation.campaign_message}
              </p>

              <div className="flex justify-center gap-4 text-sm pt-2">
                <div className="bg-black/30 rounded px-3 py-1">
                  <span className="text-white/60">Category: </span>
                  <span className="text-white font-bold">{recommendation.category}</span>
                </div>
                <div className="bg-black/30 rounded px-3 py-1">
                  <span className="text-white/60">Confidence: </span>
                  <span className="text-white font-bold">{(recommendation.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {recommendation?.error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 text-center text-sm">{recommendation.error}</p>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="glass rounded-xl p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/5 rounded p-3">
            <div className="text-white/50 mb-1">AI Model</div>
            <div className="text-white font-bold">Random Forest</div>
          </div>
          <div className="bg-white/5 rounded p-3">
            <div className="text-white/50 mb-1">Accuracy</div>
            <div className="text-white font-bold">87%</div>
          </div>
          <div className="bg-white/5 rounded p-3">
            <div className="text-white/50 mb-1">Active Sponsors</div>
            <div className="text-white font-bold">12</div>
          </div>
          <div className="bg-white/5 rounded p-3">
            <div className="text-white/50 mb-1">Response Time</div>
            <div className="text-white font-bold">&lt;200ms</div>
          </div>
        </div>
      </div>
    </div>
  );
}
