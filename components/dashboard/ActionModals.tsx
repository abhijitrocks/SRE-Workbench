
import React, { useState } from 'react';
import { AppInstance, Task } from '../../types';
import { postInstanceAction } from '../../services/apiService';

interface ActionModalsProps {
  action: 'resume' | 'cancel' | 'skip';
  instance: AppInstance;
  task: Task;
  onClose: () => void;
  onSuccess: () => void;
}

const ActionModals: React.FC<ActionModalsProps> = ({ action, instance, task, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [skipCount, setSkipCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (action === 'cancel' && !reason) {
      setError('Reason for cancellation is mandatory.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await postInstanceAction(instance.id, task.id, action, reason);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message);
      }
    } catch (e) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (action) {
      case 'resume':
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
      case 'cancel':
        return (
          <>
            <h3 className="text-lg font-medium leading-6 text-slate-900">Cancel Application Instance</h3>
            <div className="mt-4 space-y-3">
              <p className="text-sm text-slate-500">Please provide a reason for cancelling instance <span className="font-mono text-sky-600">{instance.id.split('-')[0]}...</span> This action is irreversible.</p>
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
      case 'skip':
        return (
          <>
            <h3 className="text-lg font-medium leading-6 text-slate-900">Skip Records</h3>
            <div className="mt-4 space-y-3">
              <p className="text-sm text-slate-500">Specify the number of records to skip for task <span className="font-semibold text-sky-600">{task.name}</span>. Ensure this is permitted by the SOP.</p>
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
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const buttonText = action.charAt(0).toUpperCase() + action.slice(1);
  const buttonColor = action === 'cancel' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-500';

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