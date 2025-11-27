# Service Layer Documentation

This directory contains all API service modules for the Yarago Hospital Management System frontend application.

## Architecture

All services follow a consistent pattern:
- Use the shared `apiClient` from `api.ts` for HTTP requests
- Include comprehensive TypeScript types for all request/response objects
- Export a default service object with named methods
- Handle authentication automatically via axios interceptors
- Return properly typed Promises for all async operations

## Available Services

### 1. **authService.ts**
Authentication and authorization operations.

**Key Methods:**
- `login(credentials)` - User login
- `logout()` - User logout
- `register(userData)` - User registration
- `refreshToken()` - Refresh JWT token
- `getCurrentUser()` - Get current user details

---

### 2. **patientService.ts**
Patient registration and management.

**Key Methods:**
- `createPatient(data)` - Register new patient (temporary or permanent)
- `getPatients(page, size, filters)` - Paginated patient list
- `getPatientById(id)` - Get patient details
- `getPatientByUhid(uhid)` - Search by UHID
- `updatePatient(id, data)` - Update patient information
- `searchPatients(query)` - Search by name/phone
- `convertToPermanent(id)` - Convert temporary to permanent registration
- `getPatientHistory(patientId)` - Get patient visit history

---

### 3. **appointmentService.ts**
Appointment scheduling and queue management.

**Key Methods:**
- `createAppointment(data)` - Book new appointment
- `getAppointmentById(id)` - Get appointment details
- `getAppointmentsByDate(date)` - Get appointments for specific date
- `getAppointmentsByPatient(patientId)` - Patient's appointment history
- `updateAppointmentStatus(id, status)` - Update appointment status
- `getTodayQueue()` - Get today's patient queue

**Status Flow:**
SCHEDULED → CHECKED_IN → IN_PROGRESS → COMPLETED → CHECKED_OUT

---

### 4. **consultationService.ts**
Clinical examinations and consultations.

**Key Methods:**
- Optometry examination management
- Doctor consultation records
- Prescription generation
- Clinical findings documentation

---

### 5. **billingService.ts**
Billing and payment operations.

**Key Methods:**
- `createBill(data)` - Generate new bill
- `getBills(filters)` - Get bills with filters
- `getBillById(id)` - Get bill details
- `addBillItem(billId, item)` - Add item to bill
- `removeBillItem(billId, itemId)` - Remove item from bill
- `recordPayment(data)` - Record payment
- `getPayments(billId)` - Get payment history
- `getServices()` - Get service master data
- `getDailyReport(date)` - Get daily billing report
- `getInvoice(billId)` - Download invoice PDF

---

### 6. **notificationService.ts**
Notification management (SMS, Email, Push, WebSocket).

**Key Methods:**
- Send notifications to patients/staff
- Get notification history
- Manage notification templates

---

### 7. **ipdService.ts** *(NEW)*
In-Patient Department (IPD) management.

**Key Features:**
- Ward and bed management
- Patient admission and discharge
- IPD billing
- Patient transfers
- Vitals tracking
- Discharge summaries

**Key Methods:**

**Ward Management:**
- `getWards(filters)` - List all wards
- `getWardById(id)` - Ward details with bed status
- `createWard(data)` - Create new ward
- `updateWard(id, data)` - Update ward details
- `getWardOccupancy(wardId?)` - Get occupancy statistics

**Bed Management:**
- `getBeds(filters)` - List beds (optionally filter by ward)
- `getBedById(id)` - Bed details
- `createBed(data)` - Add new bed
- `updateBedStatus(id, status, notes?)` - Update bed status
- `getAvailableBeds(wardId?, bedType?)` - Get available beds
- `assignBed(bedId, admissionId)` - Assign bed to patient
- `releaseBed(bedId)` - Release bed after discharge

**Bed Statuses:** AVAILABLE, OCCUPIED, MAINTENANCE, RESERVED, BLOCKED

**Admission Management:**
- `getAdmissions(page, size, filters)` - Paginated admission list
- `getAdmissionById(id)` - Admission details
- `getAdmissionByNumber(number)` - Get by admission number
- `getPatientAdmissions(patientId)` - Patient's admission history
- `getActiveAdmissions(wardId?)` - Current active admissions
- `createAdmission(data)` - Admit new patient
- `updateAdmission(id, data)` - Update admission details
- `dischargePatient(admissionId, data)` - Discharge patient
- `transferPatient(admissionId, data)` - Transfer to different ward/bed
- `cancelAdmission(admissionId, reason)` - Cancel admission
- `getAdmissionVitals(admissionId)` - Get vitals history
- `addAdmissionVitals(admissionId, data)` - Record vitals

**Admission Statuses:** ADMITTED, DISCHARGED, TRANSFERRED, ABSCONDED, DECEASED

