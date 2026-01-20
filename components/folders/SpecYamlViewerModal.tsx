
import React, { useState } from 'react';

// --- ICONS ---
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>;

interface SpecYamlViewerModalProps {
  title: string;
  spec: any;
  onClose: () => void;
}

const SpecYamlViewerModal: React.FC<SpecYamlViewerModalProps> = ({ title, spec, onClose }) => {
  const [copied, setCopied] = useState(false);

  const jsonToYaml = (obj: any, indent = 0): string => {
    let yaml = "";
    const padding = " ".repeat(indent);
    
    for (const key in obj) {
      const value = obj[key];
      if (Array.isArray(value)) {
        yaml += `${padding}${key}:\n`;
        value.forEach(item => {
          if (typeof item === 'object') {
            const itemYaml = jsonToYaml(item, indent + 4).trimStart();
            yaml += `${padding}  - ${itemYaml}`;
          } else {
            yaml += `${padding}  - "${item}"\n`;
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        yaml += `${padding}${key}:\n${jsonToYaml(value, indent + 2)}`;
      } else {
        const valStr = typeof value === 'string' ? `"${value}"` : value;
        yaml += `${padding}${key}: ${valStr}\n`;
      }
    }
    return yaml;
  };

  const yamlContent = jsonToYaml(spec);

  const handleCopy = () => {
    navigator.clipboard.writeText(yamlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightYaml = (yaml: string) => {
    return yaml
      .replace(/^( *)([^:\n]+):/gm, '$1<span class="text-sky-400">$2</span>:')
      .replace(/: (.*)$/gm, ': <span class="text-amber-400">$1</span>')
      .replace(/- (.*)$/gm, '- <span class="text-green-400">$1</span>');
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col animate-slide-in-right" onClick={e => e.stopPropagation()}>
        <header className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-slate-200">{title}</h2>
          <div className="flex items-center space-x-2">
            <button 
                onClick={handleCopy}
                className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-xs transition-colors"
            >
                {copied ? <span className="text-green-400 font-bold">COPIED!</span> : <><CopyIcon /><span>Copy YAML</span></>}
            </button>
            <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-800 transition-colors"><XIcon /></button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 font-mono text-sm leading-relaxed scrollbar-dark">
          <pre className="text-slate-300">
            <code dangerouslySetInnerHTML={{ __html: highlightYaml(yamlContent) }} />
          </pre>
        </div>
        <footer className="p-4 border-t border-slate-800 bg-slate-900/50 rounded-b-xl">
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">DIA RESOURCE DEFINITION v1.4 (READONLY)</p>
        </footer>
      </div>
    </div>
  );
};

export default SpecYamlViewerModal;
