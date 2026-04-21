# TrainerPlansOverview Component

This component has been refactored from a single large file into smaller, more manageable components for better maintainability and readability.

## Structure

### Main Component
- **`index.tsx`** - Main TrainerPlansOverview component that orchestrates all sub-components and manages state

### Sub-components
- **`PlansHeader.tsx`** - Header with title and create buttons for workout/diet plans
- **`PlansTabs.tsx`** - Tab navigation between workout and diet plans
- **`WorkoutPlanCard.tsx`** - Card displaying workout plan details and actions
- **`DietPlanCard.tsx`** - Card displaying diet plan details
- **`CreateWorkoutModal.tsx`** - Modal for creating new workout plans
- **`CreateDietModal.tsx`** - Modal for creating new diet plans
- **`EditWorkoutModal.tsx`** - Modal for editing existing workout plans
- **`DeleteConfirmModal.tsx`** - Modal for confirming plan deletion

### Utilities
- **`utils.ts`** - Helper functions for formatting and displaying plan information

## Key Features

- **Dual Plan Management**: Support for both workout and diet plans
- **Client Filtering**: Only shows plans for trainer's assigned clients
- **Tab Navigation**: Easy switching between workout and diet plans
- **CRUD Operations**: Complete create, read, update, delete functionality
- **Image Support**: Handle exercise images with file uploads and URL display
- **Responsive Design**: Mobile-friendly layout and modals
- **Search Functionality**: Filter clients by name, email, or phone
- **Exercise Management**: Add, edit, and remove exercises with images
- **Meal Management**: Create diet plans with multiple meals
- **Status Indicators**: Visual feedback for plan status and difficulty

## State Management

The main component manages the following state:
- `activeTab` - Current active tab ('workout' or 'diet')
- `workoutPlans` - Array of workout plans
- `dietPlans` - Array of diet plans
- `loading`/`dietLoading` - Loading states for data fetching
- `error`/`dietError` - Error states for API calls
- `showCreateModal`/`showEditModal`/`showDeleteModal` - Modal visibility states
- `form*` states - Form data for creating/editing plans
- `myClients` - Array of trainer's assigned clients
- `memberSearch` - Search term for filtering clients
- `userNameMap` - Cached user names for display

## Props

All sub-components accept props for their specific functionality:
- **PlansHeader**: `activeTab`, `onShowCreateModal`, `onShowCreateDietModal`
- **PlansTabs**: `activeTab`, `workoutPlans`, `dietPlans`, `onTabChange`, `dietLoading`, `dietError`
- **WorkoutPlanCard**: `plan`, `userNameMap`, utility functions, `onEdit`, `onDelete`
- **DietPlanCard**: `plan`, `userNameMap`, utility functions, `onEdit`, `onDelete`
- **CreateWorkoutModal**: All form states, `myClients`, `memberSearch`, and handler functions
- **CreateDietModal**: All diet form states and handler functions
- **EditWorkoutModal**: All form states for editing and update handler
- **DeleteConfirmModal**: `showDeleteModal`, `onShowDeleteModal`, `onDeletePlan`

## Utilities

The `utils.ts` module provides:
- `getTypeText` - Convert plan type to Arabic text
- `getDifficultyColor` - Get CSS classes for difficulty levels
- `getDifficultyText` - Convert difficulty to Arabic text
- `getStatusColor` - Get CSS classes for plan status
- `getStatusText` - Convert status to Arabic text

## Dependencies

- React hooks (useState, useEffect, useMemo)
- Custom hooks (useAuth)
- TypeScript types (WorkoutPlan, DietPlan)
- Services (workoutService, userService, dietService)
- No external icon libraries (using emoji for icons)

## Data Flow

1. **Initial Load**: Fetches trainer's clients and their plans
2. **Client Filtering**: Filters plans to only show trainer's assigned clients
3. **Tab Switching**: Handles switching between workout and diet plan views
4. **Plan Creation**: Creates new plans with exercises/meals and images
5. **Plan Editing**: Updates existing plans with new data
6. **Plan Deletion**: Removes plans with confirmation
7. **Image Handling**: Manages exercise images with file uploads and previews

## Modal System

- **Create Workout Modal**: Form with client selection, plan details, and exercise management
- **Create Diet Modal**: Form with client selection, plan details, and meal management
- **Edit Workout Modal**: Pre-populated form for updating existing plans
- **Delete Confirmation Modal**: Safety confirmation before plan deletion

## Exercise Management

- **Dynamic Exercise List**: Add/remove exercises with real-time updates
- **Image Support**: Upload new images or use existing URLs
- **Exercise Preview**: Click to view exercise images in new window
- **Form Validation**: Required fields and proper data types

## Meal Management

- **Meal Creation**: Add multiple meals with calories and quantities
- **Meal Details**: Each meal has name, calories, quantity, and notes
- **Dynamic List**: Add/remove meals with real-time updates
- **Form Validation**: Required meal name and calorie count

## Search and Filtering

- **Client Search**: Filter by name, email, or phone number
- **Plan Filtering**: Only show plans for assigned clients
- **Real-time Updates**: Search results update as you type
- **Case Insensitive**: Search ignores case for better UX

## Responsive Design

- **Mobile Layout**: Collapsible modals and adjusted grid layouts
- **Tablet Support**: Medium screen optimizations
- **Desktop Layout**: Full grid and modal layouts
- **Touch Friendly**: Proper button sizes and spacing

## Performance Optimizations

- **Memoized Values**: Cached computed values with useMemo
- **Efficient Filtering**: Optimized client and plan filtering
- **Lazy Loading**: Only load data when needed
- **Image Optimization**: Proper image handling and cleanup

## Error Handling

- **API Errors**: Comprehensive error display and retry options
- **Form Validation**: Client-side validation with helpful error messages
- **Network Issues**: Graceful handling of connection problems
- **User Feedback**: Clear error messages in Arabic

## Backup

The original `TrainerPlansOverview.tsx` file has been backed up as `TrainerPlansOverview.tsx.backup` before refactoring.
