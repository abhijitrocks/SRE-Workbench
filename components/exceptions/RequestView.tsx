
import React from 'react';
import { SystemRequest } from '../../types';

// --- ICONS ---
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-slate-500 hover:text-slate-700 transition-colors"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M3 21v-5h5"></path></svg>;
const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>;
const ExternalLinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 ml-1"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>;
const CheckCircleIcon = () => <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const ClockIcon = () => <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z" clipRule="evenodd" /></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;

interface RequestViewProps {
  systemRequest: SystemRequest | null;
  loading: boolean;
  onShowTaskDetailView: () => void;
}

const RequestView: React.FC<RequestViewProps> = ({ systemRequest, loading, onShowTaskDetailView }) => {
    if (loading) {
        return <div className="text-center p-8 text-slate-500">Loading request details...</div>;
    }

    if (!systemRequest) {
        return <div className="p-6"><div className="bg-white text-center p-8 text-slate-500 rounded-lg border">No request associated with this exception.</div></div>;
    }
    
    return (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left Column: Request Details */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-slate-800">{systemRequest.title}</h2>
                    <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">{systemRequest.status}</span>
                </div>
                <div className="bg-white p-6 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
                        <h3 className="text-lg font-semibold text-slate-800">System Request Details</h3>
                        <button><RefreshIcon/></button>
                    </div>
                    <dl className="space-y-4 text-sm">
                        <MetaItem label="SYR Title" value={systemRequest.syrTitle} />
                        <MetaItem label="Request ID" value={systemRequest.requestId} isMono copyable />
                        <MetaItem label="Date Created" value={new Date(systemRequest.dateCreated).toLocaleString()} />
                        <MetaItem label="Completed At" value={systemRequest.completedAt ? new Date(systemRequest.completedAt).toLocaleString() : '-'} />
                        <MetaItem label="Created By">
                            <div className="flex items-center space-x-2">
                                <span className={`h-6 w-6 rounded-full text-white flex items-center justify-center text-xs font-bold ${systemRequest.createdBy.avatarColor}`}>{systemRequest.createdBy.avatarChar}</span>
                                <span>{systemRequest.createdBy.name}</span>
                            </div>
                        </MetaItem>
                        <MetaItem label="Request Definition Code" value={systemRequest.requestDefinitionCode} isMono link />
                        <MetaItem label="Workflow" value={systemRequest.workflow} />
                        <MetaItem label="Exception ID" value={systemRequest.exceptionId} isMono copyable />
                        <MetaItem label="Exception Definition Code" value={systemRequest.exceptionDefinitionCode} isMono link />
                    </dl>
                </div>
            </div>

            {/* Right Column: History */}
            <div className="bg-white p-6 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">History</h3>
                    <button><RefreshIcon/></button>
                </div>
                <ul className="space-y-6">
                    {systemRequest.history.map((event, index) => (
                        <HistoryItem key={index} event={event} onShowTaskDetailView={onShowTaskDetailView} />
                    ))}
                </ul>
            </div>
        </div>
    );
};

const MetaItem: React.FC<{ label: string, value?: string, children?: React.ReactNode, isMono?: boolean, copyable?: boolean, link?: boolean }> = ({ label, value, children, isMono, copyable, link }) => (
  <div className="grid grid-cols-2">
    <dt className="text-slate-500">{label}</dt>
    <dd className={`text-slate-800 font-medium ${isMono ? 'font-mono' : ''}`}>
      {children || (
        <div className="flex items-center">
          <span>{value}</span>
          {copyable && <button className="ml-2 text-slate-400 hover:text-sky-600"><CopyIcon /></button>}
          {link && <a href="#" className="ml-1 text-sky-600"><ExternalLinkIcon /></a>}
        </div>
      )}
    </dd>
  </div>
);


const HistoryItem: React.FC<{
    event: SystemRequest['history'][0];
    onShowTaskDetailView: () => void;
}> = ({ event, onShowTaskDetailView }) => {
    let icon;
    if(event.type === 'review') icon = <InfoIcon />;
    else if(event.type === 'creation') icon = <ClockIcon />;
    else if(event.type === 'completion') icon = <CheckCircleIcon />;

    return (
        <li className="flex items-start space-x-4">
            <div className={`h-8 w-8 rounded-full text-white flex items-center justify-center text-sm font-bold shrink-0 ${event.user.avatarColor}`}>{event.user.avatarChar}</div>
            <div className="flex-1">
                <p className="text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">{event.user.name}</span> {event.actionText}
                    {event.link && <a href="#" className="text-sky-600"><ExternalLinkIcon /></a>}
                </p>
                <div className="text-xs text-slate-500 mt-1 flex items-center">
                    {icon}
                    <span className="ml-2">{event.details} at {new Date(event.timestamp).toLocaleString()}</span>
                </div>
                {event.remarks && <p className="text-xs text-slate-600 mt-2 p-2 bg-slate-50 rounded-md border"><strong>Remarks:</strong> {event.remarks}</p>}
                {event.showTaskDetails && <button onClick={onShowTaskDetailView} className="text-xs font-semibold text-sky-600 mt-2 hover:underline">Show Task Level Details</button>}
            </div>
        </li>
    );
};


export default RequestView;
