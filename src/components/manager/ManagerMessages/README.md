# ManagerMessages Component

This component has been refactored from a single large file into smaller, more manageable components for better maintainability and readability.

## Structure

### Main Component
- **`index.tsx`** - Main ManagerMessages component that orchestrates all sub-components and manages state

### Sub-components
- **`MessageHeader.tsx`** - Header component with title and create message button
- **`MessageStats.tsx`** - Statistics display showing total, read, and unread messages
- **`MessageFilters.tsx`** - Search and filter controls for messages
- **`MessageTable.tsx`** - Table displaying filtered messages with actions
- **`CreateMessageModal.tsx`** - Modal for creating new messages
- **`EditMessageModal.tsx`** - Modal for editing existing messages
- **`DeleteMessageModal.tsx`** - Confirmation modal for deleting messages
- **`ViewMessageModal.tsx`** - Modal for viewing detailed message information

### Utilities
- **`userUtils.ts`** - Helper functions for user data management and caching

## Key Features

- **Message Management**: Create, read, edit, and delete messages
- **Search & Filter**: Search by name or phone, filter by read/unread status
- **User Information**: Display sender and recipient details
- **Statistics**: Real-time stats for total, read, and unread messages
- **Responsive Design**: Mobile-friendly layout and modals
- **Error Handling**: Comprehensive error display and handling

## State Management

The main component manages the following state:
- `messages` - Array of all messages
- `users` - Array of all users for dropdown selection
- `loading` - Loading state for data fetching
- `error` - Error state for displaying error messages
- `searchTerm` - Current search input value
- `filterStatus` - Current filter status ('all' | 'read' | 'unread')
- `showCreateModal` - Create modal visibility
- `showEditModal` - Edit modal visibility
- `showDeleteModal` - Delete modal visibility (stores message ID)
- `showViewModal` - View modal visibility (stores message object)
- `editingMessage` - Currently editing message object
- `newMessage` - New message form data

## Props

All sub-components accept props for their specific functionality:
- **MessageHeader**: `onCreateMessage` callback
- **MessageStats**: `messages` array
- **MessageFilters**: Current filter values and change handlers
- **MessageTable**: Filtered messages and action handlers
- **Modals**: Visibility state, data, and action handlers

## Dependencies

- React hooks (useState, useEffect)
- Lucide React icons
- Custom hooks (useAuth)
- Services (messageService, userService)
- TypeScript types (Message, User)

## User Utilities

The `userUtils.ts` module provides:
- `setUsersCache` - Updates the cached users array
- `getUserName` - Retrieves user name by ID
- `getUserEmail` - Retrieves user email by ID
- `getUserPhone` - Retrieves user phone by ID

## Backup

The original `ManagerMessages.tsx` file has been backed up as `ManagerMessages.tsx.backup` before refactoring.
