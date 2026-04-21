# TrainerClientsOverview Component

This component has been refactored from a single large file into smaller, more manageable components for better maintainability and readability.

## Structure

### Main Component
- **`index.tsx`** - Main TrainerClientsOverview component that orchestrates all sub-components and manages state

### Sub-components
- **`ClientsHeader.tsx`** - Header with title, export button, search input, and filter dropdown
- **`ClientCard.tsx`** - Individual client card with avatar, client info, subscription details, and actions
- **`ClientDetailsModal.tsx`** - Modal for viewing detailed client information including progress data
- **`ClientFilters.tsx`** - Search and filter controls (integrated into header)

### Utilities
- **`utils.ts`** - Helper functions for date formatting, age calculation, BMI calculation, status colors, and Excel export

## Key Features

- **Client Management**: View, search, and filter trainer's clients
- **Detailed Information**: Comprehensive client data display including subscription details, goals, and progress
- **Progress Tracking**: Display weight, body fat, BMI, and measurements
- **Export Functionality**: Export filtered clients to Excel with Arabic headers
- **Search & Filter**: Real-time search by name/email and filter by status
- **Responsive Design**: Mobile-friendly layout and interactions
- **Status Management**: Visual status indicators for client activity
- **Goals Display**: Show client fitness goals (weight loss, muscle gain, endurance)

## State Management

The main component manages the following state:
- `clients` - Array of all clients
- `loading` - Loading state for data fetching
- `error` - Error state for API calls
- `searchTerm` - Current search input value
- `filterStatus` - Current filter status (all/active/inactive/banned)
- `isViewOpen` - Visibility of client details modal
- `viewLoading` - Loading state for client details
- `viewUser` - Selected client for detailed view
- `viewProgress` - Progress data for selected client

## Props

All sub-components accept props for their specific functionality:
- **ClientsHeader**: `onExport`, `searchTerm`, `onSearchChange`, `filterStatus`, `onFilterChange`
- **ClientCard**: `client`, `formatDateShort`, `calcAge`, `getStatusColor`, `getStatusText`, `onViewDetails`
- **ClientDetailsModal**: `isViewOpen`, `viewLoading`, `viewUser`, `viewProgress`, `userViewFields`, `formatDate`, `calcAge`, `calcBMI`, `onClose`

## Utilities

The `utils.ts` module provides:
- `formatDate` - Format date in Arabic locale
- `formatDateShort` - Format date as short string
- `calcAge` - Calculate age from date of birth
- `calcBMI` - Calculate BMI from weight and height
- `getStatusColor` - Get status color classes based on client status
- `getStatusText` - Get status text in Arabic
- `handleExport` - Export clients to Excel with Arabic headers

## Dependencies

- React hooks (useState, useEffect, useMemo)
- Custom hooks (useAuth)
- TypeScript types (User, TrainerClientApiResponse)
- Services (UserService, ProgressService)
- Navigation hooks (useRouter, usePathname)
- XLSX library for Excel export functionality

## Data Flow

1. **Initial Load**: Fetches trainer's clients based on trainer ID
2. **Search & Filter**: Real-time filtering of clients based on search term and status
3. **Client Selection**: Click to view detailed client information
4. **Progress Data**: Fetches latest progress data for selected client
5. **Export**: Export filtered clients to Excel with proper Arabic formatting

## Modal System

- **ClientDetailsModal**: Comprehensive client information display with:
  - Basic info (name, email, phone, avatar)
  - Subscription details (start/end dates, status, payments)
  - Physical data (weight, height, BMI, body fat)
  - Goals and measurements
  - User metadata and activity logs

## Client Fields

The component displays comprehensive client information:
- **Basic Info**: Name, email, phone, avatar
- **Subscription**: Start/end dates, status, balance, loyalty points
- **Physical Data**: Weight, height, BMI, body fat percentage
- **Goals**: Fitness goals (weight loss, muscle gain, endurance)
- **Measurements**: Custom body measurements
- **Activity**: Login history, IP address, creation/update dates

## Backup

The original `TrainerClientsOverview.tsx` file has been backed up as `TrainerClientsOverview.tsx.backup` before refactoring.
