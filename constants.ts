
import { AppInstance, InstanceStatus, User, UserRole, Zone, Tenant, BusinessImpact, ExceptionType, SOP, SummaryMetrics, ProcessingStage, OutputFile, ScheduledJob, ScheduleStatus, ExceptionInstance, SystemRequest, FileAppSpec, DiaStorage, DiaUser, DiaFolder, ResourceStatus } from './types';
import { allSops } from './constants/exceptions';

// Mock Users
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
  nehaSharma: {
    id: 'user-007',
    name: 'Neha Sharma',
    role: UserRole.SAAS_SRE,
    saas: 'Next Orbit',
    avatarUrl: 'https://i.pravatar.cc/150?u=nehasharma',
  },
  systemOperator: {
      id: 'user-008',
      name: 'psuuKzwdFasBPPVktcoY.operat',
      role: UserRole.PLATFORM_SRE,
      avatarUrl: 'https://i.pravatar.cc/150?u=sysop',
  }
};

// Mock Zones
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

// Mock Tenants
export const mockTenants: Tenant[] = [
  { id: 'all', name: 'All tenants' },
  { id: 'mondo', name: 'Mondo' },
  { id: 'perf-test-tenant-05', name: 'Performance Test Tenant 05' },
  { id: '15163', name: 'LSG Global' }
];

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

const generateMockInstances = (): AppInstance[] => {
  const instances: AppInstance[] = [];

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

  const sampleApp = 'sample-file-application';
  const saas = 'Next Orbit';
  const tenant = 'mondo';
  const zone = 'aws-us-east-1';

  // 10 Success for sample
  for(let i=1; i<=10; i++) {
      instances.push({
          id: `sample-s-${i}`, fileName: `Completed_Batch_990${i}.csv`,
          saas, tenantId: tenant, zone, applicationName: sampleApp, status: InstanceStatus.SUCCESS,
          totalTasks: 5, completedTasks: 5, startedAt: '2025-05-01T08:00:00Z', lastUpdatedAt: '2025-05-01T08:15:00Z',
          retryCount: 0, businessImpact: BusinessImpact.LOW, tasks: [], ...createSuccessData(`sample-s-${i}`)
      });
  }

  // 20 Failed for sample
  for(let i=1; i<=20; i++) {
      instances.push({
          id: `sample-f-${i}`, fileName: `Failed_Upload_E90${i}.csv`,
          saas, tenantId: tenant, zone, applicationName: sampleApp, status: InstanceStatus.FAILED,
          totalTasks: 5, completedTasks: 2, failedTaskIndex: 2, startedAt: '2025-05-01T09:00:00Z', lastUpdatedAt: '2025-05-01T09:05:00Z',
          retryCount: 1, businessImpact: BusinessImpact.MEDIUM, exceptionType: ExceptionType.SYSTEM, exceptionCode: 'SQLProcessorFailure',
          detailedErrorMessage: 'SQL Error: failed to parse query results from DB source.',
          tasks: [
            { id: 't1', name: 'create-job-folder', status: InstanceStatus.SUCCESS, startTime: '2025-05-01T09:00:00Z', endTime: '2025-05-01T09:01:00Z', retryAttempts: 0 },
            { id: 't2', name: 'move-input-file', status: InstanceStatus.FAILED, startTime: '2025-05-01T09:01:00Z', endTime: '2025-05-01T09:05:00Z', retryAttempts: 1, errorCode: 'IO_MOVE_ERR', errorMessage: 'Destination directory read-only' }
          ]
      });
  }

  // 30 In progress for sample
  for(let i=1; i<=30; i++) {
      instances.push({
          id: `sample-r-${i}`, fileName: `Active_Pipeline_PRC_${i}.csv`,
          saas, tenantId: tenant, zone, applicationName: sampleApp, status: InstanceStatus.IN_PROGRESS,
          totalTasks: 10, completedTasks: 4, startedAt: new Date().toISOString(), lastUpdatedAt: new Date().toISOString(),
          retryCount: 0, businessImpact: BusinessImpact.HIGH, tasks: [
              { id: 't1', name: 'receive', status: InstanceStatus.SUCCESS, startTime: '...', endTime: '...', retryAttempts: 0 },
              { id: 't2', name: 'decrypt', status: InstanceStatus.SUCCESS, startTime: '...', endTime: '...', retryAttempts: 0 },
              { id: 't3', name: 'validate', status: InstanceStatus.SUCCESS, startTime: '...', endTime: '...', retryAttempts: 0 },
              { id: 't4', name: 'transform', status: InstanceStatus.IN_PROGRESS, startTime: '...', endTime: null, retryAttempts: 0 },
          ]
      });
  }

  // Add broad success data for other folders
  const otherApps = ['Humana_ClaimsProcessing', 'enrollment-eligibility'];
  otherApps.forEach(app => {
      // 5 Failed for each
      for(let i=1; i<=5; i++) {
          instances.push({
            id: `${app}-f-${i}`, fileName: `${app}_Data_Err_${i}.json`,
            saas, tenantId: tenant, zone, applicationName: app, status: InstanceStatus.FAILED,
            totalTasks: 5, completedTasks: 1, startedAt: '2025-04-28T10:00:00Z', lastUpdatedAt: '2025-04-28T10:02:00Z',
            retryCount: 0, businessImpact: BusinessImpact.MEDIUM, detailedErrorMessage: 'Validation error', tasks: [
                { id: 't1', name: 'validate', status: InstanceStatus.FAILED, startTime: '...', endTime: '...', retryAttempts: 0, errorCode: 'VAL_ERR', errorMessage: 'Invalid format' }
            ]
          });
      }
      // 15-20 Completed for each
      const count = 15 + Math.floor(Math.random() * 10);
      for(let i=1; i<=count; i++) {
          instances.push({
            id: `${app}-s-${i}`, fileName: `${app}_Success_${i}.json`,
            saas, tenantId: tenant, zone, applicationName: app, status: InstanceStatus.SUCCESS,
            totalTasks: 5, completedTasks: 5, startedAt: '2025-04-28T11:00:00Z', lastUpdatedAt: '2025-04-28T11:10:00Z',
            retryCount: 0, businessImpact: BusinessImpact.LOW, tasks: [], ...createSuccessData(`${app}-s-${i}`)
          });
      }
  });

  return instances;
}

