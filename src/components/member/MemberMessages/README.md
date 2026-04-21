# MemberMessages Component

This component has been refactored from a single large file into smaller, more manageable components for better maintainability and readability.

## Structure

### Main Component
- **`index.tsx`** - Main MemberMessages component that orchestrates all sub-components and manages state

### Sub-components
- **`MessagesHeader.tsx`** - Header with title and send message button
- **`MessagesFilters.tsx`** - Search and filter controls for messages
- **`MessageCard.tsx`** - Individual message card with sender/receiver info and actions
- **`MessageViewModal.tsx`** - Modal for viewing full message details
- **`SendMessageModal.tsx`** - Modal for composing and sending new messages
- **`EditMessageModal.tsx`** - Modal for editing existing messages
- **`DeleteConfirmModal.tsx`** - Confirmation modal for message deletion

### Utilities
- **`utils.ts`** - Helper functions for user info and date formatting

## Key Features

- **Message Management**: View, send, edit, and delete messages
- **Search & Filter**: Search by name/phone and filter by read status
- **Real-time Updates**: Automatic message loading and status updates
- **Modal System**: Multiple modals for different message actions
- **Responsive Design**: Mobile-friendly layout and interactions
- **Error Handling**: Comprehensive error display and retry functionality
- **User Identification**: Smart user name/email/phone resolution

## State Management

The main component manages the following state:
- `messages` - Array of all messages
- `trainer` - Current trainer information
- `loading` - Loading state for data fetching
- `error` - Error state for API calls
- `searchTerm` - Current search input
- `filterStatus` - Current filter status (all/read/unread)
- Modal states: `showMessagePopup`, `showSendModal`, `showEditModal`, `showDeleteConfirm`
- Form states: `newMessage`, `editMessage`, `sending`

## Props

All sub-components accept props for their specific functionality:
- **MessagesHeader**: `trainer`, `onShowSendModal`
- **MessagesFilters**: `searchTerm`, `filterStatus`, change handlers
- **MessageCard**: Message data, user info, utility functions, action handlers
- **MessageViewModal**: Message data, user info, utility functions, action handlers
- **SendMessageModal**: Form data, trainer info, action handlers
- **EditMessageModal**: Form data, message data, action handlers
- **DeleteConfirmModal**: Message data, action handlers

## Utilities

The `utils.ts` module provides:
- `getUserName` - Resolves user ID to name (trainer/current user/fallback)
- `getUserEmail` - Resolves user ID to email
- `getUserPhone` - Resolves user ID to phone number
- `formatDate` - Formats date in Arabic locale

## Dependencies

- React hooks (useState, useEffect)
- Lucide React icons (Mail, MailOpen, Edit, Trash2, Search, Filter, Calendar, User, MessageSquare, Send, X, AlertTriangle)
- Custom hooks (useAuth)
- Services (messageService, userService)
- TypeScript types (Message, User)

## Message Flow

1. **Initial Load**: Fetches trainer info and message history
2. **Search & Filter**: Real-time filtering of messages
3. **View Messages**: Click to view full message details
4. **Send Messages**: Create new messages with form validation
5. **Edit Messages**: Modify existing message content
6. **Delete Messages**: Remove messages with confirmation
7. **Status Updates**: Automatic read status marking

## Modal System

- **MessageViewModal**: Display full message with sender info
- **SendMessageModal**: Compose new message to trainer
- **EditMessageModal**: Edit existing message content
- **DeleteConfirmModal**: Confirm message deletion with preview

## Backup

The original `MemberMessages.tsx` file has been backed up as `MemberMessages.tsx.backup` before refactoring.
