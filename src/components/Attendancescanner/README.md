# Attendancescanner Component

This component has been refactored from a single large file into smaller, more manageable components for better maintainability and readability.

## Structure

### Main Component
- **`index.tsx`** - Main AttendanceScanner component that orchestrates all sub-components and manages state

### Sub-components
- **`Header.tsx`** - Header component with navigation buttons and title
- **`ScannerCard.tsx`** - Barcode scanner input and controls
- **`StatsCard.tsx`** - Today's attendance summary display
- **`StatusBadge.tsx`** - Reusable status badge component
- **`StatusIcon.tsx`** - Reusable status icon component
- **`Popup.tsx`** - Popup notification component for scan results
- **`UserAttendanceModal.tsx`** - Modal for displaying user attendance history

### Utilities
- **`soundUtils.ts`** - Audio feedback utilities for scan results
- **`errorTranslator.ts`** - Error message translation utilities

## Key Features

- **Barcode Scanning**: Supports both USB HID scanners and manual input
- **QR Code Scanning**: Camera-based QR code scanning
- **Offline Support**: Queues attendance records when offline
- **Real-time Updates**: Live attendance summary and recent scans
- **Audio Feedback**: Sound notifications for scan results
- **User Attendance History**: Detailed view of individual attendance records

## State Management

The main component manages the following state:
- `barcode` - Current barcode input
- `isScanning` - Scanning status
- `todaySummary` - Today's attendance summary
- `recentScans` - Recent scan records
- `showQRScanner` - QR scanner modal visibility
- `popup` - Current popup notification
- `isOnline` - Network connectivity status
- `userAttendanceModal` - User attendance modal state

## Props

The main `AttendanceScanner` component accepts:
- `userId: string` - Current user ID
- `role: 'admin' | 'manager'` - User role
- `showVideoTutorial?: boolean` - Whether to show video tutorial
- `videoId?: string` - Video tutorial ID

## Dependencies

- React hooks (useState, useEffect, useCallback, useRef)
- Lucide React icons
- Custom hooks (useAuth, useBarcodeScanner)
- Services (attendanceScanService, queueAttendance)
- UI components (LoadingSpinner, VideoTutorial, QRCodeScanner)

## Backup

The original `Attendancescanner.tsx` file has been backed up as `Attendancescanner.tsx.backup` before refactoring.
