export enum UserRole {
  SAAS_SRE = 'SaaS SRE',
  PLATFORM_SRE = 'Olympus Hub SRE',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  saas?: string;
  avatarUrl: string;
}

export interface Zone {
  id: string;
  name: string;
}

export enum InstanceStatus {
  SUCCESS = 'Success',
  IN_PROGRESS = 'In progress',
  FAILED = 'Failed',
  PENDING = 'Pending',
}

export enum ExceptionType {
  BUSINESS = 'Business Exception',
  SYSTEM = 'System Exception',
}

export interface ExceptionDefinition {
  id: string;
  type: ExceptionType;
  cause: string;
  detectionPoint: string;
  exampleMessage: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  isRetryable: boolean;
  recommendedAction: string;
}


export enum BusinessImpact {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  // Fix: Add 'CRITICAL' to support critical-level exceptions, resolving a type error in constants.ts.
  CRITICAL = 'Critical',
}

export interface Task {
  id: string;
  name: string;
  status: InstanceStatus;
  startTime: string;
  endTime: string | null;
  errorCode?: string;
  errorMessage?: string;
  retryAttempts: number;
  exceptionType?: ExceptionType;
}

export interface SOP {
  title: string;
  preconditions: string[];
  steps: string[];
  permissionsRequired: UserRole[];
  rollbackActions: string[];
  expectedPostConditions: string;
}

export interface OutputFile {
  name: string;
  size: string;
  rows: number;
}

export interface ProcessingStage {
  name: string;
  description: string;
  status: InstanceStatus.SUCCESS;
  user: { name: string; avatarChar: string;};
}

export interface SummaryMetrics {
  corporationId: string;
  totalRecords: number;
  successfulRecords: number;
  errorRecords: number;
  totalEnrolmentRecords: number;
  totalPlanParticipationRecords: number;
  totalNewBeneficiaries: number;
  totalUpdatedBeneficiaries: number;
  totalAddedPlans: number;
  totalUpdatedPlans: number;
  totalChangedPlans: number;
}


export interface AppInstance {
  id: string;
  fileName: string;
  saas: string;
  zone: string;
  applicationName: string; // This will be used as "Folder"
  status: InstanceStatus;
  tasks: Task[];
  totalTasks: number;
  completedTasks: number;
  startedAt: string;
  lastUpdatedAt: string;
  retryCount: number;
  businessImpact: BusinessImpact;
  failedTaskIndex?: number;
  exceptionType?: ExceptionType;
  exceptionCode?: string;
  detailedErrorMessage?: string;
  sop?: SOP;
  summaryMetrics?: SummaryMetrics;
  processingStages?: ProcessingStage[];
  outputFiles?: OutputFile[];
  isNotified?: boolean;
  exceptionInstanceId?: string;
}

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  traceId?: string;
}

export enum ScheduleStatus {
  ON_SCHEDULE = 'On Schedule',
  OVERDUE = 'Overdue',
  DISABLED = 'Disabled',
}

export interface ScheduledJob {
  id: string;
  name: string;
  applicationName: string;
  saas: string;
  zone: string;
  cronExpression: string; // e.g., '0 2 * * *'
  lastRun?: {
    timestamp: string;
    status: InstanceStatus;
    instanceId?: string; // Link to the AppInstance
  };
  nextExpectedRun: string;
  status: ScheduleStatus;
}

export interface ExceptionInstance {
  id: string;
  name: string;
  description: string;
  criticality: string;
  createdAt: string;
  definitionCode: string;
  status: 'Open' | 'Closed' | 'In Progress';
  // --- For Detail View ---
  exceptionDescription?: string;
  createdDate?: string;
  closureDate?: string | null;
  requestDefinitionCode?: string;
  createdBy?: { name: string; avatarChar: string };
  requestId?: string;
  payload?: any;
}

export interface SystemRequest {
  title: string;
  status: 'In Progress' | 'Completed' | 'Failed';
  syrTitle: string;
  requestId: string;
  dateCreated: string;
  completedAt: string | null;
  createdBy: { name: string; avatarChar: string; avatarColor: string };
  requestDefinitionCode: string;
  workflow: string;
  exceptionId: string;
  exceptionDefinitionCode: string;
  history: RequestHistoryEvent[];
}

export interface RequestHistoryEvent {
  user: { name: string; avatarChar: string; avatarColor: string };
  actionText: string;
  link?: boolean;
  details: string;
  timestamp: string;
  remarks?: string;
  showTaskDetails?: boolean;
  type: 'review' | 'creation' | 'completion';
}
