# TrainerAttendance Component

This component has been refactored from a single large file into smaller, more manageable components for better maintainability and readability.

## Structure

### Main Component
- **`index.tsx`** - Main TrainerAttendance component that orchestrates all sub-components and manages state

### Sub-components
- **`AttendanceHeader.tsx`** - Header with title, export button, and add record button
- **`MyAttendanceRecords.tsx`** - Display trainer's own attendance records with status indicators
- **`ClientAttendanceRecords.tsx`** - Display client selection dropdown and attendance records
- **`AttendanceModal.tsx`** - Modal for adding new attendance records
- **`AttendancePagination.tsx`** - Reusable pagination component for both my and client records
- **`AttendanceCard.tsx`** - Individual attendance record card with date, time, status, and notes

### Utilities
- **`utils.ts`** - Helper functions for export functionality and status information

## Key Features

- **Dual Attendance Views**: Separate sections for trainer's own records and client records
- **Real-time Updates**: Automatic data loading and state management
- **Excel Export**: Export functionality for both my records and client records
- **Pagination**: Reusable pagination for both record types
- **Status Management**: Visual indicators for attendance status (present/absent/excused)
- **Modal System**: Add new attendance records with form validation
- **Responsive Design**: Mobile-friendly layout and interactions
- **Error Handling**: Comprehensive error display and retry functionality

## State Management

The main component manages the following state:
- `myRecords` - Array of trainer's attendance records
- `clientRecords` - Array of selected client's attendance records
- `clients` - Array of all clients/members
- `selectedClient` - Currently selected client for viewing their records
- `loading` - Loading state for data fetching
- `error` - Error state for API calls
- Pagination states: `myRecordsPage`, `clientRecordsPage`
- Modal states: `addModalOpen`, `adding`, `addForm`
- `itemsPerPage` - Number of items per page (10)

## Props

All sub-components accept props for their specific functionality:
- **AttendanceHeader**: `onExport`, `onAddRecord`
- **MyAttendanceRecords**: `myRecords`, `currentMyRecords`, `getStatusInfo`
- **ClientAttendanceRecords**: `clients`, `selectedClient`, `clientRecords`, `currentClientRecords`, `loading`, `error`, `getStatusInfo`, `onClientChange`
- **AttendanceModal**: `addModalOpen`, `addForm`, `adding`, `onClose`, `onFormChange`, `onSave`
- **AttendancePagination**: `currentPage`, `totalPages`, `startIndex`, `endIndex`, `totalItems`, `onPageChange`, `type`
- **AttendanceCard**: `record`, `client`, `getStatusInfo`, `showClientInfo`

## Utilities

The `utils.ts` module provides:
- `handleExport` - Export records to Excel with Arabic headers
- `handleExportClientRecords` - Export client records with client name in filename
- `getStatusInfo` - Get status icon, color, and text based on attendance status

## Dependencies

- React hooks (useState, useEffect, useMemo)
- Lucide React icons (UserCheck, FileText, Plus, Users, CheckCircle, XCircle, AlertCircle, Calendar, Clock, ChevronLeft, ChevronRight)
- Custom hooks (useAuth)
- Services (AttendanceService, UserService)
- TypeScript types (AttendanceRecord, User)
- XLSX library for Excel export functionality

## Data Flow

1. **Initial Load**: Fetches trainer info, clients, and attendance records
2. **Client Selection**: Dropdown to select client and view their records
3. **Record Management**: Add new attendance records with form validation
4. **Pagination**: Navigate through pages of records for both trainer and client
5. **Export**: Export records to Excel files with proper Arabic formatting
6. **Status Updates**: Real-time status indicators and error handling

## Modal System

- **AttendanceModal**: Form with date, time, status dropdown, and notes field
- **Form Validation**: Required fields and proper data formatting
- **Loading States**: Visual feedback during API calls

## Backup

The original `TrainerAttendance.tsx` file has been backed up as `TrainerAttendance.tsx.backup` before refactoring.
