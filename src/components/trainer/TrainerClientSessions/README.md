# TrainerClientSessions Component

This component has been refactored from a single large file into smaller, more manageable components for better maintainability and readability.

## Structure

### Main Component
- **`index.tsx`** - Main TrainerClientSessions component that orchestrates all sub-components and manages state

### Sub-components
- **`SessionsHeader.tsx`** - Header with title, revenue display, create session and export buttons
- **`SessionsTabs.tsx`** - Tab navigation for filtering sessions (all/today/upcoming/completed)
- **`SessionCard.tsx`** - Individual session card with client info, details, and actions
- **`SessionModal.tsx`** - Modal for creating new training sessions
- **`EditSessionModal.tsx`** - Modal for editing existing training sessions
- **`SessionsPagination.tsx`** - Reusable pagination component for session lists

### Utilities
- **`utils.ts`** - Helper functions for status colors, user info, type icons, and Excel export

## Key Features

- **Session Management**: Create, view, edit, and update status of training sessions
- **Tab Filtering**: Filter sessions by status (all/today/upcoming/completed)
- **Revenue Tracking**: Calculate and display total revenue from sessions
- **Excel Export**: Export filtered sessions with Arabic headers
- **Pagination**: Navigate through pages of session records
- **Status Management**: Update session status (مجدولة/مكتملة/ملغاة)
- **Client Information**: Display client details with phone and name
- **Session Types**: Support for different session types (شخصية/جماعية/أونلاين/تغذية)
- **Responsive Design**: Mobile-friendly layout and interactions
- **Error Handling**: Comprehensive error display and alert system

## State Management

The main component manages the following state:
- `sessions` - Array of all training sessions
- `clients` - Array of clients/members
- `loading` - Loading state for data fetching
- `activeTab` - Current active tab for filtering
- `showCreateModal` - Visibility of create session modal
- `showEditModal` - Visibility of edit session modal
- `selectedSession` - Currently selected session for editing
- `isSubmitting` - Loading state for form submissions
- `currentPage` - Current page for pagination
- `formData` - Form data for create/edit operations

## Props

All sub-components accept props for their specific functionality:
- **SessionsHeader**: `totalRevenue`, `onShowCreateModal`, `onExport`
- **SessionsTabs**: `activeTab`, `setActiveTab`, `sessions`
- **SessionCard**: `session`, `getUserName`, `getUserPhone`, `getStatusColor`, `getStatusText`, `getTypeIcon`, `onEdit`, `onUpdateStatus`
- **SessionModal**: `showCreateModal`, `formData`, `isSubmitting`, `clients`, `onClose`, `onFormChange`, `onSubmit`
- **EditSessionModal**: `showEditModal`, `formData`, `onClose`, `onFormChange`, `onSubmit`
- **SessionsPagination**: `currentPage`, `totalPages`, `startIndex`, `endIndex`, `totalItems`, `onPageChange`

## Utilities

The `utils.ts` module provides:
- `handleExport` - Export sessions to Excel with Arabic headers and client info
- `getStatusColor` - Get status color classes based on session status
- `getStatusText` - Get status text (already in Arabic)
- `getUserName` - Resolve user ID to name with fallback
- `getUserPhone` - Resolve user ID to phone number
- `getTypeIcon` - Get emoji icon for session type

## Dependencies

- React hooks (useState, useEffect)
- Lucide React icons (UserCheck, DollarSign, Plus, FileText, Calendar, Clock, ChevronLeft, ChevronRight)
- Custom hooks (useCustomAlert, useConfirmationDialog, useAuth)
- Services (SessionScheduleService, userService)
- TypeScript types (SessionSchedule, User)
- XLSX library for Excel export functionality
- Custom UI components (CustomAlert, ConfirmationDialog)

## Data Flow

1. **Initial Load**: Fetches trainer sessions and clients data
2. **Tab Filtering**: Filter sessions based on selected tab (all/today/upcoming/completed)
3. **Session Creation**: Create new sessions with form validation
4. **Session Editing**: Edit existing session details
5. **Status Updates**: Update session status (مجدولة/مكتملة/ملغاة)
6. **Pagination**: Navigate through paginated session lists
7. **Export**: Export filtered sessions to Excel with proper Arabic formatting

## Modal System

- **SessionModal**: Form with client selection, date/time, session type, price, and description
- **EditSessionModal**: Similar form for editing existing sessions
- **Form Validation**: Required fields and time validation
- **Loading States**: Visual feedback during API calls

## Session Types

The component supports four session types:
- **شخصية** (Personal) - 👤
- **جماعية** (Group) - 👥
- **أونلاين** (Online) - 💻
- **تغذية** (Nutrition) - 🥗

## Backup

The original `TrainerClientSessions.tsx` file has been backed up as `TrainerClientSessions.tsx.backup` before refactoring.
