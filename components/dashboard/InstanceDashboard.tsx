



import React, { useState, useMemo } from 'react';
import { AppInstance, InstanceStatus, User, UserRole, ExceptionType, ScheduledJob, ScheduleStatus } from '../../types';
import { mockAppInstances } from '../../constants';
import { notifySre } from '../../services/apiService';
import SchedulesView from './SchedulesView';
import FoldersView from './FoldersView';


// --- ICONS ---
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>;
const ChevronDownIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"></path></svg>;
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M3 21v-5h5"></path></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate-500 hover:text-sky-600"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const ArrowRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate-500 hover:text-sky-600"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"></path></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"></path></svg>;
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const SpinnerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-4 w-4 animate-spin"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;


// --- HELPER FUNCTIONS ---
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' +
           date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
};

const calculateDuration = (start: string, end: string, status: InstanceStatus): string => {
    if (status !== InstanceStatus.SUCCESS && status !== InstanceStatus.FAILED) return '-';
    const startDate = new Date(start);
    const endDate = new Date(end);
    let diff = Math.abs(endDate.getTime() - startDate.getTime()) / 1000;

    const hours = Math.floor(diff / 3600);
    diff %= 3600;
    const minutes = Math.floor(diff / 60).toString().padStart(2, '0');
    const seconds = Math.floor(diff % 60).toString().padStart(2, '0');

    return `${hours.toString().padStart(2,'0')}:${minutes}:${seconds}`;
};


