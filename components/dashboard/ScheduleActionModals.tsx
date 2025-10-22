import React, { useState } from 'react';
import { AppInstance, ScheduledJob } from '../../types';
import { acknowledgeSchedule, triggerScheduleNow } from '../../services/apiService';

interface ScheduleActionModalsProps {
    modalState: {
        type: 'acknowledge' | 'trigger' | null;
        job: ScheduledJob | null;
    };
    onClose: () => void;
    onAcknowledgeSuccess: (updatedSchedule: ScheduledJob) => void;
    onTriggerSuccess: (newInstance: AppInstance, updatedSchedule: ScheduledJob) => void;
}

const ScheduleActionModals: React.FC<ScheduleActionModalsProps> = ({ modalState, onClose, onAcknowledgeSuccess, onTriggerSuccess }) => {
    const { type, job } = modalState;
    const [reason, setReason] = useState('');
    const [isChecked, setIsChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!type || !job) {
        return null;
    }

    const isAcknowledge = type === 'acknowledge';
    const isTrigger = type === 'trigger';

    const isAcknowledgeDisabled = loading || !reason || !isChecked;
    const isTriggerDisabled = loading || !reason;

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            if (isAcknowledge) {
                const res = await acknowledgeSchedule(job.id, reason);
                if (res.success) {
                    onAcknowledgeSuccess(res.updatedSchedule);
                    onClose();
                }
            } else if (isTrigger) {
                const res = await triggerScheduleNow(job.id, reason);
                if (res.success) {
                    onTriggerSuccess(res.newInstance, res.updatedSchedule);
                    onClose();
                }
            }
        } catch (e: any) {
            setError(e.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

    const renderContent = () => {
        if (isAcknowledge) {
            return (
                <>
                    <h3 className="text-lg font-medium leading-6 text-slate-900">Acknowledge Overdue Schedule</h3>
                    <div className="mt-4 space-y-4">
                        <p className="text-sm text-slate-500">You are acknowledging the missed trigger for the following schedule. This action will be audited.</p>
                        <div className="text-sm bg-slate-50 p-3 rounded-md border border-slate-200">
                            <p><strong>Schedule:</strong> {job.name}</p>
                            <p><strong>Missed Run:</strong> {formatDate(job.nextExpectedRun)}</p>
                        </div>
                        <div>
                            <label htmlFor="reason" className="block text-sm font-medium text-slate-700">Reason for Acknowledgment (Mandatory)</label>
                            <textarea
                                id="reason"
                                rows={3}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="mt-1 block w-full rounded-md bg-white border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm text-slate-800"
                                placeholder="e.g., Downstream dependency was down, issue tracked in ticket INC-12345. Manual run was completed."
                            />
                        </div>
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="confirm"
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => setIsChecked(e.target.checked)}
                                    className="focus:ring-sky-500 h-4 w-4 text-sky-600 border-slate-300 rounded"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="confirm" className="font-medium text-slate-700">I understand this will mark the schedule as 'On Schedule'.</label>
                            </div>
                        </div>
                    </div>
                </>
            );
        }

        if (isTrigger) {
            return (
                <>
                    <h3 className="text-lg font-medium leading-6 text-slate-900">Manually Trigger Schedule</h3>
                    <div className="mt-4 space-y-4">
                        <p className="text-sm text-slate-500">You are about to manually trigger a new instance for the job <span className="font-semibold text-sky-600">{job.name}</span>. This action will be audited.</p>
                        <div className="bg-amber-50 p-3 rounded-md border border-amber-200 text-amber-800 text-sm">
                            <strong>Warning:</strong> This will immediately create a new application instance and execute the associated workflow.
                        </div>
                        <div>
                            <label htmlFor="reason" className="block text-sm font-medium text-slate-700">Reason for Manual Trigger (Mandatory)</label>
                            <textarea
                                id="reason"
                                rows={3}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="mt-1 block w-full rounded-md bg-white border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm text-slate-800"
                                placeholder="e.g., Rerunning job to process corrected data for CORP-XYZ as per ticket REQ-54321."
                            />
                        </div>
                    </div>
                </>
            );
        }

        return null;
    };

    const buttonText = isAcknowledge ? 'Confirm Acknowledgment' : 'Trigger Now';
    const buttonColor = 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-500';

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
                        disabled={isAcknowledge ? isAcknowledgeDisabled : isTriggerDisabled}
                        onClick={handleSubmit}
                        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 ${buttonColor}`}
                    >
                        {loading ? 'Processing...' : buttonText}
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

export default ScheduleActionModals;
