
import React from 'react';
import { AppInstance } from '../../types';

const SopViewer: React.FC<{ instance: AppInstance }> = ({ instance }) => {
  if (!instance.sop) {
    return <div className="text-slate-500">No Standard Operating Procedure (SOP) available for this exception.</div>;
  }
  
  const { sop } = instance;

  return (
    <div className="h-full overflow-y-auto text-sm text-slate-700 space-y-4">
      <h3 className="text-lg font-semibold text-sky-600">{sop.title}</h3>
      
      <SopSection title="Preconditions">
        <ul className="list-disc list-inside space-y-1 text-slate-600">
          {sop.preconditions.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </SopSection>
      
      <SopSection title="Remediation Steps">
        <ol className="list-decimal list-inside space-y-1 text-slate-600">
          {sop.steps.map((item, i) => <li key={i}>{item}</li>)}
        </ol>
      </SopSection>
      
      <SopSection title="Permissions Required">
        <div className="flex space-x-2">
            {sop.permissionsRequired.map(role => (
                <span key={role} className="bg-slate-200 text-slate-700 px-2 py-1 rounded-md text-xs">{role}</span>
            ))}
        </div>
      </SopSection>
      
      <SopSection title="Rollback Actions">
        <ul className="list-disc list-inside space-y-1 text-slate-600">
          {sop.rollbackActions.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </SopSection>

       <SopSection title="Expected Post-Conditions">
         <p className="text-slate-600">{sop.expectedPostConditions}</p>
      </SopSection>

    </div>
  );
};

const SopSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div>
        <h4 className="font-semibold text-slate-900 mb-2 border-b border-slate-200 pb-1">{title}</h4>
        {children}
    </div>
);

export default SopViewer;