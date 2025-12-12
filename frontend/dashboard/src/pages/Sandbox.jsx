import { useState, useEffect } from 'react';
import { LabIcon, ChevronDownIcon, CheckIcon, SparklesIcon, SaveIcon, RotateCwIcon } from '../components/icons/CustomIcons';
import ForecastChart from '../components/ForecastChart';
import axios from 'axios';

const Sandbox = () => {
    // 1. Simulation Parameter State
    const [params, setParams] = useState({
        horizon: 7,
        aqi: 150,
        festival_mode: false,
        rain_impact: false,
        accident_surge_prob: 0.0,
        staff_shortage: "None",
        icu_stress: false
    });

    const [loading, setLoading] = useState(false);
    const [simulationData, setSimulationData] = useState(null);
    const [scenarios, setScenarios] = useState([]);

    // Initial fetch to get scenarios
    useEffect(() => {
        // fetchScenarios(); // Uncomment when API ready
        // Simulate initial run
        handleSimulate();
    }, []);

    const handleSimulate = async () => {
        setLoading(true);
        try {
            // Call backend API
            const response = await axios.post('http://localhost:8000/sandbox/simulate', params);
            setSimulationData(response.data);
        } catch (err) {
            console.error("Simulation failed:", err);
            // Fallback mock data for design preview if backend fails
            setSimulationData(getMockSimulationData(params));
        } finally {
            setLoading(false);
        }
    };

    // Debounce simulation trigger on param change? 
    // For now, let's use a "Run Simulation" button or effect with debounce
    // User requested "triggers live recalculation" -> Effect
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSimulate();
        }, 500); // 500ms debounce
        return () => clearTimeout(timer);
    }, [params]);


    const updateParam = (key, value) => {
        setParams(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="p-8 space-y-8 animate-slide-in pb-24">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-2xl blur opacity-30 animate-pulse"></div>
                        <div className="relative w-12 h-12 rounded-xl bg-white flex items-center justify-center text-purple-600 shadow-sm border border-purple-100">
                            <LabIcon className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                            Scenario Simulator
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider border border-blue-100">Sandbox</span>
                        </h1>
                        <p className="text-gray-500 text-sm">Run what-if simulations to predict surge effects.</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                        <RotateCwIcon className="w-4 h-4" /> Reset
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200">
                        <SaveIcon className="w-4 h-4" /> Save Scenario
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* A. Controls Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card-glass p-6 relative overflow-hidden">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                            Inputs
                        </h3>

                        {/* Forecast Horizon */}
                        <ControlGroup label="Forecast Horizon">
                            <div className="flex justify-between text-xs mb-2">
                                <span className="font-medium text-gray-700">3 Days</span>
                                <span className="font-bold text-blue-600 bg-blue-50 px-2 rounded">{params.horizon} Days</span>
                                <span className="font-medium text-gray-700">14 Days</span>
                            </div>
                            <input type="range" min="3" max="14" value={params.horizon} onChange={(e) => updateParam('horizon', parseInt(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                        </ControlGroup>

                        {/* AQI Override */}
                        <ControlGroup label="AQI Level">
                            <div className="flex justify-between text-xs mb-2">
                                <span className="font-medium text-gray-700">Clean</span>
                                <span className={`font-bold px-2 rounded ${params.aqi > 200 ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>{params.aqi} AQI</span>
                                <span className="font-medium text-gray-700">Hazardous</span>
                            </div>
                            <input type="range" min="0" max="500" value={params.aqi} onChange={(e) => updateParam('aqi', parseInt(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                        </ControlGroup>

                        {/* Accident Surge */}
                        <ControlGroup label="Accident Probability">
                            <div className="flex justify-between text-xs mb-2">
                                <span className="font-medium text-gray-700">Low</span>
                                <span className="font-bold text-orange-600">{(params.accident_surge_prob * 100).toFixed(0)}%</span>
                                <span className="font-medium text-gray-700">High</span>
                            </div>
                            <input type="range" min="0" max="1" step="0.1" value={params.accident_surge_prob} onChange={(e) => updateParam('accident_surge_prob', parseFloat(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                        </ControlGroup>

                        <hr className="border-gray-100 my-6" />

                        {/* Toggles */}
                        <div className="space-y-4">
                            <Toggle label="Festival Mode" checked={params.festival_mode} onChange={(v) => updateParam('festival_mode', v)} />
                            <Toggle label="Rain Impact" checked={params.rain_impact} onChange={(v) => updateParam('rain_impact', v)} />
                            <Toggle label="ICU Stress" checked={params.icu_stress} onChange={(v) => updateParam('icu_stress', v)} color="peer-checked:bg-red-500" />
                        </div>

                        <hr className="border-gray-100 my-6" />

                        {/* Staff Shortage */}
                        <ControlGroup label="Staff Availability">
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                {['None', 'Mild', 'Severe'].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => updateParam('staff_shortage', opt)}
                                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${params.staff_shortage === opt ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </ControlGroup>
                    </div>

                    {/* Saved Scenarios */}
                    <div className="card-glass p-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Scenarios</h3>
                        <div className="flex flex-wrap gap-2">
                            <ScenarioChip label="Diwali Surge" onClick={() => setParams({ ...params, festival_mode: true, aqi: 350, horizon: 7 })} />
                            <ScenarioChip label="Monsoon" onClick={() => setParams({ ...params, rain_impact: true, accident_surge_prob: 0.8, horizon: 5 })} />
                            <ScenarioChip label="Staff Crisis" onClick={() => setParams({ ...params, staff_shortage: 'Severe', icu_stress: true })} />
                        </div>
                    </div>
                </div>

                {/* B. Forecast Output & C. Actions */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Main Chart Card */}
                    <div className="card-glass p-1 relative overflow-hidden bg-white/40 min-h-[500px]">
                        <div className="absolute inset-0 bg-grid-dots opacity-30 pointer-events-none"></div>
                        <div className="relative h-full bg-white/60 p-6 rounded-2xl backdrop-blur-sm border border-white/40 shadow-inner flex flex-col">
                            {/* Chart Component */}
                            <div className="flex-1 min-h-[400px]">
                                {simulationData ? (
                                    <ForecastChart data={simulationData.forecast.dates.map((d, i) => ({
                                        ds: d,
                                        yhat: simulationData.forecast.predicted[i],
                                        yhat_lower: simulationData.forecast.lower[i],
                                        yhat_upper: simulationData.forecast.upper[i]
                                    }))} />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 font-medium animate-pulse">Initializing Simulation...</div>
                                )}
                            </div>

                            {/* Key Stats Row */}
                            <div className="grid grid-cols-4 gap-4 mt-6">
                                <StatBox label="Peak Date" value={simulationData?.peak_date} />
                                <StatBox label="Peak Admissions" value={Math.round(simulationData?.peak_value || 0)} unit="/day" />
                                <StatBox label="Severity" value={simulationData?.severity} pillColor={simulationData?.severity === 'Critical' ? 'red' : 'yellow'} />
                                <StatBox label="Confidence" value="95%" />
                            </div>
                        </div>
                    </div>

                    {/* AI Action Panel */}
                    {simulationData?.actions && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recommendations */}
                            <div className="card-glass p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-full bg-gradient-purple p-[1px]">
                                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-purple-600">
                                            <SparklesIcon className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">AI Recommendations</h3>
                                </div>

                                <div className="space-y-4">
                                    {Object.entries(simulationData.actions).map(([category, items]) => (
                                        items.length > 0 && (
                                            <div key={category} className="space-y-2">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{category}</h4>
                                                {items.map((action, i) => (
                                                    <div key={i} className="flex items-start gap-3 p-3 bg-white/50 rounded-lg border border-white/60 shadow-sm transition-lift hover:bg-white/80">
                                                        <div className={`mt-1 w-2 h-2 rounded-full ${category === 'staffing' ? 'bg-blue-400' : 'bg-orange-400'}`}></div>
                                                        <div>
                                                            <div className="font-semibold text-sm text-gray-800">
                                                                {action.change || action.action} <span className="text-gray-500 font-normal">{action.role || action.resource}</span>
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-0.5">{action.reason}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>

                            {/* Advisory & Projections */}
                            <div className="space-y-6">
                                <div className="card-glass p-6 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 border-yellow-100">
                                    <h3 className="text-sm font-bold text-yellow-800 uppercase tracking-wide mb-2 flex items-center gap-2">
                                        <span className="text-xl">⚠️</span> Operational Advisory
                                    </h3>
                                    <p className="text-yellow-900/80 text-sm leading-relaxed font-medium">
                                        {simulationData.advisory}
                                    </p>
                                </div>

                                <div className="card-glass p-6">
                                    <h3 className="text-sm font-bold text-gray-900 mb-4">Resource Projection</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-600">Projected Bed Occupancy</span>
                                                <span className="font-bold text-gray-900">{Math.max(...(simulationData.bed_occupancy_projected || [0]))}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.max(...(simulationData.bed_occupancy_projected || [0]))}%` }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-600">ICU Stress Level</span>
                                                <span className="font-bold text-gray-900">{Math.max(...(simulationData.icu_load_projected || [0]))}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.max(...(simulationData.icu_load_projected || [0]))}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// UI Components
const ControlGroup = ({ label, children }) => (
    <div className="mb-6">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 block">{label}</label>
        {children}
    </div>
);

const Toggle = ({ label, checked, onChange, color = 'peer-checked:bg-purple-600' }) => (
    <label className="flex items-center justify-between cursor-pointer group">
        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
        <div className="relative inline-block w-11 h-6 align-middle select-none transition duration-200 ease-in">
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
            <div className={`block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${color} peer-checked:bg-purple-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:shadow-sm after:transition-all peer-checked:after:translate-x-full`}></div>
        </div>
    </label>
);

const ScenarioChip = ({ label, onClick }) => (
    <button onClick={onClick} className="px-3 py-1.5 bg-white text-gray-600 text-xs font-semibold rounded-lg border border-gray-200 shadow-sm hover:border-purple-300 hover:text-purple-600 hover:shadow-md transition-all">
        {label}
    </button>
);

const StatBox = ({ label, value, unit, pillColor }) => (
    <div className="flex flex-col">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">{label}</span>
        <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">{value}{unit}</span>
            {pillColor && <span className={`w-2 h-2 rounded-full ${pillColor === 'red' ? 'bg-red-500' : 'bg-yellow-400'}`}></span>}
        </div>
    </div>
);

// Fallback Mock Data
const getMockSimulationData = (params) => {
    return {
        forecast: {
            dates: Array.from({ length: params.horizon }, (_, i) => new Date(Date.now() + i * 86400000).toISOString()),
            predicted: Array.from({ length: params.horizon }, () => 50 + Math.random() * 20),
            lower: Array.from({ length: params.horizon }, () => 40 + Math.random() * 20),
            upper: Array.from({ length: params.horizon }, () => 60 + Math.random() * 20),
        },
        peak_date: "2025-12-18",
        peak_value: 75,
        severity: "High",
        bed_occupancy_projected: [80, 82, 85, 88, 85],
        icu_load_projected: [10, 12, 15, 18, 15],
        actions: {
            staffing: [{ change: "+3", role: "Nurses", reason: "Projected surge on Weekend" }],
            supplies: [],
            beds: []
        },
        advisory: "Simulated scenario shows high stress on ICU resources."
    };
};

export default Sandbox;