export const mockAppInstances: AppInstance[] = generateMockInstances().map(inst => ({
    ...inst,
    customerWorkbench: getWorkbenchName(inst.saas),
}));

// Mock File Application Specifications - FULL SPECIFICATIONS
export const mockFileAppSpecs: Record<string, FileAppSpec | any> = {
  'sample-file-application': {
    name: 'sample-file-application',
    fileType: 'CSV',
    delimeter: '|',
    trigger: {
      triggerType: 'SCHEDULED',
      scheduleCron: '0 0 * * *',
      timezone: 'UTC'
    },
    source: {
      type: 'DB',
      outputFileName: 'input_source.json',
      dbConfig: {
        driverClass: 'org.postgresql.Driver',
        jdbcUrl: 'delta:PG#jdbc.url',
        username: 'delta:PG#jdbc.username',
        password: 'delta:PG#jdbc.password',
        query: 'SELECT id, payload, created_at FROM job_history WHERE status = \'READY\' LIMIT 1000;',
        fetchSize: 1000
      }
    },
    tasks: [
      { id: 't1', protocol: 'dia', command: 'create-folder', parameters: { name: '${JOB_ID}', path: '/apps/sample/processing' } },
      { id: 't2', protocol: 'dia', command: 'move-file', parameters: { source: '/tmp/input_source.json', destination: '/apps/sample/processing/${JOB_ID}/input.json' } },
      { id: 't3', protocol: 'security', command: 'decrypt', parameters: { keyId: 'KMS_SECRET_01', input: 'input.json', output: 'decrypted.json' } },
      { id: 't4', protocol: 'compute', command: 'validate-schema', parameters: { schemaId: 'SCH_V1', input: 'decrypted.json' } },
      { id: 't5', protocol: 'compute', command: 'transform-records', parameters: { mapper: 'MAP_SAMPLE_V2', input: 'decrypted.json', output: 'final.csv' } }
    ],
    viewConfig: {
      summaryRenderFilePath: 'summary.json',
      downloadFiles: [
        { displayName: 'Processed Records', filePath: 'final.csv' },
        { displayName: 'Error Log', filePath: 'errors.log' }
      ]
    }
  },
  'Humana_ClaimsProcessing': {
    name: 'Humana_ClaimsProcessing',
    fileType: 'JSON',
    trigger: { 
      triggerType: 'SCHEDULED', 
      scheduleCron: '0 */5 * * * *', 
      timezone: 'UTC' 
    },
    source: {
      type: 'EXTERNAL_FOLDER',
      externalConfig: {
        path: '/mnt/humana/inbound',
        regex: '^Humana_Claim_.*\\.json$',
        postScanMovePath: '/mnt/humana/archive'
      }
    },
    tasks: [
      { id: 't1', protocol: 'security', command: 'decrypt', parameters: { keyId: 'SEC_K_99', mode: 'AES-256' } },
      { id: 't2', protocol: 'compute', command: 'validate-eligibility', parameters: { apiEndpoint: 'https://eligibility.humana.com/v1' } },
      { id: 't3', protocol: 'dia', command: 'upload-to-s3', parameters: { bucket: 'humana-processed-claims', prefix: 'daily/' } }
    ]
  },
  'enrollment-eligibility': {
    name: 'enrollment-eligibility',
    fileType: 'CSV',
    trigger: { 
      triggerType: 'EVENT', 
      timezone: 'ASIA/KOLKATA' 
    },
    source: {
      type: 'DB',
      dbConfig: {
        jdbcUrl: 'jdbc:mysql://enrollment-db-cluster:3306/enrollment',
        username: 'pipeline_svc',
        password: 'vault:secret/enrollment/db#password',
        query: 'SELECT * FROM pending_enrollments WHERE processed = false'
      }
    },
    tasks: [
      { id: 't1', protocol: 'dia', command: 'create-folder', parameters: { name: '${EVENT_ID}', path: '/dia/enrollment/workdir' } },
      { id: 't2', protocol: 'compute', command: 'record-deduplication', parameters: { window: '24h', key: 'beneficiary_id' } },
      { id: 't3', protocol: 'compute', command: 'transform-to-canonical', parameters: { version: '1.4' } },
      { id: 't4', protocol: 'dia', command: 'push-to-webhook', parameters: { url: 'https://webhook.mondo.com/enroll' } }
    ],
    eventContext: {
        publisher: 'Zeta-Enrollment-Service',
        topic: 'enrollment.created.v1',
        schema: 'avro'
    }
  }
};

