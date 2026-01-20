
import React, { useState, useEffect, useCallback } from 'react';
import { AppInstance, User, UserRole, Zone, InstanceStatus, ExceptionType, ScheduledJob, ExceptionInstance, Tenant } from './types';
import { mockUsers, mockZones, mockTenants } from './constants';
import { getInstances, getSchedules, getExceptionInstances, getExceptionInstance } from './services/apiService';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import FileProcessingDashboard from './components/dashboard/InstanceDashboard';
import InstanceDetailView from './components/dashboard/InstanceDetailView';
import ExceptionsDashboard from './components/exceptions/ExceptionsDashboard';
import ExceptionDetailView from './components/exceptions/ExceptionDetailView';
import TaskDetailView from './components/task/TaskDetailView';
import FolderConsole from './components/folders/FolderConsole';

const OpsCenterLogo = () => (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3">
        {/* Dark Blue Shape */}
        <path d="M22.9416 5.14355C25.9221 6.11183 28.3882 8.57791 29.3564 11.5584C30.292 14.4363 29.6534 17.6186 27.653 19.9987C28.5218 22.9531 27.7538 26.2483 25.6843 28.3177C23.6149 30.3871 20.3197 31.1552 17.3653 30.2864C14.4109 29.4175 11.4939 30.015 9.11379 28.0146C6.73371 26.0142 6.13619 23.0972 7.00504 20.1428C6.13619 17.1883 6.90423 13.8931 8.97368 11.8237C11.0431 9.75425 14.3383 8.98621 17.2928 9.85506C18.261 6.87458 20.6276 4.4085 22.9416 5.14355Z" fill="#3A4D8F"/>
        {/* Pink Shape */}
        <path d="M28.4111 20.9167C29.8333 21.5057 30.9023 22.8278 31.3368 24.3822C31.758 25.8829 31.4283 27.5253 30.4504 28.7891C30.8394 30.2253 30.5097 31.7897 29.5418 32.9645C28.5739 34.1393 27.0195 34.6338 25.6833 34.1993C24.3472 33.7648 22.8129 34.0438 21.6381 33.1759C20.4633 32.308 20.1336 30.8718 20.4731 29.5357C20.1336 28.1995 20.4026 26.7433 21.2705 25.5685C22.1384 24.3937 23.4605 23.8592 24.8827 24.2837C25.4717 22.8615 26.8828 21.7925 28.4111 20.9167Z" fill="#EC4899"/>
    </svg>
);

