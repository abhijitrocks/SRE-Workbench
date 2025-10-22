
import { AppInstance, LogEntry, InstanceStatus, ScheduledJob, ScheduleStatus, BusinessImpact, ExceptionInstance, SystemRequest } from '../types';
import { mockAppInstances, mockScheduledJobs, mockExceptionInstances, detailedExceptionInstance, mockSystemRequest } from '../constants';

// Simulate network latency
const LATENCY = 500;

export const getInstances = (): Promise<AppInstance[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(JSON.parse(JSON.stringify(mockAppInstances)));
    }, LATENCY);
  });
};

export const getSchedules = (): Promise<ScheduledJob[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(JSON.parse(JSON.stringify(mockScheduledJobs)));
    }, LATENCY);
  });
};

export const getExceptionInstances = (): Promise<ExceptionInstance[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(JSON.parse(JSON.stringify(mockExceptionInstances)));
    }, LATENCY);
  });
};

export const getExceptionInstance = (id: string): Promise<ExceptionInstance | undefined> => {
    return new Promise(resolve => {
        setTimeout(() => {
            // Find the base exception instance from the mock list
            const instance = mockExceptionInstances.find(inst => inst.id === id);

            if (instance) {
                // Create a detailed view by enriching the base data.
                // This single logic path works for BOTH system and business exceptions,
                // ensuring the 'requestId' is always carried over if it exists.
                const detailedData: ExceptionInstance = {
                    ...instance,
                    exceptionDescription: instance.id === detailedExceptionInstance.id 
                        ? detailedExceptionInstance.exceptionDescription // Use specific description for the main system exception
                        : instance.description,
                    createdDate: instance.createdAt,
                    closureDate: null,
                    requestDefinitionCode: 'RQDZINZZ0201',
                    createdBy: { name: 'System', avatarChar: 'S' },
                    // Use the specific rich payload for the original system exception, 
                    // otherwise generate a generic mock one.
                    payload: instance.id === detailedExceptionInstance.id 
                        ? detailedExceptionInstance.payload 
                        : {
                            "message": `This is a mock payload for exception ${instance.id}`,
                            "details": {
                                "definitionCode": instance.definitionCode,
                                "criticality": instance.criticality,
                                "description": instance.description
                            },
                            "source": `{'record':{'id':'mock-record-for-${instance.id}','status':'PENDING'}}`
                        }
                };
                resolve(JSON.parse(JSON.stringify(detailedData)));
            } else {
                resolve(undefined);
            }
        }, LATENCY);
    });
};

export const getSystemRequest = (requestId: string): Promise<SystemRequest | undefined> => {
    return new Promise(resolve => {
        setTimeout(() => {
            // Find the exception that has this request ID to make the data consistent
            const exception = mockExceptionInstances.find(ex => ex.requestId === requestId);
            
            if (exception) {
                const mockReq = JSON.parse(JSON.stringify(mockSystemRequest));
                
                // Customize the mock request based on the exception
                mockReq.requestId = requestId;
                mockReq.exceptionId = exception.id;
                mockReq.title = `Recon Force Match - ${exception.name}`;
                mockReq.syrTitle = `Recon Force Match - ${exception.name}`;
                mockReq.exceptionDefinitionCode = exception.definitionCode;
                mockReq.history[0].actionText = `is reviewing ${mockReq.title} request`;
                mockReq.history[2].actionText = `created a new ${mockReq.title} request`;
                
                resolve(mockReq);
            } else {
                resolve(undefined);
            }
        }, LATENCY);
    });
};


export const getInstanceDetails = (instanceId: string): Promise<AppInstance | undefined> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const instance = mockAppInstances.find(inst => inst.id === instanceId);
            resolve(instance ? JSON.parse(JSON.stringify(instance)) : undefined);
        }, LATENCY);
    });
};

