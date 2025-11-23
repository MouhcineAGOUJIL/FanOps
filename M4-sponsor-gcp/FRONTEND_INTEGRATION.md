# 🎯 M4 Sponsor AI - Frontend Integration Guide

## Overview
M4 is the AI-powered sponsor recommendation service deployed on **Google Cloud Functions**. It uses Machine Learning to recommend the best sponsor based on real-time match context.

### Production URL
```
https://europe-west1-can2025-fanops.cloudfunctions.net/m4-sponsor-ai
```

---

## 📡 API Integration

### Request Format
```javascript
POST https://europe-west1-can2025-fanops.cloudfunctions.net/m4-sponsor-ai
Content-Type: application/json

{
  "match_minute": 45,        // 0-120 (required for context)
  "score_diff": 0,            // -10 to +10 (score difference)
  "temperature": 28.5,        // °C (weather context)
  "crowd_density": 0.85,      // 0.0-1.0 (stadium fullness)
  "zone": "VIP",              // "VIP", "North", "South", "East", "West" (REQUIRED)
  "event": "Halftime"         // "None", "Goal", "Card", "VAR", "Halftime", etc.
}
```

### Response Format
```javascript
{
  "recommended_sponsor": "Sidi Ali",
  "confidence": 0.92,
  "campaign_message": "Rafraîchissez-vous avec Sidi Ali !",
  "category": "Beverage",
  "context_used": { /* echoes your input */ }
}
```

---

## 🔧 Frontend Implementation

### Step 1: Update Environment Variable

Add M4 URL to your `.env.local`:

```bash
# frontend/.env.local
VITE_API_URL=http://localhost:3000/dev
VITE_MOCK_MODE=false
VITE_M4_SPONSOR_URL=https://europe-west1-can2025-fanops.cloudfunctions.net/m4-sponsor-ai
```

### Step 2: Create Sponsor Service

Create or update `frontend/src/services/sponsorService.js`:

```javascript
import axios from 'axios';

const M4_API_URL = import.meta.env.VITE_M4_SPONSOR_URL || 
  'https://europe-west1-can2025-fanops.cloudfunctions.net/m4-sponsor-ai';

export const sponsorService = {
  // Get AI-powered sponsor recommendation
  getRecommendation: async (context) => {
    try {
      const response = await axios.post(M4_API_URL, {
        match_minute: context.matchMinute || 0,
        score_diff: context.scoreDiff || 0,
        temperature: context.temperature || 25,
        crowd_density: context.crowdDensity || 0.7,
        zone: context.zone || 'North',
        event: context.event || 'None'
      });
      
      return response.data;
    } catch (error) {
      console.error('M4 API Error:', error);
      throw error;
    }
  },

  // Get recommendation for specific zone
  getZoneRecommendation: async (matchData, zone) => {
    return sponsorService.getRecommendation({
      matchMinute: matchData.minute,
      scoreDiff: matchData.homeScore - matchData.awayScore,
      temperature: matchData.weather?.temperature,
      crowdDensity: matchData.attendance / matchData.capacity,
      zone: zone,
      event: matchData.lastEvent || 'None'
    });
  }
};
```

### Step 3: Update Sponsor Analytics Page

Update `frontend/src/pages/admin/SponsorAnalytics.jsx`:

