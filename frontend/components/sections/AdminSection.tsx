import * as React from 'react';
import { Branch, AdminRole } from '../../types';
import { AdminDashboard } from '../AdminDashboard';
import { BookingManagement } from '../BookingManagement';
import { ServiceManagement } from '../ServiceManagement';
import { DUMMY_BRANCH_REVENUE, DUMMY_BOOKINGS, DUMMY_SERVICE_BOOKINGS, DUMMY_SERVICE_REVENUE } from '../../data/mockData';

interface AdminSectionProps {
    adminRole: AdminRole;
    setAdminRole: (role: AdminRole) => void;
    adminSection: 'dashboard' | 'bookings' | 'services' | 'reports';
    setAdminSection: (sec: any) => void;
    activeBranch: Branch;
    services: any[];
}

export const AdminSection: React.FC<AdminSectionProps> = ({
    adminRole,
    setAdminRole,
    adminSection,
    setAdminSection,
    activeBranch,
    services
}) => {
    return (
        <section className="reveal max-w-7xl mx-auto px-6 py-20">
            <div className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div>
                    <span className="text-burgundy font-black tracking-[0.6em] uppercase text-[11px] mb-6 block">Corporate Access Portal</span>
                    <h2 className="text-7xl font-black uppercase tracking-tighter">Management.</h2>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex bg-neutral-100 dark:bg-neutral-800 p-2 rounded-2xl gap-2">
                        {(['Super Admin', 'Branch Manager', 'Reception'] as AdminRole[]).map(role => (
                            <button key={role} onClick={() => setAdminRole(role)} className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all \${adminRole === role ? 'bg-white dark:bg-neutral-700 text-black dark:text-white shadow-lg' : 'opacity-40'}`}>{role}</button>
                        ))}
                    </div>
                    <div className="flex bg-neutral-100 dark:bg-neutral-800 p-2 rounded-2xl gap-2">
                        {(['dashboard', 'bookings', 'services'] as const).map(section => (
                            <button key={section} onClick={() => setAdminSection(section)} className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all \${adminSection === section ? 'bg-white dark:bg-neutral-700 text-black dark:text-white shadow-lg' : 'opacity-40'}`}>{section}</button>
                        ))}
                    </div>
                </div>
            </div>

            {adminSection === 'dashboard' && (
                <AdminDashboard
                    role={adminRole}
                    branchId={activeBranch}
                    branch={activeBranch}
                    branchOptions={Object.values(Branch).map((b) => ({ id: b, name: b }))}
                    branchRevenues={DUMMY_BRANCH_REVENUE}
                    roomBookings={DUMMY_BOOKINGS}
                    serviceBookings={DUMMY_SERVICE_BOOKINGS}
                />
            )}

            {adminSection === 'bookings' && (
                <BookingManagement role={adminRole} branch={activeBranch} roomBookings={DUMMY_BOOKINGS} serviceBookings={DUMMY_SERVICE_BOOKINGS} />
            )}

            {adminSection === 'services' && (
                <ServiceManagement branch={activeBranch} services={services} isSuperAdmin={adminRole === 'Super Admin'} bookings={DUMMY_SERVICE_BOOKINGS} revenue={DUMMY_SERVICE_REVENUE} />
            )}
        </section>
    );
};
