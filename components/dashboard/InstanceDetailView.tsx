import React, { useState, useRef, useEffect } from 'react';
import { AppInstance, User, InstanceStatus, Task, UserRole, ExceptionType, AuditEventType } from '../../types';
import FailedInstanceView from './FailedInstanceView';
import SuccessInstanceView from './SuccessInstanceView';
import ActionModals, { ActionsDropdown } from './ActionModals';
import { notifySre } from '../../services/apiService';

const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;

interface InstanceDetailViewProps {
  instance: AppInstance;
  onClose: () => void;
  user: User;
  onUpdateInstance: (instance: AppInstance) => void;
  onSelectException: (exceptionId: string | null) => void;
}

const InstanceDetailView: React.FC<InstanceDetailViewProps> = ({ instance, onClose, user, onUpdateInstance, onSelectException }) => {

  const isSuccess = instance.status === InstanceStatus.SUCCESS;
  const isCancelled = instance.status === InstanceStatus.CANCELLED;
  const [modalOpen, setModalOpen] = useState<AuditEventType | null>(null);
  const [isNotifying, setIsNotifying] = useState(false);

  const failedTask = !isSuccess ? instance.tasks.find(t => t.status === InstanceStatus.FAILED) : undefined;

  const handleActionSuccess = (updatedInstance: AppInstance) => {
    onUpdateInstance(updatedInstance);
  };

  const handleNotify = async () => {
    setIsNotifying(true);
    try {
        const { updatedInstance } = await notifySre(instance.id);
        onUpdateInstance(updatedInstance);
    } catch (error) {
        console.error("Failed to notify SRE", error);
        // Maybe show a toast notification here
    } finally {
        setIsNotifying(false);
    }
  };

  const showNotifyButton = user.role === UserRole.PLATFORM_SRE && instance.status === InstanceStatus.FAILED && instance.exceptionType === ExceptionType.BUSINESS;
  const isPlatformSreOnBusinessException = user.role === UserRole.PLATFORM_SRE && instance.exceptionType === ExceptionType.BUSINESS;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose}></div>
      <aside className="fixed top-0 right-0 h-full w-full max-w-7xl bg-slate-50 border-l border-slate-200 shadow-2xl z-50 flex flex-col animate-slide-in-right">
        <header className="p-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
          <div className="flex-grow">
            {isSuccess || isCancelled ? (
              <h2 className="text-lg font-semibold text-slate-900">
                  {instance.fileName}
                  <span className="ml-3 inline-block">
                      <StatusChip status={instance.status} />
                  </span>
              </h2>
            ) : (
              <div>
                <h2 className="text-lg font-semibold text-slate-900">App Instance Detail</h2>
                <p className="text-sm text-slate-500 font-mono">{instance.id}</p>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
             {showNotifyButton && (
                <button
                    onClick={handleNotify}
                    disabled={instance.isNotified || isNotifying}
                    className="flex items-center bg-white border border-slate-300 text-slate-700 font-medium px-4 py-2 rounded-md text-sm transition-colors shadow-sm hover:bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                    {instance.isNotified ? <CheckCircleIcon /> : <BellIcon />}
                    <span className="ml-2">
                        {isNotifying ? 'Notifying...' : instance.isNotified ? 'SaaS SRE Notified' : 'Notify SaaS SRE'}
                    </span>
                </button>
             )}
             {!isSuccess && !isCancelled && (
                <ActionsDropdown
                  instance={instance}
                  user={user}
                  onActionClick={(action) => setModalOpen(action)}
                  disabled={isPlatformSreOnBusinessException}
                  disabledTooltip={
                    isPlatformSreOnBusinessException
                      ? "Platform SREs cannot take action on Business Exceptions."
                      : undefined
                  }
                />
            )}
            <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 text-slate-500"><XIcon /></button>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto">
          {isSuccess ? (
             <SuccessInstanceView instance={instance} />
          ) : (
            <FailedInstanceView 
                instance={instance} 
                onSelectException={onSelectException}
            />
          )}
        </div>
      </aside>
      {modalOpen && failedTask && (
        <ActionModals
            action={modalOpen}
            instance={instance}
            task={failedTask}
            user={user}
            onClose={() => setModalOpen(null)}
            onSuccess={handleActionSuccess}
        />
      )}
    </>
  );
};

// Re-defining StatusChip here to avoid circular dependency if moved to its own file and imported back
const statusStyles: { [key in InstanceStatus]: { bg: string; text: string; dot: string } } = {
  [InstanceStatus.SUCCESS]: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  [InstanceStatus.IN_PROGRESS]: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  [InstanceStatus.FAILED]: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  [InstanceStatus.PENDING]: { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
  [InstanceStatus.CANCELLED]: { bg: 'bg-slate-200', text: 'text-slate-700', dot: 'bg-slate-500' },
};

const StatusChip: React.FC<{ status: InstanceStatus }> = ({ status }) => {
  const styles = statusStyles[status];
  if (!styles) return null;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles.bg} ${styles.text}`}>
      <span className={`w-2 h-2 mr-1.5 rounded-full ${styles.dot}`}></span>
      {status}
    </span>
  );
};


export default InstanceDetailView;