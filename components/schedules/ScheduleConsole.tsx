
import React, { useState } from 'react';
import { Tenant, ScheduleDefinition, ScheduleExecution } from '../../types';
import ScheduleL1View from './ScheduleL1View';
import ScheduleL2View from './ScheduleL2View';
import ScheduleL3View from './ScheduleL3View';

const ScheduleConsole: React.FC<{ tenant: Tenant }> = ({ tenant }) => {
  const [viewState, setViewState] = useState<{
    level: 'L1' | 'L2' | 'L3';
    selectedScheduleId: string | null;
    selectedExecutionId: string | null;
  }>({ level: 'L1', selectedScheduleId: null, selectedExecutionId: null });

  const navigateToL2 = (scheduleId: string) => {
    setViewState({ level: 'L2', selectedScheduleId: scheduleId, selectedExecutionId: null });
  };

  const navigateToL3 = (executionId: string) => {
    setViewState(prev => ({ ...prev, level: 'L3', selectedExecutionId: executionId }));
  };

  const backToL1 = () => {
    setViewState({ level: 'L1', selectedScheduleId: null, selectedExecutionId: null });
  };

  const backToL2 = () => {
    setViewState(prev => ({ ...prev, level: 'L2', selectedExecutionId: null }));
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {viewState.level === 'L1' && (
        <ScheduleL1View 
          tenant={tenant} 
          onSelectSchedule={navigateToL2} 
        />
      )}
      {viewState.level === 'L2' && viewState.selectedScheduleId && (
        <ScheduleL2View 
          scheduleId={viewState.selectedScheduleId} 
          onBack={backToL1} 
          onSelectExecution={navigateToL3}
        />
      )}
      {viewState.level === 'L3' && viewState.selectedExecutionId && viewState.selectedScheduleId && (
        <ScheduleL3View 
          executionId={viewState.selectedExecutionId} 
          scheduleId={viewState.selectedScheduleId}
          onBack={backToL2} 
        />
      )}
    </div>
  );
};

export default ScheduleConsole;
