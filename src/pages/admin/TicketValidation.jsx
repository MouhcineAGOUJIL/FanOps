import { useState } from 'react';
import { Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { securityService } from '../../services/securityService';

export default function TicketValidation() {
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
    </div>
  );
}