const App: React.FC = () => {
  const [activeWorkbench, setActiveWorkbench] = useState<'olympus-hub-saas' | 'next-orbit-saas' | null>(null);
  const [activeConsole, setActiveConsole] = useState('File Processing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentZone, setCurrentZone] = useState<Zone>(mockZones[0]);
  const [currentTenant, setCurrentTenant] = useState<Tenant>(mockTenants[0]);
  
  const [instances, setInstances] = useState<AppInstance[]>([]);
  const [scheduledJobs, setScheduledJobs] = useState<ScheduledJob[]>([]);
  const [exceptionInstances, setExceptionInstances] = useState<ExceptionInstance[]>([]);

  const [filteredInstances, setFilteredInstances] = useState<AppInstance[]>([]);
  const [filteredScheduledJobs, setFilteredScheduledJobs] = useState<ScheduledJob[]>([]);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedInstance, setSelectedInstance] = useState<AppInstance | null>(null);
  const [selectedException, setSelectedException] = useState<ExceptionInstance | null>(null);
  const [selectedTaskViewData, setSelectedTaskViewData] = useState<{ instance: AppInstance, exception: ExceptionInstance } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [instanceData, scheduleData, exceptionData] = await Promise.all([
        getInstances(),
        getSchedules(),
        getExceptionInstances(),
      ]);
      setInstances(instanceData);
      setScheduledJobs(scheduleData);
      setExceptionInstances(exceptionData);
    } catch (err) {
      setError('Failed to fetch data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, fetchData]);

  useEffect(() => {
    if (!currentUser) {
      setFilteredInstances([]);
      setFilteredScheduledJobs([]);
      return;
    }

    // Base filtering by zone first
    let tempInstances = instances.filter(inst => inst.zone === currentZone.id);
    let tempSchedules = scheduledJobs.filter(job => job.zone === currentZone.id);

    // Conditionally filter by tenant if "All tenants" is not selected
    if (currentTenant.id !== 'all') {
      tempInstances = tempInstances.filter(inst => inst.tenantId === currentTenant.id);
      tempSchedules = tempSchedules.filter(job => job.tenantId === currentTenant.id);
    }
    
    if (currentUser.role === UserRole.SAAS_SRE) {
      // SaaS SREs view is scoped to their assigned SaaS and business-related exceptions.
      tempInstances = tempInstances.filter(inst => 
        inst.saas === currentUser.saas && inst.exceptionType !== ExceptionType.SYSTEM
      );
      tempSchedules = tempSchedules.filter(job => job.saas === currentUser.saas);
    } else if (currentUser.role === UserRole.PLATFORM_SRE) {
      // Platform SREs have a global view of all instances within the selected context.
      // No additional filtering is needed beyond the base filters.
      // This explicit block clarifies the logic.
    }

    setFilteredInstances(tempInstances);
    setFilteredScheduledJobs(tempSchedules);

  }, [instances, scheduledJobs, currentZone, currentTenant, currentUser, activeWorkbench]);

  const handleSelectInstance = (instance: AppInstance | null) => {
    if (instance) {
      const fullInstance = instances.find(i => i.id === instance.id);
      setSelectedInstance(fullInstance || instance);
    } else {
      setSelectedInstance(null);
    }
  };

  const handleSelectException = async (exceptionId: string | null) => {
    if (exceptionId) {
      const exceptionDetails = await getExceptionInstance(exceptionId);
      setSelectedException(exceptionDetails || null);
    } else {
      setSelectedException(null);
    }
  };

  const handleShowTaskDetailView = async (exceptionId: string) => {
    const linkedInstance = instances.find(inst => inst.exceptionInstanceId === exceptionId);
    const exceptionDetails = await getExceptionInstance(exceptionId);

    if (linkedInstance && exceptionDetails) {
      setSelectedException(null); // Close exception view
      setSelectedTaskViewData({ instance: linkedInstance, exception: exceptionDetails }); // Open new task detail view
    } else {
      console.warn(`Could not find required data for Exception ID: ${exceptionId}`);
    }
  };

  const handleCloseTaskDetailView = () => {
    setSelectedTaskViewData(null);
  };
  
  const handleUpdateInstance = (updatedInstance: AppInstance) => {
    setInstances(prev => prev.map(inst => inst.id === updatedInstance.id ? updatedInstance : inst));
    if (selectedInstance && selectedInstance.id === updatedInstance.id) {
      setSelectedInstance(updatedInstance);
    }
    if (selectedTaskViewData && selectedTaskViewData.instance.id === updatedInstance.id) {
        setSelectedTaskViewData(prev => prev ? { ...prev, instance: updatedInstance } : null);
    }
  };

  const handleAddInstance = (newInstance: AppInstance) => {
    setInstances(prev => [newInstance, ...prev]);
  };

  const handleUpdateSchedule = (updatedSchedule: ScheduledJob) => {
    setScheduledJobs(prev => prev.map(job => job.id === updatedSchedule.id ? updatedSchedule : job));
  };

  const handleSelectWorkbench = (workbenchId: string) => {
    if (workbenchId === 'olympus-hub-saas') {
      setActiveWorkbench('olympus-hub-saas');
      setCurrentUser(mockUsers.platformSre);
    } else if (workbenchId === 'next-orbit-saas') {
      setActiveWorkbench('next-orbit-saas');
      setCurrentUser(mockUsers.saasSre);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveWorkbench(null);
    setSelectedInstance(null);
    setSelectedException(null);
    setSelectedTaskViewData(null);
    setActiveConsole('File Processing');
  };

  const renderDashboard = () => {
    switch(activeConsole) {
      case 'File Processing':
        return (
          <FileProcessingDashboard
            instances={filteredInstances}
            scheduledJobs={filteredScheduledJobs}
            onSelectInstance={handleSelectInstance}
            loading={loading}
            error={error}
            currentUser={currentUser!}
            onUpdateInstance={handleUpdateInstance}
            onUpdateSchedule={handleUpdateSchedule}
            onAddInstance={handleAddInstance}
          />
        );
      case 'Exceptions':
        return (
          <ExceptionsDashboard 
            exceptions={exceptionInstances}
            onSelectException={handleSelectException}
            loading={loading}
            error={error}
          />
        );
      case 'Folder Console':
        return <FolderConsole tenant={currentTenant} />;
      default:
        return null;
    }
  }
  
  if (!currentUser) {
    return (
      <div className="h-screen font-sans bg-slate-100 flex flex-col">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-4 md:px-6 shrink-0">
          <div className="flex items-center">
            <OpsCenterLogo />
            <span className="text-xl font-semibold text-slate-800 tracking-wider">OPERATIONS CENTER</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex items-center justify-center">
             <div className="max-w-7xl mx-auto w-full">
                <WorkbenchesView onSelectWorkbench={handleSelectWorkbench} />
             </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen font-sans flex bg-slate-100">
      <Sidebar onNavigate={handleLogout} activeConsole={activeConsole} onConsoleChange={setActiveConsole} activeWorkbench={activeWorkbench} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          user={currentUser} 
          zone={currentZone} 
          zones={mockZones} 
          onZoneChange={setCurrentZone}
          tenant={currentTenant}
          tenants={mockTenants}
          onTenantChange={setCurrentTenant}
          onNavigateHome={handleLogout}
          activeWorkbench={activeWorkbench}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {renderDashboard()}
        </main>
      </div>
      {selectedInstance && (
        <InstanceDetailView 
          instance={selectedInstance} 
          onClose={() => handleSelectInstance(null)} 
          user={currentUser}
          onUpdateInstance={handleUpdateInstance}
          onSelectException={handleSelectException}
        />
      )}
      {selectedException && (
        <ExceptionDetailView
          exception={selectedException}
          onClose={() => handleSelectException(null)}
          onShowTaskDetailView={handleShowTaskDetailView}
        />
      )}
      {selectedTaskViewData && (
          <TaskDetailView 
            data={selectedTaskViewData}
            onClose={handleCloseTaskDetailView}
            user={currentUser}
            onUpdateInstance={handleUpdateInstance}
          />
      )}
    </div>
  );
};


// --- Inlined Workbench Components ---
const BriefcaseIconWB = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;

const WorkbenchCard: React.FC<{ title: string; description: string; id: string; icon: React.ReactNode; onClick: () => void; disabled?: boolean;}> = ({ title, description, id, icon, onClick, disabled }) => {
  const cardClasses = `bg-white border border-slate-200 rounded-lg p-6 flex flex-col h-full shadow-sm ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 hover:border-sky-500/50 transition-all duration-200 cursor-pointer'}`;
  return (
    <div onClick={!disabled ? onClick : undefined} className={cardClasses}>
      <div className="bg-sky-100 text-sky-500 rounded-lg w-10 h-10 flex items-center justify-center mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 mb-4 flex-grow">{description}</p>
      <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded-md self-start">{id}</span>
    </div>
  );
};

const WorkbenchesView: React.FC<{onSelectWorkbench: (workbenchId: string) => void;}> = ({ onSelectWorkbench }) => {
  const workbenches = [
    { id: 'WBHINZZ0013', title: 'Olympus Hub SaaS', description: 'Enter as an Olympus Hub SRE to manage system-level exceptions and platform health.', icon: <BriefcaseIconWB />, handler: () => onSelectWorkbench('olympus-hub-saas'), disabled: false, },
    { id: 'WBHINZZ0014', title: 'Next Orbit SaaS', description: 'Enter as a Next Orbit SRE to manage business exceptions for your dedicated SaaS.', icon: <BriefcaseIconWB />, handler: () => onSelectWorkbench('next-orbit-saas'), disabled: false, },
  ];
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Select a Workbench</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {workbenches.map(wb => ( <WorkbenchCard key={wb.id} {...wb} onClick={wb.handler} /> ))}
      </div>
    </div>
  );
};

export default App;
