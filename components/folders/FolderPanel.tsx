
import React, { useState, useMemo, useEffect } from 'react';
import { Tenant, DiaFolder, ResourceStatus } from '../../types';
import { mockDiaFolders, mockTenants } from '../../constants';
import SpecYamlViewerModal from './SpecYamlViewerModal';

const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate-400"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>;
const FolderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-amber-500"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>;
const SmartFolderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-indigo-500"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path><path d="m14 10-2.5 2.5L9 10"></path></svg>;
const CodeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>;
const DrillIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;

const FolderPanel: React.FC<{ 
  tenant: Tenant; 
  initialUserFilter: string | null;
  onDrillDown: (type: 'user' | 'folder', id: string, name: string) => void;
}> = ({ tenant, initialUserFilter, onDrillDown }) => {
  const [tenantIdFilter, setTenantIdFilter] = useState('All');
  const [userNameFilter, setUserNameFilter] = useState(initialUserFilter || 'All');
  const [folderNameFilter, setFolderNameFilter] = useState('All');
  const [folderPathFilter, setFolderPathFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [fileAppFilter, setFileAppFilter] = useState('All');
  
  const [selectedSpec, setSelectedSpec] = useState<DiaFolder | null>(null);

  useEffect(() => {
    if (initialUserFilter) setUserNameFilter(initialUserFilter);
  }, [initialUserFilter]);

  // Derive unique lists from mock data
  const availableTenants = useMemo(() => {
    const ids = new Set(mockDiaFolders.map(f => f.tenantId));
    return Array.from(ids).sort();
  }, []);

  const availableUserNames = useMemo(() => {
    const names = new Set(mockDiaFolders.map(f => f.username));
    return Array.from(names).sort();
  }, []);

  const availableFolderNames = useMemo(() => {
    const names = new Set(mockDiaFolders.map(f => f.folderName));
    return Array.from(names).sort();
  }, []);

  const availableFileApps = useMemo(() => {
    const apps = new Set(mockDiaFolders.filter(f => f.fileApplication).map(f => f.fileApplication!.name));
    return Array.from(apps).sort();
  }, []);

  const filteredFolders = useMemo(() => {
    return mockDiaFolders
      .filter(f => tenant.id === 'all' || f.tenantId === tenant.id)
      .filter(f => tenantIdFilter === 'All' || f.tenantId === tenantIdFilter)
      .filter(f => userNameFilter === 'All' || f.username === userNameFilter)
      .filter(f => folderNameFilter === 'All' || f.folderName === folderNameFilter)
      .filter(f => folderPathFilter === '' || f.path.toLowerCase().includes(folderPathFilter.toLowerCase()))
      .filter(f => statusFilter === 'All' || f.status === statusFilter)
      .filter(f => fileAppFilter === 'All' || (f.fileApplication?.name === fileAppFilter));
  }, [tenant, tenantIdFilter, userNameFilter, folderNameFilter, folderPathFilter, statusFilter, fileAppFilter]);

  const resetFilters = () => {
    setTenantIdFilter('All');
    setUserNameFilter('All');
    setFolderNameFilter('All');
    setFolderPathFilter('');
    setStatusFilter('All');
    setFileAppFilter('All');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="p-4 border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
          <FilterIcon />
          Filters
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
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
          <div className="relative">
            <select 
              value={userNameFilter} 
              onChange={(e) => setUserNameFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              <option value="All">User Name: All</option>
              {availableUserNames.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
          <div className="relative">
            <select 
              value={folderNameFilter} 
              onChange={(e) => setFolderNameFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              <option value="All">Folder Name: All</option>
              {availableFolderNames.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Filter by Path..." 
              value={folderPathFilter} 
              onChange={(e) => setFolderPathFilter(e.target.value)} 
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none" 
            />
          </div>
          <div className="relative">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              <option value="All">Status: All</option>
              {Object.values(ResourceStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="relative">
            <select 
              value={fileAppFilter} 
              onChange={(e) => setFileAppFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              <option value="All">File Application: All</option>
              {availableFileApps.map(app => <option key={app} value={app}>{app}</option>)}
            </select>
          </div>
          <div className="flex items-center">
            <button 
                onClick={resetFilters}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline"
            >
                Reset All Filters
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Tenant Id</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Folder Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Created at</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Updated at</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">File App</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredFolders.map((folder) => (
              <tr key={folder.resourceName} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-600">{folder.tenantId}</td>
                <td 
                  className="px-6 py-4 whitespace-nowrap cursor-pointer hover:bg-amber-50/50"
                  onClick={() => setSelectedSpec(folder)}
                >
                  <div className="flex items-center">
                    {folder.folderType === 'FOLDER' ? <FolderIcon /> : <SmartFolderIcon />}
                    <div className="ml-3">
                        <span className="font-bold text-slate-900 block group-hover:text-amber-600 transition-colors">{folder.folderName}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{folder.folderType}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-medium">{folder.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-500">{new Date(folder.createdTs).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-500">{new Date(folder.updatedTs).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${folder.status === ResourceStatus.ACTIVE ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                    {folder.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   {folder.fileApplication ? (
                       <span className="text-sky-600 font-bold text-xs bg-sky-50 px-2 py-0.5 rounded border border-sky-100">{folder.fileApplication.name}</span>
                   ) : (
                       <span className="text-slate-300">-</span>
                   )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button 
                        onClick={() => onDrillDown('folder', folder.resourceName, folder.folderName)}
                        className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                        title="Explore Folder Contents"
                    >
                        <DrillIcon />
                    </button>
                    <button 
                        onClick={() => setSelectedSpec(folder)}
                        className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                        title="View Spec"
                    >
                        <CodeIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredFolders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500 italic">No folders found matching filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {selectedSpec && (
        <SpecYamlViewerModal 
          title={`Folder Spec: ${selectedSpec.folderName}`} 
          spec={{ diafolder: { [selectedSpec.resourceName]: selectedSpec } }} 
          onClose={() => setSelectedSpec(null)} 
        />
      )}
    </div>
  );
};

export default FolderPanel;
