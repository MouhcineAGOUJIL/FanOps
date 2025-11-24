import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Ticket, Activity, ArrowRight, Users, BarChart3 } from 'lucide-react';
import cafLogo from '../../assets/afcon2025_logo.png';

export default function HomePage() {
    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Moroccan Zelij Pattern Background */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-red-900 via-red-800 to-red-950"
                style={{
                    backgroundImage: `url('/moroccan_zelij_red_1763840057262.png')`,
                    backgroundSize: '400px 400px',
                    backgroundRepeat: 'repeat',
                    opacity: 0.2
                }}
            />
            {/* Overlay gradient for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-red-950/50 via-transparent to-red-950/80" />

            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-[#8B0000] backdrop-blur-md border-b border-white/10 relative">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img
                            src={cafLogo}
                            alt="AFCON 2025"
                            className="h-12 w-auto"
                            style={{
                                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                            }}
                        />
                        <div>
                            <p className="text-white/60 text-xs uppercase tracking-wider">TotalEnergies</p>
                            <h1 className="text-white text-lg font-bold uppercase tracking-tight">AFCON 2025 FanOps</h1>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="hidden md:flex items-center gap-6">
                        <a href="/" className="text-white text-sm font-semibold hover:text-white/80 transition-colors">HOME</a>
                        <a href="https://www.cafonline.com/afcon2025/news/" target="_blank" rel="noopener noreferrer" className="text-white text-sm font-semibold hover:text-white/80 transition-colors">NEWS</a>
                        <a href="https://www.cafonline.com/afcon2025/videos/" target="_blank" rel="noopener noreferrer" className="text-white text-sm font-semibold hover:text-white/80 transition-colors">VIDEOS</a>
                        <a href="https://www.cafonline.com/media/epqkudrg/match-schedule_totalenergies-caf-africa-cup-of-nations_morocco25.pdf" target="_blank" rel="noopener noreferrer" className="text-white text-sm font-semibold hover:text-white/80 transition-colors">CALENDAR</a>
                        <a href="https://www.cafonline.com/afcon2025/volunteers/" target="_blank" rel="noopener noreferrer" className="text-white text-sm font-semibold hover:text-white/80 hover:border-b-2 hover:border-green-500 pb-1 transition-all">VOLUNTEERS</a>
                        <a href="https://www.cafonline.com/afconjobs/" target="_blank" rel="noopener noreferrer" className="text-white text-sm font-semibold hover:text-white/80 transition-colors">JOBS</a>
                        <a href="https://www.cafonline.com/afcon2025/qualifiers/" target="_blank" rel="noopener noreferrer" className="text-white text-sm font-semibold hover:text-white/80 transition-colors">QUALIFIERS</a>
                        <a href="https://www.cafonline.com/afcon2025/archive/2023/" target="_blank" rel="noopener noreferrer" className="text-white text-sm font-semibold hover:text-white/80 transition-colors">ARCHIVE</a>
                    </nav>

                    <Link
                        to="/login"
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded transition-all"
                    >
                        LOGIN
                    </Link>
                </div>
            </header>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-6 pt-32 pb-16">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="inline-block mb-6 px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                        <p className="text-white/90 text-sm font-medium">CAN 2025 • Morocco</p>
                    </div>

                    <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
                        FanOps
                        <span className="block text-5xl md:text-6xl bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent mt-2">
                            Management Platform
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-8">
                        Comprehensive multi-cloud system for managing fan experiences, security operations,
                        and administrative oversight for CAN 2025
                    </p>

                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                        Access Portal
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
                    <FeatureCard
                        icon={<Users className="w-8 h-8" />}
                        title="Fan Experience"
                        description="M1 Flow (Azure) - Personalized journey from ticket purchase to post-event engagement"
                        color="blue"
                    />
                    <FeatureCard
                        icon={<Shield className="w-8 h-8" />}
                        title="Security Gates"
                        description="M2 Secure-Gates (AWS) - JWT-based ticket validation and real-time threat detection"
                        color="red"
                    />
                    <FeatureCard
                        icon={<BarChart3 className="w-8 h-8" />}
                        title="Forecasting"
                        description="M3 Forecast (GCP) - AI-powered attendance prediction and resource optimization"
                        color="purple"
                    />
                    <FeatureCard
                        icon={<Ticket className="w-8 h-8" />}
                        title="Sponsor Analytics"
                        description="M4 Sponsors (GCP) - ROI tracking and engagement metrics for partners"
                        color="green"
                    />
                </div>

                {/* Tech Stack */}
                <div className="text-center">
                    <p className="text-white/60 text-sm mb-4">Powered by Multi-Cloud Architecture</p>
                    <div className="flex flex-wrap justify-center gap-6 text-white/50 text-sm">
                        <span className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">Azure</span>
                        <span className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">AWS Lambda</span>
                        <span className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">Google Cloud</span>
                        <span className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">React</span>
                        <span className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">DynamoDB</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 bg-red-950/95">
                {/* Sponsor Sections */}
                <div className="container mx-auto px-6 py-12">
                    {/* Official Title Sponsor */}
                    <div className="text-center mb-12">
                        <div className="text-xs text-white/60 tracking-widest uppercase mb-4 border-b border-white/10 inline-block pb-2 px-8">
                            Official Title Sponsor
                        </div>
                        <div className="flex justify-center">
                            <div className="bg-white/90 rounded-lg px-8 py-4 shadow-lg">
                                <div className="text-2xl font-bold text-red-900">CAN 2025</div>
                            </div>
                        </div>
                    </div>

                    {/* Official Global Partners */}
                    <div className="text-center mb-12">
                        <div className="text-xs text-white/60 tracking-widest uppercase mb-6">
                            Official Global Partners
                        </div>
                        <div className="flex flex-wrap justify-center gap-6">
                            {['Azure', 'AWS', 'GCP', 'React', 'DynamoDB', 'Node.js', 'Serverless'].map((partner, i) => (
                                <div key={i} className="bg-white/90 rounded-lg px-6 py-3 shadow-md hover:shadow-xl transition-shadow">
                                    <div className="text-sm font-semibold text-gray-800">{partner}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Official Competition Sponsors */}
                    <div className="text-center mb-12">
                        <div className="text-xs text-white/60 tracking-widest uppercase mb-6">
                            Official Competition Sponsors
                        </div>
                        <div className="flex flex-wrap justify-center gap-6">
                            {['MongoDB', 'Redis', 'PostgreSQL', 'Nginx', 'Docker'].map((sponsor, i) => (
                                <div key={i} className="bg-white/90 rounded-lg px-6 py-3 shadow-md hover:shadow-xl transition-shadow">
                                    <div className="text-sm font-semibold text-gray-800">{sponsor}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-12 mt-8">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
                            {/* Platform */}
                            <div>
                                <h3 className="text-white font-semibold text-sm mb-4">Platform</h3>
                                <ul className="space-y-2 text-white/60 text-sm">
                                    <li><a href="#" className="hover:text-white transition-colors">Fan Experience</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Security Gates</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Admin Dashboard</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
                                </ul>
                            </div>

                            {/* About */}
                            <div>
                                <h3 className="text-white font-semibold text-sm mb-4">About</h3>
                                <ul className="space-y-2 text-white/60 text-sm">
                                    <li><a href="#" className="hover:text-white transition-colors">CAN History</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">CAN President</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Organization</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Legal</a></li>
                                </ul>
                            </div>

                            {/* Official Documents */}
                            <div>
                                <h3 className="text-white font-semibold text-sm mb-4">Official Documents</h3>
                                <ul className="space-y-2 text-white/60 text-sm">
                                    <li><a href="#" className="hover:text-white transition-colors">Regulations</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Medical</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Statutes</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Licensing</a></li>
                                </ul>
                            </div>

                            {/* Development */}
                            <div>
                                <h3 className="text-white font-semibold text-sm mb-4">Development</h3>
                                <ul className="space-y-2 text-white/60 text-sm">
                                    <li><a href="#" className="hover:text-white transition-colors">Club Licensing</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Refereeing</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Safety & Security</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Medical</a></li>
                                </ul>
                            </div>

                            {/* Connect */}
                            <div>
                                <h3 className="text-white font-semibold text-sm mb-4">Connect with us</h3>
                                <div className="flex gap-3">
                                    <a href="#" className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center transition-colors">
                                        <span className="text-white text-xs">𝕏</span>
                                    </a>
                                    <a href="#" className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center transition-colors">
                                        <span className="text-white text-xs">f</span>
                                    </a>
                                    <a href="#" className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center transition-colors">
                                        <span className="text-white text-xs">in</span>
                                    </a>
                                    <a href="#" className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center transition-colors">
                                        <span className="text-white text-xs">▶</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="text-center text-white/40 text-xs pt-6 border-t border-white/10">
                            <p>&copy; 2025 FanOps Platform • CAN 2025 Morocco • All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description, color }) {
    const colorClasses = {
        blue: 'border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/10 bg-blue-500/5',
        red: 'border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10 bg-red-500/5',
        purple: 'border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/10 bg-purple-500/5',
        green: 'border-green-500/30 hover:border-green-500/50 hover:bg-green-500/10 bg-green-500/5'
    };

    return (
        <div className={`p-6 rounded-2xl border backdrop-blur-sm transition-all hover:scale-105 ${colorClasses[color]}`}>
            <div className="mb-4 text-white">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-white/70">{description}</p>
        </div>
    );
}
