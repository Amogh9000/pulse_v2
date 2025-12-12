import React, { useState, useEffect } from 'react';
import HospitalMap from '../components/digital_twin/HospitalMap';
import { motion } from 'framer-motion';

const DigitalTwin = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch Digital Twin status
    const fetchStatus = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8000/api/digital_twin/status');
            if (!response.ok) throw new Error('Failed to fetch simulation');
            const data = await response.json();
            setStatus(data);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 600000); // 10 min poll
        return () => clearInterval(interval);
    }, []);

    if (loading && !status) return <div className="h-screen flex items-center justify-center text-gray-500">Initializing Digital Twin...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

    return (
        <div className="min-h-screen bg-[#F7F9FB]">
            <header className="px-8 py-6 border-b border-gray-200/50 bg-white/50 backdrop-blur-sm sticky top-0 z-30">
                <div className="flex justify-between items-center max-w-6xl mx-auto w-full">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Digital Twin</h1>
                        <p className="text-sm text-gray-500 mt-1">Real-time Hospital Operations Simulation</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={fetchStatus}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            Refresh Map
                        </button>
                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Live Simulation
                        </div>
                    </div>
                </div>
            </header>

            <main className="py-8 animate-fade-in">
                {status && <HospitalMap departments={status.departments} />}
            </main>
        </div>
    );
};

export default DigitalTwin;
