
import React, { useState, useMemo } from 'react';
import { Tenant, ScheduleDefinition, ScheduleStatus, ScheduleRunStatus } from '../../types';
import { mockScheduleDefinitions, mockTenants, mockScheduleExecutions } from '../../constants';
import { getHumanReadableCron } from '../../utils/cronUtils';

const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 text-slate-400"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
// Fix: Updated CalendarIcon to accept className prop.
const CalendarIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "mr-2 text-slate-400"}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;

interface ScheduleL1ViewProps {
  tenant: Tenant;
  onSelectSchedule: (id: string) => void;
}

const ScheduleL1View: React.FC<ScheduleL1ViewProps> = ({ tenant, onSelectSchedule }) => {
  const [tenantFilter, setTenantFilter] = useState<string>('All');
  const [nameFilter, setNameFilter] = useState<string>('All');
  
  // Date Filtering State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredSchedules = useMemo(() => {
    return mockScheduleDefinitions.filter(s => {
      const matchTenant = (tenant.id === 'all' || s.tenantId === tenant.id) && (tenantFilter === 'All' || s.tenantId === tenantFilter);
      const matchName = nameFilter === 'All' || s.name === nameFilter;
      return matchTenant && matchName;
    }).sort((a, b) => {
        // Sort OVERDUE to top to emphasize trigger failure use cases
        if (a.status === ScheduleStatus.OVERDUE && b.status !== ScheduleStatus.OVERDUE) return -1;
        if (a.status !== ScheduleStatus.OVERDUE && b.status === ScheduleStatus.OVERDUE) return 1;
        return a.name.localeCompare(b.name);
    }).map(s => {
        // Calculate dynamic stats based on the date filter
        const scheduleExecutions = mockScheduleExecutions.filter(e => e.scheduleId === s.id);
        
        let filteredExecs = scheduleExecutions;
        if (startDate) {
            const start = new Date(startDate).getTime();
            filteredExecs = filteredExecs.filter(e => new Date(e.expectedTime).getTime() >= start);
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Ensure end of selected day is included
            filteredExecs = filteredExecs.filter(e => new Date(e.expectedTime).getTime() <= end.getTime());
        }

        return {
            ...s,
            stats: {
                completed: filteredExecs.filter(e => e.status === ScheduleRunStatus.SUCCESS).length,
                missed: filteredExecs.filter(e => e.status === ScheduleRunStatus.MISSED).length,
                failed: filteredExecs.filter(e => e.status === ScheduleRunStatus.FAILED).length,
            }
        };
    });
  }, [tenant, tenantFilter, nameFilter, startDate, endDate]);

  const availableTenants = useMemo(() => {
    const ids = new Set(mockScheduleDefinitions.map(s => s.tenantId));
    return Array.from(ids).sort();
  }, []);

  const availableNames = useMemo(() => {
    const names = new Set(mockScheduleDefinitions.map(s => s.name));
    return Array.from(names).sort();
  }, []);

  const handleResetFilters = () => {
    setTenantFilter('All');
    setNameFilter('All');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Active Schedules</h1>
          <p className="text-sm text-slate-500 mt-1">Global view of trigger performance across registry-defined workflows.</p>
        </div>
        <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-lg p-1.5 shadow-sm">
            <div className="relative">
                <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-8 pr-2 py-1 bg-transparent border-0 rounded text-[11px] font-bold text-slate-700 focus:outline-none outline-none"
                />
            </div>
            <span className="text-slate-300 text-xs">—</span>
            <div className="relative">
                <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pl-8 pr-2 py-1 bg-transparent border-0 rounded text-[11px] font-bold text-slate-700 focus:outline-none outline-none"
                />
            </div>
            {(startDate || endDate) && (
                <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-[10px] font-black uppercase text-sky-600 px-2 border-l border-slate-100">Clear</button>
            )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <FilterIcon />
                    Registry Filters
                </div>
                {(tenantFilter !== 'All' || nameFilter !== 'All') && (
                    <button 
                        onClick={() => { setTenantFilter('All'); setNameFilter('All'); }}
                        className="text-[10px] font-black uppercase text-sky-600 hover:underline"
                    >
                        Reset Search
                    </button>
                )}
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
                <select 
                    value={tenantFilter}
                    onChange={(e) => setTenantFilter(e.target.value)}
                    className="bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-sm"
                >
                    <option value="All">All Tenants</option>
                    {availableTenants.map(id => (
                        <option key={id} value={id}>{mockTenants.find(t => t.id === id)?.name || id}</option>
                    ))}
                </select>
                
                <select 
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-sm min-w-[240px]"
                >
                    <option value="All">All Schedules</option>
                    {availableNames.map(name => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                </select>
            </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50/50">
                    <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-6 py-4">Schedule Name</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Frequency</th>
                        <th className="px-6 py-4 text-center">Success</th>
                        <th className="px-6 py-4 text-center">Missed</th>
                        <th className="px-6 py-4 text-center">Failed</th>
                        <th className="px-6 py-4 text-center">Skipped</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                    {filteredSchedules.map(s => (
                        <tr 
                            key={s.id} 
                            onClick={() => onSelectSchedule(s.id)}
                            className="hover:bg-slate-50 cursor-pointer transition-colors group"
                        >
                            <td className="px-6 py-5 whitespace-nowrap">
                                <span className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors block">
                                    {s.name}
                                </span>
                                <span className="block text-[10px] text-slate-400 font-mono mt-0.5 tracking-tighter uppercase">{s.id}</span>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                                <ScheduleStatusBadge status={s.status} />
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                                <div className="flex items-center text-slate-600 font-bold text-xs">
                                    <ClockIcon /> 
                                    <span title={s.cronFrequency}>{getHumanReadableCron(s.cronFrequency)}</span>
                                </div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-center">
                                <span className={`${s.stats.completed > 0 ? 'text-green-600 font-black' : 'text-slate-300 font-medium'} text-base`}>
                                    {s.stats.completed}
                                </span>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-center">
                                <span className={`${s.stats.missed > 0 ? "text-amber-600 font-black" : "text-slate-200 font-medium"} text-base`}>
                                    {s.stats.missed}
                                </span>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap text-center">
                                <span className={`${s.stats.failed > 0 ? "text-red-600 font-black" : "text-slate-200 font-medium"} text-base`}>
                                    {s.stats.failed}
                                </span>
                            </td>
                        </tr>
                    ))}
                    {filteredSchedules.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">No schedules found matching filters.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

const ScheduleStatusBadge = ({ status }: { status: ScheduleStatus }) => {
    const styles = {
        [ScheduleStatus.ON_SCHEDULE]: 'bg-green-100 text-green-700 border-green-200',
        [ScheduleStatus.OVERDUE]: 'bg-red-100 text-red-800 border-red-200 animate-pulse shadow-sm',
        [ScheduleStatus.DISABLED]: 'bg-slate-100 text-slate-500 border-slate-200 opacity-60',
    };
    return (
        <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase border rounded-full ${styles[status]}`}>
            {status}
        </span>
    );
};

export default ScheduleL1View;
