# ManagerReports Component

This component has been refactored from a single large file into smaller, more manageable components for better maintainability and readability.

## Structure

### Main Component
- **`index.tsx`** - Main ManagerReports component that orchestrates all sub-components and manages state

### Sub-components
- **`ReportCategories.tsx`** - Report category selection interface with icons and descriptions
- **`UsersReport.tsx`** - Users statistics and latest users table
- **`SessionsReport.tsx`** - Sessions statistics and sessions table
- **`PlansReport.tsx`** - Plans statistics and latest workout/diet plans tables
- **`AttendanceReport.tsx`** - Attendance statistics and attendance records table
- **`LoyaltyReport.tsx`** - Loyalty points statistics and top users table
- **`FinancialReport.tsx`** - Financial summary and payroll statistics
- **`ExportOptions.tsx`** - Excel export functionality for all report types

### Utilities
- **`userUtils.ts`** - User data management and caching functions

## Key Features

- **Multi-Report System**: Supports users, sessions, plans, attendance, loyalty, and financial reports
- **Real-time Statistics**: Dynamic stats calculation for each report type
- **Data Export**: Excel export functionality for all report types
- **Responsive Design**: Mobile-friendly layout and tables
- **Error Handling**: Comprehensive error display and loading states
- **Data Caching**: User data caching for performance optimization

## State Management

The main component manages to following state:
- `activeReport` - Currently selected report type
- **Financial Data**: `financialSummary`, `financialLoading`, `financialError`, `payrollData`, `payrollLoading`, `payrollError`
- **Users Data**: `users`, `usersLoading`, `usersError`, `usersLoaded`
- **Sessions Data**: `sessions`, `sessionsLoading`, `sessionsError`
- **Plans Data**: `workoutPlans`, `dietPlans`, `plansLoading`, `plansError`
- **Attendance Data**: `attendanceRecords`, `attendanceLoading`, `attendanceError`
- **Loyalty Data**: Handled by `useLoyaltyStats` hook

## Props

All sub-components accept props for their specific functionality:
- **ReportCategories**: `activeReport`, `setActiveReport`
- **Report Components**: Data arrays, loading states, error states, computed stats, and `getUserInfo` utility
- **ExportOptions**: Current report type and all data arrays for export

## Dependencies

- React hooks (useState, useEffect, useMemo, useCallback)
- Lucide React icons
- Custom hooks (useLoyaltyStats, useCustomAlert)
- Services (SessionScheduleService, WorkoutService, DietService, AttendanceService, UserService, payrollService)
- Utilities (apiGet, XLSX)
- TypeScript types (User, various response types)

## User Utilities

The `userUtils.ts` module provides:
- `setUsersCache` - Updates the cached users array
- `getUserInfo` - Retrieves user name and phone by ID with fallback for unknown users

## Report Types

1. **Users Report**: Member statistics, growth metrics, and latest members table
2. **Sessions Report**: Session statistics and detailed sessions table
3. **Plans Report**: Workout and diet plan statistics with latest plans tables
4. **Attendance Report**: Attendance statistics, top performers, and attendance records table
5. **Loyalty Report**: Loyalty points statistics and top users by points
6. **Financial Report**: Monthly financial summary and payroll statistics

## Export Functionality

Each report type supports Excel export with appropriate Arabic headers:
- Users: Name, Email, Phone, Status, Registration Date, Role
- Sessions: Type, User, Trainer, Date, Times, Duration, Price, Location, Status, Description
- Plans: Type, Plan Name, User, Phone, Start Date, End Date
- Attendance: Name, Phone, Date, Status
- Loyalty: Name, Phone, Loyalty Points

## Backup

The original `ManagerReports.tsx` file has been backed up as `ManagerReports.tsx.backup` before refactoring.