```javascript
import { useState, useEffect } from 'react';
import { sponsorService } from '../../services/sponsorService';
import { TrendingUp } from 'lucide-react';

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendation();
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-white">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <TrendingUp className="w-8 h-8" />
          AI Sponsor Recommendations
        </h1>
        <p className="text-white/60 mt-2">Powered by M4 (Google Cloud)</p>
      </div>

      {/* Context Controls */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4">Match Context</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="text-white/70 text-sm">Minute</label>
            <input
              type="number"
              value={context.matchMinute}
              onChange={(e) => setContext({...context, matchMinute: parseInt(e.target.value)})}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="text-white/70 text-sm">Temperature (°C)</label>
            <input
              type="number"
              value={context.temperature}
              onChange={(e) => setContext({...context, temperature: parseFloat(e.target.value)})}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="text-white/70 text-sm">Zone</label>
            <select
              value={context.zone}
              onChange={(e) => setContext({...context, zone: e.target.value})}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
            >
              <option value="VIP">VIP</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
              <option value="West">West</option>
            </select>
          </div>
        </div>
        <button
          onClick={fetchRecommendation}
          disabled={loading}
          className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Get Recommendation'}
        </button>
      </div>

      {/* Recommendation Display */}
      {recommendation && (
        <div className="glass rounded-2xl p-8 border-2 border-green-500/50">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-2">
              {recommendation.recommended_sponsor}
            </h2>
            <p className="text-xl text-green-400 mb-4">
              {recommendation.campaign_message}
            </p>
            <div className="flex justify-center gap-4 text-sm text-white/70">
              <span>Category: {recommendation.category}</span>
              <span>Confidence: {(recommendation.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 🎨 Example Use Cases

### 1. Real-Time Match Display
Show sponsor ads dynamically during the match:

```javascript
// In a stadium display component
useEffect(() => {
  const updateSponsor = async () => {
    const matchData = await getMatchData();
    const sponsor = await sponsorService.getZoneRecommendation(matchData, 'VIP');
    displayBanner(sponsor.campaign_message);
  };
  
  // Update every 30 seconds
  const interval = setInterval(updateSponsor, 30000);
  return () => clearInterval(interval);
}, []);
```

### 2. Admin Dashboard
Show what sponsor is currently recommended for each zone:

```javascript
const zones = ['VIP', 'North', 'South', 'East', 'West'];
const [recommendations, setRecommendations] = useState({});

useEffect(() => {
  const fetchAll = async () => {
    const results = {};
    for (const zone of zones) {
      results[zone] = await sponsorService.getRecommendation({
        matchMinute: currentMin, zone, temperature: 28
      });
    }
    setRecommendations(results);
  };
  fetchAll();
}, [currentMin]);
```

### 3. Testing Different Scenarios
```javascript
// Test: Hot day, halftime
const hotDayReco = await sponsorService.getRecommendation({
  zone: 'North',
  temperature: 35,
  event: 'Halftime',
  matchMinute: 45
});
// Expected: Sidi Ali (beverage for heat)

// Test: Goal scored, winning
const goalReco = await sponsorService.getRecommendation({
  zone: 'South',
  event: 'Goal',
  scoreDiff: 1,
  matchMinute: 89
});
// Expected: Puma or Adidas (sports celebration)
```

---

## 🚀 Quick Test

### Test in Browser Console
```javascript
// Open your frontend (http://localhost:5173)
// Open browser console and run:

fetch('https://europe-west1-can2025-fanops.cloudfunctions.net/m4-sponsor-ai', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    zone: 'VIP',
    temperature: 35,
    event: 'Halftime',
    match_minute: 45
  })
})
.then(r => r.json())
.then(d => console.log('✅ Sponsor:', d.recommended_sponsor, '-',  d.campaign_message));
```

### Test with cURL
```bash
curl -X POST https://europe-west1-can2025-fanops.cloudfunctions.net/m4-sponsor-ai \
  -H "Content-Type: application/json" \
  -d '{"zone":"VIP","temperature":35,"event":"Halftime","match_minute":45}'
```

---

## 📊 Available Sponsors

| Sponsor | Category | Best Context |
|---------|----------|--------------|
| **Sidi Ali** | Beverage | Hot weather (>30°C) |
| **Coca-Cola** | Beverage | Halftime, breaks |
| **Orange** | Telecom | VIP zones |
| **Inwi** | Telecom | General zones |
| **Puma** | Sports | Goals, wins |
| **Adidas** | Sports | Competitive moments |
| **Royal Air Maroc** | Travel | VIP zones |
| **OCP** | Industry | VIP zones |
| **Koutoubia** | Hospitality | Halftime |
| **CDG** | Finance | VIP, business zones |
| **Hyundai** | Automotive | Parking zones |
| **Visa** | Finance | Payment contexts |

---

## ⚡ Performance Tips

1. **Cache recommendations** - Don't call API every second
2. **Batch requests** - Get all zones at once if needed
3. **Handle errors gracefully** - Show fallback sponsor if API fails
4. **Monitor latency** - Cold start ~3s, warm ~200ms

---

## 🔒 CORS & Security

- ✅ CORS enabled - Works from any domain
- ✅ No authentication required (for demo)
- 🔐 Production: Add API key for security

---

## 📝 Next Steps

1. **Add to frontend** - Update `sponsorService.js`
2. **Update Sponsor page** - Show live recommendations
3. **Test scenarios** - Try different weather/events
4. **Display in UI** - Show sponsor banners dynamically
