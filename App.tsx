
import React, { useState, useEffect, useCallback } from 'react';
import { AppInstance, User, UserRole, Zone, InstanceStatus, ExceptionType, ScheduledJob, ExceptionInstance } from './types';
import { mockUsers, mockZones } from './constants';
import { getInstances, getSchedules, getExceptionInstances, getExceptionInstance } from './services/apiService';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import FileProcessingDashboard from './components/dashboard/InstanceDashboard';
import InstanceDetailView from './components/dashboard/InstanceDetailView';
import ExceptionsDashboard from './components/exceptions/ExceptionsDashboard';
import ExceptionDetailView from './components/exceptions/ExceptionDetailView';
import TaskDetailView from './components/task/TaskDetailView';

const userCycleOrder = [
  mockUsers.saasSre,
  mockUsers.electronSre,
  mockUsers.tachyonSre,
  mockUsers.itpSre,
  mockUsers.rubySre,
  mockUsers.platformSre,
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'workbenches' | 'dashboard'>('workbenches');
  const [activeConsole, setActiveConsole] = useState('File Processing');
  const [currentUser, setCurrentUser] = useState<User>(mockUsers.saasSre);
  const [currentZone, setCurrentZone] = useState<Zone>(mockZones[0]);
  
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
    if (currentView === 'dashboard') {
      fetchData();
    }
  }, [currentView, fetchData]);

  useEffect(() => {
    // Filter Instances
    let filteredInst = instances.filter(inst => inst.zone === currentZone.id);
    if (currentUser.role === UserRole.SAAS_SRE) {
      // SaaS SREs should see all their instances except for FAILED ones that are classified as SYSTEM exceptions.
      // This includes SUCCESS, IN_PROGRESS, PENDING, FAILED (Business), and FAILED (Unclassified).
      filteredInst = filteredInst.filter(inst => 
        inst.saas === currentUser.saas && inst.exceptionType !== ExceptionType.SYSTEM
      );
    }
    setFilteredInstances(filteredInst);
    
    // Filter Schedules
    let filteredSched = scheduledJobs.filter(job => job.zone === currentZone.id);
    if (currentUser.role === UserRole.SAAS_SRE) {
        filteredSched = filteredSched.filter(job => job.saas === currentUser.saas);
    }
    setFilteredScheduledJobs(filteredSched);

  }, [instances, scheduledJobs, currentZone, currentUser]);

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


  const switchUser = () => {
    setCurrentUser(prevUser => {
      const currentIndex = userCycleOrder.findIndex(u => u.id === prevUser.id);
      const nextIndex = (currentIndex !== -1 ? currentIndex + 1 : 1) % userCycleOrder.length;
      return userCycleOrder[nextIndex];
    });
    setSelectedInstance(null);
    setSelectedException(null);
    setSelectedTaskViewData(null);
  };

  const handleSelectWorkbench = (workbenchId: string) => {
    if (workbenchId === 'olympus-hub-saas') {
      setCurrentView('dashboard');
    }
  };

  const navigateToWorkbenches = () => {
    setCurrentView('workbenches');
    setSelectedInstance(null);
    setSelectedException(null);
    setSelectedTaskViewData(null);
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
            currentUser={currentUser}
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
      default:
        return null;
    }
  }

  return (
    <div className="h-screen font-sans flex bg-slate-100">
      {currentView === 'dashboard' && <Sidebar onNavigate={navigateToWorkbenches} activeConsole={activeConsole} onConsoleChange={setActiveConsole} />}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          user={currentUser} 
          zone={currentZone} 
          zones={mockZones} 
          onZoneChange={setCurrentZone}
          onSwitchUser={switchUser}
          onNavigateHome={navigateToWorkbenches}
          isDashboardView={currentView === 'dashboard'}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {currentView === 'workbenches' && (
             <div className="max-w-7xl mx-auto">
                <WorkbenchesView onSelectWorkbench={handleSelectWorkbench} />
             </div>
          )}
          {currentView === 'dashboard' && renderDashboard()}
        </main>
      </div>
      {currentView === 'dashboard' && selectedInstance && (
        <InstanceDetailView 
          instance={selectedInstance} 
          onClose={() => handleSelectInstance(null)} 
          user={currentUser}
          onUpdateInstance={handleUpdateInstance}
          onSelectException={handleSelectException}
        />
      )}
      {currentView === 'dashboard' && selectedException && (
        <ExceptionDetailView
          exception={selectedException}
          onClose={() => handleSelectException(null)}
          onShowTaskDetailView={handleShowTaskDetailView}
        />
      )}
      {currentView === 'dashboard' && selectedTaskViewData && (
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
const BriefcaseIconWB = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;

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
  const workbenches = [ { id: 'WBHINZZ0013', title: 'Olympus Hub SaaS', description: 'Discover, diagnose, and remediate failed file application instances.', icon: <BriefcaseIconWB />, handler: () => onSelectWorkbench('olympus-hub-saas'), disabled: false, }, ];
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Workbenches ({workbenches.filter(w => !w.disabled).length})</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {workbenches.map(wb => ( <WorkbenchCard key={wb.id} {...wb} onClick={wb.handler} /> ))}
      </div>
    </div>
  );
};

export default App;
