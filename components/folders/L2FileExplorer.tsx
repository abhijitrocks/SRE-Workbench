
import React, { useState, useMemo } from 'react';
import { FileExplorerItem, DiaUser, DiaFolder, AppInstance } from '../../types';
import { mockDiaUsers, mockDiaFolders } from '../../constants';

// --- ICONS ---
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m15 18-6-6 6-6"></path></svg>;
const FolderIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "h-5 w-5 text-sky-500"}><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>;
const FileIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "h-5 w-5 text-slate-400"}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2 text-slate-500"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-600"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-slate-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const AlertCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-amber-500"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const ActivityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>;

const getGenericSubItems = (prefix: string): FileExplorerItem[] => [
    { id: `${prefix}-1`, name: `Completed_Batch_9901.csv`, type: 'file', size: '1.4 MB', updatedAt: '2024-03-20T09:45:00Z' },
    { id: `${prefix}-2`, name: `Failed_Upload_E901.csv`, type: 'file', size: '12 KB', updatedAt: '2024-03-20T09:50:00Z' },
    { id: `${prefix}-3`, name: 'archive', type: 'folder', updatedAt: '2024-03-18T15:00:00Z', items: [
      { id: `${prefix}-3-1`, name: 'historical_data.zip', type: 'file', size: '45.0 MB', updatedAt: '2024-03-10T12:00:00Z' }
    ]}
];

interface L2FileExplorerProps {
  resource: { type: 'user' | 'folder', id: string, name: string };
  onBack: () => void;
  onSelectInstance: (instance: AppInstance | { id: string }) => void;
  instances: AppInstance[];
}

