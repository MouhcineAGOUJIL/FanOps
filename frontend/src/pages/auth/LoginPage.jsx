import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Lock, User, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await authService.login(username, password);

            if (result.token) {
                const role = result.user.role;
                if (role === 'admin') {
                    navigate('/admin');
                } else if (role === 'gatekeeper') {
                    navigate('/gatekeeper');
                } else {
                    navigate('/fan');
                }
            } else {
                setError(result.message || 'Login failed');
            }
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError('Invalid credentials');
            } else {
                setError('Connection error. Please try again.');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Moroccan Tile Pattern */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `url('/moroccan_zelij_red_1763840057262.png')`,
                    backgroundSize: '400px 400px',
                    backgroundRepeat: 'repeat',
                    opacity: 0.15
                }}
            />
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900" />

            <div className="w-full max-w-md bg-[#0a0a0a] border border-red-900/30 rounded-2xl p-8 shadow-2xl relative z-10">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-900/20 transform rotate-3">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Secure Access</h1>
                    <p className="text-gray-500 mt-2 text-sm">Authorized Personnel Only</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-6 text-sm text-center flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Username</label>
                        <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-red-500 transition-colors" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-[#111] border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder-gray-700 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                                placeholder="Enter your ID"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-red-500 transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#111] border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder-gray-700 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-900/20 mt-8"
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                        {!loading && <ArrowRight className="w-4 h-4" />}
                    </button>
                </form>
            </div>
        </div>
    );
}