**IPD Billing:**
- `getIPDBilling(admissionId)` - Get billing details
- `generateIPDBill(admissionId)` - Generate final bill
- `addIPDCharges(admissionId, data)` - Add charges (consultation, procedure, etc.)
- `recordAdvancePayment(admissionId, data)` - Record advance payment

**Reports:**
- `getDischargeSummary(admissionId)` - Download discharge summary PDF
- `printAdmissionCard(admissionId)` - Download admission card
- `getIPDStatistics(fromDate?, toDate?)` - Dashboard statistics
- `searchAdmissions(query)` - Search by name/UHID/admission number

---

### 8. **adminService.ts** *(NEW)*
System administration and configuration.

**Key Features:**
- User management (CRUD operations)
- Role and permission management
- System settings
- Audit logs
- Branch management
- System health monitoring

**Key Methods:**

**User Management:**
- `getUsers(page, size, filters)` - Paginated user list
- `getUserById(id)` - User details
- `getUserByUsername(username)` - Get by username
- `createUser(data)` - Create new user
- `updateUser(id, data)` - Update user
- `deleteUser(id)` - Soft delete user
- `activateUser(id)` / `deactivateUser(id)` - Toggle user status
- `resetUserPassword(id, newPassword)` - Admin password reset
- `changePassword(current, new)` - User password change
- `unlockUser(id)` - Unlock locked account
- `searchUsers(query)` - Search users
- `getUserStatistics()` - User statistics
- `getUsersByRole(roleId)` - Get users by role
- `getUsersByBranch(branchId)` - Get users by branch

**Role Management:**
- `getRoles(includeInactive?)` - List all roles
- `getRoleById(id)` - Role details
- `createRole(data)` - Create new role
- `updateRole(id, data)` - Update role
- `deleteRole(id)` - Delete role (non-system only)
- `getAllPermissions()` - Get all permissions grouped by module
- `getRolePermissions(roleId)` - Get role's permissions

**Permission Modules:** PATIENT, APPOINTMENT, CONSULTATION, BILLING, IPD, ADMIN
**Permission Actions:** CREATE, READ, UPDATE, DELETE, APPROVE, CANCEL

**System Settings:**
- `getSystemSettings()` - Get all settings grouped by category
- `getSettingsByCategory(category)` - Get category settings
- `getSettingByKey(key)` - Get single setting
- `updateSystemSettings(data)` - Bulk update settings
- `updateSetting(key, value)` - Update single setting
- `resetSettings(category?)` - Reset to defaults

**Audit Logs:**
- `getAuditLogs(page, size, filters)` - Paginated audit logs
- `getAuditLogById(id)` - Audit log details
- `getEntityAuditLogs(type, id)` - Entity-specific logs
- `getUserActivityLogs(userId, from?, to?)` - User activity
- `exportAuditLogs(filters?)` - Export to Excel
- `getAuditStatistics(from?, to?)` - Audit statistics

**Branch Management:**
- `getBranches(isActive?)` - List branches
- `getBranchById(id)` - Branch details
- `createBranch(data)` - Create new branch
- `updateBranch(id, data)` - Update branch
- `deleteBranch(id)` - Soft delete branch
- `activateBranch(id)` / `deactivateBranch(id)` - Toggle status

**System Operations:**
- `getSystemHealth()` - Health check for all services
- `getSystemConfig()` - System configuration
- `clearCache(type?)` - Clear Redis cache
- `backupDatabase()` - Trigger database backup
- `getSystemLogs(level?, from?, to?, limit?)` - System logs

---

### 9. **masterDataService.ts** *(NEW)*
Clinical master data management for dropdowns and templates.

**Key Features:**
- Chief complaints library
- Medical history options
- Diagnosis codes (with ICD-10/11 integration)
- Drug/medication database
- Clinical findings templates
- Advice templates
- Master data import/export

**Key Methods:**

**Chief Complaints:**
- `getChiefComplaints(category?, isActive?)` - List chief complaints
- `getChiefComplaintById(id)` - Get details
- `searchChiefComplaints(query)` - Search complaints
- `createChiefComplaint(data)` - Create new complaint
- `updateChiefComplaint(id, data)` - Update complaint
- `deleteChiefComplaint(id)` - Soft delete
- `getChiefComplaintCategories()` - Get categories

**Categories:** VISION, PAIN, DISCHARGE, INJURY, COSMETIC, ROUTINE

**Medical History:**
- `getMedicalHistoryOptions(category?, isActive?)` - List options
- `getMedicalHistoryOptionById(id)` - Get details
- `searchMedicalHistory(query)` - Search history options
- `createMedicalHistory(data)` - Create new option
- `updateMedicalHistory(id, data)` - Update option
- `deleteMedicalHistory(id)` - Soft delete
- `getMedicalHistoryCategories()` - Get grouped by category

