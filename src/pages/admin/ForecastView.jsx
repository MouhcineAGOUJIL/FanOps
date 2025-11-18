import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { forecastService } from '../../services/forecastService';
import { useStore } from '../../useStore/useStore';

export default function ForecastView() {
  const { operationsData } = useStore();
  const [forecast, setForecast] = useState(operationsData?.forecast?.series ?? []);

  useEffect(() => {
    if (operationsData?.forecast?.series) {
      setForecast(operationsData.forecast.series);
      return;
    }

    const fetchForecast = async () => {
      const data = await forecastService.getAttendanceForecast('CAN2025-MAR-G1');
      setForecast(data.series);
    };
    fetchForecast();
  }, [operationsData]);

  return (
    <div className="space-y-6">
      <div className="text-white">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <TrendingUp className="w-8 h-8" />
          Prévision d'Affluence
        </h1>
        <p className="text-white/60 mt-2">ML Model - Google Cloud Platform</p>
      </div>

      <div className="glass rounded-2xl p-6">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={forecast}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="t" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.2)' 
              }} 
            />
            <Line 
              type="monotone" 
              dataKey="yhat" 
              stroke="#22c55e" 
              strokeWidth={3}
              dot={{ fill: '#22c55e', r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}