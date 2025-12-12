import { UsersIcon, PackageIcon, BedManagementIcon, CheckIcon } from './icons/CustomIcons';

const ActionPanel = ({ actions }) => {
    const categories = {
        staffing: { icon: UsersIcon, label: 'Staffing', color: 'blue' },
        supplies: { icon: PackageIcon, label: 'Supplies', color: 'cyan' },
        beds: { icon: BedManagementIcon, label: 'Bed Management', color: 'indigo' }
    };

    // Group actions by category if they are flat, but the backend returns structured object
    // Assuming actions is an object with keys: staffing, supplies, beds (based on previous responses)

    const hasActions = actions && Object.values(actions).some(arr => arr && arr.length > 0);

    if (!hasActions) {
        return (
            <div className="card-glass p-8 h-full flex flex-col justify-center items-center text-center">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
                    <CheckIcon className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">All Systems Optimized</h3>
                <p className="text-gray-500 mt-2">No recommended actions at this time.</p>
            </div>
        );
    }

    return (
        <div className="card-glass p-8 h-full">
            <div className="flex items-center gap-3 mb-6">
                <h3 className="text-lg font-bold text-gray-900">Recommended Actions</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-100">
                    {Object.values(actions).flat().length} New
                </span>
            </div>

            <div className="space-y-6">
                {Object.entries(actions).map(([category, items]) => {
                    if (!items || items.length === 0) return null;
                    const catConfig = categories[category] || categories.staffing;
                    const Icon = catConfig.icon;

                    return (
                        <div key={category} className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                                <Icon className="w-4 h-4" />
                                {catConfig.label}
                            </div>
                            <div className="space-y-2">
                                {items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/50 border border-white/60 shadow-sm hover:shadow-md transition-all hover:bg-white/80 cursor-pointer"
                                    >
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900 flex items-center gap-2">
                                                {item.change || item.action}
                                                {/* Fallback depending on API structure */}
                                                <span className="text-gray-500 font-normal">
                                                    {item.role || item.resource} {item.shift ? `(${item.shift})` : ''}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-500 mt-1">{item.reason}</div>
                                        </div>
                                        <button className="mt-3 sm:mt-0 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition-colors opacity-0 group-hover:opacity-100">
                                            Approve
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ActionPanel;
