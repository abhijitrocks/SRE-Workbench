
import React, { useState, useMemo } from 'react';
import { Tenant, ScheduleDefinition } from '../../types';
import { mockScheduleDefinitions, mockTenants } from '../../constants';

const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 text-slate-400"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;

interface ScheduleL1ViewProps {
  tenant: Tenant;
  onSelectSchedule: (id: string) => void;
}

const ScheduleL1View: React.FC<ScheduleL1ViewProps> = ({ tenant, onSelectSchedule }) => {
  const [tenantFilter, setTenantFilter] = useState<string>('All');
  const [nameFilter, setNameFilter] = useState<string>('');

  const filteredSchedules = useMemo(() => {
    return mockScheduleDefinitions.filter(s => {
      const matchTenant = (tenant.id === 'all' || s.tenantId === tenant.id) && (tenantFilter === 'All' || s.tenantId === tenantFilter);
      const matchName = s.name.toLowerCase().includes(nameFilter.toLowerCase());
      return matchTenant && matchName;
    });
  }, [tenant, tenantFilter, nameFilter]);

  const availableTenants = useMemo(() => {
    const ids = new Set(mockScheduleDefinitions.map(s => s.tenantId));
    return Array.from(ids).sort();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Active Schedules</h1>
        <p className="text-sm text-slate-500 mt-1">Global view of trigger performance across registry-defined workflows.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                <FilterIcon />
                Filters
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <select 
                    value={tenantFilter}
                    onChange={(e) => setTenantFilter(e.target.value)}
                    className="bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                    <option value="All">All Tenants</option>
                    {availableTenants.map(id => (
                        <option key={id} value={id}>{mockTenants.find(t => t.id === id)?.name || id}</option>
                    ))}
                </select>
                <div className="relative flex-grow max-w-[300px]">
                    <input 
                        type="text"
                        placeholder="Filter by Schedule name..."
                        value={nameFilter}
                        onChange={(e) => setNameFilter(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                </div>
            </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                    <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-6 py-3">Schedule Name</th>
                        <th className="px-6 py-3">Description</th>
                        <th className="px-6 py-3">Cron Frequency</th>
                        <th className="px-6 py-3 text-center">Completed</th>
                        <th className="px-6 py-3 text-center">Missed</th>
                        <th className="px-6 py-3 text-center">Failed</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                    {filteredSchedules.map(s => (
                        <tr 
                            key={s.id} 
                            onClick={() => onSelectSchedule(s.id)}
                            className="hover:bg-sky-50/50 cursor-pointer transition-colors group"
                        >
                            <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900 group-hover:text-sky-600">
                                {s.name}
                                <span className="block text-[10px] text-slate-400 font-mono mt-0.5">{s.id}</span>
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-xs max-w-xs">{s.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center text-slate-600 font-mono text-xs">
                                    <ClockIcon /> {s.cronFrequency}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className="text-green-600 font-black">{s.stats.completed}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className={s.stats.missed > 0 ? "text-amber-600 font-black" : "text-slate-300"}>{s.stats.missed}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className={s.stats.failed > 0 ? "text-red-600 font-black" : "text-slate-300"}>{s.stats.failed}</span>
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

export default ScheduleL1View;
