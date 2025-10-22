
import React from 'react';
import { AppInstance, Task } from '../../types';

const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

const generateIframeContent = (instance: AppInstance, task: Task) => {
    const taskDetails = instance.tasks.find(t => t.id === task.id);
    const errorMessage = taskDetails?.errorMessage || 'Task failed with an unknown error.';
    const taskName = taskDetails?.name || 'Unknown Task';
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { margin: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #1e293b; }
        ::-webkit-scrollbar-thumb { background: #475569; border-radius: 5px; }
        ::-webkit-scrollbar-thumb:hover { background: #64748b; }
    </style>
</head>
<body class="bg-[#0f172a] text-[#cbd5e1] font-sans">
    <div class="p-4 h-full flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-700 pb-3 mb-4 shrink-0">
            <div class="flex items-center space-x-3">
                <svg width="24" height="24" viewBox="0 0 135 135" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M118.125 84.375C118.125 102.938 102.938 118.125 84.375 118.125C65.8125 118.125 50.625 102.938 50.625 84.375C50.625 65.8125 65.8125 50.625 84.375 50.625C102.938 50.625 118.125 65.8125 118.125 84.375Z" fill="#00A0A9"></path><path d="M84.375 0C100.406 0 113.625 9.3375 118.125 22.5H50.625C50.625 10.125 65.8125 0 84.375 0Z" fill="#F15B2A"></path><path d="M50.625 22.5C22.6687 22.5 0 45.1688 0 73.125V101.25H73.125C61.4812 101.25 50.625 90.4688 50.625 78.75V22.5Z" fill="#78BE20"></path></svg>
                <h1 class="text-xl font-bold text-slate-100">OpenSearch (Mock)</h1>
            </div>
            <div class="text-sm text-slate-400">Oct 20, 2025 @ 15:43 &rarr; Oct 22, 2025 @ 15:43</div>
        </div>

        <!-- Filters -->
        <div class="flex items-center space-x-2 mb-4 shrink-0">
            <span class="bg-slate-700 px-2 py-1 rounded-md text-xs">instance.id: "${instance.id.substring(0,8)}..."</span>
            <span class="bg-slate-700 px-2 py-1 rounded-md text-xs">task.name: "${task.name}"</span>
        </div>

        <!-- Logs -->
        <div class="font-mono text-xs space-y-1 overflow-auto flex-1">
            <div class="flex items-start py-1"><span class="text-slate-500 w-40 shrink-0">15:35:08.123</span><span class="text-green-400 w-12 shrink-0">INFO</span><p class="flex-1">Starting task: ${taskName} for instance ${instance.id}</p></div>
            <div class="flex items-start py-1"><span class="text-slate-500 w-40 shrink-0">15:35:08.541</span><span class="text-green-400 w-12 shrink-0">INFO</span><p class="flex-1">Attempting to move file from /source to /processed/benefits/</p></div>
            <div class="flex items-start bg-red-900/40 p-1 rounded"><span class="text-slate-500 w-40 shrink-0">15:35:09.012</span><span class="text-red-400 font-bold w-12 shrink-0">ERROR</span><p class="flex-1 text-red-300">[${taskDetails?.errorCode}] ${errorMessage}</p></div>
            <div class="flex items-start py-1"><span class="text-slate-500 w-40 shrink-0">15:35:09.015</span><span class="text-amber-400 w-12 shrink-0">WARN</span><p class="flex-1">Task ${taskName} failed. Attempt 3/3.</p></div>
        </div>
    </div>
</body>
</html>
    `;
};

interface LiveLogsModalProps {
  instance: AppInstance;
  task: Task;
  onClose: () => void;
}

const LiveLogsModal: React.FC<LiveLogsModalProps> = ({ instance, task, onClose }) => {
  const iframeContent = generateIframeContent(instance, task);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="bg-white border border-slate-200 rounded-lg shadow-xl transform transition-all w-[90vw] h-[90vh] flex flex-col">
        <header className="p-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-slate-900">Live Logs: <span className="font-mono text-sky-600">{task.name}</span></h2>
            <p className="text-sm text-slate-500 font-mono">{instance.id}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-200"><XIcon /></button>
        </header>
        <div className="flex-1 p-2 bg-slate-100">
          <iframe
            title={`Live logs for task ${task.name}`}
            className="w-full h-full border-0 rounded-md bg-slate-800"
            srcDoc={iframeContent}
          />
        </div>
      </div>
    </div>
  );
};

export default LiveLogsModal;