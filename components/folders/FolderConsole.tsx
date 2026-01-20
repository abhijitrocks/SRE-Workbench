
import React, { useState } from 'react';
import { Tenant } from '../../types';
import StoragePanel from './StoragePanel';
import UserPanel from './UserPanel';
import FolderPanel from './FolderPanel';
import L2FileExplorer from './L2FileExplorer';

interface FolderConsoleProps {
  tenant: Tenant;
}

const FolderConsole: React.FC<FolderConsoleProps> = ({ tenant }) => {
  const [activeTab, setActiveTab] = useState<'Storage' | 'Users' | 'Folders'>('Storage');
  const [userFilter, setUserFilter] = useState<string | null>(null);
  const [drillDownResource, setDrillDownResource] = useState<{ type: 'user' | 'folder', id: string, name: string } | null>(null);

  const handleNavigateToFolders = (userName: string) => {
    setUserFilter(userName);
    setActiveTab('Folders');
  };

  const handleDrillDown = (type: 'user' | 'folder', id: string, name: string) => {
    setDrillDownResource({ type, id, name });
  };

  if (drillDownResource) {
    return (
      <L2FileExplorer 
        resource={drillDownResource} 
        onBack={() => setDrillDownResource(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Folder Console</h1>
          <p className="text-sm text-slate-500 mt-1">Manage DIA resources, storage mounts, and user access policies.</p>
        </div>
      </div>

      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {(['Storage', 'Users', 'Folders'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab !== 'Folders') setUserFilter(null);
              }}
              className={`py-4 px-1 border-b-2 font-bold text-sm uppercase tracking-tight transition-colors ${
                activeTab === tab
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab} Panel
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'Storage' && <StoragePanel tenant={tenant} />}
        {activeTab === 'Users' && <UserPanel tenant={tenant} onNavigateToFolders={handleNavigateToFolders} onDrillDown={handleDrillDown} />}
        {activeTab === 'Folders' && <FolderPanel tenant={tenant} initialUserFilter={userFilter} onDrillDown={handleDrillDown} />}
      </div>
    </div>
  );
};

export default FolderConsole;
