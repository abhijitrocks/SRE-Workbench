
import { ExceptionDefinition, ExceptionType, SOP, UserRole } from '../types';

export const businessExceptions: ExceptionDefinition[] = [
  {
    id: 'BeneficiaryValidationException',
    type: ExceptionType.BUSINESS,
    cause: 'beneficiaryId or required identity fields are null, empty, or invalid.',
    detectionPoint: 'BeneficiaryValidationOperator (transform task)',
    exampleMessage: 'BeneficiaryValidationException: beneficiaryId=null for line 152',
    severity: 'Medium',
    isRetryable: false,
    recommendedAction: 'Move record to error file. Notify data publisher to fix source file and reprocess.',
  },
  {
    id: 'SchemaValidationException',
    type: ExceptionType.BUSINESS,
    cause: 'Grouped records fail schema validation (e.g., missing fields, wrong data types).',
    detectionPoint: 'SchemaValidationOperator (transform task)',
    exampleMessage: "SchemaValidationException: missing required field 'planCode'",
    severity: 'Medium',
    isRetryable: false,
    recommendedAction: 'Move records to a schema validation error file. Surface schema differences to the publisher for correction.',
  },
  {
    id: 'HeaderMissingOrMalformed',
    type: ExceptionType.BUSINESS,
    cause: 'The header record is missing required values (e.g., CorporationID).',
    detectionPoint: 'read-header-line task',
    exampleMessage: "HeaderMissingOrMalformed: Cannot read properties of null (reading 'CorporationID')",
    severity: 'Medium',
    isRetryable: false,
    recommendedAction: 'Notify the publisher to correct and re-send the file. The instance should be cancelled once the new file is received.',
  },
  {
    id: 'BusinessRuleConflictWithExistingState',
    type: ExceptionType.BUSINESS,
    cause: 'Intended action conflicts with current system state (e.g., attempt to ADD a plan when it already exists).',
    detectionPoint: 'CommandExecutionOperator (downstream API)',
    exampleMessage: '409 Conflict: Plan with ID `PLAN123` already exists for beneficiary `BEN789`.',
    severity: 'Medium',
    isRetryable: false,
    recommendedAction: 'Route to error file; surface to SRE/publisher with example response for manual review.',
  },
  {
    id: 'InvalidJSONInput',
    type: ExceptionType.BUSINESS,
    cause: 'Input file contains malformed JSON for a record, preventing parsing.',
    detectionPoint: 'SourceOperator or read-line step',
    exampleMessage: 'InvalidJSONInput: Unrecognized token at line 25, column 15.',
    severity: 'Medium',
    isRetryable: false,
    recommendedAction: 'Isolate the offending record, notify the publisher to correct the source data and resubmit.',
  },
];

export const systemExceptions: ExceptionDefinition[] = [
  {
    id: 'FileSystemPermissionDenied',
    type: ExceptionType.SYSTEM,
    cause: 'A DIA operation (create-folder, move-file) failed due to incorrect permissions on the filesystem or object-store.',
    detectionPoint: 'create-folder or move-file tasks',
    exampleMessage: 'PermissionDenied: Access denied to path /apps/enrollment/...',
    severity: 'High',
    isRetryable: false,
    recommendedAction: 'Create a platform incident. An SRE must investigate and correct the underlying file system permissions. Do not retry until resolved.',
  },
  {
    id: 'DownstreamAPITimeout',
    type: ExceptionType.SYSTEM,
    cause: 'A downstream service (e.g., Gluon) returned a 5xx error or timed out.',
    detectionPoint: 'CommandExecutionOperator (API call task)',
    exampleMessage: '504 Gateway Timeout from POST https://electron.mum1-pp.zetaapps.in/gluon/api/v2/',
    severity: 'High',
    isRetryable: true,
    recommendedAction: 'Utilize automated retry with exponential backoff. If all retries fail, escalate to the on-call SRE for the downstream service.',
  },
  {
    id: 'JarDownloadError',
    type: ExceptionType.SYSTEM,
    cause: 'The system was unable to download the required job JAR file from Artifactory (e.g., 403, 404, network timeout).',
    detectionPoint: 'Custom job initialization (e.g., prepare-commands)',
    exampleMessage: 'Failed to download JAR from https://jfrog.internal.ciaas.zetaapps.in/...: 404 Not Found',
    severity: 'Critical',
    isRetryable: true,
    recommendedAction: 'Check Artifactory status and ensure the artifact exists and is accessible. Alert the platform build/ops team if the issue persists.',
  },
  {
    id: 'FileNotFound',
    type: ExceptionType.SYSTEM,
    cause: 'The source file for a `move-file` operation was not found. This could be a race condition or the file was removed prematurely.',
    detectionPoint: 'move-file-to-processing task',
    exampleMessage: 'FileNotFoundException: Source file /source/Beneficiary_EE_File_20250428_05.json does not exist.',
    severity: 'Medium',
    isRetryable: true,
    recommendedAction: 'Attempt automatic retry with backoff. If persists, mark as failed and notify the publisher.',
  },
  {
    id: 'SQLProcessorFailure',
    type: ExceptionType.SYSTEM,
    cause: 'The SQL job failed due to a parser error, resource issue, or an unsupported JSON shape in the input file.',
    detectionPoint: 'compute-summary (SQL job)',
    exampleMessage: 'SQL Parse Error: Unrecognized token `INVALID` at line 5, column 10.',
    severity: 'High',
    isRetryable: false,
    recommendedAction: 'Capture SQL engine logs and create a system incident. This may indicate a platform or data corruption issue.',
  },
];

