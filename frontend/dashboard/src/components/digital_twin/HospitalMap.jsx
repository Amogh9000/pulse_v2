import React, { useState } from 'react';
import DepartmentCard from './DepartmentCard';
import DepartmentDetailsModal from './DepartmentDetailsModal';

const HospitalMap = ({ departments }) => {
    const [selectedDept, setSelectedDept] = useState(null);

    // Helper to find dept by name
    const getDept = (name) => departments.find(d => d.name.includes(name));

    return (
        <div className="relative w-full max-w-6xl mx-auto p-4 md:p-8">
            {/* Grid Layout - Semantic Block Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[180px]">

                {/* Row 1: ER (Large) + ICU */}
                <div className="md:col-span-8 row-span-1">
                    {getDept('Emergency') && (
                        <DepartmentCard
                            department={getDept('Emergency')}
                            onClick={setSelectedDept}
                            className="h-full bg-gradient-to-br from-white to-red-50/30"
                        />
                    )}
                </div>
                <div className="md:col-span-4 row-span-1">
                    {getDept('ICU') && (
                        <DepartmentCard
                            department={getDept('ICU')}
                            onClick={setSelectedDept}
                            className="h-full bg-gradient-to-br from-white to-blue-50/30"
                        />
                    )}
                </div>

                {/* Row 2: General Ward (Large) + Respiratory + Pediatrics */}
                <div className="md:col-span-5 row-span-1">
                    {getDept('General Ward') && (
                        <DepartmentCard
                            department={getDept('General Ward')}
                            onClick={setSelectedDept}
                            className="h-full"
                        />
                    )}
                </div>
                <div className="md:col-span-4 row-span-1">
                    {getDept('Respiratory') && (
                        <DepartmentCard
                            department={getDept('Respiratory')}
                            onClick={setSelectedDept}
                            className="h-full"
                        />
                    )}
                </div>
                <div className="md:col-span-3 row-span-1">
                    {getDept('Pediatrics') && (
                        <DepartmentCard
                            department={getDept('Pediatrics')}
                            onClick={setSelectedDept}
                            className="h-full"
                        />
                    )}
                </div>

                {/* Row 3: Operating Theatre + Services */}
                <div className="md:col-span-4 row-span-1">
                    {getDept('Operating Theatre') && (
                        <DepartmentCard
                            department={getDept('Operating Theatre')}
                            onClick={setSelectedDept}
                            className="h-full"
                        />
                    )}
                </div>
                <div className="md:col-span-8 row-span-1 flex items-center justify-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <div className="text-gray-400 text-sm font-medium">Administration & Support Services</div>
                </div>

            </div>

            {/* Modal for Details */}
            <DepartmentDetailsModal
                isOpen={!!selectedDept}
                onClose={() => setSelectedDept(null)}
                department={selectedDept}
            />
        </div>
    );
};

export default HospitalMap;
