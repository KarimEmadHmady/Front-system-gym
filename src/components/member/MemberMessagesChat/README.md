# MemberMessagesChat Component

This component has been refactored from a single large file into smaller, more manageable components for better maintainability and readability.

## Structure

### Main Component
- **`index.tsx`** - Main MemberMessagesChat component that orchestrates all sub-components and manages state

### Sub-components
- **`ChatHeader.tsx`** - Chat header with trainer info and action buttons
- **`MessageList.tsx`** - Messages container with date separators and message bubbles
- **`MessageInput.tsx`** - Message input field with send button

### Utilities
- **`utils.ts`** - Helper functions for formatting dates, times, and message status

## Key Features

- **Real-time Chat**: Live messaging between member and trainer
- **Message Status**: Visual indicators for read/unread messages
- **Auto-scroll**: Smart scrolling to bottom on new messages
- **Date Separators**: Visual separation between different days
- **Message Actions**: Edit and delete options for own messages
- **Responsive Design**: Mobile-friendly layout and interactions
- **Error Handling**: Comprehensive error display and retry functionality

## State Management

The main component manages the following state:
- `messages` - Array of chat messages
- `trainer` - Current trainer information
- `loading` - Loading state for initial data fetch
- `error` - Error state for data fetching
- `newMessage` - Current input message text
- `sending` - Loading state for message sending
- `showChatActions` - Visibility of chat action menu
- `selectedMessage` - Currently selected message for actions
- `showMessageActions` - Visibility of message action menu

## Props

All sub-components accept props for their specific functionality:
- **ChatHeader**: `trainer`, `onShowChatActions`
- **MessageList**: `messages`, `currentUser`, `trainer`, formatting functions, and action handlers
- **MessageInput**: `newMessage`, `onMessageChange`, `onSendMessage`, `sending`

## Utilities

The `utils.ts` module provides:
- `formatTime` - Formats time in 24-hour Arabic format
- `formatDate` - Formats date with "Today"/"Yesterday"/full date logic
- `isMyMessage` - Checks if message belongs to current user
- `getMessageStatus` - Returns message status for display

## Dependencies

- React hooks (useState, useEffect, useRef)
- Lucide React icons (Send, MoreVertical, Phone, Video, Edit, Trash2)
- Custom hooks (useAuth)
- Services (messageService, userService)
- TypeScript types (Message, User)

## Message Flow

1. **Initial Load**: Fetches trainer info and chat history
2. **Real-time Updates**: Auto-scrolls to new messages
3. **Read Status**: Automatically marks messages as read
4. **Send Messages**: Creates new messages with optimistic updates
5. **Message Actions**: Edit and delete functionality for own messages

## Backup

The original `MemberMessagesChat.tsx` file has been backed up as `MemberMessagesChat.tsx.backup` before refactoring.
