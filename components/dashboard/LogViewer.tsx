import React, { useState } from 'react';
import { LogEntry, Task } from '../../types';

const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>;

const mockServiceMapping: { [key: string]: string[] } = {
  'a1b2c3d4-e5f6-a1b2-c3d4-e5f6a7b8c9d0': [
    'file-ingest-service',
    'validation-engine',
    'downstream-api-connector',
    'audit-log-service'
  ]
};

const LogViewer: React.FC<{ 
  logs: LogEntry[], 
  loading: boolean, 
  task: Task | null,
  onOpenLiveView: () => void;
}> = ({ logs, loading, task, onOpenLiveView }) => {
  const [copiedTraceId, setCopiedTraceId] = useState<string | null>(null);
  const [copiedTimestamp, setCopiedTimestamp] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTraceId(text);
    setTimeout(() => setCopiedTraceId(null), 2000);
  };

  const copyTimestamp = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTimestamp(text);
    setTimeout(() => setCopiedTimestamp(null), 2000);
  };

  if (loading) return <div className="flex items-center justify-center h-full text-slate-400">Loading logs...</div>;
  if (!task) return <div className="flex items-center justify-center h-full text-slate-400">Select a task to view logs.</div>;

  const traceId = logs.find(log => log.traceId)?.traceId;

  return (
    <div className="flex flex-col bg-slate-950 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-3 shrink-0">
        <h4 className="font-medium text-slate-300">Logs for: <span className="font-mono text-sky-400">{task.name}</span></h4>
        {traceId && (
            <div className="relative group flex items-center text-xs">
                <span className="text-slate-400 mr-2">Trace ID:</span>
                <span className="font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">{traceId.substring(0, 8)}...</span>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max p-3 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <h5 className="font-bold mb-1 text-slate-100">Services in Trace:</h5>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                        {mockServiceMapping[traceId]?.map(service => <li key={service}><span className="font-mono">{service}</span></li>) || <li>No services mapped.</li>}
                    </ul>
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-[-5px] w-2.5 h-2.5 bg-slate-900 border-r border-b border-slate-700 rotate-45"></div>
                </div>

                <button 
                  onClick={() => copyToClipboard(traceId)} 
                  className="ml-2 p-1.5 text-slate-400 bg-slate-800 rounded hover:bg-slate-700 transition-colors"
                  title="Copy Trace ID"
                >
                    {copiedTraceId === traceId ? (
                        <span className="text-green-400 text-xs px-1">Copied!</span> 
                    ) : (
                        <CopyIcon />
                    )}
                </button>
            </div>
        )}
      </div>
      <div className="font-mono text-xs text-slate-400 pr-2">
        {logs.map((log, i) => {
          const levelColor = log.level === 'ERROR' ? 'text-red-400' : log.level === 'WARN' ? 'text-amber-400' : 'text-sky-400';
          const messageHighlight = log.level === 'ERROR' ? 'text-red-300' : '';
          
          return (
            <div key={i} className="flex hover:bg-slate-800/50 rounded -mx-1 px-1">
              <span 
                className="w-[100px] shrink-0 text-slate-600 cursor-pointer hover:text-slate-400 transition-colors"
                title="Click to copy timestamp"
                onClick={() => copyTimestamp(log.timestamp)}
              >
                  {copiedTimestamp === log.timestamp ? <span className="text-green-400 font-sans font-medium">Copied!</span> : log.timestamp}
              </span>
              <span className={`w-12 shrink-0 font-bold ${levelColor}`}>{log.level}</span>
              <p className={`flex-1 whitespace-pre-wrap break-words ${messageHighlight}`}>{log.message}</p>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-end space-x-4 mt-3 pt-3 border-t border-slate-800 shrink-0">
         <button onClick={onOpenLiveView} className="text-sm font-medium text-sky-500 hover:text-sky-400 hover:underline transition-colors">
            Open Live View
        </button>
        <a href="https://apm-europa.internal.mum1.zetaapps.in/_dashboards/app/discover#/?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:'2025-10-21T03:14:39.745Z',to:'2025-10-23T03:14:39.745Z'))&_a=(columns:!(_source),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'logs-*',key:clusterName,negate:!f,params:(query:dia),type:phrase),query:(match_phrase:(clusterName:dia))),('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'logs-*',key:app,negate:!f,params:(query:dia-controller),type:phrase),query:(match_phrase:(app:dia-controller)))),index:'logs-*',interval:auto,query:(language:kuery,query:''),sort:!())" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-sky-500 hover:text-sky-400 hover:underline">View in Kibana</a>
      </div>
    </div>
  );
};

export default LogViewer;