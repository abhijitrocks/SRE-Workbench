
import React, { useMemo, useState } from 'react';
import { ScheduleRunStatus, ScheduleExecution, ScheduleDefinition, ScheduleStatus } from '../../types';
import { mockScheduleDefinitions, mockScheduleExecutions } from '../../constants';
import { getHumanReadableCron } from '../../utils/cronUtils';

const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m15 18-6-6 6-6"></path></svg>;
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>;
const SkipIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M5 4l10 8-10 8V4z"></path><line x1="19" y1="5" x2="19" y2="19"></line></svg>;
const ExternalLinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 opacity-60"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>;
const SpinnerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" cy="16" x2="12" y2="12"></line><line x1="12" cy="8" x2="12.01" y2="8"></line></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-slate-400"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;

interface ScheduleL2ViewProps {
  scheduleId: string;
  onBack: () => void;
  onSelectExecution: (id: string) => void;
  onSelectApp: (appName: string) => void;
  onSelectInstance: (instance: { id: string }) => void;
}

const ScheduleL2View: React.FC<ScheduleL2ViewProps> = ({ scheduleId, onBack, onSelectExecution, onSelectApp, onSelectInstance }) => {
  const [schedule, setSchedule] = useState<ScheduleDefinition | undefined>(
    mockScheduleDefinitions.find(s => s.id === scheduleId)
  );
  const [executions, setExecutions] = useState<ScheduleExecution[]>(
    mockScheduleExecutions.filter(e => e.scheduleId === scheduleId)
  );
  const [actionModal, setActionModal] = useState<{ type: 'RERUN' | 'SKIP' | null, executionId: string | null }>({ type: null, executionId: null });
  const [modalLoading, setModalLoading] = useState(false);
  const [reason, setReason] = useState('');

  // Filtering State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<ScheduleRunStatus | 'All'>('All');

  const isScheduleDisabled = schedule?.status === ScheduleStatus.DISABLED;

  const filteredExecutions = useMemo(() => {
    let result = [...executions].sort((a, b) => 
      new Date(b.expectedTime).getTime() - new Date(a.expectedTime).getTime()
    );

    if (startDate) {
      const start = new Date(startDate).getTime();
      result = result.filter(e => new Date(e.expectedTime).getTime() >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter(e => new Date(e.expectedTime).getTime() <= end.getTime());
    }

    if (statusFilter !== 'All') {
      result = result.filter(e => e.status === statusFilter);
    }

    // Increased limit to last 25 for broader historical visibility
    return result.slice(0, 25);
  }, [executions, startDate, endDate, statusFilter]);

  const handleOpenModal = (e: React.MouseEvent, type: 'RERUN' | 'SKIP', executionId: string) => {
    e.stopPropagation();
    if (isScheduleDisabled && type === 'RERUN') return;
    setReason('');
    setActionModal({ type, executionId });
  };

  const handleCloseModal = () => {
    if (modalLoading) return;
    setActionModal({ type: null, executionId: null });
  };

  const handleConfirmAction = async () => {
    if (!actionModal.executionId || !actionModal.type || reason.trim().length < 5) return;
    
    setModalLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (actionModal.type === 'SKIP') {
      setExecutions(prev => prev.map(exe => exe.id === actionModal.executionId ? { ...exe, status: ScheduleRunStatus.SKIPPED } : exe));
    } else {
      console.log(`Audit: User triggered RERUN for ${actionModal.executionId}. Reason: ${reason}`);
    }

    setModalLoading(false);
    handleCloseModal();
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setStatusFilter('All');
  };

  if (!schedule) return <div className="p-8 text-center text-red-500 font-bold">Schedule not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
            <button onClick={onBack} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-slate-500"><ChevronLeftIcon /></button>
            <div>
                <h2 className={`text-xl font-bold ${isScheduleDisabled ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{schedule.name}</h2>
                <div className="flex items-center text-sm text-sky-600 font-medium">
                    <span className={`uppercase text-[10px] ${isScheduleDisabled ? 'bg-slate-200 text-slate-500' : 'bg-sky-100 text-sky-600'} px-1.5 py-0.5 rounded mr-2`}>
                        {isScheduleDisabled ? 'DECOMMISSIONED' : 'FREQUENCY'}
                    </span>
                    <span className={isScheduleDisabled ? 'text-slate-400' : ''}>{getHumanReadableCron(schedule.cronFrequency)} ({schedule.timezone})</span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4 self-start">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 pb-2 border-b border-slate-100">Schedule Details</h3>
                <dl className="space-y-5 text-sm">
                    <DetailItem label="Schedule ID" value={schedule.id} isMono />
                    <DetailItem label="Description" value={schedule.description} />
                    <DetailItem label="Technical Owner" value={schedule.owner} isMono />
                    <DetailItem 
                        label="Target App" 
                        value={schedule.appId} 
                        isMono 
                        isLink 
                        onClick={() => onSelectApp(schedule.appId)} 
                    />
                    <DetailItem label="Timezone" value={schedule.timezone} />
                    <div>
                        <dt className="text-[10px] font-bold text-slate-400 uppercase mb-1">Execution Schedule</dt>
                        <dd className="text-slate-800">
                            <p className="font-bold">{getHumanReadableCron(schedule.cronFrequency)}</p>
                            <p className="text-[10px] font-mono text-slate-400 mt-0.5 select-all" title="Raw Cron Expression">{schedule.cronFrequency}</p>
                        </dd>
                    </div>
                </dl>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center text-slate-700 font-bold text-xs uppercase tracking-tight mb-4">
                    <InfoIcon />
                    Operational Status Legend
                </div>
                <div className="space-y-4">
                    <LegendItem 
                        label="Missed" 
                        color="text-amber-600" 
                        description="Trigger never fired. Usually caused by scheduler downtime or concurrency locks."
                    />
                    <LegendItem 
                        label="Failed" 
                        color="text-red-600" 
                        description="Trigger fired, but the runner crashed during bootstrap (e.g., Auth or Network error)."
                    />
                    <LegendItem 
                        label="Success" 
                        color="text-green-600" 
                        description="Trigger fired and the application instance was successfully created."
                    />
                </div>
            </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/50 gap-4">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Execution History</h3>
                  <span className="text-[10px] font-bold text-slate-500">Showing last {filteredExecutions.length} runs</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                    {/* Status Filter Dropdown */}
                    <div className="relative">
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="pl-3 pr-8 py-1.5 bg-white border border-slate-300 rounded text-[11px] font-bold text-slate-700 focus:ring-1 focus:ring-sky-500 focus:outline-none outline-none shadow-sm appearance-none"
                        >
                            <option value="All">All Statuses</option>
                            {Object.values(ScheduleRunStatus).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
                             <ChevronDownIcon />
                        </div>
                    </div>

                    <div className="h-4 w-px bg-slate-200 mx-1"></div>

                    {/* Date Filters */}
                    <div className="relative">
                        <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="pl-8 pr-2 py-1 bg-white border border-slate-300 rounded text-[11px] font-bold text-slate-700 focus:ring-1 focus:ring-sky-500 focus:outline-none outline-none shadow-sm"
                        />
                    </div>
                    <span className="text-slate-300 text-xs">—</span>
                    <div className="relative">
                        <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="pl-8 pr-2 py-1 bg-white border border-slate-300 rounded text-[11px] font-bold text-slate-700 focus:ring-1 focus:ring-sky-500 focus:outline-none outline-none shadow-sm"
                        />
                    </div>
                    {(startDate || endDate || statusFilter !== 'All') && (
                        <button 
                            onClick={handleResetFilters}
                            className="text-[10px] font-black uppercase text-sky-600 hover:underline px-2"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="px-6 py-3">Execution ID</th>
                            <th className="px-6 py-3">Expected Time</th>
                            <th className="px-6 py-3">Actual Time</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredExecutions.map(exe => (
                            <tr 
                                key={exe.id} 
                                onClick={() => onSelectExecution(exe.id)}
                                className="hover:bg-slate-50 cursor-pointer group transition-colors"
                            >
                                <td className="px-6 py-4 font-mono text-xs text-slate-500 group-hover:text-sky-600">{exe.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">{new Date(exe.expectedTime).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 font-medium">
                                    {exe.actualTime ? new Date(exe.actualTime).toLocaleTimeString() : <span className="text-slate-300 italic">N/A</span>}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col items-start">
                                        <RunStatusBadge status={exe.status} />
                                        {exe.status === ScheduleRunStatus.SUCCESS && exe.instanceId && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelectInstance({ id: exe.instanceId! });
                                                }}
                                                className="mt-1 flex items-center text-[10px] text-sky-600 font-bold hover:underline"
                                            >
                                                View Instance <ExternalLinkIcon />
                                            </button>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end space-x-2" onClick={e => e.stopPropagation()}>
                                        <button 
                                            onClick={(e) => handleOpenModal(e, 'RERUN', exe.id)}
                                            disabled={isScheduleDisabled}
                                            className="inline-flex items-center text-[10px] font-bold text-sky-600 hover:text-sky-700 bg-sky-50 px-2 py-1 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <RefreshIcon /> Rerun
                                        </button>
                                        {(exe.status === ScheduleRunStatus.MISSED || exe.status === ScheduleRunStatus.FAILED) && (
                                            <button 
                                                onClick={(e) => handleOpenModal(e, 'SKIP', exe.id)}
                                                className="inline-flex items-center text-[10px] font-bold text-slate-600 hover:text-slate-800 bg-slate-100 px-2 py-1 rounded"
                                            >
                                                <SkipIcon /> Skip
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredExecutions.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No runs found with the selected filters.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {actionModal.type && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200">
            <header className={`p-4 border-b flex justify-between items-center ${actionModal.type === 'RERUN' ? 'bg-sky-50 border-sky-100' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center">
                {actionModal.type === 'RERUN' ? <RefreshIcon /> : <SkipIcon />}
                <h3 className="ml-2 font-black text-slate-800 uppercase tracking-tight">Confirm {actionModal.type} Action</h3>
              </div>
              <span className="font-mono text-xs text-slate-400">EXE: {actionModal.executionId}</span>
            </header>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                {actionModal.type === 'RERUN' 
                  ? "This will trigger a manual retry of the selected execution. A new application instance will be created to process the records associated with this schedule window." 
                  : "Skipping this execution will mark it as acknowledged. It will no longer be considered 'Missed' or 'Failed' for reporting and dashboard alerts."}
              </p>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Reason for Intervention (Required)</label>
                <textarea 
                  autoFocus
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Upstream delay resolved, manual rerun requested by publisher..."
                  className="w-full h-24 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all placeholder:text-slate-300"
                />
                <p className={`text-[10px] text-right ${reason.length < 5 ? 'text-red-400' : 'text-slate-400'}`}>
                   Min. 5 characters required ({reason.length}/5)
                </p>
              </div>
            </div>

            <footer className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
              <button 
                onClick={handleCloseModal}
                disabled={modalLoading}
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmAction}
                disabled={modalLoading || reason.trim().length < 5}
                className={`flex items-center px-6 py-2 rounded-lg text-sm font-black text-white transition-all shadow-md active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${
                  actionModal.type === 'RERUN' ? 'bg-sky-600 hover:bg-sky-700' : 'bg-slate-700 hover:bg-slate-800'
                }`}
              >
                {modalLoading ? <SpinnerIcon /> : null}
                {modalLoading ? 'Processing...' : `Confirm ${actionModal.type}`}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ label, value, isMono, isLink, onClick }: { label: string; value: string; isMono?: boolean; isLink?: boolean; onClick?: () => void }) => (
    <div>
        <dt className="text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</dt>
        <dd className={`text-slate-800 ${isMono ? 'font-mono text-xs' : ''}`}>
            {isLink ? (
                <button 
                    onClick={onClick}
                    className="flex items-center text-sky-600 font-bold hover:underline transition-all text-left"
                >
                    {value}
                    <ExternalLinkIcon />
                </button>
            ) : (
                value
            )}
        </dd>
    </div>
);

const LegendItem = ({ label, color, description }: { label: string; color: string; description: string }) => (
    <div className="flex flex-col">
        <span className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{label}</span>
        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{description}</p>
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

const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"></path></svg>;

export default ScheduleL2View;
