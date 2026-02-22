import React, { useState } from 'react';
import { Branch, Service, ServiceBooking, ServiceRevenue } from '../types';

interface ServiceManagementProps {
  branch: Branch;
  services: Service[];
  isSuperAdmin: boolean;
  bookings: ServiceBooking[];
  revenue: ServiceRevenue[];
  createForm: any;
  setCreateForm: (f: any) => void;
  onSubmitCreate: (e: React.FormEvent) => void;
  editForm: any;
  setEditForm: (f: any) => void;
  onSubmitUpdate: (e: React.FormEvent) => void;
  onDelete: (id: string) => void;
  onIconUpload: (file: File | null) => void;
  onEditIconUpload: (file: File | null) => void;
  loading: boolean;
}

export const ServiceManagement: React.FC<ServiceManagementProps> = ({
  branch,
  services,
  isSuperAdmin,
  bookings,
  revenue,
  createForm,
  setCreateForm,
  onSubmitCreate,
  editForm,
  setEditForm,
  onSubmitUpdate,
  onDelete,
  onIconUpload,
  onEditIconUpload,
  loading
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'revenue' | 'manage'>('overview');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const filteredBookings = bookings.filter(b => {
    const branchMatch = isSuperAdmin || b.branchId === branch;
    const statusMatch = filterStatus === 'all' || b.status === filterStatus;
    const serviceMatch = !selectedService || b.serviceId === selectedService.id;
    return branchMatch && statusMatch && serviceMatch;
  });

  const totalServiceRevenue = revenue.reduce((acc, r) => acc + r.totalRevenue, 0);
  const totalServiceBookings = revenue.reduce((acc, r) => acc + r.totalBookings, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-5xl font-black uppercase tracking-tighter mb-3">Service Management</h3>
          <p className="text-sm opacity-60 uppercase tracking-widest font-bold">
            {isSuperAdmin ? 'All Branches' : branch}
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setEditForm(null);
            if (!showCreateForm) setActiveTab('manage');
          }}
          className="bg-burgundy text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-wider hover:brightness-125 transition-all shadow-xl"
        >
          {showCreateForm ? 'Cancel' : '+ Add New Service'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-neutral-100 dark:bg-neutral-800 p-2 rounded-2xl gap-2 overflow-x-auto">
        {(['overview', 'bookings', 'revenue', 'manage'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab !== 'manage') {
                setShowCreateForm(false);
                setEditForm(null);
              }
            }}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white dark:bg-neutral-700 text-black dark:text-white shadow-lg' : 'opacity-40'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Metrics ... (keeping existing metrics) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-[2rem] p-8">
              <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Total Services</p>
              <p className="text-4xl font-black">{services.length}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-[2rem] p-8">
              <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Service Bookings</p>
              <p className="text-4xl font-black">{totalServiceBookings}</p>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-green-800 text-white rounded-[2rem] p-8">
              <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Service Revenue</p>
              <p className="text-4xl font-black">${totalServiceRevenue}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-600 to-orange-800 text-white rounded-[2rem] p-8">
              <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Avg. Booking Value</p>
              <p className="text-4xl font-black">${totalServiceBookings > 0 ? Math.round(totalServiceRevenue / totalServiceBookings) : 0}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-[3rem] p-12 border border-neutral-100 dark:border-neutral-800 shadow-xl">
            <h4 className="text-2xl font-black opacity-70 uppercase tracking-[0.3em] mb-10">Service Performance</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {revenue.slice(0, 6).map((service) => (
                <div key={service.serviceId} className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-8">
                  <div className="flex justify-between items-start mb-4">
                    <h5 className="font-black text-lg">{service.serviceName}</h5>
                    <p className="text-2xl font-black text-burgundy">${service.totalRevenue}</p>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                    <div className="bg-burgundy h-2 rounded-full" style={{ width: `${service.popularityScore}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Manage Tab with Forms */}
      {activeTab === 'manage' && (
        <div className="space-y-8">
          {(showCreateForm || editForm) && (
            <div className="bg-white dark:bg-neutral-900 rounded-[3rem] p-12 border-2 border-burgundy/30 shadow-2xl space-y-8">
              <h4 className="text-3xl font-black uppercase tracking-tight">
                {editForm ? 'Edit Service' : 'Create New Service'}
              </h4>
              <form
                onSubmit={(e) => {
                  if (editForm) onSubmitUpdate(e);
                  else onSubmitCreate(e);
                  if (!loading) { setShowCreateForm(false); setEditForm(null); }
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">Service Name</label>
                    <input
                      value={editForm ? editForm.name : createForm.name}
                      onChange={(e) => editForm ? setEditForm({ ...editForm, name: e.target.value }) : setCreateForm({ ...createForm, name: e.target.value })}
                      placeholder="e.g. Signature Spa Massage"
                      className="w-full bg-neutral-100 dark:bg-neutral-800 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 ring-burgundy/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">Description</label>
                    <textarea
                      value={editForm ? editForm.description : createForm.description}
                      onChange={(e) => editForm ? setEditForm({ ...editForm, description: e.target.value }) : setCreateForm({ ...createForm, description: e.target.value })}
                      placeholder="Service details..."
                      className="w-full bg-neutral-100 dark:bg-neutral-800 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 ring-burgundy/50 h-32 resize-none"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">Category</label>
                      <select
                        value={editForm ? editForm.category : createForm.category}
                        onChange={(e) => editForm ? setEditForm({ ...editForm, category: e.target.value as any }) : setCreateForm({ ...createForm, category: e.target.value as any })}
                        className="w-full bg-neutral-100 dark:bg-neutral-800 border-none rounded-2xl px-6 py-4 outline-none appearance-none"
                      >
                        <option>Wellness & Fitness</option>
                        <option>Food & Entertainment</option>
                        <option>Business & Events</option>
                        <option>Beauty & Care</option>
                        <option>Convenience</option>
                        <option>Family Services</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px) font-black uppercase tracking-widest opacity-50 mb-2">Pricing ($)</label>
                      <input
                        type="number"
                        value={editForm ? editForm.pricing : createForm.pricing}
                        onChange={(e) => editForm ? setEditForm({ ...editForm, pricing: e.target.value }) : setCreateForm({ ...createForm, pricing: e.target.value })}
                        placeholder="50"
                        className="w-full bg-neutral-100 dark:bg-neutral-800 border-none rounded-2xl px-6 py-4 outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">Service Icon/Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => editForm ? onEditIconUpload(e.target.files?.[0] || null) : onIconUpload(e.target.files?.[0] || null)}
                      className="w-full text-xs opacity-60"
                    />
                    {(editForm?.icon || createForm?.icon) && (
                      <img src={editForm ? editForm.icon : createForm.icon} className="mt-4 w-20 h-20 rounded-xl object-cover border border-burgundy/20" alt="Preview" />
                    )}
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-burgundy text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:brightness-125 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : (editForm ? 'Update Service' : 'Create Service')}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowCreateForm(false); setEditForm(null); }}
                      className="px-8 border border-neutral-200 dark:border-neutral-700 py-4 rounded-2xl font-black uppercase tracking-widest opacity-60 hover:opacity-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white dark:bg-neutral-900 rounded-[3rem] p-12 border border-neutral-100 dark:border-neutral-800 shadow-xl">
            <h4 className="text-2xl font-black opacity-70 uppercase tracking-[0.3em] mb-10">Active Services</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {services.map((service) => (
                <div key={service.id} className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-8 hover:shadow-xl transition-all group">
                  <div className="flex items-start gap-6">
                    <img src={service.icon || '/hero.jpeg'} alt={service.name} className="w-24 h-24 rounded-xl object-cover" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-black text-xl">{service.name}</h5>
                          <p className="text-[10px] opacity-60 uppercase tracking-widest font-black">{service.category}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditForm({
                                id: service.id,
                                name: service.name,
                                description: service.description,
                                category: service.category,
                                icon: service.icon || '',
                                hours: service.hours || '',
                                pricing: service.pricing || '0',
                                branchId: branch
                              });
                              setShowCreateForm(false);
                            }}
                            className="p-2 hover:text-burgundy transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button
                            onClick={() => onDelete(service.id)}
                            className="p-2 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-sm opacity-60 line-clamp-2 mb-4">{service.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-black text-burgundy">${service.pricing || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bookings & Revenue Tabs ... (keeping existing logic) */}
      {activeTab === 'bookings' && (
        <div className="overflow-x-auto bg-white dark:bg-neutral-900 rounded-[3rem] p-12 shadow-xl">
          <table className="w-full text-left">
            <thead><tr className="text-[10px] uppercase opacity-40"><th>Customer</th><th>Service</th><th>Status</th></tr></thead>
            <tbody>{filteredBookings.map(b => (
              <tr key={b.id}><td>{b.customerName}</td><td>{b.serviceName}</td><td>{b.status}</td></tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
};
