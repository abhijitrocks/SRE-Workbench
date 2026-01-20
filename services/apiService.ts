
import { AppInstance, LogEntry, InstanceStatus, ScheduledJob, ScheduleStatus, BusinessImpact, ExceptionInstance, SystemRequest, AuditEventType, User, AuditEvent } from '../types';
import { mockAppInstances, mockScheduledJobs, mockExceptionInstances, detailedExceptionInstance, mockSystemRequest } from '../constants';

// Simulate network latency
const LATENCY = 500;

export const getInstances = (): Promise<AppInstance[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      // We now return all instances so summary counts for 'Completed' are accurate in Folders view.
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
            const instance = mockExceptionInstances.find(inst => inst.id === id);

            if (instance) {
                const detailedData: ExceptionInstance = {
                    ...instance,
                    exceptionDescription: instance.id === detailedExceptionInstance.id 
                        ? detailedExceptionInstance.exceptionDescription 
                        : instance.description,
                    createdDate: instance.createdAt,
                    closureDate: null,
                    requestDefinitionCode: 'RQDZINZZ0201',
                    createdBy: { name: 'System', avatarChar: 'S' },
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
            const exception = mockExceptionInstances.find(ex => ex.requestId === requestId);
            
            if (exception) {
                const mockReq = JSON.parse(JSON.stringify(mockSystemRequest));
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

interface PostActionOptions {
  instanceId: string;
  taskId: string;
  action: AuditEventType;
  user: User;
  reason?: string;
  skipCount?: number;
}

export const postInstanceAction = (options: PostActionOptions): Promise<{ success: boolean; message: string; updatedInstance: AppInstance }> => {
  const { instanceId, taskId, action, user, reason, skipCount } = options;
  
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const instanceIndex = mockAppInstances.findIndex(inst => inst.id === instanceId);
      if (instanceIndex === -1) {
        return reject({ success: false, message: 'Instance not found' });
      }
      
      const instance = JSON.parse(JSON.stringify(mockAppInstances[instanceIndex]));
      const task = instance.tasks.find((t: any) => t.id === taskId);
      
      if (!task) {
        return reject({ success: false, message: 'Task not found' });
      }

      const auditEvent: AuditEvent = {
        type: action,
        user: user.name,
        timestamp: new Date().toISOString(),
        taskId: task.id,
        taskName: task.name,
        details: {},
      };

      switch (action) {
        case 'Resume':
          instance.status = InstanceStatus.IN_PROGRESS;
          auditEvent.details!.preRetryCount = task.retryAttempts;
          task.status = InstanceStatus.IN_PROGRESS;
          task.retryAttempts += 1;
          instance.retryCount += 1;
          break;
        case 'Cancel':
          instance.status = InstanceStatus.CANCELLED;
          instance.cancellationDetails = {
              reason: reason || 'No reason provided.',
              user: user.name,
              timestamp: new Date().toISOString(),
          };
          auditEvent.details!.reason = reason;
          break;
        case 'Skip':
          task.status = InstanceStatus.SUCCESS;
          const failedIndex = instance.tasks.findIndex((t:any) => t.status === InstanceStatus.FAILED);
          if (failedIndex === -1) {
             instance.status = InstanceStatus.IN_PROGRESS;
          }
          auditEvent.details!.skipCount = skipCount;
          auditEvent.details!.reason = reason;
          break;
      }

      if (!instance.auditTrail) {
        instance.auditTrail = [];
      }
      instance.auditTrail.push(auditEvent);
      
      mockAppInstances[instanceIndex] = instance;

      resolve({ success: true, message: `Action '${action}' initiated successfully.`, updatedInstance: instance });
    }, LATENCY);
  });
};


export const notifySre = (instanceId: string): Promise<{ success: boolean, updatedInstance: AppInstance }> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const instanceIndex = mockAppInstances.findIndex(inst => inst.id === instanceId);
            if (instanceIndex === -1) {
                return reject({ success: false, message: "Instance not found" });
            }
            const instance = mockAppInstances[instanceIndex];
            instance.isNotified = true;
            
            const auditEvent: AuditEvent = {
                type: 'Notify',
                user: 'System',
                timestamp: new Date().toISOString(),
            };
            if (!instance.auditTrail) {
                instance.auditTrail = [];
            }
            instance.auditTrail.push(auditEvent);
            
            resolve({ success: true, updatedInstance: JSON.parse(JSON.stringify(instance)) });
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
            const now = new Date();
            schedule.nextExpectedRun = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
            schedule.status = ScheduleStatus.ON_SCHEDULE;
            
            resolve({ success: true, updatedSchedule: JSON.parse(JSON.stringify(schedule)) });
        }, LATENCY);
    });
}

const getWorkbenchName = (saas: string): string => {
  switch (saas) {
    case 'Next Orbit':
    case 'Electron':
    case 'Ruby':
      return 'Benefit processing Workbench';
    case 'Tachyon Credit':
      return 'Revolving credit account workbench';
    case 'ITP SaaS':
      return 'ITP workbench';
    default:
      return 'Benefit processing Workbench';
  }
};

export const triggerScheduleNow = (scheduleId: string, reason: string): Promise<{ success: true, newInstance: AppInstance, updatedSchedule: ScheduledJob }> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const schedule = mockScheduledJobs.find(s => s.id === scheduleId);
            if (!schedule) {
                return reject({ success: false, message: "Schedule not found" });
            }
            const now = new Date();
            const newInstance: AppInstance = {
                id: `manual-trig-${Date.now().toString().slice(-6)}`,
                fileName: `Manual run of ${schedule.name}`,
                saas: schedule.saas,
                tenantId: schedule.tenantId,
                zone: schedule.zone,
                applicationName: schedule.applicationName,
                customerWorkbench: getWorkbenchName(schedule.saas),
                status: InstanceStatus.IN_PROGRESS,
                tasks: [],
                totalTasks: 8,
                completedTasks: 1,
                startedAt: now.toISOString(),
                lastUpdatedAt: now.toISOString(),
                retryCount: 0,
                businessImpact: BusinessImpact.MEDIUM,
            };
            mockAppInstances.unshift(newInstance);
            
            schedule.lastRun = {
                timestamp: now.toISOString(),
                status: InstanceStatus.IN_PROGRESS,
                instanceId: newInstance.id
            };

            resolve({ success: true, newInstance: JSON.parse(JSON.stringify(newInstance)), updatedSchedule: JSON.parse(JSON.stringify(schedule)) });
        }, LATENCY);
    });
}
