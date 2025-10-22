import React, { useState } from 'react';
import { AppInstance, User, InstanceStatus, Task, ExceptionInstance } from '../../types';
import ActionModals from '../dashboard/ActionModals';
import InstanceFailureContent from '../shared/InstanceFailureContent';

const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;

interface TaskDetailViewProps {
  data: {
    instance: AppInstance;
    exception: ExceptionInstance;
  };
  onClose: () => void;
  user: User;
  onUpdateInstance: (instance: AppInstance) => void;
}

const TaskDetailView: React.FC<TaskDetailViewProps> = ({ data, onClose, user, onUpdateInstance }) => {
  const { instance, exception } = data;
  const [activeTab, setActiveTab] = useState('Task');
  const [modalOpen, setModalOpen] = useState<'resume' | 'cancel' | 'skip' | null>(null);
  const [selectedAction, setSelectedAction] = useState<'resume' | 'cancel' | 'skip' | ''>('');
  
  const failedTask = instance.tasks.find(t => t.status === InstanceStatus.FAILED);
  const canResume = failedTask && instance.sop?.permissionsRequired.includes(user.role);

  const handleActionSuccess = () => {
    const updatedInstance = { ...instance };
    
    updatedInstance.status = InstanceStatus.IN_PROGRESS;
    const taskIndex = updatedInstance.tasks.findIndex(t => t.id === failedTask?.id);
    if (taskIndex > -1) {
        updatedInstance.tasks[taskIndex].status = InstanceStatus.IN_PROGRESS;
        updatedInstance.tasks[taskIndex].retryAttempts++;
    }
    updatedInstance.retryCount++;
    onUpdateInstance(updatedInstance);
    setSelectedAction('');
  };
  
  const handleSubmitAction = () => {
      if(selectedAction) {
          setModalOpen(selectedAction);
      }
  };

  const renderContent = () => {
    switch(activeTab) {
        case 'Task':
            return (
                <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-y-auto">
                        <InstanceFailureContent instance={instance} />
                    </div>
                    <div className="p-4 border-t border-slate-200 bg-white shrink-0 flex items-center justify-end space-x-4">
                        <div className="w-full max-w-xs">
                             <label htmlFor="action-select" className="sr-only">Select Action</label>
                             <select
                                id="action-select"
                                value={selectedAction}
                                onChange={(e) => setSelectedAction(e.target.value as any)}
                                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                            >
                                <option value="" disabled>Choose an action...</option>
                                <option value="resume" disabled={!canResume} title={!canResume ? "Resume not permitted by SOP or your role" : ""}>Resume from failed step</option>
                                <option value="cancel">Cancel Instance</option>
                                <option value="skip">Skip Failed Records</option>
                            </select>
                        </div>
                        <button 
                          className="bg-slate-600 hover:bg-slate-700 text-white font-semibold px-6 py-2 rounded-md text-sm transition-colors shadow-sm disabled:bg-slate-400 disabled:cursor-not-allowed"
                          disabled={!selectedAction || !failedTask}
                          onClick={handleSubmitAction}
                          title={!selectedAction ? "Please select an action to proceed." : ""}
                        >
                            Submit Action
                        </button>
                    </div>
                </div>
            );
        default:
            return <div className="p-6 h-full overflow-y-auto"><div className="text-center text-slate-500 bg-white p-6 rounded-lg border">This view is not yet implemented.</div></div>
    }
  };
  
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose}></div>
      <aside className="fixed top-0 right-0 h-full w-full max-w-7xl bg-slate-50 border-l border-slate-200 shadow-2xl z-50 flex flex-col animate-slide-in-right">
        <header className="p-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
          <h2 className="text-xl font-semibold text-slate-900">
            {`Assess: ${exception.description} - ${instance.exceptionCode || 'FAILURE'}`}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm">
                <span className="text-slate-500 mr-2">Unassigned</span>
                <UserIcon />
            </div>
            <button className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors shadow-sm">
                Assign
            </button>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 text-slate-500"><XIcon /></button>
          </div>
        </header>
        
        <nav className="px-6 pt-4 border-b border-slate-200 bg-white shrink-0">
          <div className="flex space-x-6">
            {['Task', 'Request Details', 'Files Linked to Request', 'Exception Details', 'SOP'].map(tabName => (
              <TabButton
                key={tabName}
                name={tabName}
                active={activeTab === tabName}
                onClick={() => setActiveTab(tabName)}
              />
            ))}
          </div>
        </nav>

        <main className="flex-1 overflow-hidden">
           {renderContent()}
        </main>
        
      </aside>
      
      {modalOpen && failedTask && (
        <ActionModals
            action={modalOpen}
            instance={instance}
            task={failedTask}
            onClose={() => setModalOpen(null)}
            onSuccess={handleActionSuccess}
        />
      )}
    </>
  );
};

const TabButton: React.FC<{name: string, active: boolean, onClick: () => void}> = ({ name, active, onClick }) => (
    <button onClick={onClick} className={`${active ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>
        {name}
    </button>
);

export default TaskDetailView;