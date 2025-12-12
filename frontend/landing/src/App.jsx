import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

// Animated Counter Component
function AnimatedCounter({ end, duration = 2, suffix = '', prefix = '' }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;

        let startTime;
        let animationFrame;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = (timestamp - startTime) / (duration * 1000);

            if (progress < 1) {
                setCount(Math.floor(end * progress));
                animationFrame = requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [isInView, end, duration]);

    return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

// Floating Blob Component
function FloatingBlob({ delay = 0, duration = 20, className = '' }) {
    return (
        <motion.div
            className={`absolute rounded-full blur-3xl ${className}`}
            animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                scale: [1, 1.2, 1],
            }}
            transition={{
                duration,
                delay,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
        />
    );
}

// Custom Icon Components (SVG)
const TrendingUpIcon = () => (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M23 6l-9.5 9.5-5-5L1 18" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 6h6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const LayersIcon = () => (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 17l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const BellIcon = () => (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const DatabaseIcon = () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <ellipse cx="12" cy="5" rx="9" ry="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const BrainIcon = () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2a3 3 0 0 0-3 3v4a3 3 0 0 0 3 3 3 3 0 0 0 3-3V5a3 3 0 0 0-3-3z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 12v10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 16l-2 2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 16l2 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ZapIcon = () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

function App() {
    const { scrollYProgress } = useScroll();
    const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.5]);

    return (
        <div className="min-h-screen bg-white overflow-hidden">
            {/* Navigation */}
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100/50"
            >
                <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-3 text-xl font-semibold tracking-tight text-gray-900"
                    >
                        <img src="/logo.png" alt="Pulse Logo" className="w-8 h-8 rounded-lg" />
                        Pulse V2
                    </motion.div>
                    <div className="flex items-center gap-10">
                        <a href="#features" className="text-gray-600 hover:text-gray-900 transition text-sm font-medium">
                            Features
                        </a>
                        <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition text-sm font-medium">
                            How It Works
                        </a>
                        <a href="#impact" className="text-gray-600 hover:text-gray-900 transition text-sm font-medium">
                            Impact
                        </a>
                        <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            href="http://localhost:5174"
                            className="px-6 py-2.5 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-all shadow-lg"
                        >
                            Launch Dashboard
                        </motion.a>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-8 pt-32 pb-40 overflow-hidden">
                {/* Floating Background Blobs */}
                <FloatingBlob
                    delay={0}
                    duration={25}
                    className="w-[700px] h-[700px] bg-gradient-to-r from-cyan-200/30 to-blue-200/30 -top-48 -left-48"
                />
                <FloatingBlob
                    delay={5}
                    duration={30}
                    className="w-[600px] h-[600px] bg-gradient-to-r from-blue-200/20 to-purple-200/20 top-1/4 -right-64"
                />
                <FloatingBlob
                    delay={10}
                    duration={35}
                    className="w-[500px] h-[500px] bg-gradient-to-r from-cyan-100/40 to-blue-100/40 bottom-0 left-1/3"
                />

                <motion.div
                    style={{ y: heroY, opacity: heroOpacity }}
                    className="relative z-10 max-w-6xl mx-auto text-center"
                >
                    {/* Powered by Groq Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/60 backdrop-blur-md border border-gray-200/50 rounded-full mb-10 shadow-sm"
                    >
                        <div className="relative flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <motion.div
                                className="absolute inset-0 bg-green-500 rounded-full"
                                animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Live AI Monitoring • Powered by Groq</span>
                    </motion.div>

                    {/* Hero Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-7xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.05] text-gray-900"
                        style={{ fontWeight: 700 }}
                    >
                        AI-Powered Hospital
                        <br />
                        <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-blue-700 bg-clip-text text-transparent">
                            Operations Intelligence
                        </span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-xl md:text-2xl text-gray-600 mb-14 max-w-3xl mx-auto leading-relaxed"
                        style={{ fontWeight: 400 }}
                    >
                        Predict surges, optimize resources, and make intelligent decisions with
                        Groq-powered agentic AI. Real-time intelligence for modern healthcare operations.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="flex gap-4 justify-center mb-24"
                    >
                        <motion.a
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            href="http://localhost:5174"
                            className="px-10 py-4 bg-gray-900 text-white rounded-full text-lg font-semibold shadow-2xl hover:bg-gray-800 transition-all"
                        >
                            Launch Dashboard
                        </motion.a>
                        <motion.a
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            href="#features"
                            className="px-10 py-4 bg-white/60 backdrop-blur-md border border-gray-200/50 text-gray-900 rounded-full text-lg font-semibold hover:bg-white/80 transition-all shadow-lg"
                        >
                            Learn More
                        </motion.a>
                    </motion.div>

                    {/* Floating 3D Hero Asset */}
                    <motion.div
                        initial={{ opacity: 0, y: 60, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.9, duration: 1 }}
                        className="relative"
                    >
                        <motion.div
                            whileHover={{ y: -10, scale: 1.01 }}
                            transition={{ duration: 0.3 }}
                            className="relative bg-white/40 backdrop-blur-2xl border border-gray-200/50 rounded-3xl p-10 shadow-2xl"
                        >
                            {/* Holographic Pulse Chart */}
                            <div className="aspect-video bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl flex items-center justify-center relative overflow-hidden">
                                <motion.div
                                    animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.4, 0.2] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-400/10"
                                />

                                {/* Pulse Line Visualization */}
                                <svg className="w-full h-full absolute inset-0 p-16" viewBox="0 0 400 200">
                                    <motion.path
                                        d="M0,100 L50,100 L70,60 L90,140 L110,80 L130,120 L150,100 L200,100 L220,70 L240,130 L260,90 L280,110 L300,100 L400,100"
                                        stroke="url(#gradient)"
                                        strokeWidth="3"
                                        fill="none"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                                            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
                                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
                                        </linearGradient>
                                    </defs>
                                </svg>

                                {/* Glowing Orb */}
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute w-32 h-32 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-2xl"
                                />
                            </div>
                        </motion.div>

                        {/* Ambient Glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-blue-400/20 to-purple-400/10 blur-3xl -z-10"></div>
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 px-8 relative bg-gradient-to-b from-white to-gray-50/50">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-24"
                    >
                        <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                            Intelligent Features
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Advanced AI agents working together to optimize your hospital operations
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <TrendingUpIcon />,
                                title: 'Surge Forecasting',
                                description: 'Predict admission surges 7 days ahead with 95% accuracy using Prophet ML and real-time environmental data',
                                gradient: 'from-cyan-500 to-blue-500',
                            },
                            {
                                icon: <LayersIcon />,
                                title: 'Resource Planning',
                                description: 'AI-powered recommendations for staffing, supplies, and bed allocation optimized in real-time',
                                gradient: 'from-blue-500 to-indigo-500',
                            },
                            {
                                icon: <BellIcon />,
                                title: 'Smart Alerts & Risk Detection',
                                description: 'Automated risk detection with transparent reasoning traces and intelligent alert prioritization',
                                gradient: 'from-indigo-500 to-purple-500',
                            },
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                                whileHover={{ y: -8, scale: 1.01 }}
                                className="group relative"
                            >
                                {/* Glassmorphism Card */}
                                <div className="relative bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-500 h-full">
                                    {/* Icon */}
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        className={`inline-flex text-gray-700 mb-8 group-hover:text-blue-600 transition-colors`}
                                    >
                                        {feature.icon}
                                    </motion.div>

                                    <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed mb-6">
                                        {feature.description}
                                    </p>

                                    {/* Gradient Accent Line */}
                                    <div className={`h-0.5 w-full bg-gradient-to-r ${feature.gradient} rounded-full mt-auto`}></div>
                                </div>

                                {/* Soft glow on hover */}
                                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-5 blur-2xl rounded-3xl transition-opacity duration-500 -z-10`}></div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-32 px-8 bg-white">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-24"
                    >
                        <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                            How It Works
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Three-stage agentic pipeline for intelligent decision-making
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-16">
                        {[
                            {
                                icon: <DatabaseIcon />,
                                step: '01',
                                title: 'Sense',
                                description: 'Continuous data ingestion from admissions, AQI sensors, inventory, and staffing systems',
                            },
                            {
                                icon: <BrainIcon />,
                                step: '02',
                                title: 'Predict',
                                description: 'Prophet ML models analyze patterns and forecast surges with 95% accuracy',
                            },
                            {
                                icon: <ZapIcon />,
                                step: '03',
                                title: 'Decide',
                                description: 'Groq-powered agents generate actionable recommendations with transparent reasoning',
                            },
                        ].map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="text-center"
                            >
                                <div className="flex flex-col items-center">
                                    {/* Step Number */}
                                    <div className="text-6xl font-bold text-gray-200 mb-6">{step.step}</div>

                                    {/* Icon */}
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className="inline-flex text-blue-600 mb-6"
                                    >
                                        {step.icon}
                                    </motion.div>

                                    <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>

                                {/* Connector Line */}
                                {i < 2 && (
                                    <div className="hidden md:block absolute top-24 left-1/2 w-full h-0.5 bg-gradient-to-r from-gray-200 to-transparent"></div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Impact Stats Section */}
            <section id="impact" className="py-32 px-8 bg-gradient-to-b from-gray-50/50 to-white">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-24"
                    >
                        <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                            Real-World Impact
                        </h2>
                        <p className="text-xl text-gray-600">
                            Trusted by leading healthcare institutions worldwide
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { value: 95, suffix: '%', label: 'Forecast Accuracy' },
                            { value: 30, suffix: '%', label: 'Faster Response Time' },
                            { value: 247, suffix: '', label: 'Real-Time Monitoring', display: '24/7' },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="relative bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-12 text-center shadow-lg hover:shadow-2xl transition-all"
                            >
                                <div className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                                    {stat.display || <><AnimatedCounter end={stat.value} suffix={stat.suffix} /></>}
                                </div>
                                <div className="text-lg text-gray-600 font-medium">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Product Preview Section */}
            <section className="py-32 px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                            Experience Pulse V2
                        </h2>
                        <p className="text-xl text-gray-600">
                            The future of hospital operations intelligence
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.5 }}
                        className="relative group cursor-pointer"
                    >
                        {/* Browser Window Frame */}
                        <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-w-5xl mx-auto transform transition-transform duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                            {/* Browser Header */}
                            <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                </div>
                                <div className="bg-white border border-gray-200 rounded px-3 py-1 text-[10px] text-gray-400 flex-1 mx-4 text-center font-mono">
                                    pulse.ai/dashboard/live
                                </div>
                            </div>

                            {/* Dashboard Mockup Content */}
                            <div className="p-6 bg-[#F7F9FB] min-h-[500px]">
                                {/* Header */}
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Operations Overview</h3>
                                        <div className="text-xs text-green-600 flex items-center gap-1 font-medium mt-1">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                            System Nominal • Live Updates
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs font-medium text-gray-600 shadow-sm">
                                            Mumbai
                                        </div>
                                        <div className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium shadow-md shadow-blue-200">
                                            Export Report
                                        </div>
                                    </div>
                                </div>

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-4 gap-4 mb-6">
                                    {[
                                        { label: 'Occupancy', value: '78%', trend: '+2.4%', color: 'blue', icon: 'Items' },
                                        { label: 'AQI Level', value: '142', trend: '-12 pts', color: 'green', icon: 'Wind' },
                                        { label: 'Risk Score', value: 'Low', trend: 'Stable', color: 'yellow', icon: 'Shield' },
                                        { label: 'Pred. Surge', value: '+14%', trend: 'High', color: 'red', icon: 'Graph' }
                                    ].map((m, i) => (
                                        <div key={i} className="bg-white/80 backdrop-blur p-4 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group/card hover:-translate-y-1 transition-transform">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className={`w-8 h-8 rounded-lg bg-${m.color}-50 flex items-center justify-center text-${m.color}-500`}>
                                                    <div className="w-2 h-2 rounded-full bg-current"></div>
                                                </div>
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-${m.color}-50 text-${m.color}-600`}>
                                                    {m.trend}
                                                </span>
                                            </div>
                                            <div className="text-2xl font-bold text-gray-900">{m.value}</div>
                                            <div className="text-xs text-gray-500 font-medium">{m.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Main Content Split */}
                                <div className="grid grid-cols-3 gap-6 h-64">
                                    {/* Chart Area */}
                                    <div className="col-span-2 bg-white/80 backdrop-blur rounded-2xl border border-gray-100 shadow-sm p-6 relative">
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="text-sm font-bold text-gray-900">7-Day Admission Forecast</h4>
                                            <div className="flex gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                <span className="text-[10px] text-gray-400">Active Prediction</span>
                                            </div>
                                        </div>
                                        {/* Stylized Chart Line */}
                                        <svg className="w-full h-40" viewBox="0 0 400 150" preserveAspectRatio="none">
                                            <defs>
                                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                                </linearGradient>
                                            </defs>
                                            <path d="M0,100 C50,90 100,110 150,60 C200,10 250,80 300,50 C350,20 400,60 400,60 L400,150 L0,150 Z" fill="url(#chartGradient)" />
                                            <path d="M0,100 C50,90 100,110 150,60 C200,10 250,80 300,50 C350,20 400,60 400,60" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
                                            {/* Data Points */}
                                            <circle cx="150" cy="60" r="4" fill="white" stroke="#2563eb" strokeWidth="2" />
                                            <circle cx="300" cy="50" r="4" fill="white" stroke="#2563eb" strokeWidth="2" />
                                        </svg>
                                    </div>

                                    {/* AI Actions */}
                                    <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-100 shadow-sm p-5">
                                        <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <span className="text-purple-500">✨</span> AI Recommendations
                                        </h4>
                                        <div className="space-y-3">
                                            {[
                                                { text: "Increase nurse staffing for Shift B", type: "Staff" },
                                                { text: "Order 20 O2 Cylinders", type: "Supply" },
                                                { text: "Open Ward C for surge", type: "Ops" }
                                            ].map((action, i) => (
                                                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer">
                                                    <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-blue-500 shrink-0"></div>
                                                    <div>
                                                        <div className="text-xs font-medium text-gray-700">{action.text}</div>
                                                        <div className="text-[10px] text-gray-400 mt-0.5">{action.type}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Surrounding Glow */}
                        <div className="absolute inset-0 bg-blue-500/5 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity -z-10 rounded-full scale-90 translate-y-10"></div>
                    </motion.div>
                </div>
            </section>

            {/* Problem vs Solution Section */}
            <section className="py-32 px-8 bg-black text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/20 blur-[100px] rounded-full"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">Stop Managing Chaos. Start Predicting It.</h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">Traditional operations are reactive and fragmented. Pulse V2 unifies everything into a single predictive intelligence.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* The Old Way */}
                        <motion.div
                            initial={{ x: -30, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            className="p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur"
                        >
                            <h3 className="text-2xl font-bold text-gray-300 mb-8 flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                The Old Way
                            </h3>
                            <ul className="space-y-6">
                                {[
                                    "Reactive staffing calls at 6 AM",
                                    "Guessing inventory needs based on gut feel",
                                    "Siloed data in 14 different spreadsheets",
                                    "Patient crowding surpises in ER"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 text-gray-400">
                                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">✕</div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* The Pulse Way */}
                        <motion.div
                            initial={{ x: 30, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            className="p-10 rounded-3xl bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border border-blue-500/30 backdrop-blur relative shadow-2xl shadow-blue-900/20"
                        >
                            <div className="absolute top-0 right-0 px-4 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-bl-xl rounded-tr-2xl">
                                POWERED BY GROQ
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></span>
                                With Pulse V2
                            </h3>
                            <ul className="space-y-6">
                                {[
                                    "AI predicts surges 7 days in advance",
                                    "Automated supply ordering triggers",
                                    "Centralized Command Center Dashboard",
                                    "Proactive bed management & flow"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 text-white">
                                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">✓</div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Enterprise Architecture Section */}
            <section className="py-24 px-8 bg-gray-50/50">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Enterprise-Grade Infrastructure</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">Built to meet the rigorous demands of modern healthcare networks.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Security */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-green-100"></div>
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6 relative z-10">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">HIPAA & GDPR Compliant</h3>
                            <p className="text-gray-600 leading-relaxed">
                                End-to-end encryption for all patient data. Private cloud deployment options available for absolute data sovereignty.
                            </p>
                        </motion.div>

                        {/* Integration */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-blue-100"></div>
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 relative z-10">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Universal Integration</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Seamlessly connects with Epic, Cerner, and Allscripts via HL7/FHIR standards. No rip-and-replace required.
                            </p>
                        </motion.div>

                        {/* Speed */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-purple-100"></div>
                            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 relative z-10">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Real-Time Latency</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Powered by Groq LPUs for sub-second inference. Critical alerts reach your command center in milliseconds, not minutes.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Objection Handling FAQ */}
            <section className="py-24 px-8 bg-white">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Common Questions</h2>
                        <p className="text-gray-500">Everything you need to know about deploying Pulse V2.</p>
                    </motion.div>

                    <div className="space-y-4">
                        {[
                            {
                                q: "Does this integrate with Epic, Cerner, or Meditech?",
                                a: "Yes. Pulse V2 sits on top of your existing EMR. We use read-only HL7/FHIR connectors to ingest data without engaging your IT team in a long migration project."
                            },
                            {
                                q: "How long does implementation take?",
                                a: "Because we don't replace your core systems, we can go live in as little as 2 weeks. Analysis of historical data takes 48 hours, and live streams are connected shortly after."
                            },
                            {
                                q: "Is patient data sent to external AI models?",
                                a: "No. We offer an on-premise deployment of the Groq LPU inference engine. Patient data never leaves your hospital's secure VPC. We are fully HIPAA and GDPR compliant."
                            },
                            {
                                q: "Does my staff need extensive training?",
                                a: "Pulse V2 is designed with a 'Zero-Training' philosophy. If your staff can use a smartphone, they can use our dashboard. Alerts are plain English, not complex codes."
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="border border-gray-200 rounded-2xl p-6 hover:border-blue-300 transition-colors group cursor-default"
                            >
                                <h3 className="text-lg font-bold text-gray-900 mb-2 flex justify-between items-center">
                                    {item.q}
                                    <span className="text-gray-300 group-hover:text-blue-500 transition-colors text-2xl">+</span>
                                </h3>
                                <p className="text-gray-600 leading-relaxed pr-8">{item.a}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <p className="text-gray-500 mb-4">Still have questions?</p>
                        <a href="mailto:pulsev2@gmail.com" className="text-blue-600 font-bold hover:underline">Contact our Solutions Engineering Team →</a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-16 px-8 border-t border-gray-100 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                        <div>
                            <div className="text-xl font-semibold text-gray-900 mb-2">
                                Pulse V2
                            </div>
                            <p className="text-gray-500 text-sm">
                                Agentic AI Hospital Operations Cockpit
                            </p>
                        </div>
                        <div className="flex gap-10 text-sm text-gray-600">
                            <a href="#features" className="hover:text-gray-900 transition">Features</a>
                            <a href="#how-it-works" className="hover:text-gray-900 transition">How It Works</a>
                            <a href="#impact" className="hover:text-gray-900 transition">Impact</a>
                            <a href="http://localhost:5174" className="hover:text-gray-900 transition">Dashboard</a>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-gray-100 text-center text-sm text-gray-500">
                        <p>Powered by Groq • Built for healthcare</p>
                        <p className="mt-2">© 2025 Pulse V2. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;
