import { useState, useEffect } from 'react';
import axios from 'axios';
import MetricCard from '../components/MetricCard';
import ForecastChart from '../components/ForecastChart';
import ActionPanel from '../components/ActionPanel';
import ReasoningPanel from '../components/ReasoningPanel';
import PatientAdvisory from '../components/PatientAdvisory';
import { BedIcon, AirIcon, ShieldIcon, TrendingIcon } from '../components/icons/CustomIcons';

const Dashboard = () => {
    const [useRealData, setUseRealData] = useState(false); // Default to Mock Data
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Mock data for initial render matching the aesthetic
    const mockData = {
        metrics: {
            occupancy: { value: 34, unit: '%', trend: 'up', trendValue: '2.4%' },
            aqi: { value: 45, unit: '', trend: 'down', trendValue: '12 pts' },
            risk: { value: 'Low', unit: '', trend: 'stable', trendValue: '-' },
            surge: { value: '+42', unit: '', trend: 'up', trendValue: '15%' }
        },
        forecast: Array.from({ length: 7 }, (_, i) => ({
            ds: new Date(Date.now() + i * 86400000).toISOString(),
            yhat: Math.floor(40 + Math.random() * 20),
            yhat_lower: Math.floor(35 + Math.random() * 20),
            yhat_upper: Math.floor(45 + Math.random() * 20)
        })),
        decision: {
            actions: {
                staffing: [
                    { role: 'Nurse', change: '+2', shift: 'Day', reason: 'Anticipated surge in ER' },
                    { role: 'Tech', change: '+1', shift: 'Night', reason: 'Equipment maintenance schedule' }
                ],
                supplies: [
                    { resource: 'O2 Cylinders', action: 'Order', quantity: '20', reason: 'Low stock alert' }
                ],
                beds: []
            },
            reasoning_trace: [
                "Analyzed 7-day admission forecast showing upward trend (R²=0.92)",
                "Cross-referenced with AQI data currently trending downward",
                "Identified potential bottleneck in Day Shift nursing staff",
                "Calculated supply burn rate based on occupancy projections",
                "Generated recommendation to increase staffing buffer by 15%"
            ],
            confidence: 0.89,
            advisory: "Conditions are favorable, but prepare for moderate inflow over the weekend."
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            if (!useRealData) {
                // Use Mock Data
                console.log("Using Mock Data (Demo Mode)");
                // Simulate partial delay for realism
                setTimeout(() => {
                    setData(mockData);
                    setLoading(false);
                }, 600);
                return;
            }

            try {
                const response = await axios.post('http://localhost:8000/forecast/run', {
                    city: "Mumbai",
                    horizon: 7
                });

                const apiData = response.data;
                const decision = apiData.decision;
                const forecast = apiData.forecast;
                const context = apiData.context_summary;
                const fSummary = apiData.forecast_summary;

                // Transform API data to UI structure with robust fallbacks
                const metrics = {
                    occupancy: {
                        value: Math.round(context?.occupancy_pct || 0),
                        unit: '%',
                        trend: 'up',
                        trendValue: `${(fSummary?.delta_pct || 0).toFixed(1)}%`
                    },
                    aqi: {
                        value: Math.round(context?.aqi || 0),
                        unit: '',
                        trend: (context?.aqi || 0) > 200 ? 'up' : 'down',
                        trendValue: '4h avg'
                    },
                    risk: {
                        value: decision?.risk_level || 'Low',
                        unit: '',
                        trend: 'stable',
                        trendValue: '-'
                    },
                    surge: {
                        value: `${(fSummary?.delta_pct || 0) > 0 ? '+' : ''}${(fSummary?.delta_pct || 0).toFixed(0)}`,
                        unit: '%',
                        trend: (fSummary?.delta_pct || 0) > 0 ? 'up' : 'down',
                        trendValue: '7d'
                    }
                };

                const realData = {
                    metrics,
                    forecast: (forecast?.dates || []).map((date, i) => ({
                        ds: date,
                        yhat: Math.round(forecast?.predicted?.[i] || 0),
                        yhat_lower: Math.round(forecast?.lower?.[i] || 0),
                        yhat_upper: Math.round(forecast?.upper?.[i] || 0)
                    })),
                    decision: {
                        actions: decision?.actions || {},
                        reasoning_trace: decision?.reasoning_trace || [],
                        confidence: decision?.confidence || 0,
                        advisory: decision?.advisory || ''
                    }
                };

                console.log("Using Real Agentic Data:", realData);
                setData(realData);
            } catch (error) {
                console.error("API Error, using fallback mock data:", error);
                setData(mockData);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [useRealData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 animate-slide-in">
            {/* Header / Controls */}
            <div className="flex justify-end items-center mb-[-20px]">
                <div className="bg-white rounded-lg p-1 border border-gray-200 shadow-sm flex items-center">
                    <button
                        onClick={() => setUseRealData(false)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${!useRealData ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Demo Data
                    </button>
                    <button
                        onClick={() => setUseRealData(true)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${useRealData ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Live Agent
                    </button>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    icon={BedIcon}
                    label="Bed Occupancy"
                    value={data.metrics.occupancy.value}
                    unit={data.metrics.occupancy.unit}
                    trend={data.metrics.occupancy.trend}
                    trendValue={data.metrics.occupancy.trendValue}
                    accentColor="blue"
                />
                <MetricCard
                    icon={AirIcon}
                    label="Air Quality Index"
                    value={data.metrics.aqi.value}
                    unit={data.metrics.aqi.unit}
                    trend={data.metrics.aqi.trend}
                    trendValue={data.metrics.aqi.trendValue}
                    accentColor="green"
                />
                <MetricCard
                    icon={ShieldIcon}
                    label="Risk Level"
                    value={data.metrics.risk.value}
                    unit={data.metrics.risk.unit}
                    trend={data.metrics.risk.trend}
                    trendValue={data.metrics.risk.trendValue}
                    accentColor="yellow"
                />
                <MetricCard
                    icon={TrendingIcon}
                    label="Predicted Surge"
                    value={data.metrics.surge.value}
                    unit={data.metrics.surge.unit}
                    trend={data.metrics.surge.trend}
                    trendValue={data.metrics.surge.trendValue}
                    accentColor="red"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[500px]">
                {/* Chart Section - spans 2 cols */}
                <div className="lg:col-span-2 h-full">
                    <ForecastChart data={data.forecast} />
                </div>

                {/* Actions Panel - spans 1 col */}
                <div className="h-full">
                    <ActionPanel actions={data.decision.actions} />
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <ReasoningPanel steps={data.decision.reasoning_trace} confidence={data.decision.confidence} />
                </div>
                <div>
                    <PatientAdvisory advisory={data.decision.advisory} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
