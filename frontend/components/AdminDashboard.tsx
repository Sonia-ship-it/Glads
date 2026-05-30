import React, { useEffect, useMemo, useState } from 'react';
import { BranchRevenue, AdminRole, Branch } from '../types';

interface AdminDashboardProps {
  role: AdminRole;
  branchId: string;
  branch: Branch;
  branchOptions: { id: string; name: string }[];
  branchRevenues: BranchRevenue[];
  roomBookings: any[];
  serviceBookings: any[];
}

const formatMoney = (value: number) => `$${Math.round(value || 0).toLocaleString()}`;

const formatDate = (d: string) => {
  if (!d) return '—';
  try {
    const date = new Date(d);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return String(d);
  }
};

const isToday = (dateStr: string) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date();
  return d.toDateString() === today.toDateString();
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  role,
  branchId,
  branch,
  branchOptions,
  branchRevenues,
  roomBookings,
  serviceBookings,
}) => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [selectedBranch, setSelectedBranch] = useState<string>(branchId);
  const isSuperAdmin = role === 'Super Admin';
  const isBranchManager = role === 'Branch Manager';
  const isReceptionist = role === 'Reception';

  const availableBranches = useMemo(() => {
    if (branchOptions.length > 0) return branchOptions;
    const seen = new Set<string>();
    return branchRevenues
      .filter((row) => !!row.branchId && !seen.has(row.branchId) && seen.add(row.branchId))
      .map((row) => ({ id: row.branchId, name: row.branchName || row.branchId }));
  }, [branchOptions, branchRevenues]);

  useEffect(() => {
    if (isSuperAdmin && selectedBranch === 'all' && !branchId) return;
    if (branchId) {
      setSelectedBranch(branchId);
    } else if (isSuperAdmin && !selectedBranch) {
      setSelectedBranch('all');
    } else if (!selectedBranch && availableBranches[0]?.id) {
      setSelectedBranch(availableBranches[0].id);
    }
  }, [branchId, availableBranches, isSuperAdmin, selectedBranch]);

  const branchLabel = useMemo(() => {
    return availableBranches.find((b) => b.id === branchId)?.name || branch || 'Branch';
  }, [availableBranches, branchId, branch]);

  const filteredRoomBookings = useMemo(() => {
    if (isSuperAdmin && selectedBranch === 'all') return roomBookings;
    const targetBranch = isSuperAdmin ? selectedBranch : branch;
    return roomBookings.filter((b) => isSuperAdmin ? String(b.rawBranchId) === String(targetBranch) : b.branch === targetBranch);
  }, [roomBookings, branch, isSuperAdmin, selectedBranch]);

  const filteredServiceBookings = useMemo(() => {
    if (isSuperAdmin && selectedBranch === 'all') return serviceBookings;
    const targetBranch = isSuperAdmin ? selectedBranch : branch;
    return serviceBookings.filter((b) => isSuperAdmin ? String(b.rawBranchId) === String(targetBranch) : b.branchId === targetBranch);
  }, [serviceBookings, branch, isSuperAdmin, selectedBranch]);

  const relevantRevenues = useMemo(
    () => {
      if (isSuperAdmin && selectedBranch === 'all') return branchRevenues;
      const scopeBranch = isSuperAdmin ? selectedBranch : branchId;
      return branchRevenues.filter((row) => row.branchId === scopeBranch);
    },
    [isSuperAdmin, selectedBranch, branchRevenues, branchId]
  );

  const totals = useMemo(() => {
    const totalRevenue = relevantRevenues.reduce((sum, row) => sum + row.totalRevenue, 0);
    const totalRoomRevenue = relevantRevenues.reduce((sum, row) => sum + row.roomRevenue, 0);
    const totalServiceRevenue = relevantRevenues.reduce((sum, row) => sum + row.serviceRevenue, 0);
    const totalBookings = relevantRevenues.reduce((sum, row) => sum + row.bookingCount, 0);
    const avgOccupancy = relevantRevenues.length
      ? relevantRevenues.reduce((sum, row) => sum + row.occupancyRate, 0) / relevantRevenues.length
      : 0;
    const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
    return { totalRevenue, totalRoomRevenue, totalServiceRevenue, totalBookings, avgOccupancy, avgBookingValue };
  }, [relevantRevenues]);

  const rankedBranches = useMemo(
    () => [...relevantRevenues].sort((a, b) => b.totalRevenue - a.totalRevenue),
    [relevantRevenues]
  );

  const recentActivity = useMemo(() => {
    const roomItems = filteredRoomBookings.slice(0, 4).map((booking) => ({
      title: 'New booking',
      description: booking?.customer || 'Guest',
      when: booking?.createdAt || booking?.checkInDate || 'Recently',
    }));
    const serviceItems = filteredServiceBookings.slice(0, 4).map((booking) => ({
      title: 'Service booking',
      description: booking?.serviceName || 'Service',
      when: booking?.createdAt || booking?.date || 'Recently',
    }));
    return [...roomItems, ...serviceItems].slice(0, 6);
  }, [filteredRoomBookings, filteredServiceBookings]);

  // Reception Desk: today's check-ins, check-outs, pending
  const todaysCheckIns = useMemo(
    () => filteredRoomBookings.filter((b) => isToday(b.checkInDate || '')),
    [filteredRoomBookings]
  );
  const todaysCheckOuts = useMemo(
    () => filteredRoomBookings.filter((b) => isToday(b.checkOutDate || '')),
    [filteredRoomBookings]
  );
  const pendingRoomBookings = useMemo(
    () => filteredRoomBookings.filter((b) => String(b.status || '').toLowerCase() === 'pending'),
    [filteredRoomBookings]
  );
  const serviceBookingsToComplete = useMemo(
    () =>
      filteredServiceBookings.filter(
        (b) =>
          String(b.status || '').toLowerCase() === 'pending' ||
          String(b.status || '').toLowerCase() === 'confirmed'
      ),
    [filteredServiceBookings]
  );

  // ─── Reception Desk Dashboard ───────────────────────────────────────────────
  if (isReceptionist) {
    return (
      <div className="space-y-6 font-(--font-outfit)">
        <div className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-6 md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-neutral-500 dark:text-neutral-400">
            Reception Desk
          </p>
          <h3 className="mt-2 text-3xl md:text-5xl font-black tracking-tight text-neutral-900 dark:text-white">
            Desk Overview
          </h3>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
            Today&apos;s tasks and upcoming activity for {branchLabel}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">Today&apos;s Check-ins</p>
            <p className="mt-2 text-3xl font-black">{todaysCheckIns.length}</p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Guests arriving today</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">Today&apos;s Check-outs</p>
            <p className="mt-2 text-3xl font-black">{todaysCheckOuts.length}</p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Guests departing today</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">Pending Confirmations</p>
            <p className="mt-2 text-3xl font-black">{pendingRoomBookings.length}</p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Awaiting confirmation</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">Service Bookings</p>
            <p className="mt-2 text-3xl font-black">{serviceBookingsToComplete.length}</p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Pending or confirmed</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-6">
            <h4 className="text-xl font-black tracking-tight mb-4">Today&apos;s Check-ins</h4>
            {todaysCheckIns.length > 0 ? (
              <div className="space-y-3">
                {todaysCheckIns.slice(0, 8).map((b) => (
                  <div
                    key={b.id}
                    className="rounded-xl border border-neutral-200 dark:border-white/10 px-4 py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold">{b.customer || 'Guest'}</p>
                      <p className="text-xs text-neutral-500">{formatDate(b.checkInDate)} – {formatDate(b.checkOutDate)}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200">
                      Check-in
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">No check-ins scheduled for today.</p>
            )}
          </div>

          <div className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-6">
            <h4 className="text-xl font-black tracking-tight mb-4">Today&apos;s Check-outs</h4>
            {todaysCheckOuts.length > 0 ? (
              <div className="space-y-3">
                {todaysCheckOuts.slice(0, 8).map((b) => (
                  <div
                    key={b.id}
                    className="rounded-xl border border-neutral-200 dark:border-white/10 px-4 py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold">{b.customer || 'Guest'}</p>
                      <p className="text-xs text-neutral-500">{formatDate(b.checkOutDate)}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200">
                      Check-out
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">No check-outs scheduled for today.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-6">
          <h4 className="text-xl font-black tracking-tight mb-4">Recent Activity</h4>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((item, index) => (
                <div key={`${item.title}-${index}`} className="rounded-xl border border-neutral-200 dark:border-white/10 px-3 py-2.5">
                  <p className="text-sm font-bold">{item.title}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.description}</p>
                  <p className="text-[11px] text-neutral-400 mt-1">{item.when}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">No recent activity yet.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Super Admin & Branch Manager Analytics Dashboard ────────────────────────
  const showBranchRankings = isSuperAdmin && rankedBranches.length > 1;
  const showPerformanceBoard = isSuperAdmin || (isBranchManager && relevantRevenues.length > 0);

  return (
    <div className="space-y-6 font-(--font-outfit)">
      <div className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-6 md:p-8">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-neutral-500 dark:text-neutral-400">
              Dashboard
            </p>
            <h3 className="mt-2 text-3xl md:text-5xl font-black tracking-tight text-neutral-900 dark:text-white">
              {role}
            </h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
              {isSuperAdmin ? 'All Branches Overview' : `${branchLabel} Branch Overview`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              disabled={!isSuperAdmin || availableBranches.length === 0}
              className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.18em] border border-neutral-300 dark:border-white/20 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 disabled:opacity-70"
            >
              {isSuperAdmin && <option value="all">All Branches</option>}
              {availableBranches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            {!isReceptionist && (['today', 'week', 'month', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.18em] transition-all ${timeRange === range
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">Total Revenue</p>
          <p className="mt-2 text-3xl font-black">{formatMoney(totals.totalRevenue)}</p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {isSuperAdmin ? 'Selected branch scope' : 'Current branch'}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">Total Bookings</p>
          <p className="mt-2 text-3xl font-black">{totals.totalBookings}</p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Confirmed + pending</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">Avg Occupancy</p>
          <p className="mt-2 text-3xl font-black">{Math.round(totals.avgOccupancy)}%</p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Across selected scope</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">Avg Booking Value</p>
          <p className="mt-2 text-3xl font-black">{formatMoney(totals.avgBookingValue)}</p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Per customer</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5 items-start">
        <div className="space-y-5">
          {showPerformanceBoard && (
            <section className="self-start rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h4 className="text-xl font-black tracking-tight">
                  {isSuperAdmin ? 'Branch Performance Board' : 'Branch Summary'}
                </h4>
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">
                  {isSuperAdmin ? 'Full Summary' : branchLabel}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-sm">
                  <thead>
                    <tr className="text-left border-b border-neutral-200 dark:border-white/10 text-neutral-500 dark:text-neutral-400">
                      <th className="py-3 font-black uppercase tracking-[0.14em] text-[10px]">Branch</th>
                      <th className="py-3 font-black uppercase tracking-[0.14em] text-[10px]">Bookings</th>
                      <th className="py-3 font-black uppercase tracking-[0.14em] text-[10px]">Room Revenue</th>
                      <th className="py-3 font-black uppercase tracking-[0.14em] text-[10px]">Service Revenue</th>
                      <th className="py-3 font-black uppercase tracking-[0.14em] text-[10px]">Total</th>
                      <th className="py-3 font-black uppercase tracking-[0.14em] text-[10px]">Occupancy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relevantRevenues.map((row) => (
                      <tr key={row.branchId} className="border-b border-neutral-100 dark:border-white/5">
                        <td className="py-3 font-bold">{row.branchName || row.branchId}</td>
                        <td className="py-3">{row.bookingCount}</td>
                        <td className="py-3">{formatMoney(row.roomRevenue)}</td>
                        <td className="py-3">{formatMoney(row.serviceRevenue)}</td>
                        <td className="py-3 font-bold">{formatMoney(row.totalRevenue)}</td>
                        <td className="py-3">{Math.round(row.occupancyRate)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-6">
            <h4 className="text-xl font-black tracking-tight">Revenue Breakdown</h4>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-neutral-200 dark:border-white/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">Room Revenue</p>
                <p className="mt-2 text-3xl font-black">{formatMoney(totals.totalRoomRevenue)}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  {totals.totalRevenue > 0 ? Math.round((totals.totalRoomRevenue / totals.totalRevenue) * 100) : 0}% of total
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-200 dark:border-white/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">Service Revenue</p>
                <p className="mt-2 text-3xl font-black">{formatMoney(totals.totalServiceRevenue)}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  {totals.totalRevenue > 0 ? Math.round((totals.totalServiceRevenue / totals.totalRevenue) * 100) : 0}% of total
                </p>
              </div>
            </div>
          </section>
        </div>

        <section className="space-y-4">
          {showBranchRankings && (
            <div className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500 mb-3">Branch Rankings</p>
              <div className="space-y-3">
                {rankedBranches.map((row, index) => (
                  <div key={row.branchId} className="flex items-center justify-between rounded-xl border border-neutral-200 dark:border-white/10 px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-black text-xs font-black inline-flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-bold leading-tight">{row.branchName || row.branchId}</p>
                        <p className="text-xs text-neutral-500">{formatMoney(row.totalRevenue)}</p>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-neutral-500">{Math.round(row.occupancyRate)}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500 mb-3">Recent Activity</p>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="rounded-xl border border-neutral-200 dark:border-white/10 px-3 py-2.5">
                    <p className="text-sm font-bold">{item.title}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.description}</p>
                    <p className="text-[11px] text-neutral-400 mt-1">{item.when}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">No recent activity yet.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
