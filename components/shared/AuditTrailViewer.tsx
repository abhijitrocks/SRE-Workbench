import React from 'react';
import { AuditEvent } from '../../types';

// --- ICONS ---
const ResumeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-blue-500"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
const SkipIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-orange-500"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;
const CancelIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-red-500"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>;
const NotifyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-purple-500"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;


const iconMap: { [key in AuditEvent['type']]: React.ReactNode } = {
    Resume: <ResumeIcon />,
    Skip: <SkipIcon />,
    Cancel: <CancelIcon />,
    Notify: <NotifyIcon />,
};

const AuditTrailViewer: React.FC<{ auditTrail: AuditEvent[] }> = ({ auditTrail }) => {
    if (auditTrail.length === 0) {
        return (
            <div className="bg-white p-4 rounded-lg border border-slate-200 text-center text-sm text-slate-500">
                No actions have been recorded for this instance yet.
            </div>
        );
    }
    
    // Sort events from newest to oldest
    const sortedTrail = [...auditTrail].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h3 className="text-md font-semibold text-slate-800 mb-4">Instance History</h3>
            <ul className="space-y-4">
                {sortedTrail.map((event, index) => (
                    <li key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                           {iconMap[event.type]}
                        </div>
                        <div className="flex-1 text-sm">
                            <p className="text-slate-800">
                                <span className="font-semibold">{event.user}</span> performed action: <span className="font-semibold text-sky-600">{event.type}</span>
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {new Date(event.timestamp).toLocaleString()}
                            </p>
                            {event.taskName && (
                                <p className="text-xs text-slate-600 mt-1">
                                    <strong>Target Task:</strong> <span className="font-mono">{event.taskName}</span>
                                </p>
                            )}
                            {event.details?.reason && (
                                <p className="text-xs text-slate-600 mt-1 p-2 bg-slate-50 border border-slate-200 rounded-md">
                                    <strong>Reason:</strong> {event.details.reason}
                                </p>
                            )}
                             {event.details?.skipCount && (
                                <p className="text-xs text-slate-600 mt-1">
                                    <strong>Records Skipped:</strong> {event.details.skipCount}
                                </p>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AuditTrailViewer;