// --- UI COMPONENTS ---
interface StatCardProps {
  title: string;
  value: number;
  color?: string;
  highlight?: boolean;
  onClick: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color = 'text-slate-900', highlight = false, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${highlight ? 'border-2 border-sky-500 shadow-md' : 'border border-slate-200'}`}
  >
    <h3 className="text-sm font-medium text-slate-500">{title}</h3>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
  </div>
);

const StatusIndicator: React.FC<{ status: InstanceStatus }> = ({ status }) => {
    const styles: { [key in InstanceStatus]: { dot: string; text: string } } = {
        [InstanceStatus.SUCCESS]: { dot: 'bg-green-500', text: 'text-slate-700' },
        [InstanceStatus.IN_PROGRESS]: { dot: 'bg-blue-500', text: 'text-slate-700' },
        [InstanceStatus.FAILED]: { dot: 'bg-red-500', text: 'text-slate-700' },
        [InstanceStatus.PENDING]: { dot: 'bg-amber-500', text: 'text-slate-700' },
    };
    const style = styles[status];
    return (
        <div className="flex items-center">
            <span className={`w-2 h-2 rounded-full mr-2 ${style.dot}`}></span>
            <span className={style.text}>{status}</span>
        </div>
    );
};

const TaskProgress: React.FC<{ completed: number; total: number }> = ({ completed, total }) => {
  const progressPercentage = total > 0 ? (completed / total) * 100 : 0;
  return (
    <div className="flex items-center">
      <span className="text-slate-700 w-8">{`${completed}/${total}`}</span>
      <div className="relative w-16 h-2 bg-slate-200 rounded-full overflow-hidden ml-2">
        <div 
          className="absolute top-0 left-0 h-full bg-slate-400"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const ExceptionDefinitions: React.FC<{ isOpen: boolean; onToggle: () => void; userRole: UserRole }> = ({ isOpen, onToggle, userRole }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
      <button 
        onClick={onToggle}
        className="w-full flex justify-between items-center p-4 text-left"
        aria-expanded={isOpen}
      >
        <div>
          <h2 className="text-md font-semibold text-slate-800">Understanding Exception Types</h2>
          <p className="text-sm text-slate-500">Learn the difference between Business and System exceptions.</p>
        </div>
        <ChevronDownIcon className={`transform transition-transform duration-200 text-slate-500 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[500px]' : 'max-h-0'}`}>
        <div className={`p-4 border-t border-slate-200 grid grid-cols-1 ${userRole === UserRole.PLATFORM_SRE ? 'md:grid-cols-2' : ''} gap-x-6 gap-y-4`}>
            <div>
                <h4 className="font-semibold mb-2 text-sm text-orange-600">Business Exception</h4>
                <p className="text-sm text-slate-600">
                    Problems caused by input data, schema, or domain validation (affects correctness, must be handled by business logic or publisher).
                </p>
                <em className="text-slate-500 block mt-2 text-xs">
                    <strong>Example:</strong> missing beneficiaryId, invalid plan code, duplicate beneficiary within group.
                </em>
            </div>
            {userRole === UserRole.PLATFORM_SRE && (
                <div>
                    <h4 className="font-semibold mb-2 text-sm text-purple-600">System Exception</h4>
                    <p className="text-sm text-slate-600">
                        Infra/platform/runtime failures outside business logic (affect availability/reliability).
                    </p>
                    <em className="text-slate-500 block mt-2 text-xs">
                        <strong>Example:</strong> network timeouts to Gluon, disk full, permission denied, job JVM crash.
                    </em>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

const ExceptionChip: React.FC<{type: ExceptionType}> = ({type}) => {
    const isSystem = type === ExceptionType.SYSTEM;
    return (
        <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${isSystem ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'}`}>
            {type}
        </span>
    );
};


const FileProcessingDashboard: React.FC<{
  instances: AppInstance[];
  scheduledJobs: ScheduledJob[];
  onSelectInstance: (instance: AppInstance | { id: string }) => void;
  loading: boolean;
  error: string | null;
  currentUser: User;
  onUpdateInstance: (instance: AppInstance) => void;
  onUpdateSchedule: (schedule: ScheduledJob) => void;
  onAddInstance: (instance: AppInstance) => void;
}> = ({ instances, scheduledJobs, onSelectInstance, loading, error, currentUser, onUpdateInstance, onUpdateSchedule, onAddInstance }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InstanceStatus | 'All'>(InstanceStatus.FAILED);
  const [saasFilter, setSaasFilter] = useState<string>('All');
  const [folderFilter, setFolderFilter] = useState<string>('All');
  const [exceptionFilter, setExceptionFilter] = useState<ExceptionType | 'All'>('All');
  const [showDefinitions, setShowDefinitions] = useState(false);
  const [activeView, setActiveView] = useState<'instances' | 'folders' | 'schedules'>('instances');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [sortColumn, setSortColumn] = useState<string>('startedAt');
  const [sortDirection, setSortDirection] = useState<'asc'|'desc'>('desc');

  const { availableSaas, availableFolders } = useMemo(() => {
    const saasSet = new Set<string>();
    const folderSet = new Set<string>();
    mockAppInstances.forEach(inst => {
        saasSet.add(inst.saas);
        folderSet.add(inst.applicationName);
    });
    return { 
        availableSaas: [...saasSet].sort(), 
        availableFolders: [...folderSet].sort()
    };
  }, []);

  const handleStatusFilterClick = (status: InstanceStatus | 'All') => {
    setStatusFilter(status);
    setActiveView('instances'); // Switch to instances view when a status is clicked
    setCurrentPage(1); // Reset pagination to first page on filter change
  };

  const resetFilters = () => {
      setSearchTerm('');
      setStatusFilter('All');
      setSaasFilter('All');
      setFolderFilter('All');
      setExceptionFilter('All');
      setCurrentPage(1);
  };
  
  const filteredData = useMemo(() => {
    return instances
      .filter(inst => searchTerm === '' || inst.fileName.toLowerCase().includes(searchTerm.toLowerCase()) || inst.id.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(inst => statusFilter === 'All' || inst.status === statusFilter)
      .filter(inst => folderFilter === 'All' || inst.applicationName === folderFilter)
      .filter(inst => exceptionFilter === 'All' || inst.exceptionType === exceptionFilter)
      .filter(inst => currentUser.role === UserRole.PLATFORM_SRE ? (saasFilter === 'All' || inst.saas === saasFilter) : true)
      .sort((a, b) => {
          // For Platform SRE, sort by exception type first (System > Business)
          if (currentUser.role === UserRole.PLATFORM_SRE) {
              if (a.exceptionType === ExceptionType.SYSTEM && b.exceptionType !== ExceptionType.SYSTEM) {
                  return -1;
              }
              if (a.exceptionType !== ExceptionType.SYSTEM && b.exceptionType === ExceptionType.SYSTEM) {
                  return 1;
              }
          }

          // Fallback to user-selected sort column
          const aVal = a[sortColumn as keyof AppInstance];
          const bVal = b[sortColumn as keyof AppInstance];
          
          if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
          
          return 0;
      });
  }, [instances, searchTerm, statusFilter, folderFilter, exceptionFilter, saasFilter, currentUser.role, sortColumn, sortDirection]);

  const summary = useMemo(() => ({
      total: instances.length,
      success: instances.filter(i => i.status === InstanceStatus.SUCCESS).length,
      failed: instances.filter(i => i.status === InstanceStatus.FAILED).length,
      inProgress: instances.filter(i => i.status === InstanceStatus.IN_PROGRESS).length,
      missedTriggers: scheduledJobs.filter(j => j.status === ScheduleStatus.OVERDUE).length,
  }), [instances, scheduledJobs]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (column: string) => {
      if (sortColumn === column) {
          setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
          setSortColumn(column);
          setSortDirection('asc');
      }
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'instances':
        return (
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center gap-4">
              <div className="relative flex-grow max-w-xs">
                <SearchIcon />
                <input type="text" placeholder="Search by File or App Instance ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-slate-300 rounded-md pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none" />
              </div>
              <FilterDropdown value={statusFilter} onChange={(val) => { setStatusFilter(val as any); setCurrentPage(1); }} options={Object.values(InstanceStatus)} label="Status" />
              <FilterDropdown value={folderFilter} onChange={(val) => { setFolderFilter(val); setCurrentPage(1); }} options={availableFolders} label="Folder" />
              {currentUser.role === UserRole.PLATFORM_SRE && (
                <FilterDropdown value={saasFilter} onChange={(val) => { setSaasFilter(val); setCurrentPage(1); }} options={availableSaas} label="SaaS" />
              )}
              {currentUser.role === UserRole.PLATFORM_SRE && (
                <Chip active={exceptionFilter === ExceptionType.SYSTEM} onClick={() => { setExceptionFilter(e => e === ExceptionType.SYSTEM ? 'All' : ExceptionType.SYSTEM); setCurrentPage(1); }}>System Exceptions</Chip>
              )}
              <button onClick={resetFilters} className="text-sm text-sky-600 hover:underline ml-auto">Reset</button>
            </div>
            <div className="overflow-x-auto">
              {loading ? <div className="text-center p-8">Loading...</div> :
                error ? <div className="text-center p-8 text-red-500">{error}</div> :
                  <FileTable
                    instances={paginatedData}
                    onSelectInstance={onSelectInstance}
                    onSort={handleSort}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    currentUser={currentUser}
                    onUpdateInstance={onUpdateInstance}
                  />}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredData.length}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        );
      case 'folders':
        return <FoldersView instances={instances} onSelectInstance={onSelectInstance} />;
      case 'schedules':
        return <SchedulesView scheduledJobs={scheduledJobs} onSelectInstance={onSelectInstance} onUpdateSchedule={onUpdateSchedule} onAddInstance={onAddInstance} />;
      default:
        return null;
    }
  };


  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-800">File Processing</h1>
            <div className="flex items-center space-x-2">
                <button className="flex items-center bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm hover:bg-slate-50">
                    <RefreshIcon />
                    <span>2m</span>
                </button>
                <select className="bg-white border border-slate-300 rounded-md pl-3 pr-8 py-1.5 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                </select>
            </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-6">
                <TabButton name="Instances" active={activeView === 'instances'} onClick={() => setActiveView('instances')} />
                <TabButton name="Folders" active={activeView === 'folders'} onClick={() => setActiveView('folders')} />
                <TabButton name="Schedules" active={activeView === 'schedules'} onClick={() => setActiveView('schedules')} notificationCount={summary.missedTriggers} />
            </nav>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard 
              title="All Instances" 
              value={summary.total} 
              highlight={statusFilter === 'All' && activeView === 'instances'}
              onClick={() => handleStatusFilterClick('All')} 
            />
            <StatCard 
              title="In Progress" 
              value={summary.inProgress} 
              color="text-blue-600" 
              highlight={statusFilter === InstanceStatus.IN_PROGRESS}
              onClick={() => handleStatusFilterClick(InstanceStatus.IN_PROGRESS)} 
            />
            <StatCard 
              title="Success" 
              value={summary.success} 
              color="text-green-600" 
              highlight={statusFilter === InstanceStatus.SUCCESS}
              onClick={() => handleStatusFilterClick(InstanceStatus.SUCCESS)} 
            />
            <StatCard 
              title="Failed" 
              value={summary.failed} 
              color="text-red-600" 
              highlight={statusFilter === InstanceStatus.FAILED}
              onClick={() => handleStatusFilterClick(InstanceStatus.FAILED)} 
            />
            <StatCard
              title="Missed Triggers"
              value={summary.missedTriggers}
              color="text-amber-600"
              highlight={activeView === 'schedules' && summary.missedTriggers > 0}
              onClick={() => setActiveView('schedules')}
            />
        </div>

        <ExceptionDefinitions isOpen={showDefinitions} onToggle={() => setShowDefinitions(!showDefinitions)} userRole={currentUser.role} />
      
        {/* Main Content Area */}
        {renderActiveView()}
    </div>
  );
};

// --- TABLE & PAGINATION ---
const FileTable: React.FC<{
    instances: AppInstance[]; 
    onSelectInstance: (inst: AppInstance) => void;
    onSort: (column: string) => void;
    sortColumn: string;
    sortDirection: 'asc'|'desc';
    currentUser: User;
    onUpdateInstance: (instance: AppInstance) => void;
}> = ({ instances, onSelectInstance, onSort, sortColumn, sortDirection, currentUser, onUpdateInstance }) => {
    
    const [notifyingIds, setNotifyingIds] = useState<Set<string>>(new Set());

    const handleNotify = async (e: React.MouseEvent, instance: AppInstance) => {
        e.stopPropagation(); // prevent row click
        setNotifyingIds(prev => new Set(prev).add(instance.id));
        try {
            await notifySre(instance.id);
            onUpdateInstance({ ...instance, isNotified: true });
        } catch (error) {
            console.error("Failed to notify SRE", error);
            // In a real app, show a toast notification
        } finally {
            setNotifyingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(instance.id);
                return newSet;
            });
        }
    };

    const headers = [
        { key: 'fileName', label: 'File / ID' },
        { key: 'status', label: 'Status' },
        { key: 'exceptionType', label: 'Exception Type' },
        { key: 'exceptionCode', label: 'Exception Name' },
        { key: 'completedTasks', label: 'Tasks' },
        { key: 'retryCount', label: 'Retries' },
        { key: 'saas', label: 'SaaS' },
        { key: 'startedAt', label: 'Start time' },
        { key: 'lastUpdatedAt', label: 'End time' },
        { key: 'duration', label: 'Duration' },
        { key: 'applicationName', label: 'Folder' },
        { key: 'actions', label: 'Actions' },
    ];
    
    const SortIndicator = ({ column }: {column: string}) => {
        if (sortColumn !== column) return null;
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    if (instances.length === 0) {
        return <div className="text-center p-8 text-slate-500">No matching files found.</div>;
    }

    return (
    <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
            <tr>
                {headers.map(header => (
                    <th key={header.key} scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        <button onClick={() => onSort(header.key)} className="flex items-center">
                          {header.label}
                          <span className="ml-1"><SortIndicator column={header.key} /></span>
                        </button>
                    </th>
                ))}
            </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
            {instances.map(instance => (
                <tr key={instance.id} className="hover:bg-slate-50 transition-colors duration-150">
                    <td className="px-4 py-3 whitespace-nowrap">
                        <a href="#" onClick={(e) => { e.preventDefault(); onSelectInstance(instance); }} className="font-medium text-sky-600 hover:underline">{instance.fileName}</a>
                        <p className="text-xs text-slate-500 font-mono">{instance.id}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusIndicator status={instance.status} /></td>
                    <td className="px-4 py-3 whitespace-nowrap">
                        {instance.exceptionType ? <ExceptionChip type={instance.exceptionType} /> : <span className="text-slate-500">-</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                        {instance.exceptionCode ? <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">{instance.exceptionCode}</span> : <span className="text-slate-500">-</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                        <TaskProgress completed={instance.completedTasks} total={instance.totalTasks} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">{instance.retryCount}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">{instance.saas}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">{formatDate(instance.startedAt)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">{instance.status === InstanceStatus.SUCCESS || instance.status === InstanceStatus.FAILED ? formatDate(instance.lastUpdatedAt) : '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">{calculateDuration(instance.startedAt, instance.lastUpdatedAt, instance.status)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                        <a href="#" className="text-sky-600 hover:underline">{instance.applicationName}</a>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                            {currentUser.role === UserRole.PLATFORM_SRE && instance.status === InstanceStatus.FAILED && instance.exceptionType === ExceptionType.BUSINESS && (
                                instance.isNotified ? (
                                    <div className="flex items-center text-xs text-green-600 p-1 rounded-md bg-green-50" title={`SaaS SRE Notified`}>
                                        <CheckCircleIcon />
                                        <span className="ml-1 font-medium">Notified</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={(e) => handleNotify(e, instance)}
                                        disabled={notifyingIds.has(instance.id)}
                                        className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 hover:text-sky-600 disabled:opacity-50 disabled:cursor-wait"
                                        title="Notify SaaS SRE"
                                    >
                                        {notifyingIds.has(instance.id) ? <SpinnerIcon/> : <BellIcon />}
                                    </button>
                                )
                            )}
                            <button onClick={() => onSelectInstance(instance)} title="View Details" className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200"><ArrowRightIcon /></button>
                            <button title="Download File" className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200"><DownloadIcon /></button>
                        </div>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
    );
};

const Pagination: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
    onItemsPerPageChange: (num: number) => void;
}> = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage, onItemsPerPageChange }) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="px-4 py-3 flex items-center justify-between border-t border-slate-200 text-sm">
            <div className="flex items-center space-x-2">
                <select value={itemsPerPage} onChange={e => onItemsPerPageChange(Number(e.target.value))} className="border-slate-300 rounded-md text-sm p-1">
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                </select>
                <span className="text-slate-600">
                    {totalItems > 0 ? `Showing ${startItem} - ${endItem} of ${totalItems}` : 'No items'}
                </span>
            </div>
            
            <div className="flex items-center space-x-2">
                <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-1 rounded-md disabled:opacity-50 hover:bg-slate-100"><ChevronLeftIcon /></button>
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-1 rounded-md disabled:opacity-50 hover:bg-slate-100"><ChevronRightIcon /></button>
            </div>
        </div>
    );
}

const TabButton: React.FC<{
  name: string;
  active: boolean;
  onClick: () => void;
  notificationCount?: number;
}> = ({ name, active, onClick, notificationCount = 0 }) => (
    <button
        onClick={onClick}
        className={`relative flex items-center py-2 px-1 border-b-2 font-semibold text-sm transition-colors ${
            active
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
        }`}
    >
        {name}
        {notificationCount > 0 && (
            <span className="ml-2 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5">
                {notificationCount}
            </span>
        )}
    </button>
);


// --- SHARED SUB-COMPONENTS ---
const FilterDropdown: React.FC<{value: string, onChange: (v: string) => void, options: string[], label: string}> = ({value, onChange, options, label}) => (
    <select value={value} onChange={e => onChange(e.target.value)} className="bg-white border border-slate-300 rounded-md pl-3 pr-8 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none">
        <option value="All">{label}: All</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
);

const Chip: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button onClick={onClick} className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${active ? 'bg-sky-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}>
        {children}
    </button>
);


export default FileProcessingDashboard;