
import React, { useMemo, useState } from 'react';
import { ScheduleRunStatus, ScheduleExecution, ScheduleDefinition } from '../../types';
import { mockScheduleDefinitions, mockScheduleExecutions } from '../../constants';

const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m15 18-6-6 6-6"></path></svg>;
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>;
const SkipIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M5 4l10 8-10 8V4z"></path><line x1="19" y1="5" x2="19" y2="19"></line></svg>;

interface ScheduleL2ViewProps {
  scheduleId: string;
  onBack: () => void;
  onSelectExecution: (id: string) => void;
}

const ScheduleL2View: React.FC<ScheduleL2ViewProps> = ({ scheduleId, onBack, onSelectExecution }) => {
  const schedule = useMemo(() => mockScheduleDefinitions.find(s => s.id === scheduleId), [scheduleId]);
  const [executions, setExecutions] = useState<ScheduleExecution[]>(
    mockScheduleExecutions.filter(e => e.scheduleId === scheduleId)
  );

  const handleSkip = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExecutions(prev => prev.map(exe => exe.id === id ? { ...exe, status: ScheduleRunStatus.SKIPPED } : exe));
  };

  const handleRerun = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    alert(`Triggering rerun for Execution: ${id}`);
  };

  if (!schedule) return <div className="p-8 text-center text-red-500 font-bold">Schedule not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={onBack} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-slate-500"><ChevronLeftIcon /></button>
        <div>
            <h2 className="text-xl font-bold text-slate-800">{schedule.name}</h2>
            <div className="flex items-center text-sm text-sky-600 font-medium">
                <span className="uppercase text-[10px] bg-sky-100 px-1.5 py-0.5 rounded mr-2">Config</span>
                <span>{schedule.cronFrequency} ({schedule.timezone})</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* L2 Details Panel */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm self-start">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 pb-2 border-b border-slate-100">Schedule Details</h3>
            <dl className="space-y-5 text-sm">
                <DetailItem label="Schedule ID" value={schedule.id} isMono />
                <DetailItem label="Description" value={schedule.description} />
                <DetailItem label="Technical Owner" value={schedule.owner} isMono />
                <DetailItem label="Target App" value={schedule.appId} isMono />
                <DetailItem label="Timezone" value={schedule.timezone} />
                <DetailItem label="Cron Frequency" value={schedule.cronFrequency} isMono />
            </dl>
        </div>

        {/* L2 Runs Panel */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Execution History</h3>
                <span className="text-[10px] font-bold text-slate-500">Showing last {executions.length} runs</span>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="px-4 py-3">Execution ID</th>
                            <th className="px-4 py-3">Expected Time</th>
                            <th className="px-4 py-3">Actual Time</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {executions.map(exe => (
                            <tr 
                                key={exe.id} 
                                onClick={() => onSelectExecution(exe.id)}
                                className="hover:bg-slate-50 cursor-pointer group transition-colors"
                            >
                                <td className="px-4 py-4 font-mono text-xs text-slate-500 group-hover:text-sky-600">{exe.id}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-600">{new Date(exe.expectedTime).toLocaleString()}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-600 font-medium">
                                    {exe.actualTime ? new Date(exe.actualTime).toLocaleTimeString() : <span className="text-slate-300 italic">N/A</span>}
                                </td>
                                <td className="px-4 py-4">
                                    <RunStatusBadge status={exe.status} />
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <div className="flex items-center justify-end space-x-2" onClick={e => e.stopPropagation()}>
                                        <button 
                                            onClick={(e) => handleRerun(e, exe.id)}
                                            className="inline-flex items-center text-[10px] font-bold text-sky-600 hover:text-sky-700 bg-sky-50 px-2 py-1 rounded"
                                            title="Rerun Execution"
                                        >
                                            <RefreshIcon /> Rerun
                                        </button>
                                        {(exe.status === ScheduleRunStatus.MISSED || exe.status === ScheduleRunStatus.FAILED) && (
                                            <button 
                                                onClick={(e) => handleSkip(e, exe.id)}
                                                className="inline-flex items-center text-[10px] font-bold text-slate-600 hover:text-slate-800 bg-slate-100 px-2 py-1 rounded"
                                                title="Skip this instance"
                                            >
                                                <SkipIcon /> Skip
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value, isMono }: { label: string; value: string; isMono?: boolean }) => (
    <div>
        <dt className="text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</dt>
        <dd className={`text-slate-800 ${isMono ? 'font-mono text-xs' : ''}`}>{value}</dd>
    </div>
);

const RunStatusBadge = ({ status }: { status: ScheduleRunStatus }) => {
    const colors = {
        [ScheduleRunStatus.SUCCESS]: 'bg-green-100 text-green-700 border-green-200',
        [ScheduleRunStatus.FAILED]: 'bg-red-100 text-red-700 border-red-200',
        [ScheduleRunStatus.MISSED]: 'bg-amber-100 text-amber-700 border-amber-200',
        [ScheduleRunStatus.SKIPPED]: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return (
        <span className={`px-2 py-0.5 text-[9px] font-black uppercase border rounded-full ${colors[status]}`}>
            {status}
        </span>
    );
}

export default ScheduleL2View;