**Categories:** SYSTEMIC, OCULAR, SURGICAL, ALLERGIES, FAMILY, SOCIAL

**Diagnosis Codes:**
- `getDiagnosisCodes(category?, search?, isActive?)` - List diagnosis codes
- `getDiagnosisCodeById(id)` - Get details
- `searchDiagnosisCodes(query, limit?)` - Autocomplete search
- `createDiagnosisCode(data)` - Create new code
- `updateDiagnosisCode(id, data)` - Update code
- `deleteDiagnosisCode(id)` - Soft delete
- `getDiagnosisCategories()` - Get categories
- `getCommonDiagnoses(limit?)` - Frequently used diagnoses

**Categories:** REFRACTIVE_ERROR, CATARACT, GLAUCOMA, RETINAL, CORNEAL, etc.

**ICD Codes:**
- `searchICDCodes(query, version?, limit?)` - Search ICD codes
- `getICDCodeByCode(code, version?)` - Get specific ICD code
- `getICDCodesByChapter(chapter, version?)` - Get by chapter
- `getICDCodeHierarchy(code, version?)` - Get parent-child hierarchy

**Drugs/Medications:**
- `getDrugs(category?, type?, search?, isActive?)` - List drugs
- `getDrugById(id)` - Drug details
- `searchDrugs(query, category?, limit?)` - Autocomplete search
- `createDrug(data)` - Create new drug
- `updateDrug(id, data)` - Update drug
- `deleteDrug(id)` - Soft delete
- `getDrugCategories()` - Get drug categories
- `getCommonDrugs(category?, limit?)` - Frequently prescribed
- `getDrugInteractions(drugIds)` - Check drug interactions

**Drug Categories:** ANTIBIOTIC, ANTI_INFLAMMATORY, LUBRICANT, ANTIGLAUCOMA, etc.
**Drug Types:** EYE_DROPS, TABLET, CAPSULE, OINTMENT, INJECTION

**Clinical Findings:**
- `getClinicalFindings(category?, subcategory?, isActive?)` - List findings
- `getClinicalFindingById(id)` - Get details
- `searchClinicalFindings(query, category?)` - Search findings
- `createClinicalFinding(data)` - Create new finding
- `updateClinicalFinding(id, data)` - Update finding
- `deleteClinicalFinding(id)` - Soft delete
- `getClinicalFindingsByCategory()` - Get grouped by category

**Categories:** ANTERIOR_SEGMENT, POSTERIOR_SEGMENT, VISION, IOP, FUNDUS, etc.

**Advice Templates:**
- `getAdviceTemplates(category?, condition?, isActive?)` - List templates
- `getAdviceTemplateById(id)` - Get details
- `searchAdviceTemplates(query)` - Search templates
- `createAdviceTemplate(data)` - Create new template
- `updateAdviceTemplate(id, data)` - Update template
- `deleteAdviceTemplate(id)` - Soft delete
- `getAdviceCategories()` - Get categories
- `getCommonAdviceTemplates(limit?)` - Frequently used templates

**Categories:** POST_OPERATIVE, GENERAL, EMERGENCY, PREVENTIVE

**General Master Data Operations:**
- `getMasterDataCategories()` - Get all categories with counts
- `importMasterData(type, file)` - Bulk import from Excel/CSV
- `exportMasterData(type)` - Export to Excel
- `getMasterDataStatistics()` - Statistics for all master data types
- `syncMasterData(type)` - Sync from external source
- `createMasterData(type, data)` - Generic create
- `updateMasterData(type, id, data)` - Generic update
- `deleteMasterData(type, id)` - Generic delete
- `validateMasterData(type?)` - Validate data integrity

---

## Usage Examples

### Basic Service Call
```typescript
import { patientService } from '@/services';

// Create a new patient
const newPatient = await patientService.createPatient({
  title: 'Mr',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1985-01-15',
  gender: 'MALE',
  phoneNumber: '9876543210',
  address: '123 Main St',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
  branchId: 'BRANCH001',
  isTemporary: false
});
```

### Using with React Query
```typescript
import { useQuery } from '@tanstack/react-query';
import { patientService } from '@/services';

function PatientList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['patients', page, filters],
    queryFn: () => patientService.getPatients(page, 20, filters)
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return <PatientTable data={data.content} />;
}
```

### Error Handling
```typescript
import { patientService } from '@/services';
import { AxiosError } from 'axios';

try {
  const patient = await patientService.createPatient(data);
  toast.success('Patient registered successfully');
} catch (error) {
  if (error instanceof AxiosError) {
    if (error.response?.status === 400) {
      toast.error('Invalid patient data');
    } else if (error.response?.status === 409) {
      toast.error('Patient with this phone number already exists');
    } else {
      toast.error('Failed to register patient');
    }
  }
}
```