const L2FileExplorer: React.FC<L2FileExplorerProps> = ({ resource, onBack, onSelectInstance, instances }) => {
  const userObj = useMemo(() => mockDiaUsers.find(u => u.resourceName === resource.id), [resource]);
  const folderObj = useMemo(() => mockDiaFolders.find(f => f.resourceName === resource.id), [resource]);

  const [path, setPath] = useState<FileExplorerItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<FileExplorerItem | null>(null);

  const isAtRoot = path.length === 0;

  // Compute initial items based on resource type and configuration
  const initialFileSystem = useMemo((): FileExplorerItem[] => {
    if (resource.type === 'user') {
      if (userObj && userObj.storageMount && userObj.storageMount.length > 0) {
        return userObj.storageMount.map((m, idx) => {
          const folderResource = mockDiaFolders.find(f => f.username === userObj.userName && f.path.endsWith(m.mount));
          const mountName = m.mount.startsWith('/') ? m.mount.substring(1) : m.mount;

          return {
            id: `mount-${idx}`,
            name: folderResource ? folderResource.folderName : mountName, 
            type: 'folder',
            updatedAt: userObj.updatedTs,
            items: getGenericSubItems(mountName),
            isMount: true,
            mountPath: m.mount, 
            mountStorageName: m.storageName,
            mountPermissions: m.permissions
          };
        });
      }
      return [];
    } else if (resource.type === 'folder' && folderObj) {
        return [
            { id: 'f1', name: 'processing', type: 'folder', updatedAt: '2024-03-20T10:00:00Z', items: getGenericSubItems('processing') },
            { id: 'f2', name: 'logs', type: 'folder', updatedAt: '2024-03-20T10:00:00Z', items: getGenericSubItems('logs') },
            { id: 'f3', name: 'readme.md', type: 'file', size: '2 KB', updatedAt: '2024-01-01T00:00:00Z' }
        ];
    }
    return [];
  }, [resource, userObj, folderObj]);

  const [currentItems, setCurrentItems] = useState<FileExplorerItem[]>(initialFileSystem);

  const hasActiveMounts = useMemo(() => {
    return currentItems.some(item => item.isMount);
  }, [currentItems]);

  const currentMountContext = useMemo(() => {
    if (resource.type === 'folder' && folderObj) {
        const userWithMount = mockDiaUsers.find(u => u.userName === folderObj.username);
        const mount = userWithMount?.storageMount?.find(m => folderObj.path.endsWith(m.mount));
        if (mount) {
            return { name: folderObj.folderName, isMount: true, mountPath: mount.mount, mountStorageName: mount.storageName };
        }
    }
    if (path.length === 0) return null;
    return path[0]; 
  }, [path, resource, folderObj]);

  const folderAliases = useMemo(() => {
    if (resource.type !== 'folder' || !folderObj) return [];
    const aliases: { user: string; path: string }[] = [];
    mockDiaUsers.forEach(user => {
      user.storageMount?.forEach(mount => {
        if (user.userName === folderObj.username && folderObj.path.endsWith(mount.mount)) {
           aliases.push({ user: user.userName, path: mount.mount });
        }
      });
    });
    return aliases;
  }, [resource.type, folderObj]);

  const linkedInstance = useMemo(() => {
      if (!selectedItem || selectedItem.type !== 'file') return null;
      return instances.find(inst => inst.fileName === selectedItem.name);
  }, [selectedItem, instances]);

  const navigateTo = (item: FileExplorerItem) => {
    if (item.type === 'folder' && item.items) {
      setPath([...path, item]);
      setCurrentItems(item.items);
      setSelectedItem(null);
    } else {
      setSelectedItem(item);
    }
  };

  const navigateUp = (index: number) => {
    const newPath = path.slice(0, index + 1);
    setPath(newPath);
    setCurrentItems(newPath[newPath.length - 1].items || []);
    setSelectedItem(null);
  };

  const navigateRoot = () => {
    setPath([]);
    setCurrentItems(initialFileSystem);
    setSelectedItem(null);
  };

  const thirdColumnHeader = (resource.type === 'user' && isAtRoot && hasActiveMounts) ? 'Mount Path & Access' : 'Size';

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
            <button onClick={onBack} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-slate-500"><ChevronLeftIcon /></button>
            <div>
                <h2 className="text-xl font-bold text-slate-800">Resource Explorer</h2>
                <div className="flex items-center text-sm text-sky-600 font-medium">
                    <span className="uppercase text-[10px] bg-sky-100 px-1.5 py-0.5 rounded mr-2">{resource.type}</span>
                    <span>{resource.name}</span>
                </div>
            </div>
        </div>

        {currentMountContext?.isMount && (
            <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-lg flex items-center shadow-sm">
                <div className="mr-3 p-1.5 bg-white rounded border border-indigo-100 text-indigo-500"><LinkIcon /></div>
                <div>
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none">System Mount Path</p>
                    <p className="text-sm font-black text-indigo-700 font-mono leading-tight mt-0.5">{currentMountContext.mountPath}</p>
                </div>
            </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-lg flex flex-col overflow-hidden h-[600px]">
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
           <div className="flex items-center space-x-1 text-xs font-bold text-slate-500">
                <button onClick={navigateRoot} className="hover:text-sky-600 underline">ROOT</button>
                {path.map((p, idx) => (
                    <React.Fragment key={p.id}>
                        <span className="text-slate-300">/</span>
                        <button onClick={() => navigateUp(idx)} className={`hover:text-sky-600 underline uppercase ${idx === 0 ? 'text-indigo-600' : ''}`}>
                            {p.name}
                            {p.isMount && <span className="ml-1 text-[10px] no-underline font-mono opacity-60">({p.mountPath})</span>}
                        </button>
                    </React.Fragment>
                ))}
           </div>
           <div className="flex items-center text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 uppercase tracking-tighter">
              <EyeIcon /> Observation Mode Only
           </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
            <div className="w-2/3 border-r border-slate-200 overflow-y-auto">
                {resource.type === 'user' && isAtRoot && (
                    <div className="bg-sky-50/50 px-6 py-4 border-b border-sky-100">
                        <div className="flex items-start">
                            <div className="bg-sky-100 p-2 rounded-lg mr-4 text-sky-600"><ShieldIcon /></div>
                            <div>
                                <h4 className="text-sm font-bold text-sky-900 uppercase tracking-tight">Active User Environment</h4>
                                <p className="text-xs text-sky-800/70 leading-relaxed mt-1">
                                    Displaying the specific folders mounted for <strong>{resource.name}</strong>. This view reflects exactly what the application "sees" during runtime.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {currentItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                        <AlertCircleIcon />
                        <h3 className="mt-4 text-lg font-bold text-slate-800">No Storage Mounts Configured</h3>
                        <p className="mt-2 text-sm text-slate-500 max-w-sm">
                            This user exists in the registry but has not been granted access to any physical storage. Use the <strong>Users Panel</strong> to update their storage policy.
                        </p>
                    </div>
                ) : (
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 z-10">
                            <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="px-6 py-3">Resource Name</th>
                                <th className="px-6 py-3">Last Modified</th>
                                <th className="px-6 py-3">{thirdColumnHeader}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {currentItems.map(item => (
                                <tr key={item.id} onClick={() => navigateTo(item)} className={`cursor-pointer transition-colors ${selectedItem?.id === item.id ? 'bg-sky-50' : 'hover:bg-slate-50'}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {item.type === 'folder' ? <FolderIcon /> : <FileIcon />}
                                            <div className="ml-3">
                                                <span className={`font-bold block ${item.type === 'folder' ? 'text-slate-900' : 'text-slate-600'}`}>{item.name}</span>
                                                {item.isMount && (
                                                    <div className="flex items-center text-[10px] text-slate-400 font-medium">
                                                        <LinkIcon /> <span>Mapped to: <span className="text-sky-600 font-bold">{item.mountStorageName}</span></span>
                                                    </div>
                                                )}
                                                {item.type === 'file' && instances.some(inst => inst.fileName === item.name) && (
                                                    <div className="flex items-center text-[9px] text-sky-600 font-black uppercase mt-0.5">
                                                        <ActivityIcon /> <span>Processing Linked</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-mono text-xs">{new Date(item.updatedAt).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {(item.isMount && resource.type === 'user' && isAtRoot) ? (
                                            <div className="flex flex-col space-y-1">
                                                <code className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 self-start">{item.mountPath}</code>
                                                <div className="flex flex-wrap gap-1">
                                                    {item.mountPermissions?.map(p => (
                                                        <span key={p} className="bg-slate-100 text-slate-600 text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-slate-200">{p}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 text-xs">{item.size || '--'}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="w-1/3 bg-slate-50/50 p-6 overflow-y-auto border-l border-slate-200">
                {selectedItem || currentMountContext || (folderObj && isAtRoot) ? (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mb-4">
                                {(selectedItem || path[path.length-1] || folderObj!).type === 'folder' || (selectedItem || path[path.length-1] || folderObj!).type === undefined ? <FolderIcon className="h-10 w-10 text-sky-500" /> : <FileIcon className="h-10 w-10" />}
                            </div>
                            <h3 className="font-bold text-slate-800 text-lg break-all">{(selectedItem || path[path.length-1])?.name || folderObj?.folderName}</h3>
                            <span className="text-xs text-slate-400 font-mono uppercase">
                                {(selectedItem || currentMountContext)?.isMount ? 'Storage Mount Point' : (selectedItem?.type || 'Registry Folder')}
                            </span>
                        </div>

                        {linkedInstance && (
                            <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 shadow-sm">
                                <h4 className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-3 flex items-center"><ActivityIcon /> Processing Context</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500">Instance ID:</span>
                                        <span className="font-mono font-bold text-slate-700">{linkedInstance.id.substring(0,12)}...</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500">Current Status:</span>
                                        <span className={`font-black uppercase text-[10px] px-2 py-0.5 rounded-full ${
                                            linkedInstance.status === 'Success' ? 'bg-green-100 text-green-700' : 
                                            linkedInstance.status === 'Failed' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                        }`}>{linkedInstance.status}</span>
                                    </div>
                                    <button 
                                        onClick={() => onSelectInstance(linkedInstance)}
                                        className="w-full mt-2 bg-white border border-sky-200 text-sky-600 py-2 px-3 rounded-lg text-xs font-bold hover:bg-sky-600 hover:text-white transition-all shadow-sm flex items-center justify-center"
                                    >
                                        Jump to Instance View
                                    </button>
                                </div>
                            </div>
                        )}

                        {resource.type === 'folder' && isAtRoot && folderAliases.length > 0 && (
                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center"><LinkIcon /> Mount Aliases</h4>
                                <ul className="space-y-2">
                                    {folderAliases.map((a, i) => (
                                        <li key={i} className="flex items-center justify-between text-xs bg-white p-2 rounded border border-indigo-100">
                                            <div className="flex items-center text-slate-700 font-bold"><UserIcon /> <span className="ml-1">{a.user}</span></div>
                                            <code className="text-indigo-600 font-black">{a.path}</code>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="border-t border-slate-200 pt-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Properties</p>
                                <dl className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <dt className="text-slate-500">Modified</dt>
                                        <dd className="text-slate-800 font-medium text-xs font-mono">{new Date((selectedItem || path[path.length-1] || folderObj!).updatedAt || folderObj?.updatedTs || Date.now()).toLocaleString()}</dd>
                                    </div>
                                    {(selectedItem || currentMountContext)?.isMount && (
                                         <>
                                            <div className="flex justify-between">
                                                <dt className="text-slate-500">Technical Alias</dt>
                                                <dd className="text-indigo-600 font-mono font-black">{(selectedItem || currentMountContext!).mountPath}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-slate-500">Mount Target</dt>
                                                <dd className="text-sky-700 font-bold">{(selectedItem || currentMountContext!).mountStorageName}</dd>
                                            </div>
                                         </>
                                    )}
                                    {folderObj && isAtRoot && (
                                        <div className="flex justify-between">
                                            <dt className="text-slate-500">Physical Path</dt>
                                            <dd className="text-slate-700 font-mono text-[10px] break-all text-right max-w-[150px]">{folderObj.path}</dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        </div>

                        <div className="bg-sky-50 border border-sky-100 p-4 rounded-lg shadow-inner text-xs text-sky-800 leading-relaxed font-medium">
                            <span className="font-black">Notice:</span> Read-Only mode. Actions are restricted.
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col">
                        <div className="flex items-center space-x-2 mb-6"><BookOpenIcon /> <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">SRE Usage Guide</h3></div>
                        <div className="space-y-6">
                            <section>
                                <h4 className="text-xs font-bold text-sky-700 uppercase mb-2">Actionable Forensics</h4>
                                <ul className="space-y-3">
                                    <li className="flex items-start">
                                        <div className="h-1.5 w-1.5 rounded-full bg-sky-400 mt-1.5 mr-2 shrink-0"></div>
                                        <div>
                                            <p className="text-[11px] font-bold text-slate-700">Inbound Check</p>
                                            <p className="text-[10px] text-slate-500">Confirm file delivery when a trigger fails.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="h-1.5 w-1.5 rounded-full bg-sky-400 mt-1.5 mr-2 shrink-0"></div>
                                        <div>
                                            <p className="text-[11px] font-bold text-slate-700">Schema Inspection</p>
                                            <p className="text-[10px] text-slate-500">Manually audit malformed records.</p>
                                        </div>
                                    </li>
                                </ul>
                            </section>
                            <div className="mt-auto pt-6 border-t border-slate-200">
                                <div className="flex items-center justify-center p-4 bg-slate-100 rounded-xl border border-dashed border-slate-300 text-[11px] text-slate-400 italic text-center">Select an item to view metadata.</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default L2FileExplorer;
