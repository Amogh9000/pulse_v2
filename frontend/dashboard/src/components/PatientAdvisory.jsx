import { InfoIcon } from './icons/CustomIcons';

const PatientAdvisory = ({ advisory }) => {
    return (
        <div className="relative overflow-hidden rounded-2xl glass border border-yellow-200/50 bg-gradient-to-r from-yellow-50/80 to-orange-50/80 p-6 shadow-sm">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-yellow-100/50 flex items-center justify-center text-yellow-600 shrink-0">
                    <InfoIcon className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="text-base font-bold text-gray-900 mb-1">Patient Advisory</h4>
                    <p className="text-gray-700 leading-relaxed text-sm">
                        {advisory || "Standard operational procedures in effect."}
                    </p>
                </div>
            </div>

            {/* Decorative glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
        </div>
    );
};

export default PatientAdvisory;
