import React, { useState } from 'react';
import { Branch, Service, ServiceBooking, ServiceRevenue } from '../types';

interface ServiceManagementProps {
  branch: Branch;
  services: Service[];
  isSuperAdmin: boolean;
  bookings: ServiceBooking[];
  revenue: ServiceRevenue[];
}

export const ServiceManagement: React.FC<ServiceManagementProps> = ({ 
  branch, 
  services, 
  isSuperAdmin,
  bookings,
  revenue
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'revenue' | 'manage'>('overview');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

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
        <button className="bg-burgundy text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-wider hover:brightness-125 transition-all shadow-xl">
          + Add New Service
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-neutral-100 dark:bg-neutral-800 p-2 rounded-2xl gap-2 overflow-x-auto">
        {(['overview', 'bookings', 'revenue', 'manage'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab ? 'bg-white dark:bg-neutral-700 text-black dark:text-white shadow-lg' : 'opacity-40'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-[2rem] p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80">Total Services</p>
                  <p className="text-4xl font-black">{services.length}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
              </div>
              <p className="text-xs opacity-80">Active services</p>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-[2rem] p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80">Service Bookings</p>
                  <p className="text-4xl font-black">{totalServiceBookings}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                  </svg>
                </div>
              </div>
              <p className="text-xs opacity-80">This month</p>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-800 text-white rounded-[2rem] p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80">Service Revenue</p>
                  <p className="text-4xl font-black">${totalServiceRevenue}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                  </svg>
                </div>
              </div>
              <p className="text-xs opacity-80">+15% from last month</p>
            </div>

            <div className="bg-gradient-to-br from-orange-600 to-orange-800 text-white rounded-[2rem] p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80">Avg. Booking Value</p>
                  <p className="text-4xl font-black">${totalServiceBookings > 0 ? Math.round(totalServiceRevenue / totalServiceBookings) : 0}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                  </svg>
                </div>
              </div>
              <p className="text-xs opacity-80">Per service</p>
            </div>
          </div>

          {/* Service Performance Cards */}
          <div className="bg-white dark:bg-neutral-900 rounded-[3rem] p-12 border border-neutral-100 dark:border-neutral-800 shadow-xl">
            <h4 className="text-2xl font-black opacity-70 uppercase tracking-[0.3em] mb-10">Service Performance</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {revenue.slice(0, 6).map((service) => (
                <div key={service.serviceId} className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-8 hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h5 className="font-black text-lg mb-2">{service.serviceName}</h5>
                      <p className="text-xs opacity-60 uppercase tracking-widest font-bold">{service.totalBookings} bookings</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-burgundy">${service.totalRevenue}</p>
                      <p className="text-xs opacity-60">Revenue</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="opacity-60">Popularity</span>
                      <span className="font-bold">{service.popularityScore}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                      <div 
                        className="bg-burgundy h-2 rounded-full transition-all" 
                        style={{ width: `${service.popularityScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-100 dark:border-neutral-800 flex flex-wrap gap-4 items-center">
            <span className="text-xs font-black uppercase tracking-widest opacity-40">Filters:</span>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-neutral-100 dark:bg-neutral-800 px-4 py-2 rounded-xl text-xs font-bold border-none outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select 
              value={selectedService?.id || ''}
              onChange={(e) => setSelectedService(services.find(s => s.id === e.target.value) || null)}
              className="bg-neutral-100 dark:bg-neutral-800 px-4 py-2 rounded-xl text-xs font-bold border-none outline-none"
            >
              <option value="">All Services</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <button className="bg-burgundy text-white px-4 py-2 rounded-xl text-xs font-bold ml-auto">Export CSV</button>
          </div>

          {/* Bookings Table */}
          <div className="bg-white dark:bg-neutral-900 rounded-[3rem] p-12 border border-neutral-100 dark:border-neutral-800 shadow-xl">
            <div className="flex justify-between items-center mb-10">
              <h4 className="text-2xl font-black opacity-70 uppercase tracking-[0.3em]">Service Bookings</h4>
              <span className="text-sm opacity-60">{filteredBookings.length} bookings</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b-2 border-neutral-100 dark:border-neutral-800">
                  <tr className="text-[10px] uppercase tracking-widest opacity-40">
                    <th className="pb-6">Booking ID</th>
                    <th className="pb-6">Customer</th>
                    <th className="pb-6">Service</th>
                    <th className="pb-6">Branch</th>
                    <th className="pb-6">Date & Time</th>
                    <th className="pb-6">Amount</th>
                    <th className="pb-6">Status</th>
                    <th className="pb-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all">
                      <td className="py-6 font-black text-burgundy">#{booking.id}</td>
                      <td className="py-6">
                        <div>
                          <p className="font-medium">{booking.customerName}</p>
                          <p className="text-xs opacity-60">{booking.customerEmail}</p>
                        </div>
                      </td>
                      <td className="py-6 font-medium">{booking.serviceName}</td>
                      <td className="py-6 font-light opacity-60">{booking.branchId}</td>
                      <td className="py-6">
                        <div>
                          <p className="font-medium">{booking.date}</p>
                          <p className="text-xs opacity-60">{booking.time}</p>
                        </div>
                      </td>
                      <td className="py-6 font-black text-lg">${booking.amount}</td>
                      <td className="py-6">
                        <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase ${
                          booking.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                          booking.status === 'confirmed' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                          booking.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                          'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-6">
                        <div className="flex gap-2">
                          <button className="bg-neutral-100 dark:bg-neutral-800 p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all" title="View Details">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                          </button>
                          <button className="bg-green-100 dark:bg-green-900/30 text-green-600 p-2 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all" title="Confirm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                          </button>
                          <button className="bg-red-100 dark:bg-red-900/30 text-red-600 p-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all" title="Cancel">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBookings.length === 0 && (
                <div className="text-center py-20 opacity-40">
                  <p className="text-lg font-bold uppercase tracking-widest">No bookings found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <div className="space-y-8">
          {/* Revenue Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-[2rem] p-8">
              <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Total Service Revenue</p>
              <p className="text-5xl font-black mb-4">${totalServiceRevenue}</p>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 14l5-5 5 5z"/>
                </svg>
                <span className="text-xs font-bold">+18% vs last month</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-cyan-600 to-cyan-800 text-white rounded-[2rem] p-8">
              <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Average per Service</p>
              <p className="text-5xl font-black mb-4">${revenue.length > 0 ? Math.round(totalServiceRevenue / revenue.length) : 0}</p>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-cyan-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 14l5-5 5 5z"/>
                </svg>
                <span className="text-xs font-bold">+12% growth</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-violet-600 to-violet-800 text-white rounded-[2rem] p-8">
              <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Top Performer</p>
              <p className="text-2xl font-black mb-2">{revenue[0]?.serviceName || 'N/A'}</p>
              <p className="text-3xl font-black">${revenue[0]?.totalRevenue || 0}</p>
            </div>
          </div>

          {/* Detailed Revenue Table */}
          <div className="bg-white dark:bg-neutral-900 rounded-[3rem] p-12 border border-neutral-100 dark:border-neutral-800 shadow-xl">
            <h4 className="text-2xl font-black opacity-70 uppercase tracking-[0.3em] mb-10">Revenue by Service</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b-2 border-neutral-100 dark:border-neutral-800">
                  <tr className="text-[10px] uppercase tracking-widest opacity-40">
                    <th className="pb-6">Service Name</th>
                    <th className="pb-6">Total Bookings</th>
                    <th className="pb-6">Total Revenue</th>
                    <th className="pb-6">Avg. Per Booking</th>
                    {isSuperAdmin && (
                      <>
                        <th className="pb-6">Ndera</th>
                        <th className="pb-6">Kanombe</th>
                        <th className="pb-6">Kabeza</th>
                      </>
                    )}
                    <th className="pb-6">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
                  {revenue.map((service) => (
                    <tr key={service.serviceId} className="text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all">
                      <td className="py-6 font-bold">{service.serviceName}</td>
                      <td className="py-6 font-medium">{service.totalBookings}</td>
                      <td className="py-6 font-black text-lg text-burgundy">${service.totalRevenue}</td>
                      <td className="py-6 font-medium">${Math.round(service.totalRevenue / service.totalBookings)}</td>
                      {isSuperAdmin && (
                        <>
                          <td className="py-6 opacity-60">${service.branchRevenue[Branch.NDERA] || 0}</td>
                          <td className="py-6 opacity-60">${service.branchRevenue[Branch.KANOMBE] || 0}</td>
                          <td className="py-6 opacity-60">${service.branchRevenue[Branch.KABEZA] || 0}</td>
                        </>
                      )}
                      <td className="py-6">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M7 14l5-5 5 5z"/>
                          </svg>
                          <span className="text-green-600 dark:text-green-400 font-bold text-xs">+{Math.round(Math.random() * 20 + 5)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Revenue Chart */}
          <div className="bg-white dark:bg-neutral-900 rounded-[3rem] p-12 border border-neutral-100 dark:border-neutral-800 shadow-xl">
            <h4 className="text-2xl font-black opacity-70 uppercase tracking-[0.3em] mb-10">Monthly Revenue Trend</h4>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => (
                <div key={month} className="text-center">
                  <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-6 mb-4 h-40 flex items-end justify-center">
                    <div 
                      className="bg-gradient-to-t from-burgundy to-red-500 rounded-lg w-full" 
                      style={{ height: `${60 + Math.random() * 40}%` }}
                    ></div>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider opacity-60">{month}</p>
                  <p className="text-lg font-black">${Math.round(2000 + Math.random() * 2000)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Manage Tab */}
      {activeTab === 'manage' && (
        <div className="space-y-8">
          <div className="bg-white dark:bg-neutral-900 rounded-[3rem] p-12 border border-neutral-100 dark:border-neutral-800 shadow-xl">
            <h4 className="text-2xl font-black opacity-70 uppercase tracking-[0.3em] mb-10">Active Services</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {services.map((service) => (
                <div key={service.id} className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-8 hover:shadow-xl transition-all group">
                  <div className="flex items-start gap-6">
                    {service.icon && (
                      <img src={service.icon} alt={service.name} className="w-24 h-24 rounded-xl object-cover" />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h5 className="font-black text-xl mb-2">{service.name}</h5>
                          <p className="text-xs opacity-60 uppercase tracking-widest font-bold mb-2">{service.category}</p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 p-2 rounded-lg hover:bg-blue-200 transition-all" title="Edit">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                          </button>
                          <button className="bg-red-100 dark:bg-red-900/30 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-all" title="Delete">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-sm mb-4 opacity-70">{service.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {service.hours && (
                          <span className="bg-white dark:bg-neutral-700 px-3 py-1 rounded-full text-xs font-bold">
                            🕒 {service.hours}
                          </span>
                        )}
                        {service.pricing && (
                          <span className="bg-burgundy/10 text-burgundy dark:bg-burgundy/20 px-3 py-1 rounded-full text-xs font-bold">
                            💰 {service.pricing}
                          </span>
                        )}
                      </div>
                      <button className="w-full bg-burgundy text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:brightness-125 transition-all">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
