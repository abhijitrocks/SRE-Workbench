
import React, { useState, useMemo } from 'react';
import { Tenant, DiaUser, ResourceStatus } from '../../types';
import { mockDiaUsers, mockTenants, mockDiaFolders } from '../../constants';
import SpecYamlViewerModal from './SpecYamlViewerModal';

const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate-400"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-indigo-600"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const FolderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>;
const CodeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>;
const DrillIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;
const AlertTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 mr-1"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>;

const UserPanel: React.FC<{ 
  tenant: Tenant; 
  onNavigateToFolders: (userName: string) => void; 
  onDrillDown: (type: 'user' | 'folder', id: string, name: string) => void;
}> = ({ tenant, onNavigateToFolders, onDrillDown }) => {
  const [tenantIdFilter, setTenantIdFilter] = useState('All');
  const [userNameFilter, setUserNameFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedSpec, setSelectedSpec] = useState<DiaUser | null>(null);

  // Derive unique lists from mock data
  const availableTenants = useMemo(() => {
    const ids = new Set(mockDiaUsers.map(u => u.tenantId));
    return Array.from(ids).sort();
  }, []);

  const availableUserNames = useMemo(() => {
    const names = new Set(mockDiaUsers.map(u => u.userName));
    return Array.from(names).sort();
  }, []);

  const filteredUsers = useMemo(() => {
    return mockDiaUsers
      .filter(u => tenant.id === 'all' || u.tenantId === tenant.id)
      .filter(u => tenantIdFilter === 'All' || u.tenantId === tenantIdFilter)
      .filter(u => userNameFilter === 'All' || u.userName === userNameFilter)
      .filter(u => statusFilter === 'All' || u.status === statusFilter);
  }, [tenant, tenantIdFilter, userNameFilter, statusFilter]);

  const getUserMetrics = (userName: string, mountsCount: number = 0) => {
    const ownedFolders = mockDiaFolders.filter(f => f.username === userName).length;
    return { ownedFolders, activeMounts: mountsCount, gap: ownedFolders > 0 && mountsCount === 0 };
  };

  const resetFilters = () => {
    setTenantIdFilter('All');
    setUserNameFilter('All');
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
              value={userNameFilter} 
              onChange={(e) => setUserNameFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              <option value="All">User Name: All</option>
              {availableUserNames.map(name => <option key={name} value={name}>{name}</option>)}
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
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">User Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase text-center">Owned Folders</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase text-center">Active Mounts</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredUsers.map((user) => {
              const metrics = getUserMetrics(user.userName, user.storageMount?.length || 0);
              return (
                <tr key={user.resourceName} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-600">{user.tenantId}</td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap cursor-pointer hover:bg-indigo-50/50"
                    onClick={() => setSelectedSpec(user)}
                  >
                    <div className="flex items-center">
                      <UserIcon />
                      <div className="ml-3">
                          <span className="font-bold text-slate-900 block group-hover:text-indigo-600 transition-colors">{user.userName}</span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{user.type.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-slate-700">{metrics.ownedFolders}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col items-center justify-center">
                        <span className={`font-black text-sm ${metrics.gap ? 'text-amber-600' : 'text-slate-900'}`}>{metrics.activeMounts}</span>
                        {metrics.gap && (
                            <div className="flex items-center mt-1 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 animate-pulse" title="Configuration Gap: User owns folders but has no active runtime mounts.">
                                <AlertTriangleIcon />
                                <span className="text-[8px] font-black text-amber-700 uppercase tracking-tighter leading-none">Gap</span>
                            </div>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${user.status === ResourceStatus.ACTIVE ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                          onClick={() => onNavigateToFolders(user.userName)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                          title="View Linked Folders"
                      >
                          <FolderIcon />
                      </button>
                      <button 
                          onClick={() => onDrillDown('user', user.resourceName, user.userName)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                          title="Explore User Home Dir"
                      >
                          <DrillIcon />
                      </button>
                      <button 
                          onClick={() => setSelectedSpec(user)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                          title="View Spec"
                      >
                          <CodeIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">No users found matching filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {selectedSpec && (
        <SpecYamlViewerModal 
          title={`User Spec: ${selectedSpec.userName}`} 
          spec={{ diaUser: { [selectedSpec.resourceName]: selectedSpec } }} 
          onClose={() => setSelectedSpec(null)} 
        />
      )}
    </div>
  );
};

export default UserPanel;
