import React, { useState, useEffect, useCallback } from 'react';
import { AppInstance, User, UserRole, Zone, InstanceStatus, ExceptionType, ScheduledJob } from './types';
import { mockUsers, mockZones } from './constants';
import { getInstances, getSchedules } from './services/apiService';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import FileProcessingDashboard from './components/dashboard/InstanceDashboard';
import InstanceDetailView from './components/dashboard/InstanceDetailView';

// Define the order for user switching
const userCycleOrder = [
  mockUsers.saasSre,
  mockUsers.electronSre,
  mockUsers.tachyonSre,
  mockUsers.itpSre,
  mockUsers.rubySre,
  mockUsers.platformSre,
];

// --- Inlined Workbench Components ---

// Fix: Corrected malformed viewBox attribute in SVG definition.
const BriefcaseIconWB = () => <svg xmlns="http://www.w.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;

interface WorkbenchCardProps {
  title: string;
  description: string;
  id: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

const WorkbenchCard: React.FC<WorkbenchCardProps> = ({ title, description, id, icon, onClick, disabled }) => {
  const cardClasses = `
    bg-white border border-slate-200 rounded-lg p-6 flex flex-col h-full shadow-sm
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 hover:border-sky-500/50 transition-all duration-200 cursor-pointer'}
  `;

  return (
    <div onClick={!disabled ? onClick : undefined} className={cardClasses}>
      <div className="bg-sky-100 text-sky-500 rounded-lg w-10 h-10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 mb-4 flex-grow">{description}</p>
      <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded-md self-start">{id}</span>
    </div>
  );
};

interface WorkbenchesViewProps {
  onSelectWorkbench: (workbenchId: string) => void;
}

const WorkbenchesView: React.FC<WorkbenchesViewProps> = ({ onSelectWorkbench }) => {
  const workbenches = [
     {
      id: 'WBHINZZ0013',
      title: 'Olympus Hub SaaS',
      description: 'Discover, diagnose, and remediate failed file application instances.',
      icon: <BriefcaseIconWB />,
      handler: () => onSelectWorkbench('olympus-hub-saas'),
      // Fix: Added 'disabled' property to the object to resolve TypeScript errors on lines 57 and 71.
      disabled: false,
    },
  ];
  
  const enabledWorkbenches = workbenches.filter(w => !w.disabled).length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Workbenches ({enabledWorkbenches})</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {workbenches.map(wb => (
          <WorkbenchCard
            key={wb.id}
            title={wb.title}
            description={wb.description}
            id={wb.id}
            icon={wb.icon}
            onClick={wb.handler}
            disabled={wb.disabled}
          />
        ))}
      </div>
    </div>
  );
};

// --- End of Inlined Workbench Components ---


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'workbenches' | 'dashboard'>('workbenches');
  const [currentUser, setCurrentUser] = useState<User>(mockUsers.saasSre);
  const [currentZone, setCurrentZone] = useState<Zone>(mockZones[0]);
  const [instances, setInstances] = useState<AppInstance[]>([]);
  const [scheduledJobs, setScheduledJobs] = useState<ScheduledJob[]>([]);
  const [filteredInstances, setFilteredInstances] = useState<AppInstance[]>([]);
  const [filteredScheduledJobs, setFilteredScheduledJobs] = useState<ScheduledJob[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<AppInstance | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [instanceData, scheduleData] = await Promise.all([
        getInstances(),
        getSchedules()
      ]);
      setInstances(instanceData);
      setScheduledJobs(scheduleData);
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
      filteredInst = filteredInst.filter(inst => 
        inst.saas === currentUser.saas &&
        (inst.status !== InstanceStatus.FAILED || inst.exceptionType === ExceptionType.BUSINESS)
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
      // Find the full instance from the original list to ensure we have all data
      const fullInstance = instances.find(i => i.id === instance.id);
      setSelectedInstance(fullInstance || instance);
    } else {
      setSelectedInstance(null);
    }
  };
  
  const handleUpdateInstance = (updatedInstance: AppInstance) => {
    setInstances(prev => prev.map(inst => inst.id === updatedInstance.id ? updatedInstance : inst));
    if (selectedInstance && selectedInstance.id === updatedInstance.id) {
      setSelectedInstance(updatedInstance);
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
      // If user not found, default to first user
      const nextIndex = (currentIndex !== -1 ? currentIndex + 1 : 1) % userCycleOrder.length;
      return userCycleOrder[nextIndex];
    });
    setSelectedInstance(null); // Close detail view on user switch
  };

  const handleSelectWorkbench = (workbenchId: string) => {
    if (workbenchId === 'olympus-hub-saas') {
      setCurrentView('dashboard');
    }
  };

  const navigateToWorkbenches = () => {
    setCurrentView('workbenches');
    setSelectedInstance(null); // Close detail view when navigating away
  };

  return (
    <div className={`h-screen font-sans ${currentView === 'dashboard' ? 'flex' : ''} bg-slate-100`}>
      {currentView === 'dashboard' && <Sidebar onNavigate={navigateToWorkbenches} />}
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
          {currentView === 'dashboard' && (
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
          )}
        </main>
      </div>
      {currentView === 'dashboard' && selectedInstance && (
        <InstanceDetailView 
          instance={selectedInstance} 
          onClose={() => handleSelectInstance(null)} 
          user={currentUser}
          onUpdateInstance={handleUpdateInstance}
        />
      )}
    </div>
  );
};

export default App;