# AdminReports Component Structure

This folder contains the refactored AdminReports component, split into smaller, maintainable components for better readability and organization.

## Components

### `index.tsx`
Main AdminReports component that orchestrates all sub-components and manages state.

### `ReportCategories.tsx`
Displays the report category buttons for users to select different report types.
- **Props**: reports array, activeReport, onSetActiveReport
- **Features**: Grid layout of report categories with icons and descriptions

### `FinancialReport.tsx`
Shows financial statistics and summaries including revenue, expenses, profit, and payroll.
- **Props**: financialSummary, financialLoading, financialError, payrollData
- **Features**: Financial summary cards with growth indicators

### `UsersReport.tsx`
Displays user statistics and a table of recent users.
- **Props**: users, usersLoading, usersError, usersLoaded, userStats
- **Features**: User statistics cards and recent users table

### `SessionsReport.tsx`
Shows session statistics and training session data.
- **Props**: sessionsLoading, sessionsError, sessionStats
- **Features**: Session statistics cards showing total, completed, upcoming, and revenue

### `PlansReport.tsx`
Displays workout and diet plan statistics with tables.
- **Props**: plansLoading, plansError, plansStats, getUserInfo
- **Features**: Plan statistics cards and separate tables for workout and diet plans

### `AttendanceReport.tsx`
Shows attendance statistics and top members by attendance.
- **Props**: attendanceLoading, attendanceError, attendanceStats, getUserInfo
- **Features**: Attendance statistics cards and top members table

### `LoyaltyReport.tsx`
Displays loyalty points statistics and top users.
- **Props**: loyaltyLoading, loyaltyStats
- **Features**: Loyalty statistics cards and ranked users table

### `ExportOptions.tsx`
Handles Excel export functionality for all report types.
- **Props**: activeReport, all data arrays, getUserInfo, alert functions
- **Features**: Dynamic export based on active report type with proper formatting

## Benefits of Refactoring

1. **Better Maintainability**: Each component has a single responsibility
2. **Improved Readability**: Smaller, focused components are easier to understand
3. **Reusability**: Components can be reused in other parts of the application
4. **Easier Testing**: Individual components can be tested in isolation
5. **Better Developer Experience**: Easier to locate and modify specific functionality

## Usage

The main AdminReports component is imported and used the same way as before:
```tsx
import AdminReports from '@/components/admin/AdminReports';
```

All functionality remains exactly the same as the original component, including:
- Multiple report types (Financial, Users, Sessions, Plans, Attendance, Loyalty)
- Real-time data loading and statistics
- Excel export functionality for all report types
- Responsive design and dark mode support
- Error handling and loading states

## State Management

The main component (`index.tsx`) manages all state and passes down necessary data and handlers to child components through props. This maintains a clear data flow and makes the application easier to debug and maintain.

## Data Flow

1. Main component loads and manages all data
2. ReportCategories handles user selection of report type
3. Based on selection, appropriate report component is rendered
4. ExportOptions provides export functionality for the active report
5. All components share common data through props from the main component
