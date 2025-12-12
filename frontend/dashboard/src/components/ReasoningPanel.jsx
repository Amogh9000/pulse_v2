import { useState } from 'react';
import { ChevronDownIcon, SparklesIcon } from './icons/CustomIcons';
import { motion, AnimatePresence } from 'framer-motion';

const ReasoningPanel = ({ steps, confidence }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Take first 3 steps for preview, show all if expanded
    const visibleSteps = isExpanded ? steps : steps.slice(0, 3);

    // Calculate stroke dasharray for the circular confidence ring
    // Circumference = 2 * PI * R
    // R ~ 28 (based on logic below) -> C ~ 176
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - ((confidence || 0) * circumference);

    return (
        <div className="card-glass p-8 relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-purple p-[1px] shadow-sm">
                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-purple-600">
                            <SparklesIcon className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">AI Reasoning Engine</h3>
                        <p className="text-xs text-purple-600 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                            Analysis Complete
                        </p>
                    </div>
                </div>

                {/* Confidence Ring Animation */}
                {confidence && (
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        {/* Background Ring */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="32" cy="32" r={radius}
                                stroke="#F3E8FF" strokeWidth="4"
                                fill="transparent"
                            />
                            {/* Foreground Ring */}
                            <motion.circle
                                cx="32" cy="32" r={radius}
                                stroke="#A855F7" strokeWidth="4"
                                fill="transparent"
                                strokeLinecap="round"
                                initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset }}
                                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900">
                            {Math.round(confidence * 100)}%
                        </div>
                    </div>
                )}
            </div>

            {/* Timeline Steps */}
            <div className="space-y-0 relative z-10">
                {/* Continuous Logic Line */}
                <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-purple-100 via-purple-50 to-transparent"></div>

                <AnimatePresence initial={false}>
                    {visibleSteps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative flex gap-6 pb-6 last:pb-0 group"
                        >
                            <div className="w-10 flex flex-col items-center shrink-0">
                                <div className="w-3 h-3 rounded-full bg-white border-2 border-purple-400 z-10 shadow-[0_0_0_4px_rgba(243,232,255,0.5)] group-hover:scale-125 transition-transform duration-300"></div>
                            </div>
                            <div className="flex-1 pt-1">
                                <p className="text-gray-700 leading-relaxed text-sm bg-white/60 p-4 rounded-xl border border-white/80 shadow-sm group-hover:shadow-md transition-all">
                                    {step}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {steps.length > 3 && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full mt-6 py-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors border-t border-gray-100"
                >
                    {isExpanded ? 'Collapse Analysis' : `View Full Reasoning Trace`}
                    <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
            )}

            {/* Decorative Blur */}
            <div className="absolute -left-10 top-20 w-40 h-40 bg-purple-200/20 blur-[80px] pointer-events-none"></div>
        </div>
    );
};

export default ReasoningPanel;
