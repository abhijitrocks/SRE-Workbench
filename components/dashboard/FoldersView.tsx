
import React, { useMemo, useState, useEffect } from 'react';
import { AppInstance, InstanceStatus, FileAppSpec, User, UserRole, ExceptionType, AuditEventType } from '../../types';
import { mockFileAppSpecs } from '../../constants';
import StatusChip from '../ui/StatusChip';
import ActionModals from './ActionModals';

// --- ICONS ---
const ChevronDownIcon = ({ className, onClick }: { className?: string; onClick?: () => void }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
        onClick={onClick}
    >
        <path d="m6 9 6 6 6-6"></path>
    </svg>
);

const FolderIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "h-5 w-5 text-sky-600"}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"></path></svg>;
const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;

// --- HELPERS ---
const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) + ' ' +
           date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const calculateDuration = (start: string, end: string, status: InstanceStatus): string => {
    const isTerminal = status === InstanceStatus.SUCCESS || 
                       status === InstanceStatus.FAILED || 
                       status === InstanceStatus.CANCELLED;
    
    if (!isTerminal || !end || !start) return '-';
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    let diff = Math.abs(endDate.getTime() - startDate.getTime()) / 1000;
    
    const hours = Math.floor(diff / 3600);
    diff %= 3600;
    const minutes = Math.floor(diff / 60);
    const seconds = Math.floor(diff % 60);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const renderYaml = (obj: any, indent = 0): string => {
    const padding = "  ".repeat(indent);
    let yaml = "";
    if (obj === null || obj === undefined) return "null\n";
    for (const key in obj) {
        const val = obj[key];
        if (Array.isArray(val)) {
            yaml += `${padding}<span class="text-sky-400">${key}</span>:\n`;
            val.forEach(item => {
                if (typeof item === 'object' && item !== null) {
                    const entries = Object.entries(item);
                    entries.forEach(([subKey, subVal], idx) => {
                        const prefix = idx === 0 ? "- " : "  ";
                        if (typeof subVal === 'object' && subVal !== null) {
                            yaml += `${padding}${prefix}<span class="text-sky-400">${subKey}</span>:\n${renderYaml(subVal, indent + 2)}`;
                        } else {
                            const disp = typeof subVal === 'string' && (subVal.includes('/') || subVal.includes('*') || subVal.includes('{') || subVal.includes('|')) ? `"${subVal}"` : subVal;
                            yaml += `${padding}${prefix}<span class="text-sky-400">${subKey}</span>: <span class="text-sky-200">${disp}</span>\n`;
                        }
                    });
                } else {
                    const disp = typeof item === 'string' && (item.includes('/') || item.includes('*')) ? `"${item}"` : item;
                    yaml += `${padding}  - <span class="text-sky-200">${disp}</span>\n`;
                }
            });
        } else if (typeof val === 'object' && val !== null) {
            yaml += `${padding}<span class="text-sky-400">${key}</span>:\n${renderYaml(val, indent + 1)}`;
        } else {
            const displayVal = typeof val === 'string' && (val.includes('/') || val.includes('*') || val.includes('{') || val.includes('|')) ? `"${val}"` : val;
            yaml += `${padding}<span class="text-sky-400">${key}</span>: <span class="text-sky-200">${displayVal}</span>\n`;
        }
    }
    return yaml;
};

// --- SUB-COMPONENTS ---
const SpecYamlViewer: React.FC<{ spec: FileAppSpec }> = ({ spec }) => {
    const [copied, setCopied] = useState(false);
    const yamlHtml = useMemo(() => renderYaml(spec), [spec]);
    const handleCopy = () => {
        const plainText = yamlHtml.replace(/<[^>]*>?/gm, '');
        navigator.clipboard.writeText(plainText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="bg-[#0f172a] rounded-xl border border-slate-800 overflow-hidden h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 bg-[#1e293b]/50 border-b border-slate-800">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Configuration Spec</span>
                <button onClick={handleCopy} className="p-1.5 hover:bg-slate-700/50 rounded transition-colors text-slate-500 hover:text-white">
                    {copied ? <span className="text-[10px] font-bold text-green-400 mr-2 uppercase">Copied</span> : null}
                    <CopyIcon />
                </button>
            </div>
            <div className="flex-1 p-6 overflow-auto custom-scrollbar">
                <pre className="text-[13px] font-mono leading-relaxed tracking-tight">
                    <code dangerouslySetInnerHTML={{ __html: yamlHtml }} />
                </pre>
            </div>
        </div>
    );
};

// --- MAIN VIEWS ---

interface FolderStats {
    total: number;
    completed: number; 
    failed: number;
    running: number; 
    cancelled: number;
}

export interface AppGroup {
    instances: AppInstance[];
    stats: FolderStats;
    owner: string;
    description: string;
}

const FoldersView: React.FC<{
    instances: AppInstance[];
    onSelectInstance: (instance: AppInstance | { id: string }) => void;
    onJumpToInstances: (folder: string, status: InstanceStatus | 'All') => void;
    currentUser: User;
    onUpdateInstance: (instance: AppInstance) => void;
    initialAppName?: string | null;
    onClearInitialApp?: () => void;
}> = ({ instances, onSelectInstance, onJumpToInstances, currentUser, onUpdateInstance, initialAppName, onClearInitialApp }) => {
    const [selectedAppName, setSelectedAppName] = useState<string | null>(null);
    const [initialStatusFilter, setInitialStatusFilter] = useState<InstanceStatus | null>(null);
    const [ownerFilter, setOwnerFilter] = useState<string>('All');

    const appRegistry = useMemo(() => {
        const groups: Record<string, AppGroup> = {};
        instances.forEach(inst => {
            if (!groups[inst.applicationName]) {
                groups[inst.applicationName] = {
                    instances: [],
                    owner: inst.saas, 
                    description: `Standard file processing pipeline for ${inst.applicationName}...`,
                    stats: { total: 0, completed: 0, failed: 0, running: 0, cancelled: 0 }
                };
            }
            const group = groups[inst.applicationName];
            group.instances.push(inst);
            group.stats.total++;
            if (inst.status === InstanceStatus.SUCCESS) group.stats.completed++;
            else if (inst.status === InstanceStatus.FAILED) group.stats.failed++;
            else if (inst.status === InstanceStatus.IN_PROGRESS) group.stats.running++;
            else if (inst.status === InstanceStatus.CANCELLED) group.stats.cancelled++;
        });
        return groups;
    }, [instances]);

    // Deep-link effect from main dashboard
    useEffect(() => {
      if (initialAppName && appRegistry[initialAppName]) {
        setSelectedAppName(initialAppName);
        // Clear it so navigation is only triggered once
        onClearInitialApp?.();
      }
    }, [initialAppName, appRegistry, onClearInitialApp]);

    const availableOwners = useMemo(() => {
        const owners = new Set<string>();
        (Object.values(appRegistry) as AppGroup[]).forEach(group => owners.add(group.owner));
        return Array.from(owners).sort();
    }, [appRegistry]);

    const filteredApps = useMemo(() => {
        const entries = Object.entries(appRegistry) as [string, AppGroup][];
        const filtered = ownerFilter === 'All' 
            ? entries 
            : entries.filter((entry: [string, AppGroup]) => entry[1].owner === ownerFilter);
        
        return filtered.sort(([a], [b]) => a.localeCompare(b));
    }, [appRegistry, ownerFilter]);

    const handleOpenFolder = (name: string, filter: InstanceStatus | null = null) => {
        setInitialStatusFilter(filter);
        setSelectedAppName(name);
    };

    const handleBackFromFolder = () => {
        setSelectedAppName(null);
        setInitialStatusFilter(null);
    };

    if (selectedAppName) {
        return (
            <L2AppDetailView 
                appName={selectedAppName} 
                data={appRegistry[selectedAppName]} 
                initialFilter={initialStatusFilter}
                onBack={handleBackFromFolder}
                onSelectInstance={onSelectInstance}
                currentUser={currentUser}
                onUpdateInstance={onUpdateInstance}
            />
        );
    }

    return (
        <div className="space-y-4 pt-2">
            {/* Folder Tab Filter Bar */}
            <div className="flex items-center justify-between pb-2">
                <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-3 flex items-center">
                            <FilterIcon />
                            Filter by Owner:
                        </label>
                        <select 
                            value={ownerFilter}
                            onChange={(e) => setOwnerFilter(e.target.value)}
                            className="bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-sm"
                        >
                            <option value="All">All Owners</option>
                            {availableOwners.map(owner => (
                                <option key={owner} value={owner}>{owner}</option>
                            ))}
                        </select>
                    </div>
                    {ownerFilter !== 'All' && (
                        <button 
                            onClick={() => setOwnerFilter('All')}
                            className="text-xs font-bold text-sky-600 hover:underline"
                        >
                            Reset
                        </button>
                    )}
                </div>
                <div className="text-xs font-medium text-slate-500">
                    Showing <span className="text-slate-900 font-bold">{filteredApps.length}</span> of <span className="text-slate-900 font-bold">{Object.keys(appRegistry).length}</span> folders
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {filteredApps.map(([name, data]) => (
                    <div 
                        key={name}
                        className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all group flex overflow-hidden"
                    >
                        <div 
                           onClick={() => handleOpenFolder(name)}
                           className="p-4 flex flex-1 items-center justify-between cursor-pointer"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="bg-sky-50 p-2.5 rounded-lg border border-sky-100 group-hover:bg-sky-100 transition-colors">
                                    <FolderIcon className="h-6 w-6 text-sky-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-sky-600 transition-colors">{name}</h3>
                                    <div className="flex items-center mt-0.5 space-x-3 text-xs">
                                        <span className="text-slate-400 font-medium">Owner: <span className="text-slate-600">{data.owner}</span></span>
                                        <span className="text-slate-300">|</span>
                                        <p className="text-slate-500 line-clamp-1 italic">{data.description}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center px-4 bg-slate-50/30 border-l border-slate-50">
                            <div className="flex space-x-8 mr-10">
                                <ClickableStat 
                                    label="Completed" 
                                    value={data.stats.completed} 
                                    color="text-slate-700" 
                                    onClick={() => handleOpenFolder(name, InstanceStatus.SUCCESS)} 
                                />
                                <ClickableStat 
                                    label="Failed" 
                                    value={data.stats.failed} 
                                    color="text-red-600" 
                                    onClick={() => handleOpenFolder(name, InstanceStatus.FAILED)} 
                                />
                                <ClickableStat 
                                    label="In progress" 
                                    value={data.stats.running} 
                                    color="text-blue-600" 
                                    onClick={() => handleOpenFolder(name, InstanceStatus.IN_PROGRESS)} 
                                />
                                <ClickableStat 
                                    label="Cancelled" 
                                    value={data.stats.cancelled} 
                                    color="text-slate-500" 
                                    onClick={() => handleOpenFolder(name, InstanceStatus.CANCELLED)} 
                                />
                            </div>
                            <div className="h-10 w-px bg-slate-200 mr-6"></div>
                            <ChevronDownIcon 
                                className="text-slate-400 -rotate-90 group-hover:text-sky-600 transition-all group-hover:translate-x-1 cursor-pointer" 
                                onClick={() => handleOpenFolder(name)}
                            />
                        </div>
                    </div>
                ))}
                {filteredApps.length === 0 && (
                    <div className="py-20 text-center bg-white border border-slate-200 border-dashed rounded-lg">
                        <p className="text-slate-400 italic">No folders found for owner "{ownerFilter}".</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const ClickableStat = ({ label, value, color, onClick }: { label: string, value: number, color: string, onClick: () => void }) => (
    <button 
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className="text-right group/stat hover:scale-105 transition-transform"
    >
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover/stat:text-sky-500 transition-colors">{label}</p>
        <p className={`text-xl font-black ${color} leading-none mt-1`}>{value}</p>
    </button>
);

// --- L2 (Detail) VIEW ---
export const L2AppDetailView: React.FC<{ 
    appName: string; 
    data: AppGroup; 
    initialFilter: InstanceStatus | null;
    onBack: () => void; 
    onSelectInstance: (instance: AppInstance | { id: string }) => void;
    currentUser: User;
    onUpdateInstance: (instance: AppInstance) => void;
}> = ({ appName, data, initialFilter, onBack, onSelectInstance, currentUser, onUpdateInstance }) => {
    const spec = mockFileAppSpecs[appName];
    const [localFilter, setLocalFilter] = useState<InstanceStatus | null>(initialFilter);

    const [modalAction, setModalAction] = useState<AuditEventType | null>(null);
    const [activeInstance, setActiveInstance] = useState<AppInstance | null>(null);

    const filteredInstances = useMemo(() => {
        if (!localFilter) return data.instances;
        return data.instances.filter(i => i.status === localFilter);
    }, [data.instances, localFilter]);

    const handleActionClick = (inst: AppInstance, action: AuditEventType) => {
        setActiveInstance(inst);
        setModalAction(action);
    };

    const handleActionSuccess = (updatedInst: AppInstance) => {
        onUpdateInstance(updatedInst);
        setModalAction(null);
        setActiveInstance(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button onClick={onBack} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-slate-500"><ChevronLeftIcon /></button>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{appName}</h2>
                        <p className="text-sm text-slate-500 font-medium">Application Operations & Drilldown</p>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 flex items-center space-x-6 shadow-sm">
                        <L2InteractiveStat 
                            label="Completed" 
                            val={data.stats.completed} 
                            isActive={localFilter === InstanceStatus.SUCCESS}
                            onClick={() => setLocalFilter(localFilter === InstanceStatus.SUCCESS ? null : InstanceStatus.SUCCESS)}
                        />
                        <L2InteractiveStat 
                            label="Failed" 
                            val={data.stats.failed} 
                            color="text-red-600" 
                            isActive={localFilter === InstanceStatus.FAILED}
                            onClick={() => setLocalFilter(localFilter === InstanceStatus.FAILED ? null : InstanceStatus.FAILED)}
                        />
                        <L2InteractiveStat 
                            label="In progress" 
                            val={data.stats.running} 
                            color="text-blue-600" 
                            isActive={localFilter === InstanceStatus.IN_PROGRESS}
                            onClick={() => setLocalFilter(localFilter === InstanceStatus.IN_PROGRESS ? null : InstanceStatus.IN_PROGRESS)}
                        />
                         <L2InteractiveStat 
                            label="Cancelled" 
                            val={data.stats.cancelled} 
                            color="text-slate-500" 
                            isActive={localFilter === InstanceStatus.CANCELLED}
                            onClick={() => setLocalFilter(localFilter === InstanceStatus.CANCELLED ? null : InstanceStatus.CANCELLED)}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Application Details</h3>
                        <dl className="space-y-4 text-sm">
                            <L2MetaItem label="Owner (SaaS)" val={data.owner} />
                            <L2MetaItem label="Description" val={data.description} />
                            <L2MetaItem label="Status" val="Active" isStatus />
                        </dl>
                    </div>
                    <div className="h-[550px]">
                        {spec ? <SpecYamlViewer spec={spec} /> : <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center"><p className="text-sm">Configuration spec not registered for this app.</p></div>}
                    </div>
                </div>
                <div className="lg:col-span-2">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center space-x-3">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Operational Runs</h3>
                                {localFilter && (
                                    <span className="bg-sky-100 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center">
                                        Filtering: {localFilter === InstanceStatus.SUCCESS ? 'Completed' : localFilter}
                                        <button onClick={() => setLocalFilter(null)} className="ml-1.5 hover:text-sky-900">×</button>
                                    </span>
                                )}
                            </div>
                            <button className="text-xs font-bold text-sky-600 hover:underline">Download History (CSV)</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-50">
                                    <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <th className="px-4 py-3">File Name</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Start Time</th>
                                        <th className="px-4 py-3">End Time</th>
                                        <th className="px-4 py-3">Duration</th>
                                        <th className="px-4 py-3">Folder</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredInstances.sort((a: any, b: any) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()).map((inst: AppInstance) => (
                                        <tr key={inst.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => onSelectInstance(inst)}>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <p className="font-bold text-slate-700 group-hover:text-sky-600 transition-colors">{inst.fileName}</p>
                                                <p className="text-[10px] font-mono text-slate-400">{inst.id.substring(0, 8)}</p>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap"><StatusChip status={inst.status} /></td>
                                            <td className="px-4 py-3 whitespace-nowrap text-slate-500 text-xs font-medium">{formatDate(inst.startedAt)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-slate-500 text-xs font-medium">{(inst.status !== InstanceStatus.IN_PROGRESS && inst.status !== InstanceStatus.PENDING) ? formatDate(inst.lastUpdatedAt) : '-'}</td>
                                            <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-slate-500 tracking-wide">{calculateDuration(inst.startedAt, inst.lastUpdatedAt, inst.status)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap"><span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-tighter">{inst.applicationName}</span></td>
                                            <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                                                {inst.status === InstanceStatus.FAILED ? (
                                                    <div className="flex justify-end space-x-2">
                                                        <button 
                                                            className="text-[10px] font-black uppercase text-sky-600 hover:text-sky-700 hover:bg-sky-50 px-2 py-1 rounded border border-sky-100 transition-colors"
                                                            onClick={() => handleActionClick(inst, 'Resume')}
                                                        >
                                                            Resume
                                                        </button>
                                                        <button 
                                                            className="text-[10px] font-black uppercase text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded border border-red-100 transition-colors"
                                                            onClick={() => handleActionClick(inst, 'Cancel')}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-200">--</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredInstances.length === 0 && (
                                        <tr><td colSpan={7} className="p-12 text-center text-slate-400 italic">No runs found for this status.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {modalAction && activeInstance && (
                <ActionModals
                    action={modalAction}
                    instance={activeInstance}
                    task={activeInstance.tasks.find(t => t.status === InstanceStatus.FAILED) || activeInstance.tasks[0]}
                    user={currentUser}
                    onClose={() => { setModalAction(null); setActiveInstance(null); }}
                    onSuccess={handleActionSuccess}
                />
            )}
        </div>
    );
};

// --- MINIMAL COMPONENTS ---

const L2InteractiveStat = ({ label, val, color = 'text-slate-700', isActive, onClick }: { label: string; val: number; color?: string; isActive: boolean; onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center px-3 py-1 rounded-md transition-all ${isActive ? 'bg-sky-50 ring-1 ring-sky-200 shadow-inner' : 'hover:bg-slate-50'}`}
    >
        <span className={`text-[9px] uppercase font-black tracking-tighter ${isActive ? 'text-sky-600' : 'text-slate-400'}`}>{label}</span>
        <span className={`text-lg font-black ${color} leading-none mt-1`}>{val}</span>
    </button>
);

const L2MetaItem = ({ label, val, isStatus }: { label: string; val: string; isStatus?: boolean }) => (
    <div>
        <dt className="text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</dt>
        <dd className="text-slate-800">{isStatus ? <span className="bg-green-100 text-green-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">{val}</span> : val}</dd>
    </div>
);

export default FoldersView;
