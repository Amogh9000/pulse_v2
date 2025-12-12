import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Sandbox from './pages/Sandbox';
import AskPulse from './pages/AskPulse';

import Inventory from './pages/Inventory';

import Alerts from './pages/Alerts';
import DigitalTwin from './pages/DigitalTwin';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-[#F7F9FB]">
                <Sidebar />
                <div className="ml-64">
                    <Header />
                    <main className="pt-16 min-h-screen">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/digital-twin" element={<DigitalTwin />} />
                            <Route path="/sandbox" element={<Sandbox />} />
                            <Route path="/ask-pulse" element={<AskPulse />} />
                            <Route path="/inventory" element={<Inventory />} />
                            <Route path="/alerts" element={<Alerts />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </Router>
    );
}

export default App;
