import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDownIcon, ActivityIcon } from './icons/CustomIcons';

const Header = () => {
    const [selectedCity, setSelectedCity] = useState('Mumbai');
    const location = useLocation();
    const [pageTitle, setPageTitle] = useState('Operations Overview');

    useEffect(() => {
        const path = location.pathname;
        if (path === '/') setPageTitle('Operations Overview');
        else if (path === '/sandbox') setPageTitle('Scenario Simulator');
        else if (path === '/inventory') setPageTitle('Supply Intelligence');
        else if (path === '/alerts') setPageTitle('Incident Command Center');
        else if (path === '/ask-pulse') setPageTitle('Ask Pulse AI');
    }, [location]);

    return (
        <header className="h-16 fixed top-0 left-64 right-0 glass border-b border-gray-200/50 z-40 flex items-center justify-between px-8">
            {/* Left Section */}
            <div className="flex items-center gap-6">
                <h2 className="text-lg font-semibold text-gray-900">{pageTitle}</h2>

                {/* System Status - Only show on Dashboard or specialized pages if desired, keeping global for now but maybe hiding if needed. keeping global is fine. */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50/50 rounded-full border border-green-200/50">
                    <div className="relative">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse-glow"></div>
                    </div>
                    <span className="text-xs font-medium text-green-700">System Active</span>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
                {/* City Selector */}
                <div className="relative">
                    <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="appearance-none bg-white/50 border border-gray-200/50 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:bg-white/80 transition-smooth cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        <option value="Mumbai">Mumbai</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Bangalore">Bangalore</option>
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                </div>

                {/* User Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-blue-cyan flex items-center justify-center text-black text-sm font-semibold shadow-soft">
                    A
                </div>
            </div>
        </header>
    );
};

export default Header;
