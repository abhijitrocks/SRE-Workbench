import React, { useState } from 'react';
import { ScheduledJob, ScheduleStatus, InstanceStatus, AppInstance } from '../../types';
import ScheduleActionModals from './ScheduleActionModals';

// --- ICONS ---
const ClockIcon = () => <svg xmlns="http://www.w.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z" clipRule="evenodd" /></svg>;

const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' +
           date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const ScheduleStatusChip: React.FC<{ status: ScheduleStatus }> = ({ status }) => {
    const styles = {
        [ScheduleStatus.ON_SCHEDULE]: 'bg-green-100 text-green-800',
        [ScheduleStatus.OVERDUE]: 'bg-red-100 text-red-800 animate-pulse',
        [ScheduleStatus.DISABLED]: 'bg-slate-200 text-slate-600',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
            {status}
        </span>
    );
};

const InstanceStatusChip: React.FC<{ status: InstanceStatus }> = ({ status }) => {
    const styles = {
        [InstanceStatus.SUCCESS]: 'text-green-600',
        [InstanceStatus.FAILED]: 'text-red-600',
        [InstanceStatus.IN_PROGRESS]: 'text-blue-600',
        [InstanceStatus.PENDING]: 'text-amber-600',
    };
    return <span className={`font-medium ${styles[status]}`}>{status}</span>;
};

interface SchedulesViewProps {
    scheduledJobs: ScheduledJob[];
    onSelectInstance: (instance: { id: string }) => void;
    onUpdateSchedule: (schedule: ScheduledJob) => void;
    onAddInstance: (instance: AppInstance) => void;
}

const SchedulesView: React.FC<SchedulesViewProps> = ({ scheduledJobs, onSelectInstance, onUpdateSchedule, onAddInstance }) => {
    const [modalState, setModalState] = useState<{ type: 'acknowledge' | 'trigger' | null, job: ScheduledJob | null }>({ type: null, job: null });

    const sortedJobs = [...scheduledJobs].sort((a, b) => {
        // Sort OVERDUE jobs to the top
        if (a.status === ScheduleStatus.OVERDUE && b.status !== ScheduleStatus.OVERDUE) return -1;
        if (a.status !== ScheduleStatus.OVERDUE && b.status === ScheduleStatus.OVERDUE) return 1;
        // Then sort by next expected run time
        return new Date(a.nextExpectedRun).getTime() - new Date(b.nextExpectedRun).getTime();
    });

    const handleAcknowledgeSuccess = (updatedSchedule: ScheduledJob) => {
        onUpdateSchedule(updatedSchedule);
    };

    const handleTriggerSuccess = (newInstance: AppInstance, updatedSchedule: ScheduledJob) => {
        onAddInstance(newInstance);
        onUpdateSchedule(updatedSchedule);
    };


    return (
        <>
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="p-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800">Scheduled Application Triggers</h2>
                <p className="text-sm text-slate-500 mt-1">Monitor event-based schedules to ensure they trigger as expected.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Schedule Name</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">SaaS</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Schedule Cadence</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Run</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Next Expected Run</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {sortedJobs.map(job => (
                            <tr key={job.id} className={job.status === ScheduleStatus.OVERDUE ? 'bg-red-50' : ''}>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <p className="font-medium text-slate-800">{job.name}</p>
                                    <p className="text-xs text-slate-500">{job.applicationName}</p>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-slate-700">{job.saas}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-slate-500 font-mono text-xs flex items-center"><ClockIcon />{job.cronExpression}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    {job.lastRun ? (
                                        <div>
                                            <p className="text-slate-600">{formatDate(job.lastRun.timestamp)}</p>
                                            <p className="text-xs">
                                                Status: <InstanceStatusChip status={job.lastRun.status} />
                                                {job.lastRun.instanceId && (
                                                    <a
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            onSelectInstance({ id: job.lastRun!.instanceId! });
                                                        }}
                                                        className="ml-2 text-sky-600 hover:underline"
                                                    >
                                                        (View)
                                                    </a>
                                                )}
                                            </p>
                                        </div>
                                    ) : (
                                        <span className="text-slate-400">Never run</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-slate-600">{formatDate(job.nextExpectedRun)}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <ScheduleStatusChip status={job.status} />
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center space-x-2">
                                        <button className="text-xs font-medium text-sky-600 hover:underline disabled:text-slate-400 disabled:no-underline" disabled={job.status !== ScheduleStatus.OVERDUE} onClick={() => setModalState({ type: 'acknowledge', job })}>Acknowledge</button>
                                        <button className="text-xs font-medium text-sky-600 hover:underline" onClick={() => setModalState({ type: 'trigger', job })}>Trigger Now</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        {modalState.type && modalState.job && (
            <ScheduleActionModals
                modalState={modalState}
                onClose={() => setModalState({ type: null, job: null })}
                onAcknowledgeSuccess={handleAcknowledgeSuccess}
                onTriggerSuccess={handleTriggerSuccess}
            />
        )}
        </>
    );
};

export default SchedulesView;