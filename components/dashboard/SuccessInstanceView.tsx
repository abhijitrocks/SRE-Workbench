
import React, { useState } from 'react';
import { AppInstance, InstanceStatus } from '../../types';

// --- ICONS ---
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const CheckCircleIcon = () => <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;


const SuccessInstanceView: React.FC<{
  instance: AppInstance;
}> = ({ instance }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'outputs'>('overview');

    return (
        <div className="p-6 space-y-6">
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <TabButton name="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <TabButton name="Output files" active={activeTab === 'outputs'} onClick={() => setActiveTab('outputs')} />
                </nav>
            </div>
            
            {activeTab === 'overview' && <OverviewTab instance={instance} />}
            {activeTab === 'outputs' && <OutputFilesTab instance={instance} />}
        </div>
    );
};


const OverviewTab: React.FC<{instance: AppInstance}> = ({instance}) => {
    if (!instance.summaryMetrics || !instance.processingStages) {
        return <div className="text-center text-slate-500 p-8">Summary data is not available for this instance.</div>
    }

    const { summaryMetrics, processingStages } = instance;
    const summaryData = [
        { label: 'Corporation ID', value: summaryMetrics.corporationId },
        { label: 'File level error code', value: '-' },
        { label: 'Error code description', value: '-' },
        { label: 'Total records', value: summaryMetrics.totalRecords },
        { label: 'Total Successful Records', value: summaryMetrics.successfulRecords },
        { label: 'Total Error Records', value: summaryMetrics.errorRecords },
        { label: 'Total Enrolment Records', value: summaryMetrics.totalEnrolmentRecords },
        { label: 'Total Plan Participation Records', value: summaryMetrics.totalPlanParticipationRecords },
        { label: 'Total New Beneficiaries', value: summaryMetrics.totalNewBeneficiaries },
        { label: 'Total Updated Beneficiaries', value: summaryMetrics.totalUpdatedBeneficiaries },
        { label: 'Total Added Plans', value: summaryMetrics.totalAddedPlans },
        { label: 'Total Updated Plans', value: summaryMetrics.totalUpdatedPlans },
        { label: 'Total Changed Plans', value: summaryMetrics.totalChangedPlans },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left: Summary */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
                 <h3 className="text-lg font-semibold text-slate-800 mb-4">Summary</h3>
                 <dl className="space-y-3">
                    {summaryData.map(item => (
                        <div key={item.label} className="flex justify-between text-sm">
                            <dt className="text-slate-600">{item.label}</dt>
                            <dd className="font-medium text-slate-800">{item.value}</dd>
                        </div>
                    ))}
                 </dl>
            </div>

            {/* Right: Stages */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">File Processing Stages</h3>
                <div className="relative">
                    {/* Dotted line */}
                    <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-slate-200 border-l-2 border-dotted border-slate-400"></div>
                    <ul className="space-y-8">
                        {processingStages.map((stage, index) => (
                            <li key={index} className="flex items-start space-x-4 relative">
                                <div className="flex-shrink-0 z-10">
                                    <CheckCircleIcon />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                      <h4 className="font-semibold text-slate-800">{stage.name}</h4>
                                      <div className="h-8 w-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">{stage.user.avatarChar}</div>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1">{stage.description}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const OutputFilesTab: React.FC<{instance: AppInstance}> = ({instance}) => {
    if (!instance.outputFiles || instance.outputFiles.length === 0) {
        return <div className="text-center text-slate-500 p-8">No output files were generated for this instance.</div>
    }

    const { outputFiles } = instance;

    return (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Output files</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">File size</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Number of rows</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Download</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {outputFiles.map(file => (
                        <tr key={file.name}>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-800">{file.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-600">{file.size}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-600">{file.rows}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                <button className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-100 rounded-full transition-colors">
                                    <DownloadIcon />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const TabButton: React.FC<{name: string, active: boolean, onClick: () => void}> = ({ name, active, onClick }) => (
    <button onClick={onClick} className={`${active ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm`}>
        {name}
    </button>
);

export default SuccessInstanceView;