### IPD Workflow Example
```typescript
import { ipdService } from '@/services';

// 1. Check available beds
const availableBeds = await ipdService.getAvailableBeds('WARD001', 'DELUXE');

// 2. Create admission
const admission = await ipdService.createAdmission({
  patientId: 'PAT12345',
  admissionDate: '2025-11-27',
  admissionTime: '14:30',
  admissionType: 'PLANNED',
  admissionCategory: 'SURGERY',
  wardId: 'WARD001',
  bedId: availableBeds[0].id,
  primaryDoctorId: 'DOC001',
  departmentId: 'DEPT001',
  provisionalDiagnosis: 'Cataract',
  chiefComplaint: 'Blurred vision',
  advanceAmount: 10000,
  branchId: 'BRANCH001'
});

// 3. Add vitals
await ipdService.addAdmissionVitals(admission.id, {
  recordedAt: new Date().toISOString(),
  temperature: 98.6,
  bloodPressure: '120/80',
  pulse: 72,
  spo2: 98
});

// 4. Add charges
await ipdService.addIPDCharges(admission.id, {
  chargeType: 'PROCEDURE',
  description: 'Cataract Surgery',
  amount: 50000,
  quantity: 1
});

// 5. Discharge patient
await ipdService.dischargePatient(admission.id, {
  dischargeDate: '2025-11-28',
  dischargeTime: '10:00',
  dischargeSummary: 'Surgery successful. Patient stable.',
  dischargeType: 'NORMAL',
  finalDiagnosis: 'Cataract - Operated',
  followUpDate: '2025-12-05',
  medications: [
    {
      medicineName: 'Moxifloxacin Eye Drops',
      dosage: '1 drop',
      frequency: '4 times daily',
      duration: '7 days',
      instructions: 'Apply to operated eye'
    }
  ]
});
```

### Master Data Usage Example
```typescript
import { masterDataService } from '@/services';

// Search for drugs with autocomplete
const drugs = await masterDataService.searchDrugs('moxi', 'ANTIBIOTIC', 10);

// Get chief complaints by category
const visionComplaints = await masterDataService.getChiefComplaints('VISION');

// Search ICD codes
const icdCodes = await masterDataService.searchICDCodes('cataract', 'ICD-10');

// Get advice template
const postOpAdvice = await masterDataService.getAdviceTemplates('POST_OPERATIVE', 'CATARACT');
```

## API Configuration

The base API URL is configured in `.env`:
```
VITE_API_BASE_URL=http://localhost:8080
```

All requests go through the API Gateway at port 8080, which routes to:
- Patient Service (8081)
- Appointment Service (8082)
- Consultation Service (8083)
- Billing Service (8084)
- Notification Service (8085)
- IPD Service (8086)
- Admin Service (8087)
- Master Data Service (8088)

## Authentication

JWT tokens are automatically included in all requests via axios interceptors:
```typescript
// In api.ts
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Error Handling

All services use consistent error handling:
- **401 Unauthorized** - Automatic redirect to login
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **409 Conflict** - Duplicate resource
- **422 Unprocessable Entity** - Validation error
- **500 Internal Server Error** - Server error

## Best Practices

1. **Always use TypeScript types** - Import types from services for type safety
2. **Use React Query** - For caching, background updates, and loading states
3. **Handle errors gracefully** - Show user-friendly error messages
4. **Use pagination** - For large datasets to improve performance
5. **Implement optimistic updates** - For better UX with mutations
6. **Cache master data** - Chief complaints, drugs, etc. change infrequently
7. **Debounce search inputs** - For autocomplete fields to reduce API calls
8. **Use filters effectively** - Pass only necessary filters to reduce response size

## File Structure

```
services/
├── api.ts                      # Axios client configuration
├── authService.ts              # Authentication
├── patientService.ts           # Patient management
├── appointmentService.ts       # Appointments
├── consultationService.ts      # Clinical operations
├── billingService.ts           # Billing & payments
├── notificationService.ts      # Notifications
├── ipdService.ts              # IPD management (NEW)
├── adminService.ts            # System administration (NEW)
├── masterDataService.ts       # Clinical master data (NEW)
├── index.ts                   # Service exports
└── README.md                  # This file
```

## Contributing

When adding new service methods:
1. Follow the established naming convention
2. Add proper TypeScript types for request/response
3. Include JSDoc comments explaining the method's purpose
4. Update this README with the new method
5. Add error handling for common scenarios
6. Consider pagination for list endpoints
