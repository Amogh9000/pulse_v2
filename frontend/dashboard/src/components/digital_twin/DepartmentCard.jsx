import React from 'react';
import { motion } from 'framer-motion';

const DepartmentCard = ({ department, onClick, className }) => {
    const isHighRisk = department.risk_level === 'High';
    const isMediumRisk = department.risk_level === 'Medium';

    const borderColor = isHighRisk ? 'border-red-200' : isMediumRisk ? 'border-yellow-200' : 'border-gray-200';
    const glowColor = isHighRisk ? 'shadow-[0_0_30px_rgba(239,68,68,0.15)]' : isMediumRisk ? 'shadow-[0_0_20px_rgba(234,179,8,0.1)]' : 'shadow-sm';

    return (
        <motion.div
            layoutId={`dept-${department.name}`}
            onClick={() => onClick(department)}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`relative bg-white p-5 rounded-2xl border ${borderColor} ${glowColor} cursor-pointer hover:shadow-lg transition-all flex flex-col justify-between ${className} group`}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-gray-900 text-lg leading-tight">{department.name}</h3>
                {isHighRisk && (
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                )}
            </div>

            {/* Metrics */}
            <div className="space-y-3">
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Occupancy</span>
                        <span className="font-bold text-gray-900">{department.current_occupancy}/{department.capacity}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full ${isHighRisk ? 'bg-red-500' : isMediumRisk ? 'bg-yellow-500' : 'bg-blue-500'} transition-all duration-1000`}
                            style={{ width: `${(department.current_occupancy / department.capacity) * 100}%` }}
                        ></div>
                    </div>
                </div>

                <div className="flex justify-between items-end pt-2 border-t border-gray-50">
                    <div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Predicted Load</div>
                        <div className="text-xl font-bold text-gray-900">{department.predicted_load}</div>
                    </div>
                    <div className={`text-xs font-medium px-2 py-1 rounded-md ${department.expected_increase_pct > 10 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {department.expected_increase_pct > 0 ? '+' : ''}{department.expected_increase_pct}%
                    </div>
                </div>
            </div>

            {/* Hover Tooltip Hint */}
            <div className="absolute inset-0 bg-gray-900/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none flex items-center justify-center">
                <span className="bg-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm text-gray-900">View Analysis</span>
            </div>
        </motion.div>
    );
};

export default DepartmentCard;
