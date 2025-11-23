import { useState } from 'react';
import { Scan, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { securityService } from '../../services/securityService';
import successAudio from '../../assets/DimaMaghriboutput.mp3';

export default function ScanPage() {
    const [ticketJWT, setTicketJWT] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [gatekeeperId] = useState('GK-001'); // Mock ID for now

    const playSuccessSound = () => {
        const audio = new Audio(successAudio);
        audio.volume = 0.7;
        audio.play().catch(err => console.log('Audio playback failed:', err));
    };

    const handleScan = async () => {
        setLoading(true);
        setResult(null);
        try {
            const response = await securityService.verifyTicket({
                jwt: ticketJWT,
                gateId: 'G1',
                deviceId: 'scanner-01',
                gatekeeperId
            });
            setResult(response);

            // Play success sound if ticket is valid
            if (response.ok) {
                playSuccessSound();
            }
        } catch (error) {
            setResult({ ok: false, reason: 'network_error', message: 'Erreur de connexion' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-white">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Scan className="w-8 h-8" />
                    Scanner de Billets
                </h1>
                <p className="text-white/60 mt-2">Interface Gatekeeper - Portique G1</p>
            </div>

            <div className="glass rounded-2xl p-6">
                <label className="block text-white mb-2 font-semibold">
                    Scanner un billet (JWT)
                </label>
                <textarea
                    className="w-full bg-white/10 text-white border border-white/20 rounded-lg p-4 h-32 font-mono text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    placeholder="Scanner le QR Code..."
                    value={ticketJWT}
                    onChange={(e) => setTicketJWT(e.target.value)}
                />

                <button
                    onClick={handleScan}
                    disabled={loading || !ticketJWT}
                    className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                    {loading ? 'Vérification...' : 'VÉRIFIER LE BILLET'}
                </button>
            </div>

            {result && (
                <div className={`glass rounded-2xl p-8 border-4 ${result.ok ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'
                    } animate-in fade-in slide-in-from-bottom-4 duration-300`}>
                    <div className="flex flex-col items-center text-center gap-4">
                        {result.ok ? (
                            <>
                                <CheckCircle className="w-24 h-24 text-green-400" />
                                <div>
                                    <h2 className="text-4xl font-bold text-white mb-2">ACCÈS AUTORISÉ</h2>
                                    <p className="text-green-200 text-xl">{result.message}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 w-full mt-4">
                                    <div className="bg-white/10 p-3 rounded-lg">
                                        <p className="text-xs text-white/60 uppercase">Siège</p>
                                        <p className="text-xl font-mono text-white">{result.seatNumber}</p>
                                    </div>
                                    <div className="bg-white/10 p-3 rounded-lg">
                                        <p className="text-xs text-white/60 uppercase">Match</p>
                                        <p className="text-xl font-mono text-white">{result.matchId}</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <XCircle className="w-24 h-24 text-red-400" />
                                <div>
                                    <h2 className="text-4xl font-bold text-white mb-2">ACCÈS REFUSÉ</h2>
                                    <p className="text-red-200 text-xl">{result.message}</p>
                                </div>
                                <div className="bg-red-500/20 p-4 rounded-xl w-full mt-4 flex items-center justify-center gap-2">
                                    <AlertTriangle className="w-6 h-6 text-red-300" />
                                    <span className="text-red-200 font-mono">Raison: {result.reason}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
