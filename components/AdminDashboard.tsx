import React, { useState } from 'react';
import { Branch, BranchRevenue, AdminRole } from '../types';
import { BRANCH_DATA } from '../constants';

interface AdminDashboardProps {
  role: AdminRole;
  branch: Branch;
  branchRevenues: BranchRevenue[];
  roomBookings: any[];
  serviceBookings: any[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  role, 
  branch,
  branchRevenues,
  roomBookings,
  serviceBookings
}) => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const isSuperAdmin = role === 'Super Admin';

  const relevantRevenues = isSuperAdmin 
    ? branchRevenues 
    : branchRevenues.filter(r => r.branchId === branch);

  const totalRevenue = relevantRevenues.reduce((acc, r) => acc + r.totalRevenue, 0);
  const totalRoomRevenue = relevantRevenues.reduce((acc, r) => acc + r.roomRevenue, 0);
  const totalServiceRevenue = relevantRevenues.reduce((acc, r) => acc + r.serviceRevenue, 0);
  const totalBookings = relevantRevenues.reduce((acc, r) => acc + r.bookingCount, 0);
  const avgOccupancy = relevantRevenues.length > 0
    ? relevantRevenues.reduce((acc, r) => acc + r.occupancyRate, 0) / relevantRevenues.length
    : 0;

  return (
    <div className="space-y-8">
      {/* Header with Role Badge */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <h2 className="text-7xl font-black uppercase tracking-tighter">Dashboard.</h2>
            <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase ${
              role === 'Super Admin' ? 'bg-gradient-to-r from-burgundy to-red-600 text-white' :
              role === 'Branch Manager' ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white' :
              'bg-gradient-to-r from-green-600 to-green-800 text-white'
            }`}>
              {role}
            </span>
          </div>
          <p className="text-sm opacity-60 uppercase tracking-widest font-bold">
            {isSuperAdmin ? 'All Branches Overview' : `${branch} Branch`}
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex bg-neutral-100 dark:bg-neutral-800 p-2 rounded-2xl gap-2">
          {(['today', 'week', 'month', 'year'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                timeRange === range ? 'bg-white dark:bg-neutral-700 text-black dark:text-white shadow-lg' : 'opacity-40'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-burgundy via-red-700 to-red-800 text-white rounded-[2rem] p-8 shadow-2xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">Total Revenue</p>
              <p className="text-4xl font-black mt-2">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 14l5-5 5 5z"/>
            </svg>
            <span className="text-xs font-bold">+12% from last {timeRange}</span>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-[2rem] p-8 shadow-2xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">Total Bookings</p>
              <p className="text-4xl font-black mt-2">{totalBookings}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 14l5-5 5 5z"/>
            </svg>
            <span className="text-xs font-bold">+8% this {timeRange}</span>
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-gradient-to-br from-green-600 to-green-800 text-white rounded-[2rem] p-8 shadow-2xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">Avg Occupancy</p>
              <p className="text-4xl font-black mt-2">{Math.round(avgOccupancy)}%</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 mt-4">
            <div className="bg-white h-2 rounded-full" style={{ width: `${avgOccupancy}%` }}></div>
          </div>
        </div>

        {/* Average Booking Value */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-[2rem] p-8 shadow-2xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">Avg Booking Value</p>
              <p className="text-4xl font-black mt-2">
                ${totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0}
              </p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3z"/>
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="text-xs font-bold opacity-80">Per customer</span>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Split Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-[3rem] p-12 border border-neutral-100 dark:border-neutral-800 shadow-xl">
          <h4 className="text-2xl font-black opacity-70 uppercase tracking-[0.3em] mb-10">Revenue Breakdown</h4>
          
          {/* Visual Breakdown */}
          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="relative">
              <div className="bg-gradient-to-br from-burgundy to-red-600 rounded-3xl p-10 text-white">
                <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-3">Room Revenue</p>
                <p className="text-5xl font-black mb-2">${totalRoomRevenue.toLocaleString()}</p>
                <p className="text-sm opacity-80">{totalRevenue > 0 ? Math.round((totalRoomRevenue / totalRevenue) * 100) : 0}% of total</p>
                <div className="absolute -right-4 -top-4 bg-white dark:bg-neutral-800 p-4 rounded-2xl shadow-xl">
                  <svg className="w-8 h-8 text-burgundy" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V6H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl p-10 text-white">
                <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-3">Service Revenue</p>
                <p className="text-5xl font-black mb-2">${totalServiceRevenue.toLocaleString()}</p>
                <p className="text-sm opacity-80">{totalRevenue > 0 ? Math.round((totalServiceRevenue / totalRevenue) * 100) : 0}% of total</p>
                <div className="absolute -right-4 -top-4 bg-white dark:bg-neutral-800 p-4 rounded-2xl shadow-xl">
                  <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed List */}
          <div className="space-y-4">
            {relevantRevenues.map((rev) => (
              <div key={rev.branchId} className="flex items-center justify-between p-6 bg-neutral-50 dark:bg-neutral-800 rounded-2xl hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-burgundy/10 dark:bg-burgundy/20 p-3 rounded-xl">
                    <svg className="w-6 h-6 text-burgundy" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-black text-lg">{rev.branchId}</p>
                    <p className="text-xs opacity-60">{rev.bookingCount} bookings</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-2xl text-burgundy">${rev.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs opacity-60">{Math.round(rev.occupancyRate)}% occupancy</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-[3rem] p-10">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 opacity-60">Quick Actions</p>
            <div className="space-y-4">
              <button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-lg p-4 rounded-2xl text-left transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-burgundy p-2 rounded-xl">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                      </svg>
                    </div>
                    <span className="font-bold text-sm">New Booking</span>
                  </div>
                  <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </button>

              <button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-lg p-4 rounded-2xl text-left transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-xl">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                      </svg>
                    </div>
                    <span className="font-bold text-sm">View Calendar</span>
                  </div>
                  <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </button>

              <button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-lg p-4 rounded-2xl text-left transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-600 p-2 rounded-xl">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                      </svg>
                    </div>
                    <span className="font-bold text-sm">Export Report</span>
                  </div>
                  <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </button>
            </div>
          </div>

          {/* Branch Performance Summary */}
          {isSuperAdmin && (
            <div className="bg-white dark:bg-neutral-900 rounded-[3rem] p-10 border border-neutral-100 dark:border-neutral-800 shadow-lg">
              <p className="text-[10px] font-black uppercase tracking-widest mb-8 opacity-40">Branch Rankings</p>
              <div className="space-y-6">
                {relevantRevenues
                  .sort((a, b) => b.totalRevenue - a.totalRevenue)
                  .map((rev, index) => (
                    <div key={rev.branchId} className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                        index === 1 ? 'bg-gradient-to-br from-neutral-400 to-neutral-600 text-white' :
                        'bg-gradient-to-br from-orange-700 to-orange-900 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm">{rev.branchId}</p>
                        <p className="text-xs opacity-60">${rev.totalRevenue.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-lg">{Math.round(rev.occupancyRate)}%</p>
                        <p className="text-xs opacity-60">occupancy</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white dark:bg-neutral-900 rounded-[3rem] p-10 border border-neutral-100 dark:border-neutral-800 shadow-lg">
            <p className="text-[10px] font-black uppercase tracking-widest mb-8 opacity-40">Recent Activity</p>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg h-fit">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">New booking confirmed</p>
                  <p className="text-xs opacity-60">Executive Studio - Ndera</p>
                  <p className="text-xs opacity-40 mt-1">2 mins ago</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg h-fit">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Payment received</p>
                  <p className="text-xs opacity-60">$850 - John Smith</p>
                  <p className="text-xs opacity-40 mt-1">15 mins ago</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg h-fit">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Service booking</p>
                  <p className="text-xs opacity-60">Spa Treatment - Alice Wong</p>
                  <p className="text-xs opacity-40 mt-1">1 hour ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-br from-burgundy via-red-700 to-red-800 text-white rounded-[3rem] p-12 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-60">System-Wide Performance</p>
              <p className="text-6xl font-black mb-2">{Object.values(Branch).length} Branches</p>
              <p className="text-xl opacity-90">Operating at peak efficiency</p>
            </div>
            <div className="grid grid-cols-3 gap-8">
              <div>
                <p className="text-4xl font-black">{totalBookings}</p>
                <p className="text-xs opacity-80 uppercase tracking-wider mt-2">Total Bookings</p>
              </div>
              <div>
                <p className="text-4xl font-black">${totalRevenue.toLocaleString()}</p>
                <p className="text-xs opacity-80 uppercase tracking-wider mt-2">Total Revenue</p>
              </div>
              <div>
                <p className="text-4xl font-black">{Math.round(avgOccupancy)}%</p>
                <p className="text-xs opacity-80 uppercase tracking-wider mt-2">Avg Occupancy</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
