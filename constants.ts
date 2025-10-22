


import { AppInstance, InstanceStatus, User, UserRole, Zone, BusinessImpact, ExceptionType, SOP, SummaryMetrics, ProcessingStage, OutputFile, ScheduledJob, ScheduleStatus } from './types';
import { allSops } from './constants/exceptions';

export const mockUsers: { [key: string]: User } = {
  saasSre: {
    id: 'user-001',
    name: 'Alex Johnson',
    role: UserRole.SAAS_SRE,
    saas: 'Next Orbit',
    avatarUrl: 'https://i.pravatar.cc/150?u=alexjohnson',
  },
  electronSre: {
    id: 'user-003',
    name: 'Casey Lee',
    role: UserRole.SAAS_SRE,
    saas: 'Electron',
    avatarUrl: 'https://i.pravatar.cc/150?u=caseylee',
  },
  tachyonSre: {
    id: 'user-004',
    name: 'Dev Patel',
    role: UserRole.SAAS_SRE,
    saas: 'Tachyon Credit',
    avatarUrl: 'https://i.pravatar.cc/150?u=devpatel',
  },
  itpSre: {
    id: 'user-005',
    name: 'Maria Garcia',
    role: UserRole.SAAS_SRE,
    saas: 'ITP SaaS',
    avatarUrl: 'https://i.pravatar.cc/150?u=mariagarcia',
  },
  rubySre: {
    id: 'user-006',
    name: 'Samira Khan',
    role: UserRole.SAAS_SRE,
    saas: 'Ruby',
    avatarUrl: 'https://i.pravatar.cc/150?u=samirakhan',
  },
  platformSre: {
    id: 'user-002',
    name: 'Brenda Smith',
    role: UserRole.PLATFORM_SRE,
    avatarUrl: 'https://i.pravatar.cc/150?u=brendasmith',
  },
};

export const mockZones: Zone[] = [
  { id: 'aws-us-east-1', name: 'AWS US-EAST-1' },
  { id: 'aws-axon-staging', name: 'AWS AXON Staging' },
  { id: 'aws-common-prod-mumbai', name: 'AWS Common Prod Mumbai' },
  { id: 'aws-hdfc-beta', name: 'AWS HDFC Beta' },
  { id: 'aws-sodexo-prod-london', name: 'AWS Sodexo Prod London' },
  { id: 'aws-staging-mumbai', name: 'AWS Staging Mumbai' },
  { id: 'aws-zone-perf-testing', name: 'AWS Zone for perf testing' },
  { id: 'cce', name: 'CCE' },
  { id: 'ciaas-zone', name: 'CIaaS Zone' },
  { id: 'hdfc-prod', name: 'HDFC Prod' },
  { id: 'gcp-us-central1', name: 'GCP US-CENTRAL-1' },
  { id: 'azure-westus-2', name: 'Azure West-US-2' },
];

const systemExceptionSOP: SOP = {
  title: 'SOP: Move File Task Failure (404 Not Found)',
  preconditions: [
    'Verify the target directory exists and has correct permissions.',
    'Check for any network connectivity issues to the file storage.',
    'Ensure the service account running the task has access rights.',
  ],
  steps: [
    '1. Identify the missing folder path from the error log message.',
    '2. If the folder is missing, recreate it with the correct permissions.',
    '3. If permissions are incorrect, update them using platform tools.',
    '4. Once the underlying system issue is resolved, use the "Resume" action in the workbench.',
  ],
  permissionsRequired: [UserRole.PLATFORM_SRE, UserRole.SAAS_SRE],
  rollbackActions: ['No rollback necessary. The task is idempotent.'],
  expectedPostConditions: 'The task successfully moves the file and the instance progresses to the next step.',
};

const businessExceptionSOP: SOP = {
  title: 'SOP: Schema Validation Error',
  preconditions: [
    'Confirm the file content does not match the expected schema version.',
    'The error log should contain details about the validation failure (e.g., missing field, wrong data type).',
  ],
  steps: [
    '1. Do NOT resume the task. This can lead to data corruption.',
    '2. Contact the data publisher (Owner team) and provide them with the App Instance ID and error details.',
    '3. The publisher must provide a corrected file.',
    '4. Once a corrected file is available, the publisher will need to trigger a new file application instance.',
    '5. Cancel the current failed instance with a reason noting it was replaced by a new file.',
  ],
  permissionsRequired: [UserRole.SAAS_SRE, UserRole.PLATFORM_SRE],
  rollbackActions: ['Cancel the instance. State is not modified.'],
  expectedPostConditions: 'The failed instance is cancelled, and a new instance is processing the corrected data.',
};


