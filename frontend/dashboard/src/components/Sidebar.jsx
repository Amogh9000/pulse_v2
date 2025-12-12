import { NavLink } from 'react-router-dom';
import {
    DashboardIcon,
    LabIcon,
    SandboxIcon,
    InventoryIcon,
    AlertsIcon,
    ChatIcon,
    MapIcon
} from './icons/CustomIcons';

const Sidebar = () => {
    const navItems = [
        { name: 'Dashboard', path: '/', icon: DashboardIcon },
        { name: 'Digital Twin', path: '/digital-twin', icon: MapIcon },
        { name: 'Sandbox', path: '/sandbox', icon: SandboxIcon },
        { name: 'Inventory', path: '/inventory', icon: InventoryIcon },
        { name: 'Alerts', path: '/alerts', icon: AlertsIcon },
        { name: 'AskPulse', path: '/ask-pulse', icon: ChatIcon },
    ];

    return (
        <aside className="w-64 h-screen fixed left-0 top-0 glass-dark border-r border-gray-200/50 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200/50">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="Pulse Logo" className="w-8 h-8 rounded-lg" />
                    <h1 className="text-xl font-bold gradient-text-blue">Pulse V2</h1>
                </div>
                <p className="text-xs text-gray-500 mt-1">Operations Intelligence</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 custom-scrollbar overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-smooth ${isActive
                                ? 'bg-gradient-to-r from-cyan-50 to-blue-50 text-blue-600 accent-bar-left shadow-soft'
                                : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                                <span className="text-sm font-medium">{item.name}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200/50">
                <div className="text-xs text-gray-500 text-center">
                    <p>Powered by Groq</p>
                    <p className="mt-1">© 2025 Pulse V2</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
