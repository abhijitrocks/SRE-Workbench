
import React, { useState, useEffect } from 'react';
import { AppInstance, User, Task, LogEntry, InstanceStatus, ExceptionType } from '../../types';
import LogViewer from './LogViewer';
import SopViewer from './SopViewer';
import LiveLogsModal from './LiveLogsModal';
import { getLogsForTask } from '../../services/apiService';
import { allExceptionDefs } from '../../constants/exceptions';

// --- ICONS ---
const CheckCircleIcon = () => <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const XCircleIcon = () => <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
const ClockIcon = () => <svg className="h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z" clipRule="evenodd" /></svg>;
const SpinnerIcon = () => <svg className="h-5 w-5 text-blue-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;


const FailedInstanceView: React.FC<{
  instance: AppInstance;
}> = ({ instance }) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'logs' | 'sop'>('tasks');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logLoading, setLogLoading] = useState(false);
  const [isLiveLogsModalOpen, setIsLiveLogsModalOpen] = useState(false);

  useEffect(() => {
    // Select the failed or first in-progress task by default
    const taskToSelect = instance.tasks.find(t => t.status === InstanceStatus.FAILED) 
        || instance.tasks.find(t => t.status === InstanceStatus.IN_PROGRESS)
        || instance.tasks[0];
    
    if (taskToSelect) {
      setSelectedTask(taskToSelect);
    }
    
    // Always default to the Task Timeline tab when a new instance is viewed.
    setActiveTab('tasks');
  }, [instance]);

  useEffect(() => {
    if (selectedTask) {
      setLogLoading(true);
      getLogsForTask(instance.id, selectedTask.id)
        .then(setLogs)
        .finally(() => setLogLoading(false));
    }
  }, [selectedTask, instance.id]);
  
  return (
    <>
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Meta & Details */}
        <div className="space-y-6">
          <InstanceMeta instance={instance} />
          <ExceptionDetails instance={instance} />
        </div>

        {/* Right Column: Tabs (Timeline, Logs, SOP) */}
        <div className="flex flex-col h-[calc(100vh-120px)]">
          <div className="border-b border-slate-200 shrink-0">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
              <TabButton name="Task Timeline" active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
              <TabButton name="Logs" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
              <TabButton name="SOP" active={activeTab === 'sop'} onClick={() => setActiveTab('sop')} />
            </nav>
          </div>
          <div className="flex-1 mt-4 min-h-0">
            {activeTab === 'tasks' && (
              <div className="bg-white p-4 h-full overflow-y-auto rounded-lg border border-slate-200">
                <TasksTimeline 
                  instance={instance} 
                  selectedTask={selectedTask} 
                  onSelectTask={setSelectedTask} 
                  onViewLogs={() => setActiveTab('logs')}
                />
              </div>
            )}
            {activeTab === 'logs' && <LogViewer logs={logs} loading={logLoading} task={selectedTask} onOpenLiveView={() => setIsLiveLogsModalOpen(true)} />}
            {activeTab === 'sop' && <div className="bg-white p-4 h-full overflow-y-auto rounded-lg border border-slate-200"><SopViewer instance={instance} /></div>}
          </div>
        </div>
      </div>
      
    {isLiveLogsModalOpen && selectedTask && (
        <LiveLogsModal
            instance={instance}
            task={selectedTask}
            onClose={() => setIsLiveLogsModalOpen(false)}
        />
    )}
    </>
  );
};

// --- SUB-COMPONENTS ---

const InstanceMeta: React.FC<{instance: AppInstance}> = ({instance}) => (
    <div className="bg-white p-4 rounded-lg border border-slate-200">
        <h3 className="font-semibold text-slate-800 mb-4">{instance.applicationName}</h3>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <MetaItem label="Status"><StatusChip status={instance.status}/></MetaItem>
            <MetaItem label="SaaS">{instance.saas}</MetaItem>
            <MetaItem label="Zone">{instance.zone}</MetaItem>
            <MetaItem label="Started At">{new Date(instance.startedAt).toLocaleString()}</MetaItem>
            <MetaItem label="Last Updated">{new Date(instance.lastUpdatedAt).toLocaleString()}</MetaItem>
        </dl>
    </div>
);

