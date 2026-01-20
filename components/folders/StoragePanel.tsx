
import React, { useState, useMemo } from 'react';
import { Tenant, DiaStorage, ResourceStatus } from '../../types';
import { mockDiaStorages, mockTenants } from '../../constants';
import SpecYamlViewerModal from './SpecYamlViewerModal';

const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate-400"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>;
const DatabaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-sky-600"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5V19A9 3 0 0 0 21 19V5"></path><path d="M3 12A9 3 0 0 0 21 12"></path></svg>;
const CodeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;

const StoragePanel: React.FC<{ tenant: Tenant }> = ({ tenant }) => {
  const [tenantIdFilter, setTenantIdFilter] = useState('All');
  const [storageNameFilter, setStorageNameFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedSpec, setSelectedSpec] = useState<DiaStorage | null>(null);

  // Derive unique lists from mock data
  const availableTenants = useMemo(() => {
    const ids = new Set(mockDiaStorages.map(s => s.tenantId));
    return Array.from(ids).sort();
  }, []);

  const availableStorageNames = useMemo(() => {
    const names = new Set(mockDiaStorages.map(s => s.storageName));
    return Array.from(names).sort();
  }, []);

  const filteredStorages = useMemo(() => {
    return mockDiaStorages
      .filter(s => tenant.id === 'all' || s.tenantId === tenant.id)
      .filter(s => tenantIdFilter === 'All' || s.tenantId === tenantIdFilter)
      .filter(s => storageNameFilter === 'All' || s.storageName === storageNameFilter)
      .filter(s => statusFilter === 'All' || s.status === statusFilter);
  }, [tenant, tenantIdFilter, storageNameFilter, statusFilter]);

  const resetFilters = () => {
    setTenantIdFilter('All');
    setStorageNameFilter('All');
    setStatusFilter('All');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="p-4 border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
          <FilterIcon />
          Filters
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-grow max-w-[200px]">
            <select 
              value={tenantIdFilter} 
              onChange={(e) => setTenantIdFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              <option value="All">Tenant Id: All</option>
              {availableTenants.map(id => (
                <option key={id} value={id}>
                   {mockTenants.find(t => t.id === id)?.name || id} ({id})
                </option>
              ))}
            </select>
          </div>
          <div className="relative flex-grow max-w-[200px]">
            <select 
              value={storageNameFilter} 
              onChange={(e) => setStorageNameFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              <option value="All">Storage Name: All</option>
              {availableStorageNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-md pl-3 pr-8 py-1.5 text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="All">Status: All</option>
            {Object.values(ResourceStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button 
            onClick={resetFilters}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline px-2"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Tenant Id</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Storage Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Created at</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Updated at</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredStorages.map((storage) => (
              <tr key={storage.resourceName} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-600">{storage.tenantId}</td>
                <td 
                  className="px-6 py-4 whitespace-nowrap cursor-pointer hover:bg-sky-50/50"
                  onClick={() => setSelectedSpec(storage)}
                >
                  <div className="flex items-center">
                    <DatabaseIcon />
                    <div className="ml-3">
                        <span className="font-bold text-slate-900 block group-hover:text-sky-600 transition-colors">{storage.storageName}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{storage.type.replace('_', ' ')}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500">{storage.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-500">{new Date(storage.createdTs).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-500">{new Date(storage.updatedTs).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${storage.status === ResourceStatus.ACTIVE ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                    {storage.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button 
                    onClick={() => setSelectedSpec(storage)}
                    className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                    title="View Spec"
                  >
                    <CodeIcon />
                  </button>
                </td>
              </tr>
            ))}
            {filteredStorages.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500 italic">No storage resources found matching filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {selectedSpec && (
        <SpecYamlViewerModal 
          title={`Storage Spec: ${selectedSpec.storageName}`} 
          spec={{ diaStorage: { [selectedSpec.resourceName]: selectedSpec } }} 
          onClose={() => setSelectedSpec(null)} 
        />
      )}
    </div>
  );
};

export default StoragePanel;
