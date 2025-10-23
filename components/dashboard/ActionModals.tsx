import React, { useState, useRef, useEffect } from 'react';
import { AppInstance, Task, User, InstanceStatus, AuditEventType } from '../../types';
import { postInstanceAction } from '../../services/apiService';

const ChevronDownIcon = ({ className = '' }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"></path></svg>;

export const ActionsDropdown: React.FC<{
  instance: AppInstance;
  user: User;
  onActionClick: (action: 'Resume' | 'Cancel' | 'Skip') => void;
  disabled?: boolean;
  disabledTooltip?: string;
}> = ({ instance, user, onActionClick, disabled = false, disabledTooltip }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const failedTask = instance.tasks.find(t => t.status === InstanceStatus.FAILED);
  const canResume = failedTask && instance.sop?.permissionsRequired.includes(user.role);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (action: 'Resume' | 'Cancel' | 'Skip') => {
    onActionClick(action);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center bg-sky-600 text-white font-medium px-4 py-2 rounded-md text-sm transition-colors shadow-sm ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-sky-700'}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        disabled={disabled}
        title={disabled ? disabledTooltip : 'Perform an action'}
      >
        Actions
        <ChevronDownIcon className="ml-2 h-4 w-4" />
      </button>
      {isOpen && !disabled && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <button
              onClick={() => handleItemClick('Resume')}
              disabled={!canResume}
              className="w-full text-left text-slate-700 block px-4 py-2 text-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white"
              title={!canResume ? "Resume not permitted by SOP or your role" : "Resume from failed step"}
              role="menuitem"
            >
              Resume from failed step
            </button>
            <button
              onClick={() => handleItemClick('Cancel')}
              className="w-full text-left text-slate-700 block px-4 py-2 text-sm hover:bg-slate-100"
              role="menuitem"
            >
              Cancel Instance
            </button>
            <button
              onClick={() => handleItemClick('Skip')}
              className="w-full text-left text-slate-700 block px-4 py-2 text-sm hover:bg-slate-100"
              role="menuitem"
            >
              Skip Failed Records
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


interface ActionModalsProps {
  action: AuditEventType;
  instance: AppInstance;
  task: Task;
  user: User;
  onClose: () => void;
  onSuccess: (updatedInstance: AppInstance) => void;
}

const ActionModals: React.FC<ActionModalsProps> = ({ action, instance, task, user, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [skipCount, setSkipCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (action === 'Cancel' && !reason) {
      setError('Reason for cancellation is mandatory.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await postInstanceAction({
          instanceId: instance.id,
          taskId: task.id,
          action,
          user,
          reason,
          skipCount: action === 'Skip' ? skipCount : undefined
      });
      if (res.success) {
        onSuccess(res.updatedInstance);
        onClose();
      } else {
        setError(res.message);
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (action) {
      case 'Resume':
        return (
          <>
            <h3 className="text-lg font-medium leading-6 text-slate-900">Confirm Resume Action</h3>
            <div className="mt-2">
              <p className="text-sm text-slate-500">Are you sure you want to resume task <span className="font-semibold text-sky-600">{task.name}</span>? Please confirm the following preconditions are met:</p>
              <ul className="list-disc list-inside text-sm text-slate-600 mt-3 space-y-1 bg-slate-100 p-3 rounded-md">
                {instance.sop?.preconditions.slice(0, 3).map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          </>
        );
      case 'Cancel':
        return (
          <>
            <h3 className="text-lg font-medium leading-6 text-slate-900">Cancel Application Instance</h3>
            <div className="mt-4 space-y-3">
              <p className="text-sm text-slate-500">Please provide a reason for cancelling instance <span className="font-mono text-sky-600">{instance.id.split('-')[0]}...</span> This action is irreversible and will be audited.</p>
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-slate-700">Reason for Cancel (Mandatory)</label>
                <textarea
                  id="reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 block w-full rounded-md bg-slate-50 border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm text-slate-800"
                  placeholder="e.g., Data issue identified, replaced by new instance XYZ..."
                />
              </div>
            </div>
          </>
        );
      case 'Skip':
        return (
          <>
            <h3 className="text-lg font-medium leading-6 text-slate-900">Skip Records</h3>
            <div className="mt-4 space-y-3">
              <p className="text-sm text-slate-500">Specify the number of records to skip for task <span className="font-semibold text-sky-600">{task.name}</span>. Ensure this is permitted by the SOP. This action will be audited.</p>
              <div>
                 <label htmlFor="skipCount" className="block text-sm font-medium text-slate-700">Number of records to skip</label>
                 <input
                    type="number"
                    id="skipCount"
                    value={skipCount}
                    onChange={(e) => setSkipCount(parseInt(e.target.value, 10))}
                    className="mt-1 block w-full rounded-md bg-slate-50 border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm text-slate-800"
                    min="1"
                 />
              </div>
              <div>
                <label htmlFor="reason-skip" className="block text-sm font-medium text-slate-700">Reason for Skipping</label>
                <input
                  id="reason-skip"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 block w-full rounded-md bg-slate-50 border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm text-slate-800"
                  placeholder="Optional: e.g., Malformed data from source"
                />
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const buttonText = action.charAt(0).toUpperCase() + action.slice(1);
  const buttonColor = action === 'Cancel' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="bg-white border border-slate-200 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          {renderContent()}
           {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </div>
        <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 ${buttonColor}`}
          >
            {loading ? 'Processing...' : `Confirm ${buttonText}`}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionModals;