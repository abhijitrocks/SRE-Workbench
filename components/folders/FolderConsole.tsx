
import React, { useState, useMemo } from 'react';
import { Tenant, AppInstance, User, InstanceStatus } from '../../types';
import StoragePanel from './StoragePanel';
import UserPanel from './UserPanel';
import FolderPanel from './FolderPanel';
import L2FileExplorer from './L2FileExplorer';
import { L2AppDetailView, AppGroup } from '../dashboard/FoldersView';

interface FolderConsoleProps {
  tenant: Tenant;
  instances: AppInstance[];
  currentUser: User;
  onUpdateInstance: (instance: AppInstance) => void;
  onSelectInstance: (instance: AppInstance | { id: string }) => void;
}

const FolderConsole: React.FC<FolderConsoleProps> = ({ tenant, instances, currentUser, onUpdateInstance, onSelectInstance }) => {
  const [activeTab, setActiveTab] = useState<'Storage' | 'Users' | 'Folders'>('Storage');
  const [userFilter, setUserFilter] = useState<string | null>(null);
  const [drillDownResource, setDrillDownResource] = useState<{ type: 'user' | 'folder' | 'app', id: string, name: string } | null>(null);

  const handleNavigateToFolders = (userName: string) => {
    setUserFilter(userName);
    setActiveTab('Folders');
  };

  const handleDrillDown = (type: 'user' | 'folder' | 'app', id: string, name: string) => {
    setDrillDownResource({ type, id, name });
  };

  // Logic to build AppGroup if we are drilling down into an app
  const selectedAppGroup = useMemo(() => {
    if (drillDownResource?.type !== 'app') return null;
    
    const appName = drillDownResource.name;
    const filteredInstances = instances.filter(i => i.applicationName === appName);
    
    const stats = { total: 0, completed: 0, failed: 0, running: 0, cancelled: 0 };
    filteredInstances.forEach(inst => {
        stats.total++;
        if (inst.status === InstanceStatus.SUCCESS) stats.completed++;
        else if (inst.status === InstanceStatus.FAILED) stats.failed++;
        else if (inst.status === InstanceStatus.IN_PROGRESS) stats.running++;
        else if (inst.status === InstanceStatus.CANCELLED) stats.cancelled++;
    });

    const appGroup: AppGroup = {
        instances: filteredInstances,
        owner: filteredInstances[0]?.saas || 'Unknown',
        description: `Standard file processing pipeline for ${appName}...`,
        stats
    };
    
    return appGroup;
  }, [drillDownResource, instances]);

  if (drillDownResource) {
    if (drillDownResource.type === 'app' && selectedAppGroup) {
        return (
            <L2AppDetailView 
                appName={drillDownResource.name}
                data={selectedAppGroup}
                initialFilter={null}
                onBack={() => setDrillDownResource(null)}
                onSelectInstance={onSelectInstance}
                currentUser={currentUser}
                onUpdateInstance={onUpdateInstance}
            />
        );
    }
    return (
      <L2FileExplorer 
        resource={drillDownResource as any} 
        onBack={() => setDrillDownResource(null)} 
        onSelectInstance={onSelectInstance}
        instances={instances}
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
                  ? 'border-sky-50 text-sky-600'
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
