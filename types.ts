
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

export interface Tenant {
  id: string;
  name: string;
}

export enum InstanceStatus {
  SUCCESS = 'Success',
  IN_PROGRESS = 'In progress',
  FAILED = 'Failed',
  PENDING = 'Pending',
  CANCELLED = 'Cancelled',
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

export type AuditEventType = 'Resume' | 'Skip' | 'Cancel' | 'Notify';

export interface AuditEvent {
  type: AuditEventType;
  user: string;
  timestamp: string;
  taskId?: string;
  taskName?: string;
  details?: {
    reason?: string;
    skipCount?: number;
    preRetryCount?: number;
  };
}


export interface AppInstance {
  id: string;
  fileName: string;
  saas: string;
  tenantId: string;
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
  customerWorkbench?: string;
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
  cancellationDetails?: {
    reason: string;
    user: string;
    timestamp: string;
  };
  auditTrail?: AuditEvent[];
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
  tenantId: string;
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

// --- FILE APPLICATION SPECIFICATION TYPES ---

export type FileType = 'CSV' | 'JSON' | 'PARQUET';
export type TriggerType = 'EVENT' | 'SCHEDULED' | 'API';
export type SourceType = 'APPLICATION_FOLDER' | 'DB' | 'EXTERNAL_FOLDER';

export interface FileAppSpec {
  name: string;
  fileType: FileType;
  delimeter?: string;
  trigger: {
    triggerType: TriggerType;
    scheduleCron?: string;
    timezone?: string;
  };
  source?: {
    type: SourceType;
    outputFileName?: string;
    dbConfig?: {
      driverClass?: string;
      jdbcUrl: string;
      username: string;
      password: string;
      query: string;
      fetchSize?: number;
    };
    externalConfig?: {
      path: string;
      regex?: string;
      postScanMovePath?: string;
    };
  };
  tasks: {
    id: string;
    protocol: string;
    command: string;
    parameters: Record<string, string>;
  }[];
  viewConfig?: {
    summaryRenderFilePath?: string;
    downloadFiles?: {
      displayName: string;
      filePath: string;
    }[];
  };
  eventContext?: Record<string, string>;
}

// --- DIA CONSOLE TYPES ---

export enum ResourceStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  DRAFT = 'Draft',
}

export interface DiaStorage {
  resourceName: string;
  tenantId: string;
  storageName: string;
  description: string;
  type: 'SFTP' | 'CLOUD_STORAGE';
  app: string;
  status: ResourceStatus;
  createdTs: string;
  updatedTs: string;
  cloudStorageParameters?: {
    bucketName: string;
    region: string;
    prefix: string;
  };
  sftpParameters?: {
    deltaURN: string;
  };
}

export interface DiaUser {
  resourceName: string;
  tenantId: string;
  userName: string;
  description: string;
  type: 'SYSTEM_USER' | 'EXTERNAL_USER';
  app: string;
  status: ResourceStatus;
  createdTs: string;
  updatedTs: string;
  rbac: {
    resource: string;
  };
  storageMount?: {
    storageName: string;
    mount: string;
    permissions: string[];
  }[];
}

export interface DiaFolder {
  resourceName: string;
  tenantId: string;
  folderName: string;
  folderType: 'FOLDER' | 'SMARTFOLDER';
  path: string;
  app: string;
  username: string;
  status: ResourceStatus;
  createdTs: string;
  updatedTs: string;
  encryptionPublicKey?: string;
  tags?: { key: string; value: string }[];
  smartFolderDefinition?: {
    criteria: 'TAG';
    tags: { key: string; value: string }[];
  };
  fileApplication?: {
    name: string;
    inputArguments: { key: string; value: string }[];
    overrideProperties?: {
      cronExpression?: string;
      timeZone?: string;
    };
  };
}

export interface FileExplorerItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size?: string;
  updatedAt: string;
  items?: FileExplorerItem[];
  // For mount-aware exploration
  isMount?: boolean;
  mountPath?: string;
  mountStorageName?: string;
  mountPermissions?: string[];
}

// --- NEW SCHEDULE CONSOLE TYPES ---

export interface ScheduleDefinition {
  id: string;
  name: string;
  tenantId: string;
  description: string;
  cronFrequency: string;
  owner: string;
  timezone: string;
  appId: string;
  stats: {
    completed: number;
    missed: number;
    failed: number;
  };
}

export enum ScheduleRunStatus {
  SUCCESS = 'Success',
  FAILED = 'Failed',
  MISSED = 'Missed',
  SKIPPED = 'Skipped',
}

export interface ScheduleExecution {
  id: string;
  scheduleId: string;
  expectedTime: string;
  actualTime: string | null;
  status: ScheduleRunStatus;
}
