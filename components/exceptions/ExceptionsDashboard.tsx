import React, { useState, useMemo } from 'react';
import { ExceptionInstance } from '../../types';

// --- ICONS ---
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M3 21v-5h5"></path></svg>;
const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"></path></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"></path></svg>;

const ExceptionsDashboard: React.FC<{
  exceptions: ExceptionInstance[];
  onSelectException: (exceptionId: string) => void;
  loading: boolean;
  error: string | null;
}> = ({ exceptions, onSelectException, loading, error }) => {

  const [sortColumn, setSortColumn] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const sortedData = useMemo(() => {
    return [...exceptions].sort((a, b) => {
        const aVal = a[sortColumn as keyof ExceptionInstance];
        const bVal = b[sortColumn as keyof ExceptionInstance];
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        
        return 0;
    });
  }, [exceptions, sortColumn, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (column: string) => {
      if (sortColumn === column) {
          setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
          setSortColumn(column);
          setSortDirection('desc');
      }
  };

  if (loading) return <div className="text-center p-8">Loading exceptions...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Exceptions</h1>
                <p className="text-sm text-slate-500">Last Refreshed: {new Date().toLocaleString()}</p>
            </div>
            <button className="flex items-center bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm hover:bg-slate-50">
                <RefreshIcon />
                <span>Refresh</span>
            </button>
        </div>
        <div className="flex items-center space-x-2">
            <FilterChip label="Exception ID" />
            <FilterChip label="Definition Code" />
            <FilterChip label="Status: Open" active />
            <FilterChip label="Created Date" />
            <FilterChip label="Completed Date" />
        </div>
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="overflow-x-auto">
                <ExceptionsTable 
                    exceptions={paginatedData}
                    onSelectException={onSelectException}
                    onSort={handleSort}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                />
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={sortedData.length}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
            />
        </div>
    </div>
  );
};

const FilterChip: React.FC<{label: string, active?: boolean}> = ({label, active}) => (
    <button className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${active ? 'bg-slate-700 text-white border-slate-700' : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-600'}`}>
        {label}
    </button>
);


const ExceptionsTable: React.FC<{
    exceptions: ExceptionInstance[]; 
    onSelectException: (id: string) => void;
    onSort: (column: string) => void;
    sortColumn: string;
    sortDirection: 'asc'|'desc';
}> = ({ exceptions, onSelectException, onSort, sortColumn, sortDirection }) => {
    
    const headers = [
        { key: 'name', label: 'Name' },
        { key: 'id', label: 'ID' },
        { key: 'criticality', label: 'Criticality' },
        { key: 'createdAt', label: 'Creation Date' },
        { key: 'definitionCode', label: 'Definition Code' },
        { key: 'status', label: 'Status' },
    ];
    
    const SortIndicator = ({ column }: {column: string}) => {
        if (sortColumn !== column) return null;
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    if (exceptions.length === 0) {
        return <div className="text-center p-8 text-slate-500">No exceptions found.</div>;
    }

    return (
    <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
            <tr>
                {headers.map(header => (
                    <th key={header.key} scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        <button onClick={() => onSort(header.key)} className="flex items-center">
                          {header.label}
                          <span className="ml-1"><SortIndicator column={header.key} /></span>
                        </button>
                    </th>
                ))}
            </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
            {exceptions.map(ex => (
                <tr key={ex.id} className="hover:bg-slate-50 transition-colors duration-150">
                    <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-medium text-sky-600">{ex.name}</p>
                        <p className="text-xs text-slate-500">{ex.description}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                             <a href="#" onClick={(e) => { e.preventDefault(); onSelectException(ex.id); }} className="font-mono text-sky-600 hover:underline">{ex.id}</a>
                            <button title="Copy ID" className="text-slate-400 hover:text-sky-600"><CopyIcon /></button>
                        </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap"><span className="px-2 py-0.5 text-xs rounded-full font-medium bg-red-100 text-red-800">{ex.criticality}</span></td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">{ex.createdAt}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                       <div className="flex items-center space-x-2">
                            <span className="font-mono text-slate-700">{ex.definitionCode}</span>
                            <button title="Copy Code" className="text-slate-400 hover:text-sky-600"><CopyIcon /></button>
                       </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center text-slate-700">
                            <svg className="h-5 w-5 mr-1.5 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path></svg>
                            <span>{ex.status}</span>
                        </div>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
    );
};

const Pagination: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
    onItemsPerPageChange: (num: number) => void;
}> = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage, onItemsPerPageChange }) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="px-4 py-3 flex items-center justify-between border-t border-slate-200 text-sm">
            <div className="flex items-center space-x-2">
                <select value={itemsPerPage} onChange={e => onItemsPerPageChange(Number(e.target.value))} className="border-slate-300 rounded-md text-sm p-1">
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                </select>
                <span className="text-slate-600">
                    {totalItems > 0 ? `Showing ${startItem} - ${endItem} of ${totalItems}` : 'No items'}
                </span>
            </div>
            
            <div className="flex items-center space-x-2">
                <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-1 rounded-md disabled:opacity-50 hover:bg-slate-100"><ChevronLeftIcon /></button>
                <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-1 rounded-md disabled:opacity-50 hover:bg-slate-100"><ChevronRightIcon /></button>
            </div>
        </div>
    );
}

export default ExceptionsDashboard;