const ExceptionDetails: React.FC<{instance: AppInstance}> = ({instance}) => {
    if (!instance.exceptionCode || !allExceptionDefs[instance.exceptionCode]) {
        return null;
    }
    const def = allExceptionDefs[instance.exceptionCode];

    return (
        <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-4">Exception Details</h3>
            <div className="space-y-3 text-sm">
                 <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <MetaItem label="Type"><ExceptionChip type={def.type} /></MetaItem>
                    <MetaItem label="Severity">{def.severity}</MetaItem>
                    <MetaItem label="Code"><span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">{instance.exceptionCode}</span></MetaItem>
                    <MetaItem label="Retryable?">{def.isRetryable ? 'Yes' : 'No'}</MetaItem>
                    <div className="col-span-2">
                        <dt className="text-slate-500">Message</dt>
                        <dd className="text-slate-800 font-medium font-mono bg-slate-100 p-2 rounded mt-1 text-xs">{instance.detailedErrorMessage}</dd>
                    </div>
                     <div className="col-span-2">
                        <dt className="text-slate-500">Cause</dt>
                        <dd className="text-slate-700 mt-1">{def.cause}</dd>
                    </div>
                     <div className="col-span-2">
                        <dt className="text-slate-500">Detection Point</dt>
                        <dd className="text-slate-700 mt-1">{def.detectionPoint}</dd>
                    </div>
                </dl>
            </div>
        </div>
    );
};

const TasksTimeline: React.FC<{
  instance: AppInstance, 
  selectedTask: Task | null, 
  onSelectTask: (task: Task) => void,
  onViewLogs: () => void
}> = ({instance, onSelectTask, selectedTask, onViewLogs}) => (
    <div>
        <h3 className="text-md font-semibold text-slate-800 mb-3">Tasks Timeline</h3>
        <ul className="space-y-2">
          {instance.tasks.map((task, index) => (
            <TaskItem 
                key={task.id} 
                task={task} 
                index={index} 
                isSelected={selectedTask?.id === task.id}
                onSelect={() => onSelectTask(task)}
                onViewLogs={onViewLogs}
            />
          ))}
        </ul>
    </div>
);


const MetaItem: React.FC<{label: string, children: React.ReactNode}> = ({label, children}) => (
    <>
        <dt className="text-slate-500 col-span-1">{label}</dt>
        <dd className="text-slate-800 col-span-1 font-medium">{children}</dd>
    </>
);

const TaskItem: React.FC<{
  task: Task, 
  index: number, 
  isSelected: boolean, 
  onSelect: () => void,
  onViewLogs: () => void
}> = ({task, index, isSelected, onSelect, onViewLogs}) => {
    let statusIcon;
    switch(task.status) {
        case InstanceStatus.SUCCESS: statusIcon = <CheckCircleIcon/>; break;
        case InstanceStatus.FAILED: statusIcon = <XCircleIcon/>; break;
        case InstanceStatus.IN_PROGRESS: statusIcon = <SpinnerIcon />; break;
        default: statusIcon = <ClockIcon/>;
    }
    
    const handleViewLogsClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent the li's onClick from firing separately
      onSelect(); // Select this task
      onViewLogs(); // Switch to the logs tab
    };

    return (
        <li onClick={onSelect} className={`p-3 rounded-lg cursor-pointer transition-colors flex justify-between items-center border ${isSelected ? 'bg-sky-100 border-sky-300 shadow-sm' : 'bg-white hover:bg-slate-100 border-slate-200'}`}>
            <div className="flex items-center">
                {statusIcon}
                <div className="ml-3">
                    <p className="text-sm font-medium text-slate-800">{index + 1}. {task.name}</p>
                    <p className="text-xs text-slate-500">Retries: {task.retryAttempts} {task.errorCode && `| Code: ${task.errorCode}`}</p>
                </div>
            </div>
            {task.status === InstanceStatus.FAILED && (
                <button
                    onClick={handleViewLogsClick}
                    className="bg-sky-600 text-white text-xs font-semibold px-3 py-1 rounded-md hover:bg-sky-700 transition-colors shadow-sm"
                >
                    View Logs
                </button>
            )}
        </li>
    );
};

const TabButton: React.FC<{name: string, active: boolean, onClick: () => void}> = ({ name, active, onClick }) => (
    <button onClick={onClick} className={`${active ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>
        {name}
    </button>
);

const ExceptionChip: React.FC<{type: ExceptionType}> = ({type}) => {
    const isSystem = type === ExceptionType.SYSTEM;
    return (
        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${isSystem ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'}`}>
            {type}
        </span>
    );
};

const StatusChip: React.FC<{ status: InstanceStatus }> = ({ status }) => {
  const styles: { [key in InstanceStatus]: { bg: string; text: string; } } = {
    [InstanceStatus.SUCCESS]: { bg: 'bg-green-100', text: 'text-green-800' },
    [InstanceStatus.IN_PROGRESS]: { bg: 'bg-blue-100', text: 'text-blue-800' },
    [InstanceStatus.FAILED]: { bg: 'bg-red-100', text: 'text-red-800' },
    [InstanceStatus.PENDING]: { bg: 'bg-amber-100', text: 'text-amber-800' },
  };
  const style = styles[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${style.bg} ${style.text}`}>
      {status}
    </span>
  );
};

export default FailedInstanceView;
