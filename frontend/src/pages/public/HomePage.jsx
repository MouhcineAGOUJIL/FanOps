import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Ticket, Activity, ArrowRight, Users, BarChart3, Lock } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-[#800000] text-white selection:bg-black selection:text-white">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-[#800000]/90 backdrop-blur-md border-b border-white/10">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
                            <Activity className="w-6 h-6 text-[#800000]" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">
                            FanOps <span className="text-white/80">Platform</span>
                        </span>
                    </div>
                    <Link
                        to="/login"
                        className="px-6 py-2.5 bg-white text-[#800000] font-bold rounded-full hover:bg-gray-100 transition-all flex items-center gap-2 shadow-lg"
                    >
                        Login <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-5xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 border border-white/10 text-white/90 mb-8 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            CAN 2025 Official Operations Platform
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                            The Complete Ecosystem for <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                                Football Event Management
                            </span>
                        </h1>

                        <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
                            From fan engagement and ticketing to real-time security and operational analytics.
                            FanOps unifies every aspect of the matchday experience.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/login"
                                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-black/20 flex items-center justify-center gap-2"
                            >
                                Access Portal
                            </Link>
                            <button className="w-full sm:w-auto px-8 py-4 bg-black/20 hover:bg-black/30 text-white font-semibold rounded-xl border border-white/10 transition-all backdrop-blur-sm">
                                View Documentation
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modules Grid */}
            <section className="py-20 bg-black/10 backdrop-blur-sm">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Integrated Modules</h2>
                        <p className="text-white/60 max-w-2xl mx-auto">
                            Three powerful pillars working in sync to deliver a seamless tournament experience.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Users className="w-8 h-8 text-[#800000]" />}
                            title="Fan Experience"
                            description="Interactive mobile app for fans to access tickets, view match stats, and receive real-time promotions."
                        />
                        <FeatureCard
                            icon={<Shield className="w-8 h-8 text-[#800000]" />}
                            title="Security & Access"
                            description="Gatekeeper tools for rapid ticket scanning, fraud detection, and crowd control management."
                        />
                        <FeatureCard
                            icon={<BarChart3 className="w-8 h-8 text-[#800000]" />}
                            title="Admin Operations"
                            description="Centralized dashboard for organizers to monitor gates, sales, and sponsor performance."
                        />
                    </div>
                </div>
            </section>

            {/* Sponsors Placeholder */}
            <section className="py-16 border-t border-white/10">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-white/40 text-sm font-semibold tracking-widest uppercase mb-8">Trusted by Global Partners</p>
                    <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Placeholders for logos */}
                        <div className="h-8 w-24 bg-white/20 rounded"></div>
                        <div className="h-8 w-24 bg-white/20 rounded"></div>
                        <div className="h-8 w-24 bg-white/20 rounded"></div>
                        <div className="h-8 w-24 bg-white/20 rounded"></div>
                        <div className="h-8 w-24 bg-white/20 rounded"></div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/10 bg-black/20">
                <div className="container mx-auto px-6 text-center text-white/40">
                    <p>&copy; 2025 FanOps Platform. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }) {
    return (
        <div className="p-8 rounded-2xl bg-white text-black hover:-translate-y-1 transition-all duration-300 shadow-xl">
            <div className="mb-6 p-4 bg-gray-100 rounded-xl inline-block">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-gray-600 leading-relaxed">
                {description}
            </p>
        </div>
    );
}
