import React, { useMemo, useState } from 'react';
import { AppInstance, InstanceStatus } from '../../types';

// --- ICONS ---
const ChevronDownIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"></path></svg>;
const FolderIcon = () => <svg xmlns="http://www.w.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-sky-600"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;
const ArrowRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate-500 hover:text-sky-600"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;

const StatusIndicator: React.FC<{ status: InstanceStatus }> = ({ status }) => {
    const styles: { [key in InstanceStatus]: { dot: string; text: string } } = {
        [InstanceStatus.SUCCESS]: { dot: 'bg-green-500', text: 'text-slate-700' },
        [InstanceStatus.IN_PROGRESS]: { dot: 'bg-blue-500', text: 'text-slate-700' },
        [InstanceStatus.FAILED]: { dot: 'bg-red-500', text: 'text-slate-700' },
        [InstanceStatus.PENDING]: { dot: 'bg-amber-500', text: 'text-slate-700' },
    };
    const style = styles[status];
    return (
        <div className="flex items-center">
            <span className={`w-2 h-2 rounded-full mr-2 ${style.dot}`}></span>
            <span className={style.text}>{status}</span>
        </div>
    );
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' +
           date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

interface FolderData {
    instances: AppInstance[];
    stats: {
        total: number;
        failed: number;
        inProgress: number;
        success: number;
    };
}

const FolderGroup: React.FC<{
    folderName: string;
    data: FolderData;
    onSelectInstance: (instance: AppInstance) => void;
}> = ({ folderName, data, onSelectInstance }) => {
    const hasFailures = data.stats.failed > 0;
    const [isOpen, setIsOpen] = useState(hasFailures);

    return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                aria-expanded={isOpen}
            >
                <div className="flex items-center space-x-3">
                    <FolderIcon />
                    <span className="text-lg font-semibold text-slate-800">{folderName}</span>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm">
                        <span className="text-slate-500">Total:</span>
                        <span className="font-medium text-slate-800">{data.stats.total}</span>
                    </div>
                    {hasFailures && (
                        <span className="px-2 py-0.5 text-xs font-medium text-red-800 bg-red-100 rounded-full">{data.stats.failed} Failed</span>
                    )}
                    <ChevronDownIcon className={`transform transition-transform duration-200 text-slate-500 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            {isOpen && (
                <div className="border-t border-slate-200 overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">File / ID</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Start Time</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {data.instances.map(instance => (
                                <tr key={instance.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <p className="font-medium text-sky-600">{instance.fileName}</p>
                                        <p className="text-xs text-slate-500 font-mono">{instance.id}</p>
                                    </td>
                                    <td className="px-4 py-3"><StatusIndicator status={instance.status} /></td>
                                    <td className="px-4 py-3 text-slate-500">{formatDate(instance.startedAt)}</td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => onSelectInstance(instance)} title="View Details" className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200"><ArrowRightIcon /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

interface FoldersViewProps {
    instances: AppInstance[];
    onSelectInstance: (instance: AppInstance | { id: string }) => void;
}

const FoldersView: React.FC<FoldersViewProps> = ({ instances, onSelectInstance }) => {
    const groupedByFolder = useMemo(() => {
        return instances.reduce((acc, instance) => {
            const folder = instance.applicationName;
            if (!acc[folder]) {
                acc[folder] = {
                    instances: [],
                    stats: { total: 0, failed: 0, inProgress: 0, success: 0 }
                };
            }
            acc[folder].instances.push(instance);
            acc[folder].stats.total++;
            if (instance.status === InstanceStatus.FAILED) acc[folder].stats.failed++;
            if (instance.status === InstanceStatus.IN_PROGRESS) acc[folder].stats.inProgress++;
            if (instance.status === InstanceStatus.SUCCESS) acc[folder].stats.success++;
            return acc;
        }, {} as Record<string, FolderData>);
    }, [instances]);

    const sortedFolders = Object.entries(groupedByFolder).sort(([a], [b]) => a.localeCompare(b));

    if (sortedFolders.length === 0) {
        return <div className="text-center p-8 text-slate-500 bg-white rounded-lg border">No folders to display for the current filters.</div>;
    }

    return (
        <div className="space-y-4">
            {sortedFolders.map(([folderName, data]) => (
                <FolderGroup key={folderName} folderName={folderName} data={data} onSelectInstance={onSelectInstance as any} />
            ))}
        </div>
    );
};

export default FoldersView;