const generateMockInstances = (): AppInstance[] => {
  
  // Fix: Add explicit return type to provide contextual typing and prevent type widening on `processingStages`.
  const createSuccessData = (id: string, totalRecordsBase: number = 50): { summaryMetrics: SummaryMetrics; processingStages: ProcessingStage[]; outputFiles: OutputFile[]; } => {
    const totalRecords = totalRecordsBase + (id.charCodeAt(0) % 50);
    const errorRecords = Math.floor(totalRecords / 10);
    const successfulRecords = totalRecords - errorRecords;
    return {
        summaryMetrics: {
            corporationId: `CORP${100 + (id.charCodeAt(1) % 50)}`,
            totalRecords,
            successfulRecords,
            errorRecords,
            totalEnrolmentRecords: Math.floor(successfulRecords * 0.6),
            totalPlanParticipationRecords: Math.floor(successfulRecords * 0.4),
            totalNewBeneficiaries: Math.floor(successfulRecords * 0.3),
            totalUpdatedBeneficiaries: Math.floor(successfulRecords * 0.2),
            totalAddedPlans: Math.floor(successfulRecords * 0.2),
            totalUpdatedPlans: Math.floor(successfulRecords * 0.1),
            totalChangedPlans: Math.floor(successfulRecords * 0.1),
        },
        processingStages: [
            { name: 'Pre-processing', description: 'Initial validation checks were performed at both file and record levels.', status: InstanceStatus.SUCCESS, user: { name: 'Automation', avatarChar: 'A' } },
            { name: 'Assessment', description: 'Based on validation results, files are either approved for further processing or rejected', status: InstanceStatus.SUCCESS, user: { name: 'S. Jones', avatarChar: 'S' } },
            { name: 'Processing', description: 'Approved files are processed by the configured workflows according to their type', status: InstanceStatus.SUCCESS, user: { name: 'Automation', avatarChar: 'A' } },
            { name: 'Post-Processing', description: 'An acknowledgment file containing the processing results is generated.', status: InstanceStatus.SUCCESS, user: { name: 'Automation', avatarChar: 'A' } },
        ],
        outputFiles: [
            { name: 'Enrolment_Records.csv', size: '8.1 MB', rows: Math.floor(successfulRecords * 0.6) },
            { name: 'Plan_Participation.csv', size: '6.2 MB', rows: Math.floor(successfulRecords * 0.4) },
            { name: 'Beneficiaries_Updated.txt', size: '3.3 MB', rows: Math.floor(successfulRecords * 0.2) },
        ]
    };
  };

  const enrollmentEligibilityBaseTasks = [
      { id: 't1', name: 'create-job-folder', status: InstanceStatus.SUCCESS, startTime: '2025-04-27T11:00:00Z', endTime: '2025-04-27T11:00:10Z', retryAttempts: 0 },
      { id: 't2', name: 'create-processing-folder', status: InstanceStatus.SUCCESS, startTime: '2025-04-27T11:00:10Z', endTime: '2025-04-27T11:00:20Z', retryAttempts: 0 },
      { id: 't3', name: 'move-file-to-processing', status: InstanceStatus.SUCCESS, startTime: '2025-04-27T11:00:20Z', endTime: '2025-04-27T11:01:00Z', retryAttempts: 0 },
      { id: 't4', name: 'read-header-line', status: InstanceStatus.SUCCESS, startTime: '2025-04-27T11:01:00Z', endTime: '2025-04-27T11:01:30Z', retryAttempts: 0 },
      { id: 't5', name: 'compute-summary', status: InstanceStatus.SUCCESS, startTime: '2025-04-27T11:01:30Z', endTime: '2025-04-27T11:03:00Z', retryAttempts: 0 },
      { id: 't6', name: 'prepare-commands', status: InstanceStatus.SUCCESS, startTime: '2025-04-27T11:03:00Z', endTime: '2025-04-27T11:08:00Z', retryAttempts: 0 },
      { id: 't7', name: 'process-commands', status: InstanceStatus.SUCCESS, startTime: '2025-04-27T11:08:00Z', endTime: '2025-04-27T11:15:00Z', retryAttempts: 0 },
      { id: 't8', name: 'success-sql-command', status: InstanceStatus.SUCCESS, startTime: '2025-04-27T11:15:00Z', endTime: '2025-04-27T11:16:00Z', retryAttempts: 0 },
      { id: 't9', name: 'create-summary-file', status: InstanceStatus.SUCCESS, startTime: '2025-04-27T11:16:00Z', endTime: '2025-04-27T11:16:10Z', retryAttempts: 0 },
  ];

  const moreFailedEnrollmentInstances: AppInstance[] = [
    // --- START: ADDED FAILED INSTANCES FOR OTHER SAAS ---
    // 1. Electron: Business Exception (Conflict) in aws-us-east-1
    {
      id: 'ee-biz-fail-electron-1',
      fileName: 'Beneficiary_EE_File_20250429_01',
      saas: 'Electron',
      zone: 'aws-us-east-1',
      applicationName: 'enrollment-eligibility',
      status: InstanceStatus.FAILED,
      totalTasks: 9, completedTasks: 6, failedTaskIndex: 6,
      startedAt: '2025-04-29T10:00:00Z', lastUpdatedAt: '2025-04-29T10:15:00Z',
      retryCount: 0, businessImpact: BusinessImpact.MEDIUM,
      exceptionType: ExceptionType.BUSINESS,
      isNotified: false,
      exceptionCode: 'BusinessRuleConflictWithExistingState',
      detailedErrorMessage: '409 Conflict: Beneficiary `BEN456` cannot be terminated as they have an active claim.',
      sop: allSops.BusinessRuleConflictWithExistingState,
      tasks: [
        ...enrollmentEligibilityBaseTasks.slice(0, 6),
        { ...enrollmentEligibilityBaseTasks[6], status: InstanceStatus.FAILED, endTime: '2025-04-29T10:15:00Z', errorCode: 'BIZ_CONFLICT_409', errorMessage: "Beneficiary cannot be terminated", exceptionType: ExceptionType.BUSINESS },
        ...enrollmentEligibilityBaseTasks.slice(7).map(t => ({...t, status: InstanceStatus.PENDING, endTime: null })),
      ]
    },
    // 2. Tachyon Credit: Business Exception (Schema) in aws-us-east-1
    {
      id: 'ee-biz-fail-tachyon-1',
      fileName: 'Beneficiary_EE_File_20250429_02',
      saas: 'Tachyon Credit',
      zone: 'aws-us-east-1',
      applicationName: 'enrollment-eligibility',
      status: InstanceStatus.FAILED,
      totalTasks: 9, completedTasks: 5, failedTaskIndex: 5,
      startedAt: '2025-04-29T11:00:00Z', lastUpdatedAt: '2025-04-29T11:07:00Z',
      retryCount: 0, businessImpact: BusinessImpact.HIGH,
      exceptionType: ExceptionType.BUSINESS,
      isNotified: false,
      exceptionCode: 'SchemaValidationException',
      detailedErrorMessage: "SchemaValidationException: missing required field 'ssn' in beneficiary record",
      sop: allSops.SchemaValidationException,
      tasks: [
        ...enrollmentEligibilityBaseTasks.slice(0, 5),
        { ...enrollmentEligibilityBaseTasks[5], status: InstanceStatus.FAILED, endTime: '2025-04-29T11:07:00Z', errorCode: 'BIZ_SCHEMA_002', errorMessage: "missing required field 'ssn'", exceptionType: ExceptionType.BUSINESS },
        ...enrollmentEligibilityBaseTasks.slice(6).map(t => ({...t, status: InstanceStatus.PENDING, endTime: null })),
      ]
    },
    // 3. ITP SaaS: Business Exception (Invalid JSON) in aws-us-east-1
    {
      id: 'ee-biz-fail-itp-1',
      fileName: 'Beneficiary_EE_File_20250429_03',
      saas: 'ITP SaaS',
      zone: 'aws-us-east-1',
      applicationName: 'enrollment-eligibility',
      status: InstanceStatus.FAILED,
      totalTasks: 9, completedTasks: 4, failedTaskIndex: 4,
      startedAt: '2025-04-29T12:00:00Z', lastUpdatedAt: '2025-04-29T12:02:00Z',
      retryCount: 0, businessImpact: BusinessImpact.MEDIUM,
      exceptionType: ExceptionType.BUSINESS,
      isNotified: false,
      exceptionCode: 'InvalidJSONInput',
      detailedErrorMessage: 'InvalidJSONInput: Unrecognized token `}` at line 188, column 5.',
      sop: allSops.InvalidJSONInput,
      tasks: [
        ...enrollmentEligibilityBaseTasks.slice(0, 4),
        { ...enrollmentEligibilityBaseTasks[4], status: InstanceStatus.FAILED, endTime: '2025-04-29T12:02:00Z', errorCode: 'BIZ_JSON_001', errorMessage: "Unrecognized token", exceptionType: ExceptionType.BUSINESS },
        ...enrollmentEligibilityBaseTasks.slice(5).map(t => ({...t, status: InstanceStatus.PENDING, endTime: null })),
      ]
    },
    // 4. Ruby: Business Exception (Header) in aws-us-east-1
    {
      id: 'ee-biz-fail-ruby-1',
      fileName: 'Beneficiary_EE_File_20250429_04',
      saas: 'Ruby',
      zone: 'aws-us-east-1',
      applicationName: 'enrollment-eligibility',
      status: InstanceStatus.FAILED,
      totalTasks: 9, completedTasks: 3, failedTaskIndex: 3,
      startedAt: '2025-04-29T13:00:00Z', lastUpdatedAt: '2025-04-29T13:01:10Z',
      retryCount: 0, businessImpact: BusinessImpact.CRITICAL,
      exceptionType: ExceptionType.BUSINESS,
      isNotified: false,
      exceptionCode: 'HeaderMissingOrMalformed',
      detailedErrorMessage: "HeaderMissingOrMalformed: Header record is missing 'fileCreationDate' field.",
      sop: allSops.HeaderMissingOrMalformed,
      tasks: [
        ...enrollmentEligibilityBaseTasks.slice(0, 3),
        { ...enrollmentEligibilityBaseTasks[3], status: InstanceStatus.FAILED, endTime: '2025-04-29T13:01:10Z', errorCode: 'BIZ_HEADER_002', errorMessage: "header is missing 'fileCreationDate'", exceptionType: ExceptionType.BUSINESS },
        ...enrollmentEligibilityBaseTasks.slice(4).map(t => ({...t, status: InstanceStatus.PENDING, endTime: null })),
      ]
    },
    // --- END: ADDED FAILED INSTANCES ---
    // 1. Business Exception: SchemaValidationException
    {
      id: 'ee-biz-fail-schema-4h5j-6k7l',
      fileName: 'Beneficiary_EE_File_20250428_04',
      saas: 'Next Orbit', zone: 'aws-us-east-1', applicationName: 'enrollment-eligibility',
      status: InstanceStatus.FAILED,
      totalTasks: 9, completedTasks: 5, failedTaskIndex: 5,
      startedAt: '2025-04-28T14:00:00Z', lastUpdatedAt: '2025-04-28T14:06:00Z',
      retryCount: 0, businessImpact: BusinessImpact.MEDIUM,
      exceptionType: ExceptionType.BUSINESS,
      isNotified: false,
      exceptionCode: 'SchemaValidationException',
      detailedErrorMessage: "SchemaValidationException: missing required field 'planCode' in grouped record",
      sop: allSops.SchemaValidationException,
      tasks: [
        ...enrollmentEligibilityBaseTasks.slice(0, 5),
        { ...enrollmentEligibilityBaseTasks[5], status: InstanceStatus.FAILED, endTime: '2025-04-28T14:06:00Z', errorCode: 'BIZ_SCHEMA_001', errorMessage: "missing required field 'planCode'", exceptionType: ExceptionType.BUSINESS },
        ...enrollmentEligibilityBaseTasks.slice(6).map(t => ({...t, status: InstanceStatus.PENDING, endTime: null })),
      ]
    },
    // 2. Business Exception: HeaderMissingOrMalformed
    {
      id: 'ee-biz-fail-header-1a2b-3c4d',
      fileName: 'Beneficiary_EE_File_20250428_08',
      saas: 'Next Orbit', zone: 'aws-us-east-1', applicationName: 'enrollment-eligibility',
      status: InstanceStatus.FAILED,
      totalTasks: 9, completedTasks: 3, failedTaskIndex: 3,
      startedAt: '2025-04-28T18:00:00Z', lastUpdatedAt: '2025-04-28T18:01:15Z',
      retryCount: 0, businessImpact: BusinessImpact.HIGH,
      exceptionType: ExceptionType.BUSINESS,
      isNotified: false,
      exceptionCode: 'HeaderMissingOrMalformed',
      detailedErrorMessage: "HeaderMissingOrMalformed: Cannot read properties of null (reading 'CorporationID')",
      sop: allSops.HeaderMissingOrMalformed,
      tasks: [
        ...enrollmentEligibilityBaseTasks.slice(0, 3),
        { ...enrollmentEligibilityBaseTasks[3], status: InstanceStatus.FAILED, endTime: '2025-04-28T18:01:15Z', errorCode: 'BIZ_HEADER_001', errorMessage: "headerRecord is null", exceptionType: ExceptionType.BUSINESS },
        ...enrollmentEligibilityBaseTasks.slice(4).map(t => ({...t, status: InstanceStatus.PENDING, endTime: null })),
      ]
    },
    // 3. Business Exception: BusinessRuleConflictWithExistingState
    {
      id: 'ee-biz-fail-conflict-9p8o-7i6u',
      fileName: 'Beneficiary_EE_File_20250428_09',
      saas: 'Next Orbit', zone: 'aws-us-east-1', applicationName: 'enrollment-eligibility',
      status: InstanceStatus.FAILED,
      totalTasks: 9, completedTasks: 6, failedTaskIndex: 6,
      startedAt: '2025-04-28T19:00:00Z', lastUpdatedAt: '2025-04-28T19:12:00Z',
      retryCount: 0, businessImpact: BusinessImpact.MEDIUM,
      exceptionType: ExceptionType.BUSINESS,
      isNotified: false,
      exceptionCode: 'BusinessRuleConflictWithExistingState',
      detailedErrorMessage: '409 Conflict: Plan with ID `PLAN123` already exists for beneficiary `BEN789`.',
      sop: allSops.BusinessRuleConflictWithExistingState,
      tasks: [
        ...enrollmentEligibilityBaseTasks.slice(0, 6),
        { ...enrollmentEligibilityBaseTasks[6], status: InstanceStatus.FAILED, endTime: '2025-04-28T19:12:00Z', errorCode: 'BIZ_CONFLICT_409', errorMessage: "Plan with ID `PLAN123` already exists", exceptionType: ExceptionType.BUSINESS },
        ...enrollmentEligibilityBaseTasks.slice(7).map(t => ({...t, status: InstanceStatus.PENDING, endTime: null })),
      ]
    },
    // 4. System Exception: FileNotFound
    {
      id: 'ee-sys-fail-filenotfound-5t6y',
      fileName: 'Beneficiary_EE_File_20250428_05',
      saas: 'Next Orbit', zone: 'gcp-us-central1', applicationName: 'enrollment-eligibility',
      status: InstanceStatus.FAILED,
      totalTasks: 9, completedTasks: 2, failedTaskIndex: 2,
      startedAt: '2025-04-28T15:00:00Z', lastUpdatedAt: '2025-04-28T15:02:30Z',
      retryCount: 3, businessImpact: BusinessImpact.HIGH,
      exceptionType: ExceptionType.SYSTEM,
      exceptionCode: 'FileNotFound',
      detailedErrorMessage: 'FileNotFoundException: Source file /source/Beneficiary_EE_File_20250428_05.json does not exist.',
      sop: allSops.FileNotFound,
      tasks: [
        ...enrollmentEligibilityBaseTasks.slice(0, 2),
        { ...enrollmentEligibilityBaseTasks[2], status: InstanceStatus.FAILED, endTime: '2025-04-28T15:02:30Z', retryAttempts: 3, errorCode: 'SYS_IO_404', errorMessage: "Source file does not exist", exceptionType: ExceptionType.SYSTEM },
        ...enrollmentEligibilityBaseTasks.slice(3).map(t => ({...t, status: InstanceStatus.PENDING, endTime: null })),
      ]
    },
    // 5. System Exception: JarDownloadError
    {
      id: 'ee-sys-fail-jardownload-8u9i',
      fileName: 'Beneficiary_EE_File_20250428_06',
      saas: 'Next Orbit', zone: 'azure-westus-2', applicationName: 'enrollment-eligibility',
      status: InstanceStatus.FAILED,
      totalTasks: 9, completedTasks: 5, failedTaskIndex: 5,
      startedAt: '2025-04-28T16:00:00Z', lastUpdatedAt: '2025-04-28T16:05:00Z',
      retryCount: 3, businessImpact: BusinessImpact.CRITICAL,
      exceptionType: ExceptionType.SYSTEM,
      exceptionCode: 'JarDownloadError',
      detailedErrorMessage: 'Failed to download JAR from https://jfrog.internal.ciaas.zetaapps.in/...: 404 Not Found',
      sop: allSops.JarDownloadError,
      tasks: [
        ...enrollmentEligibilityBaseTasks.slice(0, 5),
        { ...enrollmentEligibilityBaseTasks[5], status: InstanceStatus.FAILED, endTime: '2025-04-28T16:05:00Z', retryAttempts: 3, errorCode: 'SYS_ARTIFACT_404', errorMessage: "Failed to download JAR", exceptionType: ExceptionType.SYSTEM },
        ...enrollmentEligibilityBaseTasks.slice(6).map(t => ({...t, status: InstanceStatus.PENDING, endTime: null })),
      ]
    },
    // 6. System Exception: SQLProcessorFailure
    {
      id: 'ee-sys-fail-sql-3e4r-5t6y',
      fileName: 'Beneficiary_EE_File_20250428_07',
      saas: 'Next Orbit', zone: 'aws-us-east-1', applicationName: 'enrollment-eligibility',
      status: InstanceStatus.FAILED,
      totalTasks: 9, completedTasks: 4, failedTaskIndex: 4,
      startedAt: '2025-04-28T17:00:00Z', lastUpdatedAt: '2025-04-28T17:02:00Z',
      retryCount: 3,
      businessImpact: BusinessImpact.HIGH,
      exceptionType: ExceptionType.SYSTEM,
      exceptionCode: 'SQLProcessorFailure',
      detailedErrorMessage: 'SQL Parse Error: Unrecognized token `INVALID` at line 5, column 10.',
      sop: allSops.SQLProcessorFailure,
      tasks: [
        ...enrollmentEligibilityBaseTasks.slice(0, 4),
        { ...enrollmentEligibilityBaseTasks[4], status: InstanceStatus.FAILED, endTime: '2025-04-28T17:02:00Z', errorCode: 'SYS_SQL_001', errorMessage: "SQL Parse Error", exceptionType: ExceptionType.SYSTEM, retryAttempts: 3 },
        ...enrollmentEligibilityBaseTasks.slice(5).map(t => ({...t, status: InstanceStatus.PENDING, endTime: null })),
      ]
    },
  ];

  const newFailedInstances: AppInstance[] = [
    // 1. Business Exception: BeneficiaryValidationException
    {
      id: 'ee-biz-fail-1-a1b2-c3d4-e5f6',
      fileName: 'Beneficiary_EE_File_20250427_01',
      saas: 'Next Orbit',
      zone: 'aws-us-east-1',
      applicationName: 'enrollment-eligibility',
      status: InstanceStatus.FAILED,
      totalTasks: 9, completedTasks: 5, failedTaskIndex: 5,
      startedAt: '2025-04-27T11:00:00Z', lastUpdatedAt: '2025-04-27T11:05:30Z',
      retryCount: 0, businessImpact: BusinessImpact.MEDIUM,
      exceptionType: ExceptionType.BUSINESS,
      isNotified: false,
      exceptionCode: 'BeneficiaryValidationException',
      detailedErrorMessage: 'BeneficiaryValidationException: beneficiaryId=null for line 152',
      sop: allSops.BeneficiaryValidationException,
      tasks: [
        ...enrollmentEligibilityBaseTasks.slice(0, 5).map(t => ({...t, status: InstanceStatus.SUCCESS})),
        { ...enrollmentEligibilityBaseTasks[5], status: InstanceStatus.FAILED, endTime: '2025-04-27T11:05:30Z', errorCode: 'BIZ_VAL_005', errorMessage: 'beneficiaryId=null for line 152', exceptionType: ExceptionType.BUSINESS },
        ...enrollmentEligibilityBaseTasks.slice(6).map(t => ({...t, status: InstanceStatus.PENDING, startTime: '2025-04-27T11:05:30Z', endTime: null})),
      ]
    },
    // 2. System Exception: FileSystemPermissionDenied
    {
      id: 'ee-sys-fail-1-b2c3-d4e5-f6g7',
      fileName: 'Beneficiary_EE_File_20250427_02',
      saas: 'Next Orbit',
      zone: 'aws-us-east-1',
      applicationName: 'enrollment-eligibility',
      status: InstanceStatus.FAILED,
      totalTasks: 9, completedTasks: 2, failedTaskIndex: 2,
      startedAt: '2025-04-27T12:00:00Z', lastUpdatedAt: '2025-04-27T12:01:30Z',
      retryCount: 3, businessImpact: BusinessImpact.HIGH,
      exceptionType: ExceptionType.SYSTEM,
      exceptionCode: 'FileSystemPermissionDenied',
      detailedErrorMessage: 'PermissionDenied: Access denied to path /apps/enrollment/processing/Beneficiary_EE_File_20250427_02',
      sop: allSops.FileSystemPermissionDenied,
      tasks: [
        ...enrollmentEligibilityBaseTasks.slice(0, 2).map(t => ({...t, status: InstanceStatus.SUCCESS})),
        { ...enrollmentEligibilityBaseTasks[2], status: InstanceStatus.FAILED, endTime: '2025-04-27T12:01:30Z', retryAttempts: 3, errorCode: 'SYS_IO_001', errorMessage: 'Access denied to path /apps/enrollment/processing/...', exceptionType: ExceptionType.SYSTEM },
        ...enrollmentEligibilityBaseTasks.slice(3).map(t => ({...t, status: InstanceStatus.PENDING, startTime: '2025-04-27T12:01:30Z', endTime: null})),
      ]
    },
    // 3. System Exception: DownstreamAPITimeout
    {
      id: 'ee-sys-fail-2-c3d4-e5f6-g7h8',
      fileName: 'Beneficiary_EE_File_20250427_03',
      saas: 'Next Orbit',
      zone: 'aws-us-east-1',
      applicationName: 'enrollment-eligibility',
      status: InstanceStatus.FAILED,
      totalTasks: 9, completedTasks: 6, failedTaskIndex: 6,
      startedAt: '2025-04-27T13:00:00Z', lastUpdatedAt: '2025-04-27T13:20:00Z',
      retryCount: 3, businessImpact: BusinessImpact.HIGH,
      exceptionType: ExceptionType.SYSTEM,
      exceptionCode: 'DownstreamAPITimeout',
      detailedErrorMessage: '504 Gateway Timeout from POST https://electron.mum1-pp.zetaapps.in/gluon/api/v2/',
      sop: allSops.DownstreamAPITimeout,
      tasks: [
        ...enrollmentEligibilityBaseTasks.slice(0, 6).map(t => ({...t, status: InstanceStatus.SUCCESS})),
        { ...enrollmentEligibilityBaseTasks[6], status: InstanceStatus.FAILED, endTime: '2025-04-27T13:20:00Z', retryAttempts: 3, errorCode: 'SYS_NET_504', errorMessage: '504 Gateway Timeout from POST ...', exceptionType: ExceptionType.SYSTEM },
        ...enrollmentEligibilityBaseTasks.slice(7).map(t => ({...t, status: InstanceStatus.PENDING, startTime: '2025-04-27T13:20:00Z', endTime: null})),
      ]
    },
  ];


  const instances: AppInstance[] = [
    ...moreFailedEnrollmentInstances,
    ...newFailedInstances,
    // New Failed Instance 1: System Exception (Visible on load)
    {
      id: 'sys-fail-1-a1b2-c3d4-e5f6-g7h8i9j0k1l2',
      fileName: 'EDI_837_Claims_20250426',
      saas: 'Next Orbit', // Matches default user
      zone: 'aws-us-east-1', // Matches default zone
      applicationName: 'Humana_ClaimsProcessing',
      status: InstanceStatus.FAILED,
      totalTasks: 5,
      completedTasks: 2,
      failedTaskIndex: 2,
      exceptionType: ExceptionType.SYSTEM,
      sop: systemExceptionSOP,
      startedAt: '2025-04-26T10:00:00Z',
      lastUpdatedAt: '2025-04-26T10:05:30Z',
      retryCount: 3,
      businessImpact: BusinessImpact.HIGH,
      tasks: [
        { id: 't1', name: 'receive-file', status: InstanceStatus.SUCCESS, startTime: '2025-04-26T10:00:00Z', endTime: '2025-04-26T10:00:30Z', retryAttempts: 0 },
        { id: 't2', name: 'decrypt-pgp', status: InstanceStatus.SUCCESS, startTime: '2025-04-26T10:00:30Z', endTime: '2025-04-26T10:01:00Z', retryAttempts: 0 },
        { id: 't3', name: 'move-to-landing', status: InstanceStatus.FAILED, startTime: '2025-04-26T10:01:00Z', endTime: '2025-04-26T10:05:30Z', retryAttempts: 3, errorCode: 'SYS_CONN_003', errorMessage: 'Connection timed out to storage bucket s3://humana-claims-landing.', exceptionType: ExceptionType.SYSTEM },
        { id: 't4', name: 'validate-schema', status: InstanceStatus.PENDING, startTime: '2025-04-26T10:05:30Z', endTime: null, retryAttempts: 0 },
        { id: 't5', name: 'archive-file', status: InstanceStatus.PENDING, startTime: '2025-04-26T10:05:30Z', endTime: null, retryAttempts: 0 },
      ],
    },
    // New Failed Instance 2: Business Exception (Visible on load)
    {
      id: 'biz-fail-2-b2c3-d4e5-f6g7-h8i9j0k1l2m3',
      fileName: 'Member_Roster_Update_April',
      saas: 'Next Orbit', // Matches default user
      zone: 'aws-us-east-1', // Matches default zone
      applicationName: 'Humana_Eligibility',
      status: InstanceStatus.FAILED,
      totalTasks: 4,
      completedTasks: 1,
      failedTaskIndex: 1,
      exceptionType: ExceptionType.BUSINESS,
      isNotified: false,
      sop: businessExceptionSOP,
      startedAt: '2025-04-26T09:30:00Z',
      lastUpdatedAt: '2025-04-26T09:32:00Z',
      retryCount: 0,
      businessImpact: BusinessImpact.MEDIUM,
      tasks: [
        { id: 't1', name: 'download-file', status: InstanceStatus.SUCCESS, startTime: '2025-04-26T09:30:00Z', endTime: '2025-04-26T09:31:00Z', retryAttempts: 0 },
        { id: 't2', name: 'validate-roster-schema', status: InstanceStatus.FAILED, startTime: '2025-04-26T09:31:00Z', endTime: '2025-04-26T09:32:00Z', retryAttempts: 0, errorCode: 'BIZ_VAL_002', errorMessage: 'Header mismatch. Expected `MEMBER_ID`, found `PATIENT_ID`.', exceptionType: ExceptionType.BUSINESS },
        { id: 't3', name: 'process-updates', status: InstanceStatus.PENDING, startTime: '2025-04-26T09:32:00Z', endTime: null, retryAttempts: 0 },
        { id: 't4', name: 'send-confirmation', status: InstanceStatus.PENDING, startTime: '2025-04-26T09:32:00Z', endTime: null, retryAttempts: 0 },
      ],
    },
    // Data from screenshot
    {
      id: 'a7c8e9f0-b2d3-4c5e-8a9b-1d2e3f4a5b6c',
      fileName: 'Beneficiary File_270225',
      saas: 'Next Orbit',
      zone: 'aws-us-east-1',
      applicationName: 'Humana_Enrollment&PlanParticipation',
      status: InstanceStatus.IN_PROGRESS,
      totalTasks: 8,
      completedTasks: 3,
      startedAt: '2025-04-25T16:40:49Z',
      lastUpdatedAt: '2025-04-25T16:40:49Z',
      retryCount: 0,
      businessImpact: BusinessImpact.HIGH,
      tasks: [
        { id: 't1', name: 'receive-file', status: InstanceStatus.SUCCESS, startTime: '2025-04-25T16:40:49Z', endTime: '2025-04-25T16:41:00Z', retryAttempts: 0 },
        { id: 't2', name: 'decrypt-pgp', status: InstanceStatus.SUCCESS, startTime: '2025-04-25T16:41:00Z', endTime: '2025-04-25T16:41:20Z', retryAttempts: 0 },
        { id: 't3', name: 'move-to-landing', status: InstanceStatus.SUCCESS, startTime: '2025-04-25T16:41:20Z', endTime: '2025-04-25T16:41:30Z', retryAttempts: 0 },
        { id: 't4', name: 'validate-schema', status: InstanceStatus.IN_PROGRESS, startTime: '2025-04-25T16:41:30Z', endTime: null, retryAttempts: 0 },
        { id: 't5', name: 'archive-file', status: InstanceStatus.PENDING, startTime: '2025-04-25T16:41:30Z', endTime: null, retryAttempts: 0 },
        { id: 't6', name: 'process-records', status: InstanceStatus.PENDING, startTime: '2025-04-25T16:41:30Z', endTime: null, retryAttempts: 0 },
        { id: 't7', name: 'generate-outputs', status: InstanceStatus.PENDING, startTime: '2025-04-25T16:41:30Z', endTime: null, retryAttempts: 0 },
        { id: 't8', name: 'send-ack', status: InstanceStatus.PENDING, startTime: '2025-04-25T16:41:30Z', endTime: null, retryAttempts: 0 },
      ],
    },
    {
      id: 'b3d4e5f6-c7a8-4b9d-a1b2-c3d4e5f6a7b8',
      fileName: 'Beneficiary File_250225',
      saas: 'Next Orbit',
      zone: 'aws-us-east-1',
      applicationName: 'Humana_Enrollment&PlanParticipation',
      status: InstanceStatus.PENDING,
      totalTasks: 8,
      completedTasks: 0,
      startedAt: '2025-04-25T16:34:28Z',
      lastUpdatedAt: '2025-04-25T16:34:28Z',
      retryCount: 0,
      businessImpact: BusinessImpact.HIGH,
      tasks: [],
    },
    {
      id: 'd1e2f3a4-b5c6-4d7e-8f9a-0b1c2d3e4f5a',
      fileName: 'Beneficiary File_010125',
      saas: 'Next Orbit',
      zone: 'gcp-us-central1',
      applicationName: 'Humana_Enrollment&PlanParticipation',
      status: InstanceStatus.FAILED,
      totalTasks: 6,
      completedTasks: 1,
      failedTaskIndex: 1,
      exceptionType: ExceptionType.BUSINESS,
      isNotified: false,
      sop: businessExceptionSOP,
      startedAt: '2025-04-23T14:40:40Z',
      lastUpdatedAt: '2025-04-23T14:53:10Z',
      retryCount: 0,
      businessImpact: BusinessImpact.MEDIUM,
      tasks: [
          { id: 't1', name: 'download-file', status: InstanceStatus.SUCCESS, startTime: '2023-10-20T08:00:00Z', endTime: '2023-10-20T08:01:00Z', retryAttempts: 0 },
          { id: 't2', name: 'validate-schema', status: InstanceStatus.FAILED, startTime: '2023-10-20T08:01:00Z', endTime: '2023-10-20T08:01:05Z', retryAttempts: 0, errorCode: 'BIZ_VAL_001', errorMessage: 'Field `patient_dob` has invalid format. Expected YYYY-MM-DD.', exceptionType: ExceptionType.BUSINESS },
      ],
    },
    // --- THIS INSTANCE IS THE DETAILED SUCCESS VIEW FROM SCREENSHOTS ---
    {
      id: 'c8d9e0f1-a2b3-4c5d-8e9f-0a1b2c3d4e5f',
      fileName: 'Beneficiary File_140224',
      saas: 'Tachyon Credit',
      zone: 'gcp-us-central1',
      applicationName: 'Humana_AdhocIssuance',
      status: InstanceStatus.SUCCESS,
      totalTasks: 10,
      completedTasks: 10,
      startedAt: '2025-04-22T15:40:40Z',
      lastUpdatedAt: '2025-04-22T15:46:20Z',
      retryCount: 1,
      businessImpact: BusinessImpact.MEDIUM,
      tasks: [], // Tasks can be omitted for success view if stages are used
      summaryMetrics: {
        corporationId: 'ZETA123',
        totalRecords: 100,
        successfulRecords: 90,
        errorRecords: 10,
        totalEnrolmentRecords: 60,
        totalPlanParticipationRecords: 40,
        totalNewBeneficiaries: 30,
        totalUpdatedBeneficiaries: 20,
        totalAddedPlans: 20,
        totalUpdatedPlans: 10,
        totalChangedPlans: 10,
      },
      processingStages: [
        { name: 'Pre-processing', description: 'Initial validation checks were performed at both file and record levels to ensure that the file meets the required standards', status: InstanceStatus.SUCCESS, user: { name: 'Automation', avatarChar: 'A' } },
        { name: 'Assessment', description: 'Based on validation results, files are either approved for further processing or rejected', status: InstanceStatus.SUCCESS, user: { name: 'K. L.', avatarChar: 'K' } },
        { name: 'Processing', description: 'Approved files are processed by the configured workflows according to their type', status: InstanceStatus.SUCCESS, user: { name: 'Automation', avatarChar: 'A' } },
        { name: 'Post-Processing', description: 'An acknowledgment file containing the processing results is generated and sent back to the source folder', status: InstanceStatus.SUCCESS, user: { name: 'Automation', avatarChar: 'A' } },
      ],
      outputFiles: [
        { name: 'Total Enrolment Records.csv', size: '10.3 MB', rows: 60 },
        { name: 'Total Plan Participation Records.csv', size: '14.2 MB', rows: 40 },
        { name: 'Total New Beneficiaries.csv', size: '19.9 MB', rows: 30 },
        { name: 'Total Updated Beneficiaries.txt', size: '7.6 MB', rows: 20 },
        { name: 'Total Added Plans.csv', size: '8.1 MB', rows: 20 },
        { name: 'Total Updated Plans.csv', size: '15.4 MB', rows: 10 },
        { name: 'Total Changed Plans.csv', size: '1.5 MB', rows: 10 },
      ]
    },
    {
      id: 'e6f7a8b9-c0d1-4e2f-8a3b-4c5d6e7f8a9b',
      fileName: 'Beneficiary File_030125',
      saas: 'ITP SaaS',
      zone: 'azure-westus-2',
      applicationName: 'Humana_AdhocIssuance',
      status: InstanceStatus.SUCCESS,
      totalTasks: 4,
      completedTasks: 4,
      startedAt: '2025-04-21T13:40:40Z',
      lastUpdatedAt: '2025-04-21T13:49:50Z',
      retryCount: 0,
      businessImpact: BusinessImpact.LOW,
      tasks: [],
      ...createSuccessData('e6f7a8b9-c0d1-4e2f-8a3b-4c5d6e7f8a9b', 120),
    },
    {
      id: 'f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
      fileName: 'Beneficiary File_040125',
      saas: 'Ruby',
      zone: 'aws-us-east-1',
      applicationName: 'Humana_AdhocIssuance',
      status: InstanceStatus.SUCCESS,
      totalTasks: 7,
      completedTasks: 7,
      startedAt: '2025-04-20T19:40:40Z',
      lastUpdatedAt: '2025-04-20T19:44:00Z',
      retryCount: 0,
      businessImpact: BusinessImpact.MEDIUM,
      tasks: [],
      ...createSuccessData('f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c', 250),
    },
     {
      id: 'g5h6i7j8-k9l0-4m1n-2o3p-4q5r6s7t8u9v',
      fileName: 'Beneficiary File_050125',
      saas: 'Electron',
      zone: 'aws-us-east-1',
      applicationName: 'Humana_AdhocIssuance',
      status: InstanceStatus.SUCCESS,
      totalTasks: 5,
      completedTasks: 5,
      startedAt: '2025-04-19T15:40:40Z',
      lastUpdatedAt: '2025-04-19T15:54:40Z',
      retryCount: 0,
      businessImpact: BusinessImpact.HIGH,
      tasks: [],
      ...createSuccessData('g5h6i7j8-k9l0-4m1n-2o3p-4q5r6s7t8u9v', 1500),
    },
    {
      id: 'h1i2j3k4-l5m6-4n7o-8p9q-r1s2t3u4v5w6',
      fileName: 'Beneficiary File_060125',
      saas: 'Next Orbit',
      zone: 'gcp-us-central1',
      applicationName: 'Humana_Enrollment&PlanParticipation',
      status: InstanceStatus.SUCCESS,
      totalTasks: 9,
      completedTasks: 9,
      startedAt: '2025-04-18T19:40:40Z',
      lastUpdatedAt: '2025-04-18T19:50:40Z',
      retryCount: 2,
      businessImpact: BusinessImpact.LOW,
      tasks: [],
      ...createSuccessData('h1i2j3k4-l5m6-4n7o-8p9q-r1s2t3u4v5w6', 80),
    },
    {
      id: 'i3j4k5l6-m7n8-4o9p-0q1r-s2t3u4v5w6x7',
      fileName: 'Beneficiary File_070125',
      saas: 'Tachyon Credit',
      zone: 'azure-westus-2',
      applicationName: 'Humana_AdhocIssuance',
      status: InstanceStatus.SUCCESS,
      totalTasks: 6,
      completedTasks: 6,
      startedAt: '2025-04-17T14:40:40Z',
      lastUpdatedAt: '2025-04-17T14:50:40Z',
      retryCount: 0,
      businessImpact: BusinessImpact.MEDIUM,
      tasks: [],
      ...createSuccessData('i3j4k5l6-m7n8-4o9p-0q1r-s2t3u4v5w6x7', 300),
    },
    {
      id: 'j4k5l6m7-n8o9-4p0q-1r2s-t3u4v5w6x7y8',
      fileName: 'Beneficiary File_080125',
      saas: 'ITP SaaS',
      zone: 'aws-us-east-1',
      applicationName: 'Humana_Enrollment&PlanParticipation',
      status: InstanceStatus.SUCCESS,
      totalTasks: 8,
      completedTasks: 8,
      startedAt: '2025-04-16T11:40:40Z',
      lastUpdatedAt: '2025-04-16T11:52:40Z',
      retryCount: 1,
      businessImpact: BusinessImpact.HIGH,
      tasks: [],
      ...createSuccessData('j4k5l6m7-n8o9-4p0q-1r2s-t3u4v5w6x7y8', 950),
    }
  ];

  // Add more instances to reach 62 for pagination
  for (let i = 0; i < 50; i++) { // Adjusted loop to account for added instances
    const randomSaas = ['Next Orbit', 'Electron', 'Tachyon Credit', 'ITP SaaS', 'Ruby'][i % 5];
    const randomZone = ['aws-us-east-1', 'gcp-us-central1', 'azure-westus-2'][i % 3];
    const randomFolder = ['Humana_Enrollment&PlanParticipation', 'Humana_AdhocIssuance'][i % 2];
    const startDate = new Date(2025, 3, 15 - Math.floor(i / 5), 10 + (i%8), 30 + (i%30), 0);
    const endDate = new Date(startDate.getTime() + (5 + (i%10)) * 60000);
    const id = `m${i}-a1b2-4c3d-8e9f-0g1h2i3j4k5l`;
    instances.push({
      id,
      fileName: `Beneficiary File_${100125 + i}`,
      saas: randomSaas,
      zone: randomZone,
      applicationName: randomFolder,
      status: InstanceStatus.SUCCESS,
      totalTasks: 5,
      completedTasks: 5,
      startedAt: startDate.toISOString(),
      lastUpdatedAt: endDate.toISOString(),
      retryCount: 0,
      businessImpact: BusinessImpact.LOW,
      tasks: [],
      ...createSuccessData(id, 50 + i * 5),
    });
  }

  return instances;
}

