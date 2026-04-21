# AdminSearch Component Structure

This folder contains the refactored AdminSearch component, split into smaller, maintainable components for better readability and organization.

## Components

### `index.tsx`
Main AdminSearch component that orchestrates all sub-components and manages state.

### `SearchFilters.tsx`
Handles all filtering and search controls for financial transactions.
- **Props**: filters, users, showAdvanced, and various handler functions
- **Features**: Basic filters (type, user, date range) and advanced filters (invoice number, status, category, payment method, sort, amount range, limit)

### `SearchResults.tsx`
Displays search results in a tabular format with export functionality.
- **Props**: loading, error, visibleResults, totalCount, pagination info, getUserInfo, onExportToExcel
- **Features**: Results table with type icons, user info, and export button

### `SearchPagination.tsx`
Handles pagination controls for search results.
- **Props**: currentPage, totalPages, startIndex, endIndex, totalCount, onPageChange
- **Features**: Previous/Next navigation with page information display

## Benefits of Refactoring

1. **Better Maintainability**: Each component has a single responsibility
2. **Improved Readability**: Smaller, focused components are easier to understand
3. **Reusability**: Components can be reused in other parts of the application
4. **Easier Testing**: Individual components can be tested in isolation
5. **Better Developer Experience**: Easier to locate and modify specific functionality

## Usage

The main AdminSearch component is imported and used the same way as before:
```tsx
import AdminSearch from '@/components/admin/AdminSearch';
```

All functionality remains exactly the same as the original component, including:
- Advanced search filters with basic and advanced modes
- Real-time search with debouncing
- Results display with type icons and user information
- Pagination with client-side slicing
- Excel export functionality
- Error handling and loading states

## State Management

The main component (`index.tsx`) manages all state and passes down necessary data and handlers to child components through props. This maintains a clear data flow and makes the application easier to debug and maintain.

## Data Flow

1. Main component loads and manages all data
2. SearchFilters handles user input and filter changes
3. Based on filters, searchResults displays filtered data
4. SearchPagination handles page navigation
5. SearchExport provides Excel export functionality
6. All components share common data through props from the main component

## Key Features Preserved

- **Advanced Filtering**: Basic and advanced filter modes with comprehensive options
- **Real-time Search**: Debounced search with automatic execution
- **Excel Export**: Full export functionality with proper formatting
- **Pagination**: Client-side pagination with visual controls
- **Type Safety**: All interfaces and props properly typed
- **Responsive Design**: Mobile-friendly layout with proper breakpoints
- **Error Handling**: Comprehensive error states and user feedback
