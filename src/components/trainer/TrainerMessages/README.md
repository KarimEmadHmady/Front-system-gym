# TrainerMessages Component

This component has been refactored from a single large file into smaller, more manageable components for better maintainability and readability.

## Structure

### Main Component
- **`index.tsx`** - Main TrainerMessages component that orchestrates all sub-components and manages state

### Sub-components
- **`MessagesHeader.tsx`** - Header with title and create message button
- **`MessagesFilters.tsx`** - Search input and status filter dropdown
- **`MessageTable.tsx`** - Table displaying messages with sender/receiver info and actions
- **`CreateMessageModal.tsx`** - Modal for creating new messages
- **`EditMessageModal.tsx`** - Modal for editing existing messages
- **`ViewMessageModal.tsx`** - Modal for viewing detailed message information
- **`DeleteConfirmModal.tsx`** - Modal for confirming message deletion

### Utilities
- **`utils.ts`** - Helper functions for user info and date formatting

## Key Features

- **Message Management**: Create, view, edit, delete, and mark messages as read
- **Real-time Search**: Filter messages by name, email, or phone
- **Status Filtering**: Filter messages by read/unread status
- **User Management**: Display trainer's members only
- **Responsive Design**: Mobile-friendly layout and interactions
- **Error Handling**: Comprehensive error display and recovery
- **Loading States**: Visual feedback during data operations
- **Modal System**: Multiple modals for different message operations

## State Management

The main component manages the following state:
- `messages` - Array of all messages
- `members` - Array of trainer's members
- `loading` - Loading state for data fetching
- `error` - Error state for API calls
- `searchTerm` - Current search input value
- `filterStatus` - Current filter status (all/read/unread)
- `showCreateModal` - Visibility of create message modal
- `showEditModal` - Visibility of edit message modal
- `showDeleteModal` - ID of message to delete
- `showViewModal` - Currently viewed message
- `editingMessage` - Message being edited
- `newMessage` - Form data for new message

## Props

All sub-components accept props for their specific functionality:
- **MessagesHeader**: `onShowCreateModal`
- **MessagesFilters**: `searchTerm`, `onSearchChange`, `filterStatus`, `onFilterChange`
- **MessageTable**: `filteredMessages`, `currentUser`, `getUserName`, `getUserEmail`, `getUserPhone`, `formatDate`, `onViewMessage`, `onMarkAsRead`, `onEditMessage`, `onDeleteMessage`
- **CreateMessageModal**: `showCreateModal`, `newMessage`, `members`, `onShowCreateModal`, `onNewMessageChange`, `onCreateMessage`
- **EditMessageModal**: `showEditModal`, `editingMessage`, `onShowEditModal`, `onEditingMessageChange`, `onEditMessage`
- **ViewMessageModal**: `showViewModal`, `getUserName`, `getUserEmail`, `formatDate`, `onShowViewModal`
- **DeleteConfirmModal**: `showDeleteModal`, `onShowDeleteModal`, `onDeleteMessage`

## Utilities

The `utils.ts` module provides:
- `getUserName` - Get user name by ID with fallback to current user
- `getUserEmail` - Get user email by ID with fallback to current user
- `getUserPhone` - Get user phone by ID with fallback to current user
- `formatDate` - Format date in Arabic locale with proper formatting

## Dependencies

- React hooks (useState, useEffect)
- Custom hooks (useAuth)
- TypeScript types (Message, User)
- Services (messageService, userService)
- Lucide React icons (Mail, MailOpen, Plus, Edit, Trash2, Search, Filter, Calendar, User, MessageSquare)

## Data Flow

1. **Initial Load**: Fetches trainer's members and messages between trainer and members
2. **Search & Filter**: Real-time filtering of messages based on search term and status
3. **Message Operations**: Create, edit, delete, and mark as read operations
4. **Modal Management**: Show/hide appropriate modals based on user actions
5. **Auto-refresh**: Data refreshes after any successful operation

## Message Filtering

The component supports multiple filtering options:
- **Search**: Filter by sender name, receiver name, email, or phone
- **Status**: Filter by read/unread status
- **Combined**: Both search and status filters work together

## Modal System

- **Create Modal**: Form with member selection, subject, and message content
- **Edit Modal**: Form for editing existing message subject and content
- **View Modal**: Detailed view of message with sender/receiver info and metadata
- **Delete Modal**: Confirmation dialog before message deletion

## Permission System

The component implements proper permission checks:
- Only trainer's own messages can be edited or deleted
- Only messages received by trainer can be marked as read
- All messages can be viewed by trainer

## Error Handling

Comprehensive error handling includes:
- Network errors during data fetching
- Validation errors during form submissions
- Permission errors during unauthorized operations
- User-friendly error messages in Arabic

## Backup

The original `TrainerMessages.tsx` file has been backed up as `TrainerMessages.tsx.backup` before refactoring.