export const allExceptionDefs: { [key: string]: ExceptionDefinition } = 
  [...businessExceptions, ...systemExceptions].reduce((acc, def) => {
    acc[def.id] = def;
    return acc;
  }, {} as { [key: string]: ExceptionDefinition });


export const allSops: { [key: string]: SOP } = {
  BeneficiaryValidationException: {
    title: 'SOP: Beneficiary Validation Failed',
    preconditions: [
      "Error logs confirm a `BeneficiaryValidationException`.",
      "The failed record has been isolated in an error file.",
    ],
    steps: [
      "1. Do NOT resume the task. This will not fix the data issue.",
      "2. Identify the business owner/publisher for the source file.",
      "3. Provide them the App Instance ID, error message, and the contents of the error file.",
      "4. The publisher must provide a corrected file for processing.",
      "5. Once the corrected file is received and a new instance is running, cancel this failed instance with a clear reason.",
    ],
    permissionsRequired: [UserRole.SAAS_SRE],
    rollbackActions: ["Cancel the instance. The state was not modified."],
    expectedPostConditions: 'The failed instance is cancelled, and a new instance is processing the corrected data.',
  },
  SchemaValidationException: {
    title: 'SOP: Schema Validation Failed',
    preconditions: [
      "Error logs confirm a `SchemaValidationException`.",
      "The error message specifies which field(s) are missing or malformed.",
    ],
    steps: [
      "1. Analyze the error message to understand the schema mismatch.",
      "2. Contact the data publisher with the details of the schema failure.",
      "3. The publisher must correct their data generation process to align with the required schema.",
      "4. A new file with the correct schema must be provided.",
      "5. Cancel this instance after the new file is being processed.",
    ],
    permissionsRequired: [UserRole.SAAS_SRE, UserRole.PLATFORM_SRE],
    rollbackActions: ["Instance cancellation."],
    expectedPostConditions: 'The publisher acknowledges the schema issue, provides a corrected file, and the failed instance is cancelled.',
  },
  HeaderMissingOrMalformed: {
    title: 'SOP: Malformed or Missing Header',
    preconditions: [
      "Task `read-header-line` has failed.",
      "Error message indicates a required header field could not be read (e.g., CorporationID is null).",
    ],
    steps: [
      "1. Confirm the input file is missing the header or a key value.",
      "2. Notify the publisher that the file is invalid due to a malformed header.",
      "3. Request that they regenerate and re-upload the file with the correct header information.",
      "4. Cancel this failed instance.",
    ],
    permissionsRequired: [UserRole.SAAS_SRE],
    rollbackActions: ["Instance cancellation."],
    expectedPostConditions: 'Publisher provides a corrected file and the invalid instance is cancelled.',
  },
  FileSystemPermissionDenied: {
    title: 'SOP: Filesystem Permission Denied',
    preconditions: [
      "A file operation task (create, move, write) has failed.",
      "The error log explicitly states 'Permission Denied' or 'Access Denied' for a specific file path.",
    ],
    steps: [
      "1. This is a platform issue. Do not attempt to resume.",
      "2. Create a high-priority incident and assign it to the Platform SRE team.",
      "3. Include the full error message, file path, and App Instance ID in the ticket.",
      "4. The Platform SRE must investigate and fix the permissions on the underlying storage.",
      "5. Once the Platform SRE confirms permissions are fixed, the task can be safely resumed.",
    ],
    permissionsRequired: [UserRole.PLATFORM_SRE],
    rollbackActions: ["No rollback action. State is unchanged. Resume after fix."],
    expectedPostConditions: 'Filesystem permissions are corrected by a Platform SRE, and the instance is successfully resumed.',
  },
  DownstreamAPITimeout: {
    title: 'SOP: Downstream API Timeout / 5xx Error',
    preconditions: [
      "A task involving an API call has failed.",
      "Logs show repeated 5xx errors (e.g., 500, 503, 504) or connection timeouts after multiple retries.",
    ],
    steps: [
      "1. Check the status page or monitoring dashboards for the downstream service (e.g., Gluon) for any ongoing incidents.",
      "2. If there is an active incident, link it to this instance and wait for resolution.",
      "3. If there is no active incident, create a new incident and escalate to the on-call SRE for the downstream service.",
      "4. Once the downstream service is healthy again, the `Resume` action can be used.",
    ],
    permissionsRequired: [UserRole.PLATFORM_SRE, UserRole.SAAS_SRE],
    rollbackActions: ["The task is idempotent and can be safely resumed once the downstream service is stable."],
    expectedPostConditions: 'The downstream service recovers, and the instance is successfully resumed, processing the records.',
  },
  JarDownloadError: {
    title: 'SOP: Job JAR Download Failed',
    preconditions: [
      "A custom job task has failed during initialization.",
      "Error logs indicate a failure to download a JAR file from an artifact repository (e.g., JFrog Artifactory).",
    ],
    steps: [
      "1. Verify the artifact repository is online and accessible.",
      "2. Check the URL in the error message to ensure the JAR path and version are correct.",
      "3. If the repository is down or the JAR is missing, create an incident and assign it to the build/platform operations team.",
      "4. Do not resume until the artifact is confirmed to be available.",
      "5. Once available, the instance can be resumed.",
    ],
    permissionsRequired: [UserRole.PLATFORM_SRE],
    rollbackActions: ["No rollback. Resume after the artifact is accessible."],
    expectedPostConditions: 'The required JAR is restored in the artifact repository, and the instance resumes successfully.',
  },
  BusinessRuleConflictWithExistingState: {
    title: 'SOP: Business Rule Conflict',
    preconditions: [
      "Task `process-commands` has failed.",
      "Logs show a 4xx error from the downstream API, such as a 409 Conflict.",
    ],
    steps: [
      "1. This is a data conflict, do not resume.",
      "2. Analyze the error message to understand the nature of the conflict (e.g., duplicate record).",
      "3. Notify the publisher with the App Instance ID and the specific record causing the conflict.",
      "4. The publisher needs to decide on the correct action (e.g., update their source data, manually resolve the conflict in the target system).",
      "5. Cancel this instance once the issue is understood and being handled externally.",
    ],
    permissionsRequired: [UserRole.SAAS_SRE],
    rollbackActions: ["Instance cancellation."],
    expectedPostConditions: 'The data conflict is resolved by the publisher in the source or target system.',
  },
  FileNotFound: {
    title: 'SOP: Source File Not Found',
    preconditions: [
      "Task `move-file-to-processing` has failed.",
      "Logs show a 'FileNotFound' or 'MoveSourceMissing' error.",
      "Automated retries (3) have been exhausted.",
    ],
    steps: [
      "1. Verify if the file has been delivered to the source directory.",
      "2. If the file arrived late, a `Resume` action might succeed.",
      "3. If the file is confirmed to be missing, contact the publisher.",
      "4. Inform them that the expected file was not available for processing and request them to re-upload it.",
      "5. Cancel this failed instance once the publisher confirms a re-upload.",
    ],
    permissionsRequired: [UserRole.SAAS_SRE, UserRole.PLATFORM_SRE],
    rollbackActions: ["Resume if file appears, otherwise cancel."],
    expectedPostConditions: 'The missing file is either located and processed, or the instance is cancelled and a new one is created for the re-uploaded file.',
  },
  SQLProcessorFailure: {
    title: 'SOP: SQL Processor Failure',
    preconditions: [
      "A `process-records` task with `jobType: SQL` has failed.",
      "Logs indicate a SQL parsing or execution error.",
    ],
    steps: [
      "1. This is a potential platform or severe data corruption issue. Do not resume.",
      "2. Capture the full SQL error message from the logs.",
      "3. Create a high-priority incident and assign to the Platform SRE team.",
      "4. The Platform SRE team will investigate the SQL engine and the input data slice that caused the failure.",
      "5. The instance should remain in a failed state until a root cause is determined.",
    ],
    permissionsRequired: [UserRole.PLATFORM_SRE],
    rollbackActions: ["No rollback. Requires deep investigation."],
    expectedPostConditions: 'The root cause of the SQL engine failure is identified and addressed by the platform team.',
  },
  InvalidJSONInput: {
    title: 'SOP: Invalid JSON Input',
    preconditions: [
        "A file reading or parsing task has failed.",
        "Logs indicate a JSON parsing error at a specific line or column.",
    ],
    steps: [
        "1. This is a data quality issue from the publisher. Do not resume.",
        "2. Isolate the malformed JSON record or file segment.",
        "3. Contact the publisher and provide the App Instance ID, file name, and the location of the parsing error.",
        "4. The publisher must fix their data generation process and provide a corrected file.",
        "5. Cancel this instance once the new, valid file is being processed.",
    ],
    permissionsRequired: [UserRole.SAAS_SRE],
    rollbackActions: ["Instance cancellation."],
    expectedPostConditions: 'Publisher provides a file with valid JSON, and the failed instance is cancelled.',
  },
};