import { useState } from 'react';
import { Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { securityService } from '../../services/securityService';
import { useStore } from '../../useStore/useStore';

export default function TicketValidation() {
  const { operationsData } = useStore();
  const recentScans = operationsData?.ticketValidation?.recentScans ?? [];
  const [ticketJWT, setTicketJWT] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleValidate = async () => {
    setLoading(true);
    try {
      const response = await securityService.verifyTicket({
        jwt: ticketJWT,
        gateId: 'G1',
        deviceId: 'scanner-01'
      });
      setResult(response);
    } catch (error) {
      setResult({ ok: false, reason: 'network_error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-white">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Shield className="w-8 h-8" />
          Validation de Billets
        </h1>
        <p className="text-white/60 mt-2">Service AWS Lambda - Secure-Gates</p>
      </div>

      <div className="glass rounded-2xl p-6">
        <label className="block text-white mb-2 font-semibold">
          Token JWT du billet
        </label>
        <textarea
          className="w-full bg-white/10 text-white border border-white/20 rounded-lg p-4 h-32 font-mono text-sm"
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          value={ticketJWT}
          onChange={(e) => setTicketJWT(e.target.value)}
        />

        <button
          onClick={handleValidate}
          disabled={loading || !ticketJWT}
          className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? 'Vérification...' : 'Valider le billet'}
        </button>
      </div>

      {result && (
        <div className={`glass rounded-2xl p-6 border-2 ${
          result.ok ? 'border-green-500' : 'border-red-500'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            {result.ok ? (
              <CheckCircle className="w-8 h-8 text-green-400" />
            ) : (
              <XCircle className="w-8 h-8 text-red-400" />
            )}
            <div>
              <h3 className="text-xl font-bold text-white">
                {result.ok ? 'Billet Valide ✓' : 'Billet Invalide ✗'}
              </h3>
              <p className="text-white/60">Raison: {result.reason}</p>
            </div>
          </div>
        </div>
      )}
      {recentScans.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h2 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Recent Scans
          </h2>
          <div className="space-y-3">
            {recentScans.map((scan) => (
              <div key={scan.jwt} className="flex flex-col rounded-xl border border-white/10 p-4 text-white/80">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="pill bg-white/10 border-white/20 text-white">{scan.gate}</span>
                  <span className={`pill ${scan.valid ? 'bg-green-600/40' : 'bg-red-600/40'} border-white/10 text-white`}>
                    {scan.valid ? 'Valid' : 'Rejected'}
                  </span>
                  <span className="text-xs uppercase tracking-[0.3em] text-white/50">{new Date(scan.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="mt-2 font-mono text-xs break-all text-white/60">{scan.jwt}</p>
                {!scan.valid && (
                  <p className="mt-1 text-sm text-red-300">
                    Reason: {scan.reason || 'unknown'}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}