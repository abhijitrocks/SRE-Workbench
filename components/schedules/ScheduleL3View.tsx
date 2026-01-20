
import React, { useMemo } from 'react';
import { ScheduleExecution } from '../../types';

const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m15 18-6-6 6-6"></path></svg>;

interface ScheduleL3ViewProps {
  executionId: string;
  scheduleId: string;
  onBack: () => void;
}

const ScheduleL3View: React.FC<ScheduleL3ViewProps> = ({ executionId, scheduleId, onBack }) => {
  
  const mockLogs = useMemo(() => {
    const timestamp = new Date().toISOString().split('T')[1].substring(0, 8);
    return [
        { time: '01:00:01', level: 'INFO', msg: 'Job scheduler initiated trigger for SCH-001.' },
        { time: '01:00:01', level: 'INFO', msg: 'Authenticating DIA system-user: mondo_app_user...' },
        { time: '01:00:02', level: 'INFO', msg: 'Success. Session token acquired.' },
        { time: '01:00:03', level: 'DEBUG', msg: 'Checking source registry for app: Humana_ClaimsProcessing' },
        { time: '01:00:05', level: 'INFO', msg: 'App Specification v2.1 loaded successfully.' },
        { time: '01:00:05', level: 'WARN', msg: 'Detected high latency in downstream API connector (450ms).' },
        { time: '01:00:06', level: 'INFO', msg: 'Initiating pipeline instance: mondo_batch_20240321.csv' },
        { time: '01:00:10', level: 'INFO', msg: 'Pipeline task 1/5 [create-folder] started.' },
        { time: '01:00:12', level: 'INFO', msg: 'Execution completed. Signal sent back to scheduler.' }
    ];
  }, []);

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center space-x-4">
        <button onClick={onBack} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-slate-500"><ChevronLeftIcon /></button>
        <div>
            <h2 className="text-xl font-bold text-slate-800">Log Analysis</h2>
            <div className="flex items-center text-sm text-slate-500 font-medium">
                <span className="uppercase text-[10px] bg-slate-200 px-1.5 py-0.5 rounded mr-2">Execution</span>
                <span className="font-mono text-xs">{executionId}</span>
            </div>
        </div>
      </div>

      <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center space-x-3">
                <div className="flex space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Terminal Output</span>
            </div>
            <div className="flex items-center space-x-4 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                <span>Filter: All Logs</span>
                <span>|</span>
                <span>Auto-refresh: On</span>
            </div>
        </div>
        <div className="flex-1 p-6 font-mono text-xs overflow-y-auto custom-scrollbar bg-slate-950/50">
            {mockLogs.map((log, i) => (
                <div key={i} className="flex space-x-4 py-0.5 hover:bg-slate-900 transition-colors">
                    <span className="text-slate-600 shrink-0">{log.time}</span>
                    <span className={`shrink-0 font-bold ${log.level === 'INFO' ? 'text-sky-400' : log.level === 'WARN' ? 'text-amber-500' : 'text-purple-400'}`}>{log.level}</span>
                    <span className="text-slate-300 break-all">{log.msg}</span>
                </div>
            ))}
            <div className="mt-4 flex items-center space-x-2 text-sky-500 animate-pulse">
                <span>$</span>
                <div className="h-4 w-2 bg-sky-500"></div>
            </div>
        </div>
        <div className="p-3 bg-slate-900/50 border-t border-slate-800 text-[10px] text-slate-500 text-center uppercase font-black tracking-[0.2em]">
            End of Run Trace
        </div>
      </div>
    </div>
  );
};

export default ScheduleL3View;