// Mock Scheduled Jobs
export const mockScheduledJobs: ScheduledJob[] = [
  {
    id: 'job-001',
    name: 'Daily Enrollment Sync',
    applicationName: 'enrollment-eligibility',
    saas: 'Next Orbit',
    tenantId: 'mondo',
    zone: 'aws-us-east-1',
    cronExpression: '0 2 * * *',
    nextExpectedRun: '2025-05-02T02:00:00Z',
    status: ScheduleStatus.ON_SCHEDULE,
    lastRun: {
      timestamp: '2025-05-01T02:00:00Z',
      status: InstanceStatus.SUCCESS,
      instanceId: 'sample-s-1'
    }
  }
];

// Mock Exception Instances
export const mockExceptionInstances: ExceptionInstance[] = [
  {
    id: 'EXC-001',
    name: 'Downstream API Timeout - Gluon',
    description: 'Repeated 504 Gateway Timeout from Gluon service.',
    criticality: 'High',
    createdAt: '2025-04-26T10:05:30Z',
    definitionCode: 'DownstreamAPITimeout',
    status: 'Open',
    requestId: 'REQ-001'
  }
];

// Detailed Exception Instance
export const detailedExceptionInstance: ExceptionInstance = {
  ...mockExceptionInstances[0],
  exceptionDescription: 'Gluon API is unresponsive.',
  payload: { source: "{'record':{'id':'rec-123'},'error':'504'}" }
};

// Mock System Request
export const mockSystemRequest: SystemRequest = {
  title: 'Recon Force Match',
  status: 'In Progress',
  syrTitle: 'Recon Force Match',
  requestId: 'REQ-001',
  dateCreated: '2025-04-26T10:10:00Z',
  completedAt: null,
  createdBy: { name: 'System', avatarChar: 'S', avatarColor: 'bg-slate-500' },
  requestDefinitionCode: 'RQDZINZZ0201',
  workflow: 'Recon Match Workflow',
  exceptionId: 'EXC-001',
  exceptionDefinitionCode: 'DownstreamAPITimeout',
  history: [
    {
      user: { name: 'Brenda Smith', avatarChar: 'B', avatarColor: 'bg-sky-500' },
      actionText: 'is reviewing request',
      details: 'Review started',
      timestamp: '2025-04-26T11:00:00Z',
      type: 'review'
    }
  ]
};

// Mock DIA Storages
export const mockDiaStorages: DiaStorage[] = [
  {
    resourceName: 'STOR-001',
    tenantId: 'mondo',
    storageName: 'S3_LANDING_BUCKET',
    description: 'Primary landing bucket',
    type: 'CLOUD_STORAGE',
    app: 'Humana_ClaimsProcessing',
    status: ResourceStatus.ACTIVE,
    createdTs: '2024-01-01T00:00:00Z',
    updatedTs: '2024-03-20T10:00:00Z',
    cloudStorageParameters: { bucketName: 'humana-claims-landing', region: 'us-east-1', prefix: 'inbound/' }
  }
];

// Mock DIA Users
export const mockDiaUsers: DiaUser[] = [
  {
    resourceName: 'USER-001',
    tenantId: 'mondo',
    userName: 'mondo_app_user',
    description: 'App user',
    type: 'SYSTEM_USER',
    app: 'Humana_ClaimsProcessing',
    status: ResourceStatus.ACTIVE,
    createdTs: '2024-01-01T00:00:00Z',
    updatedTs: '2024-03-20T10:00:00Z',
    rbac: { resource: 'STOR-001' }
  }
];

// Mock DIA Folders
export const mockDiaFolders: DiaFolder[] = [
  {
    resourceName: 'FOLD-001',
    tenantId: 'mondo',
    folderName: 'Mondo_Inbound',
    folderType: 'FOLDER',
    path: '/apps/mondo/inbound',
    app: 'Humana_ClaimsProcessing',
    username: 'mondo_app_user',
    status: ResourceStatus.ACTIVE,
    createdTs: '2024-01-01T00:00:00Z',
    updatedTs: '2024-03-20T10:00:00Z'
  }
];
