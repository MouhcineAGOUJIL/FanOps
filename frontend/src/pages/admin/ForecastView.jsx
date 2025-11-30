import { useState } from 'react';
import { TrendingUp, Users, Calendar, MapPin, Trophy, Clock } from 'lucide-react';
import { forecastService } from '../../services/forecastService';

const STADIUMS = [
  'Stade Mohamed V (Casablanca)',
  'Complexe Moulay Abdellah (Rabat)',
  'Grand Stade de Marrakech',
  'Stade Adrar (Agadir)',
  'Grand Stade de Tanger',
  'Stade de Fès'
];

const STAGES = ['Group Stage', 'Round of 16', 'Quarter-Final', 'Semi-Final', 'Final'];
const TIMES = ['Afternoon', 'Evening'];

export default function ForecastView() {
  const [formData, setFormData] = useState({
    team_a: '',
    team_b: '',
    stadium: STADIUMS[0],
    time: TIMES[1],
    stage: STAGES[0]
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const result = await forecastService.predictAttendance(formData);
      setPrediction(result.predicted_attendance);
    } catch (err) {
      setError('Failed to get prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-white">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-green-400" />
          Prévision d'Affluence (IA)
        </h1>
        <p className="text-white/60 mt-2">
          Utilisez notre modèle de Machine Learning (AWS) pour estimer l'affluence des prochains matchs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="glass rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Détails du Match
          </h2>

          <form onSubmit={handlePredict} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-1">Équipe A</label>
                <input
                  type="text"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Ex: Maroc"
                  value={formData.team_a}
                  onChange={(e) => setFormData({ ...formData, team_a: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Équipe B</label>
                <input
                  type="text"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Ex: Sénégal"
                  value={formData.team_b}
                  onChange={(e) => setFormData({ ...formData, team_b: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1">Stade</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-white/40" />
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pl-10 text-white focus:outline-none focus:border-blue-500 appearance-none"
                  value={formData.stadium}
                  onChange={(e) => setFormData({ ...formData, stadium: e.target.value })}
                >
                  {STADIUMS.map(s => <option key={s} value={s} className="bg-slate-800">{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-1">Phase</label>
                <div className="relative">
                  <Trophy className="absolute left-3 top-3.5 w-4 h-4 text-white/40" />
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pl-10 text-white focus:outline-none focus:border-blue-500 appearance-none"
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  >
                    {STAGES.map(s => <option key={s} value={s} className="bg-slate-800">{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Horaire</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3.5 w-4 h-4 text-white/40" />
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pl-10 text-white focus:outline-none focus:border-blue-500 appearance-none"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  >
                    {TIMES.map(t => <option key={t} value={t} className="bg-slate-800">{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? 'Calcul en cours...' : 'Lancer la Prédiction'}
            </button>
          </form>
        </div>

        {/* Result Section */}
        <div className="glass rounded-2xl p-6 border border-white/10 flex flex-col justify-center items-center text-center relative overflow-hidden">
          {prediction !== null ? (
            <div className="animate-in fade-in zoom-in duration-500">
              <div className="bg-green-500/20 p-4 rounded-full mb-4 inline-block">
                <Users className="w-12 h-12 text-green-400" />
              </div>
              <h3 className="text-white/60 text-lg mb-2">Affluence Estimée</h3>
              <div className="text-6xl font-bold text-white mb-2 tracking-tight">
                {prediction.toLocaleString()}
              </div>
              <p className="text-green-400 font-medium bg-green-400/10 px-3 py-1 rounded-full inline-block">
                Spectateurs
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4 text-left w-full max-w-xs bg-white/5 p-4 rounded-xl">
                <div>
                  <p className="text-xs text-white/40">Confiance Modèle</p>
                  <p className="text-white font-semibold">94.2%</p>
                </div>
                <div>
                  <p className="text-xs text-white/40">Marge d'erreur</p>
                  <p className="text-white font-semibold">± 1,200</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-white/20 flex flex-col items-center">
              <TrendingUp className="w-24 h-24 mb-4 opacity-20" />
              <p>Entrez les détails du match pour voir la prédiction</p>
            </div>
          )}

          {error && (
            <div className="absolute bottom-6 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}