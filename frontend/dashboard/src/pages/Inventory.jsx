import { useState, useEffect } from 'react';
import { PackageIcon, AlertTriangleIcon, TrendingDownIcon, TruckIcon, ShoppingCartIcon, ActivityIcon, CheckIcon } from '../components/icons/CustomIcons';
import axios from 'axios';

const Inventory = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/inventory/analyze');
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch inventory:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="p-8 space-y-8 animate-slide-in pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                        <PackageIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Supply Intelligence</h1>
                        <p className="text-gray-500 text-sm">Real-time stock tracking and depletion forecasting.</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg border border-red-100">
                        <AlertTriangleIcon className="w-4 h-4" />
                        <span className="font-bold">{data?.critical_stock_count} Critical</span>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-100">
                        <ActivityIcon className="w-4 h-4" />
                        <span className="font-bold">{data?.low_stock_count} Low Stock</span>
                    </div>
                </div>
            </div>

            {/* AI Summary */}
            <div className="card-glass p-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-blue-100">
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <SparklesIcon className="w-3 h-3" />
                    Inventory Intelligence Summary
                </h3>
                <p className="text-gray-700 font-medium leading-relaxed">{data?.ai_summary}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Stock Table */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card-glass overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">Live Inventory Status</h3>
                            <button className="text-xs font-medium text-blue-600 hover:text-blue-700">Export CSV</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Item Name</th>
                                        <th className="px-6 py-3 font-medium">Category</th>
                                        <th className="px-6 py-3 font-medium">Stock</th>
                                        <th className="px-6 py-3 font-medium">Days Left</th>
                                        <th className="px-6 py-3 font-medium">Status</th>
                                        <th className="px-6 py-3 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {data?.items.map((item) => (
                                        <tr key={item.item_id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4 font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {item.item_name}
                                                <div className="text-[10px] text-gray-400 font-normal">{item.supplier}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                <span className="px-2 py-1 rounded bg-gray-100 text-[10px] font-medium">{item.category}</span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">
                                                <div className="font-bold">{item.current_stock.toLocaleString()}</div>
                                                <div className="text-[10px] text-gray-400">Min: {item.minimum_stock}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`flex items-center gap-1 font-mono ${item.days_remaining < 7 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                                                    {item.days_remaining < 999 ? item.days_remaining : '>365'}
                                                </div>
                                                <div className="text-[10px] text-gray-400">Depletes: {new Date(item.predicted_depletion_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={item.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {item.recommended_reorder_qty > 0 && (
                                                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title={`Order ${item.recommended_reorder_qty} ${item.unit}`}>
                                                        <ShoppingCartIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Risks & Vendors */}
                <div className="space-y-6">
                    {/* Risk Alerts */}
                    <div className="card-glass p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <TrendingDownIcon className="w-4 h-4 text-red-500" />
                            Supply Chain Risks
                        </h3>
                        <div className="space-y-3">
                            {data?.risk_alerts.length > 0 ? (
                                data.risk_alerts.map((alert, i) => (
                                    <div key={i} className={`p-3 rounded-lg border ${alert.severity === 'Critical' ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'}`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${alert.severity === 'Critical' ? 'text-red-600' : 'text-orange-600'}`}>{alert.severity} Alert</span>
                                            <span className="text-[10px] text-gray-400">Just now</span>
                                        </div>
                                        <p className="text-xs font-medium text-gray-800 mb-2">{alert.message}</p>
                                        <div className="text-[10px] text-gray-600 bg-white/50 p-1.5 rounded border border-black/5 flex items-center gap-1.5">
                                            <CheckIcon className="w-3 h-3" />
                                            {alert.action}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-gray-500 text-center py-4">No active supply risks detected.</div>
                            )}
                        </div>
                    </div>

                    {/* Key Suppliers */}
                    <div className="card-glass p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <TruckIcon className="w-4 h-4 text-gray-400" />
                            Logistics Overview
                        </h3>
                        <div className="space-y-4">
                            <SupplierRow name="OxyGen Solutions" leadTime="4 hrs" status="On Time" />
                            <SupplierRow name="MedSupply Co" leadTime="24 hrs" status="Delayed" />
                            <SupplierRow name="PharmaCare" leadTime="12 hrs" status="On Time" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-components
const StatusBadge = ({ status }) => {
    let styles = "bg-gray-100 text-gray-600";
    if (status === "Critical") styles = "bg-red-100 text-red-700 animate-pulse";
    if (status === "Low") styles = "bg-yellow-100 text-yellow-700";
    if (status === "OK") styles = "bg-green-100 text-green-700";

    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${styles}`}>
            {status}
        </span>
    );
};

const SupplierRow = ({ name, leadTime, status }) => (
    <div className="flex items-center justify-between pb-3 border-b border-gray-50 last:border-0 last:pb-0">
        <div>
            <div className="text-sm font-medium text-gray-800">{name}</div>
            <div className="text-[10px] text-gray-400">Avg Lead Time: {leadTime}</div>
        </div>
        <div className={`text-[10px] font-bold px-2 py-0.5 rounded ${status === 'Delayed' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {status}
        </div>
    </div>
);

const SparklesIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);

export default Inventory;
