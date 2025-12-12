import { useState, useRef, useEffect } from 'react';
import { ChatIcon, SendIcon, SparklesIcon } from '../components/icons/CustomIcons';

const AskPulse = () => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hello! I\'m Pulse AI, powered by Groq. I can help analyze surge patterns, staffing needs, or run specific scenarios.',
            reasoning: []
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isTyping]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulation response
        setTimeout(() => {
            setIsTyping(false);
            const aiMsg = {
                role: 'assistant',
                content: "I've analyzed the recent admission trends. Based on the 7-day forecast showing a 20% surge, I recommend increasing the nursing staff for the night shift by 2 personnel. The inventory for oxygen cylinders is sufficient for this period.",
                reasoning: [
                    "Retrieved forecasting model output: +20% admission rate",
                    "Checked current staffing roster: Shift A (Full), Shift B (Deficit)",
                    "Cross-referenced inventory checklist ID-402",
                    "Formulated recommendation based on safety thresholds"
                ]
            };
            setMessages(prev => [...prev, aiMsg]);
        }, 1500);
    };

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col bg-[#F7F9FB]">
            {/* Header Area within Chat */}
            <div className="p-6 border-b border-gray-200/50 glass z-10">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-blue-cyan p-[1px]">
                            <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-blue-500">
                                <SparklesIcon className="w-5 h-5" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">AskPulse AI</h1>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                <span className="text-xs text-gray-500 font-medium">Powered by Groq</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                <div className="max-w-3xl mx-auto space-y-8">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                                {/* Message Bubble */}
                                <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                    }`}>
                                    {msg.content}
                                </div>

                                {/* Reasoning Trace (Assistant Only) */}
                                {msg.role === 'assistant' && msg.reasoning && msg.reasoning.length > 0 && (
                                    <div className="ml-2 mt-1">
                                        <details className="group">
                                            <summary className="text-xs font-semibold text-gray-400 cursor-pointer hover:text-blue-500 transition-colors list-none flex items-center gap-1">
                                                <span className="w-1 h-1 rounded-full bg-gray-300 group-hover:bg-blue-400"></span>
                                                View Reasoning Trace
                                            </summary>
                                            <div className="mt-2 pl-3 border-l-2 border-gray-100 space-y-1">
                                                {msg.reasoning.map((step, rIdx) => (
                                                    <div key={rIdx} className="text-xs text-gray-500 font-mono">
                                                        {rIdx + 1}. {step}
                                                    </div>
                                                ))}
                                            </div>
                                        </details>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm">
                                <div className="flex gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-6 glass border-t border-gray-200/50">
                <div className="max-w-3xl mx-auto relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about operations, forecasts, or recommendations..."
                        className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="absolute right-2 top-2 p-2 bg-blue-50 text-blue-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-100 transition-colors"
                    >
                        <SendIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="text-center mt-3">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Pulse AI v2.0 • Ops Intelligence</p>
                </div>
            </div>
        </div>
    );
};

export default AskPulse;
