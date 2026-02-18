import React, { useState } from 'react';
import { Branch, ServiceBooking, BookingData, AdminRole } from '../types';

interface BookingManagementProps {
  role: AdminRole;
  branch: Branch;
  roomBookings: any[];
  serviceBookings: ServiceBooking[];
}

export const BookingManagement: React.FC<BookingManagementProps> = ({
  role,
  branch,
  roomBookings,
  serviceBookings
}) => {
  const [activeTab, setActiveTab] = useState<'rooms' | 'services' | 'calendar'>('rooms');
  const [filterBranch, setFilterBranch] = useState<Branch | 'all'>(role === 'Super Admin' ? 'all' : branch);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isSuperAdmin = role === 'Super Admin';

  // Filter bookings
  const filteredRoomBookings = roomBookings.filter(b => {
    const branchMatch = filterBranch === 'all' || b.branch === filterBranch;
    const statusMatch = filterStatus === 'all' || b.status.toLowerCase() === filterStatus;
    const searchMatch = searchQuery === '' || 
      b.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase());
    return branchMatch && statusMatch && searchMatch;
  });

  const filteredServiceBookings = serviceBookings.filter(b => {
    const branchMatch = filterBranch === 'all' || b.branchId === filterBranch;
    const statusMatch = filterStatus === 'all' || b.status === filterStatus;
    const searchMatch = searchQuery === '' ||
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase());
    return branchMatch && statusMatch && searchMatch;
  });

  const allBookings = [...filteredRoomBookings, ...filteredServiceBookings.map(sb => ({
    id: sb.id,
    branch: sb.branchId,
    amount: sb.amount,
    customer: sb.customerName,
    status: sb.status,
    type: 'service',
    serviceName: sb.serviceName,
    date: sb.date,
    time: sb.time
  }))];

  const totalRevenue = allBookings.reduce((acc, b) => acc + b.amount, 0);
  const pendingCount = allBookings.filter(b => b.status.toLowerCase() === 'pending').length;
  const confirmedCount = allBookings.filter(b => b.status.toLowerCase() === 'confirmed').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-5xl font-black uppercase tracking-tighter mb-3">Booking Management</h3>
          <p className="text-sm opacity-60 uppercase tracking-widest font-bold">
            {isSuperAdmin && filterBranch === 'all' ? 'All Branches' : filterBranch}
          </p>
        </div>
        <button className="bg-burgundy text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-wider hover:brightness-125 transition-all shadow-xl">
          + Create Booking
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-[2rem] p-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">Total Bookings</p>
              <p className="text-4xl font-black">{allBookings.length}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
          </div>
          <p className="text-xs opacity-80">Active bookings</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 text-white rounded-[2rem] p-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">Pending</p>
              <p className="text-4xl font-black">{pendingCount}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
            </div>
          </div>
          <p className="text-xs opacity-80">Awaiting confirmation</p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-800 text-white rounded-[2rem] p-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">Confirmed</p>
              <p className="text-4xl font-black">{confirmedCount}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
              </svg>
            </div>
          </div>
          <p className="text-xs opacity-80">Ready to serve</p>
        </div>

        <div className="bg-gradient-to-br from-burgundy to-red-700 text-white rounded-[2rem] p-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">Revenue</p>
              <p className="text-4xl font-black">${totalRevenue}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
              </svg>
            </div>
          </div>
          <p className="text-xs opacity-80">From bookings</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-neutral-100 dark:bg-neutral-800 p-2 rounded-2xl gap-2 overflow-x-auto">
        {(['rooms', 'services', 'calendar'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab ? 'bg-white dark:bg-neutral-700 text-black dark:text-white shadow-lg' : 'opacity-40'
            }`}
          >
            {tab} Bookings
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-100 dark:border-neutral-800 flex flex-wrap gap-4 items-center">
        <span className="text-xs font-black uppercase tracking-widest opacity-40">Filters:</span>
        
        {isSuperAdmin && (
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value as any)}
            className="bg-neutral-100 dark:bg-neutral-800 px-4 py-2 rounded-xl text-xs font-bold border-none outline-none"
          >
            <option value="all">All Branches</option>
            {Object.values(Branch).map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        )}

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

        <input
          type="text"
          placeholder="Search bookings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-neutral-100 dark:bg-neutral-800 px-4 py-2 rounded-xl text-xs font-bold border-none outline-none flex-1 min-w-[200px]"
        />

        <div className="flex gap-2 ml-auto">
          <button className="bg-neutral-100 dark:bg-neutral-800 px-4 py-2 rounded-xl text-xs font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all">
            Filter
          </button>
          <button className="bg-burgundy text-white px-4 py-2 rounded-xl text-xs font-bold hover:brightness-125 transition-all">
            Export
          </button>
        </div>
      </div>

      {/* Room Bookings Tab */}
      {activeTab === 'rooms' && (
        <div className="bg-white dark:bg-neutral-900 rounded-[3rem] p-12 border border-neutral-100 dark:border-neutral-800 shadow-xl">
          <div className="flex justify-between items-center mb-10">
            <h4 className="text-2xl font-black opacity-70 uppercase tracking-[0.3em]">Room Bookings</h4>
            <span className="text-sm opacity-60">{filteredRoomBookings.length} bookings</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b-2 border-neutral-100 dark:border-neutral-800">
                <tr className="text-[10px] uppercase tracking-widest opacity-40">
                  <th className="pb-6">Booking ID</th>
                  <th className="pb-6">Customer</th>
                  <th className="pb-6">Branch</th>
                  <th className="pb-6">Room Type</th>
                  <th className="pb-6">Check-in</th>
                  <th className="pb-6">Check-out</th>
                  <th className="pb-6">Amount</th>
                  <th className="pb-6">Status</th>
                  <th className="pb-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
                {filteredRoomBookings.map((booking, index) => (
                  <tr key={booking.id} className="text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all">
                    <td className="py-6 font-black text-burgundy">#ROOM-{String(index + 1).padStart(4, '0')}</td>
                    <td className="py-6 font-medium">{booking.customer}</td>
                    <td className="py-6 font-light opacity-60">{booking.branch}</td>
                    <td className="py-6 font-medium">Executive Suite</td>
                    <td className="py-6 text-xs opacity-60">2024-02-15</td>
                    <td className="py-6 text-xs opacity-60">2024-02-18</td>
                    <td className="py-6 font-black text-lg">${booking.amount}</td>
                    <td className="py-6">
                      <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase ${
                        booking.status === 'Paid' || booking.status === 'confirmed' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                        booking.status === 'Pending' || booking.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-6">
                      <div className="flex gap-2">
                        <button className="bg-neutral-100 dark:bg-neutral-800 p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all" title="View">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </button>
                        <button className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 p-2 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        <button className="bg-green-100 dark:bg-green-900/30 text-green-600 p-2 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all" title="Check-in">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRoomBookings.length === 0 && (
              <div className="text-center py-20 opacity-40">
                <p className="text-lg font-bold uppercase tracking-widest">No room bookings found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Service Bookings Tab */}
      {activeTab === 'services' && (
        <div className="bg-white dark:bg-neutral-900 rounded-[3rem] p-12 border border-neutral-100 dark:border-neutral-800 shadow-xl">
          <div className="flex justify-between items-center mb-10">
            <h4 className="text-2xl font-black opacity-70 uppercase tracking-[0.3em]">Service Bookings</h4>
            <span className="text-sm opacity-60">{filteredServiceBookings.length} bookings</span>
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
                {filteredServiceBookings.map((booking) => (
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
                        <button className="bg-neutral-100 dark:bg-neutral-800 p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all" title="View">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </button>
                        <button className="bg-green-100 dark:bg-green-900/30 text-green-600 p-2 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all" title="Complete">
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
            {filteredServiceBookings.length === 0 && (
              <div className="text-center py-20 opacity-40">
                <p className="text-lg font-bold uppercase tracking-widest">No service bookings found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="bg-white dark:bg-neutral-900 rounded-[3rem] p-12 border border-neutral-100 dark:border-neutral-800 shadow-xl">
          <div className="text-center py-20">
            <div className="bg-neutral-100 dark:bg-neutral-800 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 opacity-40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
            </div>
            <h4 className="text-2xl font-black uppercase tracking-widest opacity-40 mb-4">Calendar View</h4>
            <p className="text-sm opacity-60">Interactive calendar view coming soon</p>
          </div>
        </div>
      )}
    </div>
  );
};
