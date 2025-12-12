import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DepartmentDetailsModal = ({ isOpen, onClose, department }) => {
    if (!department) return null;

    const getRiskColor = (level) => {
        switch (level) {
            case 'High': return 'text-red-600 bg-red-50 border-red-200';
            case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default: return 'text-green-600 bg-green-50 border-green-200';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    />

                    {/* Modal Panel */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full md:w-[480px] bg-white shadow-2xl z-50 overflow-y-auto border-l border-gray-100"
                    >
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{department.name}</h2>
                                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 border ${getRiskColor(department.risk_level)}`}>
                                        {department.risk_level} Risk
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Main Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="text-sm text-gray-500 mb-1">Occupancy</div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {department.current_occupancy} <span className="text-sm text-gray-400 font-normal">/ {department.capacity}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 h-1.5 rounded-full mt-3 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${department.risk_level === 'High' ? 'bg-red-500' : 'bg-blue-500'}`}
                                            style={{ width: `${(department.current_occupancy / department.capacity) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="text-sm text-gray-500 mb-1">Predicted Load</div>
                                    <div className="text-2xl font-bold text-gray-900">{department.predicted_load}</div>
                                    <div className={`text-xs font-medium mt-1 ${department.expected_increase_pct > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        {department.expected_increase_pct > 0 ? '+' : ''}{department.expected_increase_pct}% surge expected
                                    </div>
                                </div>
                            </div>

                            {/* Resource Gaps */}
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Resource Risks</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                🩺
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">Staffing Gaps</span>
                                        </div>
                                        <div className="text-right">
                                            {department.staffing_gap.nurses_needed > 0 && (
                                                <div className="text-xs font-bold text-red-600">{department.staffing_gap.nurses_needed} Nurses Needed</div>
                                            )}
                                            {department.staffing_gap.doctors_needed > 0 && (
                                                <div className="text-xs font-bold text-red-600">{department.staffing_gap.doctors_needed} Doctors Needed</div>
                                            )}
                                            {department.staffing_gap.nurses_needed === 0 && department.staffing_gap.doctors_needed === 0 && (
                                                <div className="text-xs font-medium text-green-600">Adequate</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                📦
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">Supplies</span>
                                        </div>
                                        <div className="text-right text-xs">
                                            <div className={`${department.supply_risk.oxygen === 'Critical' ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                                                Oxygen: {department.supply_risk.oxygen}
                                            </div>
                                            <div className={`${department.supply_risk.medications === 'Critical' ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                                                Meds: {department.supply_risk.medications}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* AI Recommendations */}
                            {department.ai_recommendations && department.ai_recommendations.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <span>✨</span> AI Recommended Actions
                                    </h3>
                                    <div className="space-y-3">
                                        {department.ai_recommendations.map((action, idx) => (
                                            <div key={idx} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
                                                <div className="text-xs font-bold text-blue-600 mb-1 uppercase opacity-70">{action.type}</div>
                                                <p className="text-sm text-gray-800 font-medium leading-relaxed">{action.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Reasoning Trace */}
                            {department.reasoning_trace && (
                                <div className="relative">
                                    <div className="absolute left-3 top-2 bottom-0 w-0.5 bg-gray-100"></div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 pl-8">Engine Reasoning</h3>
                                    <ul className="space-y-4">
                                        {department.reasoning_trace.map((trace, i) => (
                                            <li key={i} className="flex gap-4 relative">
                                                <div className="w-6 h-6 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-[10px] text-gray-400 shrink-0 z-10">
                                                    {i + 1}
                                                </div>
                                                <p className="text-xs text-gray-500 pt-0.5">{trace}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default DepartmentDetailsModal;