export const getLogsForTask = (instanceId: string, taskId: string): Promise<LogEntry[]> => {
    const instance = mockAppInstances.find(inst => inst.id === instanceId);
    const task = instance?.tasks.find(t => t.id === taskId);

    const logs: LogEntry[] = [
        { timestamp: '15:35:08.123', level: 'INFO', message: `Starting task: ${task?.name} for instance ${instanceId.substring(0,20)}...` },
        { timestamp: '15:35:08.541', level: 'INFO', message: `Attempting to move file from /source to /processed/benefits/` },
    ];

    if (task?.status === InstanceStatus.FAILED) {
        logs.push({
            timestamp: '15:35:09.012',
            level: 'ERROR',
            message: `[${task.errorCode}] ${task.errorMessage}`,
            traceId: 'a1b2c3d4-e5f6-a1b2-c3d4-e5f6a7b8c9d0'
        });
        logs.push({ timestamp: '15:35:09.015', level: 'WARN', message: `Task ${task.name} failed. Attempt ${task.retryAttempts}/3.` });
    } else {
        logs.push({ timestamp: '15:35:08.999', level: 'INFO', message: `Task ${task?.name} completed successfully.` });
    }

    return new Promise(resolve => {
        setTimeout(() => {
            resolve(logs);
        }, LATENCY / 2);
    });
};

export const postInstanceAction = (instanceId: string, taskId: string, action: 'resume' | 'cancel' | 'skip', reason?: string): Promise<{ success: boolean; message: string }> => {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log(`Action: ${action} on instance ${instanceId}, task ${taskId}. Reason: ${reason || 'N/A'}`);
            
            if (action === 'resume') {
                const instance = mockAppInstances.find(inst => inst.id === instanceId);
                if (instance) {
                   instance.status = InstanceStatus.IN_PROGRESS;
                   const failedTask = instance.tasks.find(t => t.status === InstanceStatus.FAILED);
                   if(failedTask) {
                       failedTask.status = InstanceStatus.IN_PROGRESS;
                       failedTask.retryAttempts += 1;
                       instance.retryCount += 1;
                   }
                }
            } else if (action === 'cancel') {
                const instance = mockAppInstances.find(inst => inst.id === instanceId);
                if (instance) instance.status = InstanceStatus.FAILED; // Or a new "Cancelled" status
            }

            resolve({ success: true, message: `Action '${action}' initiated successfully.` });
        }, LATENCY);
    });
};

export const notifySre = (instanceId: string): Promise<{ success: boolean }> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const instance = mockAppInstances.find(inst => inst.id === instanceId);
            if (instance) {
                instance.isNotified = true;
                console.log(`SaaS SRE notified for instance ${instanceId}`);
            }
            resolve({ success: true });
        }, LATENCY);
    });
};

export const acknowledgeSchedule = (scheduleId: string, reason: string): Promise<{ success: true, updatedSchedule: ScheduledJob }> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const schedule = mockScheduledJobs.find(s => s.id === scheduleId);
            if (!schedule) {
                return reject({ success: false, message: "Schedule not found" });
            }
            console.log(`Acknowledging schedule ${scheduleId}. Reason: ${reason}`);
            // In a real app, you'd properly recalculate the next run time based on the cron expression.
            // For this mock, we'll just set it to some time in the future.
            const now = new Date();
            schedule.nextExpectedRun = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // ~24h from now
            schedule.status = ScheduleStatus.ON_SCHEDULE;
            
            resolve({ success: true, updatedSchedule: JSON.parse(JSON.stringify(schedule)) });
        }, LATENCY);
    });
}

export const triggerScheduleNow = (scheduleId: string, reason: string): Promise<{ success: true, newInstance: AppInstance, updatedSchedule: ScheduledJob }> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const schedule = mockScheduledJobs.find(s => s.id === scheduleId);
            if (!schedule) {
                return reject({ success: false, message: "Schedule not found" });
            }
            console.log(`Manually triggering schedule ${scheduleId}. Reason: ${reason}`);
            const now = new Date();
            const newInstance: AppInstance = {
                id: `manual-trig-${Date.now().toString().slice(-6)}`,
                fileName: `Manual run of ${schedule.name}`,
                saas: schedule.saas,
                zone: schedule.zone,
                applicationName: schedule.applicationName,
                status: InstanceStatus.IN_PROGRESS,
                tasks: [],
                totalTasks: 8, // Example value
                completedTasks: 1, // Example value
                startedAt: now.toISOString(),
                lastUpdatedAt: now.toISOString(),
                retryCount: 0,
                businessImpact: BusinessImpact.MEDIUM, // Example value
            };
            mockAppInstances.unshift(newInstance);
            
            // Update the schedule's last run info
            schedule.lastRun = {
                timestamp: now.toISOString(),
                status: InstanceStatus.IN_PROGRESS,
                instanceId: newInstance.id
            };

            resolve({ success: true, newInstance: JSON.parse(JSON.stringify(newInstance)), updatedSchedule: JSON.parse(JSON.stringify(schedule)) });
        }, LATENCY);
    });
}