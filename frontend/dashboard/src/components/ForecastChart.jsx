import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const predicted = payload.find(p => p.dataKey === 'yhat');
        const upper = payload.find(p => p.dataKey === 'yhat_upper');
        const lower = payload.find(p => p.dataKey === 'yhat_lower');

        // Format date nicely
        const dateStr = new Date(label).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });

        return (
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl border border-white/60 shadow-elevated z-50">
                <p className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-100 pb-2">{dateStr}</p>
                <div className="space-y-1.5">
                    {predicted && (
                        <div className="flex items-center gap-4 justify-between">
                            <span className="text-sm font-medium text-blue-600">Predicted Admissions:</span>
                            <span className="text-lg font-bold text-gray-900">{predicted.value}</span>
                        </div>
                    )}
                    {upper && (
                        <div className="flex items-center gap-4 justify-between text-xs text-gray-500">
                            <span>Upper Bound:</span>
                            <span className="font-mono">{upper.value}</span>
                        </div>
                    )}
                    {lower && (
                        <div className="flex items-center gap-4 justify-between text-xs text-gray-500">
                            <span>Lower Bound:</span>
                            <span className="font-mono">{lower.value}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

const ForecastChart = ({ data }) => {
    return (
        <div className="card-glass p-8 h-full">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">7-Day Surge Forecast</h3>
                    <p className="text-sm text-gray-500 mt-1">AI prediction model (Prophet) with 95% confidence interval</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-gray-600">Predicted Admissions</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200"></div>
                        <span className="text-gray-600">Confidence Band</span>
                    </div>
                </div>
            </div>

            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis
                            dataKey="ds"
                            tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        {/* Confidence Interval Area */}
                        <Area
                            type="monotone"
                            dataKey="yhat_upper"
                            stroke="none"
                            fill="#E0F2FE"
                            fillOpacity={0.5}
                        />
                        <Area
                            type="monotone"
                            dataKey="yhat_lower"
                            stroke="none"
                            fill="#F7F9FB"
                        />

                        {/* Main Prediction Line */}
                        <Line
                            type="monotone"
                            dataKey="yhat"
                            stroke="url(#gradientLine)"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#0EA5E9', strokeWidth: 2, stroke: '#fff', strokeWidth: 2 }}
                            activeDot={{ r: 6, fill: '#0EA5E9', strokeWidth: 0 }}
                        />
                        <defs>
                            <linearGradient id="gradientLine" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#0EA5E9" />
                                <stop offset="100%" stopColor="#38BDF8" />
                            </linearGradient>
                        </defs>
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ForecastChart;
