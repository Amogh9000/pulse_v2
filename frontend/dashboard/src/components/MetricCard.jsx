import { motion } from 'framer-motion';

const MetricCard = ({ icon: Icon, label, value, unit, trend, trendValue, accentColor = 'blue' }) => {
    const accentColors = {
        blue: 'from-blue-500 to-cyan-500',
        green: 'from-green-500 to-emerald-500',
        yellow: 'from-yellow-500 to-orange-500',
        red: 'from-red-500 to-pink-500',
    };

    const textAccents = {
        blue: 'text-blue-600',
        green: 'text-green-600',
        yellow: 'text-yellow-600',
        red: 'text-red-600',
    };

    return (
        <motion.div
            className="card-glass p-6 transition-lift hover-lift group relative overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Icon Circle */}
            <div className="flex items-start justify-between mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-full glass flex items-center justify-center text-gray-700 group-hover:text-white group-hover:bg-gradient-to-br ${accentColors[accentColor]} transition-smooth shadow-sm`}>
                    <Icon className="w-5 h-5" />
                </div>

                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full glass ${trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                        {trend === 'up' ?
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                            :
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                        }
                        {trendValue}
                    </div>
                )}
            </div>

            {/* Label */}
            <div className="text-sm text-gray-500 font-medium mb-1 relative z-10">{label}</div>

            {/* Value */}
            <div className="metric-number text-gray-900 mb-6 relative z-10 flex items-baseline gap-1">
                <motion.span
                    initial={{ opacity: 0, filter: 'blur(5px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    key={value} // Trigger animation on value change
                    transition={{ duration: 0.4 }}
                >
                    {value}
                </motion.span>
                {unit && <span className="text-xl text-gray-400 font-medium">{unit}</span>}
            </div>

            {/* Gradient Accent Line with Pulse Animation */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
                <div className={`h-full bg-gradient-to-r ${accentColors[accentColor]} opacity-80 animate-pulse-travel rounded-full`}></div>
            </div>

            {/* Ambient background glow on hover */}
            <div className={`absolute -right-10 -bottom-10 w-32 h-32 bg-gradient-to-br ${accentColors[accentColor]} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500 rounded-full`}></div>
        </motion.div>
    );
};

export default MetricCard;
