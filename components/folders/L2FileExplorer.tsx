
import React, { useState } from 'react';
import { FileExplorerItem } from '../../types';

// --- ICONS ---
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m15 18-6-6 6-6"></path></svg>;
const FolderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-sky-500"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>;
const FileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-slate-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2 text-slate-500"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>;

const mockFileSystem: FileExplorerItem[] = [
  {
    id: 'f1',
    name: 'processing',
    type: 'folder',
    updatedAt: '2024-03-20T10:00:00Z',
    items: [
      { id: 'f1-1', name: 'Beneficiary_20250427_01.csv', type: 'file', size: '12.4 MB', updatedAt: '2024-03-20T09:45:00Z' },
      { id: 'f1-2', name: 'Claims_Batch_A9.json', type: 'file', size: '2.1 MB', updatedAt: '2024-03-20T09:50:00Z' },
      { id: 'f1-3', name: 'archive', type: 'folder', updatedAt: '2024-03-18T15:00:00Z', items: [
        { id: 'f1-3-1', name: 'old_data.zip', type: 'file', size: '45.0 MB', updatedAt: '2024-03-10T12:00:00Z' }
      ]}
    ]
  },
  {
    id: 'f2',
    name: 'logs',
    type: 'folder',
    updatedAt: '2024-03-19T22:00:00Z',
    items: [
      { id: 'f2-1', name: 'runtime.log', type: 'file', size: '450 KB', updatedAt: '2024-03-20T10:05:00Z' },
      { id: 'f2-2', name: 'error_dump.txt', type: 'file', size: '1.2 MB', updatedAt: '2024-03-20T08:30:00Z' }
    ]
  },
  { id: 'f3', name: 'readme.md', type: 'file', size: '2 KB', updatedAt: '2024-01-01T00:00:00Z' }
];

interface L2FileExplorerProps {
  resource: { type: 'user' | 'folder', id: string, name: string };
  onBack: () => void;
}

const L2FileExplorer: React.FC<L2FileExplorerProps> = ({ resource, onBack }) => {
  const [currentItems, setCurrentItems] = useState<FileExplorerItem[]>(mockFileSystem);
  const [path, setPath] = useState<FileExplorerItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<FileExplorerItem | null>(null);

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
    setCurrentItems(mockFileSystem);
    setSelectedItem(null);
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center space-x-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-slate-500"
        >
          <ChevronLeftIcon />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Resource Explorer</h2>
          <div className="flex items-center text-sm text-sky-600 font-medium">
             <span className="uppercase text-[10px] bg-sky-100 px-1.5 py-0.5 rounded mr-2">{resource.type}</span>
             <span>{resource.name}</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-lg flex flex-col overflow-hidden h-[600px]">
        {/* Navigation Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
           <div className="flex items-center space-x-1 text-xs font-bold text-slate-500">
                <button onClick={navigateRoot} className="hover:text-sky-600 underline">ROOT</button>
                {path.map((p, idx) => (
                    <React.Fragment key={p.id}>
                        <span>/</span>
                        <button onClick={() => navigateUp(idx)} className="hover:text-sky-600 underline uppercase">{p.name}</button>
                    </React.Fragment>
                ))}
           </div>
           <div className="flex items-center text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 uppercase tracking-tighter">
              <EyeIcon />
              Observation Mode Only
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
            {/* List Column */}
            <div className="w-2/3 border-r border-slate-200 overflow-y-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                        <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="px-6 py-2">Name</th>
                            <th className="px-6 py-2">Last Modified</th>
                            <th className="px-6 py-2">Size</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {currentItems.map(item => (
                            <tr 
                                key={item.id} 
                                onClick={() => navigateTo(item)}
                                className={`cursor-pointer transition-colors ${selectedItem?.id === item.id ? 'bg-sky-50' : 'hover:bg-slate-50'}`}
                            >
                                <td className="px-6 py-3 whitespace-nowrap">
                                    <div className="flex items-center">
                                        {item.type === 'folder' ? <FolderIcon /> : <FileIcon />}
                                        <span className={`ml-3 font-medium ${item.type === 'folder' ? 'text-slate-900' : 'text-slate-600'}`}>{item.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap text-slate-400 font-mono text-xs">{new Date(item.updatedAt).toLocaleString()}</td>
                                <td className="px-6 py-3 whitespace-nowrap text-slate-400 text-xs">{item.size || '--'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Info Column */}
            <div className="w-1/3 bg-slate-50/50 p-6 overflow-y-auto">
                {selectedItem || (path.length > 0 ? path[path.length - 1] : null) ? (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mb-4">
                                {(selectedItem || path[path.length-1]).type === 'folder' ? <FolderIcon /> : <FileIcon />}
                            </div>
                            <h3 className="font-bold text-slate-800 text-lg break-all">{(selectedItem || path[path.length-1]).name}</h3>
                            <span className="text-xs text-slate-400 font-mono uppercase">{(selectedItem || path[path.length-1]).type}</span>
                        </div>

                        <div className="space-y-4">
                            <div className="border-t border-slate-200 pt-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Properties</p>
                                <dl className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <dt className="text-slate-500">Modified</dt>
                                        <dd className="text-slate-800 font-medium text-xs font-mono">{new Date((selectedItem || path[path.length-1]).updatedAt).toLocaleString()}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-slate-500">Kind</dt>
                                        <dd className="text-slate-800 font-medium capitalize">{(selectedItem || path[path.length-1]).type}</dd>
                                    </div>
                                    {(selectedItem || path[path.length-1]).size && (
                                        <div className="flex justify-between">
                                            <dt className="text-slate-500">Size</dt>
                                            <dd className="text-slate-800 font-medium">{(selectedItem || path[path.length-1]).size}</dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        </div>

                        <div className="bg-sky-50 border border-sky-100 p-4 rounded-lg">
                            <p className="text-xs text-sky-800 leading-relaxed font-medium">
                                <span className="font-black">Notice:</span> You are viewing this resource in Read-Only mode. All write operations (upload/delete/rename) are disabled for your current role.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-20"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        <p className="text-sm font-bold">Select an item to view properties</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default L2FileExplorer;
