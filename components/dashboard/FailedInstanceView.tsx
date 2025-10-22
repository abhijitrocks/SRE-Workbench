
import React from 'react';
import { AppInstance } from '../../types';
import InstanceFailureContent from '../shared/InstanceFailureContent';


const FailedInstanceView: React.FC<{
  instance: AppInstance;
  onSelectException: (exceptionId: string) => void;
}> = ({ instance, onSelectException }) => {
  return (
    <InstanceFailureContent 
        instance={instance} 
        onSelectException={onSelectException} 
    />
  );
};

export default FailedInstanceView;
