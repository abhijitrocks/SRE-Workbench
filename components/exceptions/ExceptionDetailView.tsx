
import React, { useState, useEffect } from 'react';
import { ExceptionInstance, SystemRequest } from '../../types';
import { getSystemRequest } from '../../services/apiService';
import RequestView from './RequestView';

// --- ICONS ---
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>;
const ExternalLinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 ml-1"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>;

interface ExceptionDetailViewProps {
  exception: ExceptionInstance;
  onClose: () => void;
  onShowTaskDetailView: (exceptionId: string) => void;
}

const ExceptionDetailView: React.FC<ExceptionDetailViewProps> = ({ exception, onClose, onShowTaskDetailView }) => {
  const [activeTab, setActiveTab] = useState('Details');
  const [systemRequest, setSystemRequest] = useState<SystemRequest | null>(null);
  const [requestLoading, setRequestLoading] = useState(false);

  useEffect(() => {
    const fetchRequestData = async () => {
      if (activeTab === 'Request' && exception.requestId && !systemRequest) {
        setRequestLoading(true);
        try {
          const data = await getSystemRequest(exception.requestId);
          setSystemRequest(data || null);
        } catch (error) {
          console.error("Failed to fetch system request", error);
        } finally {
          setRequestLoading(false);
        }
      }
    };
    fetchRequestData();
  }, [activeTab, exception.requestId, systemRequest]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'Request':
        return <RequestView 
                  systemRequest={systemRequest} 
                  loading={requestLoading} 
                  onShowTaskDetailView={() => onShowTaskDetailView(exception.id)}
               />;
      case 'SOP':
        return (
          <div className="p-6">
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Standard Operating Procedure (SOP)</h3>
              <p className="mt-4 text-slate-500">SOP display is not yet linked for this view. An associated App Instance is required to show the correct SOP.</p>
            </div>
          </div>
        );
      case 'Details':
      default:
        return <DetailsView exception={exception} />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose}></div>
      <aside className="fixed top-0 right-0 h-full w-full max-w-7xl bg-slate-50 border-l border-slate-200 shadow-2xl z-50 flex flex-col animate-slide-in-right">
        <header className="p-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
          <div>
            <p className="text-sm text-sky-600">Exceptions &gt;</p>
            <h2 className="text-xl font-semibold text-slate-900">{exception.name}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 text-slate-500"><XIcon /></button>
        </header>

        <nav className="px-6 pt-4 border-b border-slate-200 bg-white shrink-0">
          <div className="flex space-x-6">
            {['Details', 'SOP', 'Request'].map(tabName => (
              <button
                key={tabName}
                onClick={() => setActiveTab(tabName)}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tabName ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                {tabName}
              </button>
            ))}
          </div>
        </nav>

        <main className="flex-1 overflow-y-auto">
          {renderActiveTab()}
        </main>
      </aside>
    </>
  );
};


const DetailsView: React.FC<{exception: ExceptionInstance}> = ({exception}) => {
    const [payloadView, setPayloadView] = useState('JSON View');
    
    return (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Overview */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 self-start">
                <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-4">Overview</h3>
                <dl className="space-y-4 text-sm">
                    <MetaItem label="Exception Name" value={exception.name} />
                    <MetaItem label="Exception ID" value={exception.id} isMono copyable />
                    <MetaItem label="Exception Description" value={exception.exceptionDescription || '-'} />
                    <MetaItem label="Created Date" value={exception.createdDate || '-'} />
                    <MetaItem label="Criticality"><span className="px-2 py-0.5 text-xs rounded-full font-medium bg-red-100 text-red-800">{exception.criticality}</span></MetaItem>
                    <MetaItem label="Exception Definition Code" value={exception.definitionCode} isMono link />
                    <MetaItem label="Created By">
                        <div className="flex items-center space-x-2">
                        <span className="h-6 w-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold">{exception.createdBy?.avatarChar}</span>
                        <span>{exception.createdBy?.name}</span>
                        </div>
                    </MetaItem>
                    <MetaItem label="Request ID" value={exception.requestId || '-'} isMono link />
                    <MetaItem label="Closure Date" value={exception.closureDate || '-'} />
                    <MetaItem label="Request Definition Code" value={exception.requestDefinitionCode || '-'} isMono link />
                </dl>
            </div>
            {/* Right Column: Payload */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 self-start">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Exception Payload</h3>
                <div className="border border-slate-200 rounded-lg">
                    <div className="p-2 bg-slate-50 border-b border-slate-200 flex justify-end">
                         <div className="flex items-center bg-slate-200 p-0.5 rounded-md">
                            <button onClick={() => setPayloadView('Enhanced View')} className={`px-3 py-1 text-xs font-medium rounded ${payloadView === 'Enhanced View' ? 'bg-white shadow-sm' : 'text-slate-600'}`}>Enhanced View</button>
                            <button onClick={() => setPayloadView('JSON View')} className={`px-3 py-1 text-xs font-medium rounded ${payloadView === 'JSON View' ? 'bg-white shadow-sm' : 'text-slate-600'}`}>JSON View</button>
                         </div>
                    </div>
                    <JsonViewer data={exception.payload} />
                </div>
            </div>
        </div>
    );
}

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

const JsonViewer: React.FC<{ data: any }> = ({ data }) => {
  const [copied, setCopied] = useState(false);
  const formattedJson = data ? JSON.stringify(JSON.parse(data.source.replace(/'/g, '"')), null, 2) : "{}";

  const handleCopy = () => {
      navigator.clipboard.writeText(formattedJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 rounded-b-lg relative">
      <div className="absolute top-3 right-3">
        <button onClick={handleCopy} className="p-1.5 rounded-md bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white transition-colors">
            {copied ? <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> : <CopyIcon />}
        </button>
      </div>
      <pre className="p-4 text-xs text-slate-300 overflow-auto max-h-[60vh]">
        <code dangerouslySetInnerHTML={{ __html: syntaxHighlight(formattedJson) }} />
      </pre>
    </div>
  );
};

function syntaxHighlight(json: string) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'text-green-400'; // number
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'text-sky-400'; // key
            } else {
                cls = 'text-amber-400'; // string
            }
        } else if (/true|false/.test(match)) {
            cls = 'text-fuchsia-400'; // boolean
        } else if (/null/.test(match)) {
            cls = 'text-slate-500'; // null
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}


export default ExceptionDetailView;
