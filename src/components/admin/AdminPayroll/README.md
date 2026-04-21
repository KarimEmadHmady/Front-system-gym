# AdminPayroll Component Structure

This folder contains the refactored AdminPayroll component, split into smaller, maintainable components for better readability and organization.

## Components

### `index.tsx`
Main AdminPayroll component that orchestrates all sub-components and manages state.

### `PayrollFilters.tsx`
Handles all filtering and search controls for payroll data.
- **Props**: employeeId, roleFilter, from, to, sort, loading, payrollUsers, and various onChange handlers
- **Features**: Employee selection, role filtering, date range filtering, sorting, and export functionality

### `PayrollForm.tsx`
Manages both create and edit forms for payroll entries.
- **Props**: form data, selectedId, payrollUsers, loading, and form handlers
- **Features**: Dynamic form that switches between create and edit modes based on selectedId

### `PayrollTable.tsx`
Displays payroll data in a tabular format with actions.
- **Props**: displayedRows, selectedId, loading, error, userMap, and action handlers
- **Features**: Sortable table with view and delete actions for each payroll entry

### `PayrollSummary.tsx`
Shows summary cards and monthly breakdown of payroll data.
- **Props**: summary data, totalPayrollAll, count
- **Features**: Summary cards showing totals, date range, and monthly breakdown table

### `PayrollModal.tsx`
Modal for viewing detailed payroll information.
- **Props**: viewOpen, viewDoc, userMap, and modal handlers
- **Features**: Detailed view of payroll entry with edit capability

### `PayrollPagination.tsx`
Handles pagination controls for the payroll table.
- **Props**: skip, limit, count, loading, and pagination handlers
- **Features**: Previous/Next navigation with page information display

## Benefits of Refactoring

1. **Better Maintainability**: Each component has a single responsibility
2. **Improved Readability**: Smaller, focused components are easier to understand
3. **Reusability**: Components can be reused in other parts of the application
4. **Easier Testing**: Individual components can be tested in isolation
5. **Better Developer Experience**: Easier to locate and modify specific functionality

## Usage

The main AdminPayroll component is imported and used the same way as before:
```tsx
import AdminPayroll from '@/components/admin/AdminPayroll';
```

All functionality remains exactly the same as the original component, including:
- Employee payroll management
- Filtering and searching
- Excel export functionality
- Summary statistics
- Pagination
- Create, read, update, delete operations

## State Management

The main component (`index.tsx`) manages all state and passes down necessary data and handlers to child components through props. This maintains a clear data flow and makes the application easier to debug and maintain.