export const mockAppInstances: AppInstance[] = generateMockInstances();

// Get the current date and time
const now = new Date();
// Function to get a date in the past
const daysAgo = (days: number): Date => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
// Function to get a date in the future
const hoursFromNow = (hours: number): Date => new Date(now.getTime() + hours * 60 * 60 * 1000);

export const mockScheduledJobs: ScheduledJob[] = [
  // --- START: ADDED FOR NEXT ORBIT SAAS ---
  {
    id: 'sched-no-01',
    name: 'Daily Recurring Payouts',
    applicationName: 'Humana_Payouts',
    saas: 'Next Orbit',
    zone: 'aws-us-east-1',
    cronExpression: '0 5 * * *', // Daily at 5 AM
    lastRun: {
      timestamp: daysAgo(2).toISOString(),
      status: InstanceStatus.SUCCESS,
    },
    nextExpectedRun: daysAgo(1).toISOString(),
    status: ScheduleStatus.OVERDUE, // This makes the count 2
  },
  {
    id: 'sched-no-02',
    name: 'File Plan Termination (Initiated and Completed)',
    applicationName: 'Humana_Enrollment&PlanParticipation',
    saas: 'Next Orbit',
    zone: 'aws-us-east-1',
    cronExpression: '0 3 1 * *', // Monthly on the 1st
    lastRun: {
      timestamp: new Date('2025-04-01T03:00:00Z').toISOString(),
      status: InstanceStatus.SUCCESS,
    },
    nextExpectedRun: new Date('2025-05-01T03:00:00Z').toISOString(),
    status: ScheduleStatus.ON_SCHEDULE,
  },
  {
    id: 'sched-no-03',
    name: 'Payout Config ID Subscription Termination',
    applicationName: 'Humana_Config_Management',
    saas: 'Next Orbit',
    zone: 'aws-us-east-1',
    cronExpression: '0 4 * * 1', // Weekly on Monday
    lastRun: {
      timestamp: daysAgo(7).toISOString(),
      status: InstanceStatus.SUCCESS,
    },
    nextExpectedRun: hoursFromNow(48).toISOString(), // ~2 days from now
    status: ScheduleStatus.ON_SCHEDULE,
  },
  {
    id: 'sched-no-04',
    name: 'Plan Change (Future Scheduled Item)',
    applicationName: 'Humana_Enrollment&PlanParticipation',
    saas: 'Next Orbit',
    zone: 'aws-us-east-1',
    cronExpression: '0 0 15 * *', // Monthly on the 15th
    nextExpectedRun: new Date('2025-05-15T00:00:00Z').toISOString(),
    status: ScheduleStatus.ON_SCHEDULE,
  },
  {
    id: 'sched-no-05',
    name: 'Card Issuance (1st December)',
    applicationName: 'Humana_AdhocIssuance',
    saas: 'Next Orbit',
    zone: 'gcp-us-central1', // Different zone for variety
    cronExpression: '0 8 1 12 *', // Annually on Dec 1st
    nextExpectedRun: new Date('2025-12-01T08:00:00Z').toISOString(),
    status: ScheduleStatus.ON_SCHEDULE,
  },
  {
    id: 'sched-no-06',
    name: 'Collateral Issuance (Scheduled in Advance)',
    applicationName: 'Humana_AdhocIssuance',
    saas: 'Next Orbit',
    zone: 'aws-us-east-1',
    cronExpression: '0 10 20 * *', // Monthly on the 20th
    lastRun: {
        timestamp: new Date('2025-04-20T10:00:00Z').toISOString(),
        status: InstanceStatus.SUCCESS,
    },
    nextExpectedRun: new Date('2025-05-20T10:00:00Z').toISOString(),
    status: ScheduleStatus.ON_SCHEDULE,
  },
  {
    id: 'sched-no-07',
    name: 'Print File Generation and Sharing with Vendor',
    applicationName: 'Humana_Vendor_Integration',
    saas: 'Next Orbit',
    zone: 'aws-us-east-1',
    cronExpression: '0 22 * * 5', // Weekly on Friday
    lastRun: {
        timestamp: daysAgo(3).toISOString(), // Last Friday
        status: InstanceStatus.SUCCESS,
    },
    nextExpectedRun: hoursFromNow(72).toISOString(), // Next Friday
    status: ScheduleStatus.ON_SCHEDULE,
  },
  // --- END: ADDED FOR NEXT ORBIT SAAS ---
  {
    id: 'sched-001',
    name: 'Daily Humana Claims Processing',
    applicationName: 'Humana_ClaimsProcessing',
    saas: 'Next Orbit',
    zone: 'aws-us-east-1',
    cronExpression: '0 2 * * *', // Daily at 2 AM
    lastRun: {
      timestamp: daysAgo(2).toISOString(),
      status: InstanceStatus.SUCCESS,
      instanceId: 'sys-fail-1-a1b2-c3d4-e5f6-g7h8i9j0k1l2', // Mock link
    },
    nextExpectedRun: daysAgo(1).toISOString(),
    status: ScheduleStatus.OVERDUE,
  },
  {
    id: 'sched-002',
    name: 'Hourly ITP SaaS Ad-hoc Issuance',
    applicationName: 'Humana_AdhocIssuance',
    saas: 'ITP SaaS',
    zone: 'azure-westus-2',
    cronExpression: '0 * * * *', // Every hour
    lastRun: {
      timestamp: daysAgo(0.2).toISOString(), // ~5 hours ago
      status: InstanceStatus.FAILED,
      instanceId: 'd1e2f3a4-b5c6-4d7e-8f9a-0b1c2d3e4f5a', // Mock link
    },
    // This job should have run 4 hours ago, but hasn't.
    nextExpectedRun: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
    status: ScheduleStatus.OVERDUE,
  },
  {
    id: 'sched-003',
    name: 'Weekly Tachyon Credit Enrollment',
    applicationName: 'Humana_Enrollment&PlanParticipation',
    saas: 'Tachyon Credit',
    zone: 'gcp-us-central1',
    cronExpression: '0 0 * * 1', // Weekly on Monday
    lastRun: {
      timestamp: daysAgo(7).toISOString(),
      status: InstanceStatus.SUCCESS,
      instanceId: 'c8d9e0f1-a2b3-4c5d-8e9f-0a1b2c3d4e5f'
    },
    nextExpectedRun: hoursFromNow(72).toISOString(),
    status: ScheduleStatus.ON_SCHEDULE,
  },
    {
    id: 'sched-004',
    name: 'Nightly Ruby File Sync',
    applicationName: 'Humana_AdhocIssuance',
    saas: 'Ruby',
    zone: 'aws-us-east-1',
    cronExpression: '30 1 * * *', // Daily at 1:30 AM
    lastRun: {
      timestamp: daysAgo(2).toISOString(),
      status: InstanceStatus.SUCCESS,
      instanceId: 'f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c'
    },
    // This job should have run yesterday
    nextExpectedRun: daysAgo(1).toISOString(),
    status: ScheduleStatus.OVERDUE,
  }
];