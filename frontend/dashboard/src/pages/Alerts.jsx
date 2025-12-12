import { useState, useEffect } from 'react';
import { BellIcon, CheckCircleIcon, ShieldAlertIcon, ActivityIcon, PlusIcon, FilterIcon, ChevronDownIcon } from '../components/icons/CustomIcons';
import axios from 'axios';

const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [summary, setSummary] = useState(null);
    const [filter, setFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    const fetchAlerts = async () => {
        try {
            // Trigger generation first for demo purposes to ensure we have fresh data
            await axios.post('http://localhost:8000/api/alerts/generate');

            const [listRes, summaryRes] = await Promise.all([
                axios.get(`http://localhost:8000/api/alerts/list?category=${filter}`),
                axios.get('http://localhost:8000/api/alerts/summary')
            ]);

            setAlerts(listRes.data);
            setSummary(summaryRes.data);
        } catch (error) {
            console.error("Error fetching alerts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
        // Poll every 30s
        const interval = setInterval(fetchAlerts, 30000);
        return () => clearInterval(interval);
    }, [filter]);

    const handleResolve = async (id, e) => {
        e.stopPropagation();
        try {
            await axios.post(`http://localhost:8000/api/alerts/resolve/${id}`);
            // Optimistic update
            setAlerts(prev => prev.filter(a => a.id !== id));
            // Refetch summary
            const summaryRes = await axios.get('http://localhost:8000/api/alerts/summary');
            setSummary(summaryRes.data);
        } catch (error) {
            console.error("Failed to resolve:", error);
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="p-8 space-y-8 animate-slide-in pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-red-600 shadow-sm border border-red-100">
                        <BellIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                            Incident Command Center
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        </h1>
                        <p className="text-gray-500 text-sm">Real-time operational alerts and response tracking.</p>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard label="Active Incidents" value={summary?.total_active || 0} color="red" icon={<BellIcon />} />
                <SummaryCard label="Critical" value={summary?.critical || 0} color="red" icon={<ShieldAlertIcon />} />
                <SummaryCard label="High Priority" value={summary?.high || 0} color="orange" icon={<ActivityIcon />} />
                <SummaryCard label="Resolved Today" value="12" color="green" icon={<CheckCircleIcon />} />
            </div>

            {/* Main Content */}
            <div className="card-glass overflow-hidden min-h-[500px]">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between sticky top-0 backdrop-blur-sm z-10">
                    <div className="flex gap-2">
                        {['All', 'Staffing', 'Surge', 'Supply', 'Environment'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${filter === cat ? 'bg-white shadow-sm text-gray-900 border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <button className="text-xs font-medium text-gray-400 flex items-center gap-1 hover:text-gray-600">
                        <FilterIcon className="w-3 h-3" /> Filter View
                    </button>
                </div>

                {/* Alert Feed */}
                <div className="divide-y divide-gray-100">
                    {loading ? (
                        <div className="p-8 text-center text-gray-400">Loading incidents...</div>
                    ) : alerts.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                                <CheckCircleIcon className="w-8 h-8" />
                            </div>
                            <h3 className="text-gray-900 font-bold">All Clear</h3>
                            <p className="text-gray-500 text-sm mt-1">No active incidents requiring attention.</p>
                        </div>
                    ) : (
                        alerts.map(alert => (
                            <div
                                key={alert.id}
                                onClick={() => toggleExpand(alert.id)}
                                className={`group p-4 transition-all cursor-pointer hover:bg-gray-50 ${expandedId === alert.id ? 'bg-gray-50' : ''}`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon Column */}
                                    <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center border ${getLevelStyles(alert.level).icon}`}>
                                        <AlertIcon category={alert.category} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getLevelStyles(alert.level).badge}`}>
                                                        {alert.level}
                                                    </span>
                                                    <span className="text-xs text-gray-400 font-medium uppercase">{alert.category}</span>
                                                </div>
                                                <h3 className="text-base font-bold text-gray-900">{alert.message}</h3>
                                                <p className="text-sm text-gray-600 mt-1">{alert.trigger_cause}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs text-gray-400 font-mono">Just now</span>
                                                <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => handleResolve(alert.id, e)}
                                                        className="px-3 py-1.5 bg-white border border-gray-200 shadow-sm rounded-lg text-xs font-semibold text-gray-700 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-all flex items-center gap-1"
                                                    >
                                                        <CheckCircleIcon className="w-3 h-3" /> Resolve
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Context */}
                                        <div className={`grid transition-all duration-300 ease-in-out overflow-hidden ${expandedId === alert.id ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}>
                                            <div className="min-h-0 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">AI Reasoning Trace</h4>
                                                        <ul className="space-y-2">
                                                            {(alert.reasoning_trace || []).map((step, i) => (
                                                                <li key={i} className="text-sm text-gray-600 flex gap-2">
                                                                    <span className="text-blue-400 select-none">•</span>
                                                                    {step}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Recommended Actions</h4>
                                                        <ul className="space-y-2">
                                                            {(alert.recommended_actions || []).map((action, i) => (
                                                                <li key={i} className="flex items-center gap-2 text-sm font-medium text-gray-800 bg-gray-50 p-2 rounded border border-gray-100">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                                    {action}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

// Helpers
const getLevelStyles = (level) => {
    switch (level) {
        case 'Critical': return { badge: 'bg-red-100 text-red-700', icon: 'bg-red-50 border-red-100 text-red-600' };
        case 'High': return { badge: 'bg-orange-100 text-orange-700', icon: 'bg-orange-50 border-orange-100 text-orange-600' };
        case 'Medium': return { badge: 'bg-yellow-100 text-yellow-700', icon: 'bg-yellow-50 border-yellow-100 text-yellow-600' };
        default: return { badge: 'bg-gray-100 text-gray-600', icon: 'bg-gray-50 border-gray-100 text-gray-500' };
    }
};

const AlertIcon = ({ category }) => {
    switch (category) {
        case 'Staffing': return <ActivityIcon className="w-5 h-5" />;
        case 'Supply': return <BellIcon className="w-5 h-5" />; // Replace with Package if available
        case 'Environment': return <ShieldAlertIcon className="w-5 h-5" />;
        default: return <BellIcon className="w-5 h-5" />;
    }
};

const SummaryCard = ({ label, value, color, icon }) => (
    <div className="card-glass p-4 flex items-center justify-between">
        <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center opacity-80 bg-${color}-50 text-${color}-600`}>
            {icon}
        </div>
    </div>
);

export default Alerts;
