# AdminSettings Component Structure

This folder contains the refactored AdminSettings component, split into smaller, maintainable components for better readability and organization.

## Components

### `index.tsx`
Main AdminSettings component that orchestrates all sub-components and manages state.

### `FileInput.tsx`
Reusable file input component with preview and remove functionality.
- **Props**: onChange, onRemove, accept, className, label, currentFile, currentUrl
- **Features**: File upload with preview, remove button, and customizable styling

### `GymSettingsForm.tsx`
Handles gym basic information settings (name, logo, address, phone, email, working hours).
- **Props**: settings, loading, saving, uploadedLogo, onSettingsChange, onLogoChange, onLogoRemove, onSave
- **Features**: Form validation, file upload for logo, and save functionality

### `PasswordChangeForm.tsx`
Handles password change functionality with validation.
- **Props**: onSave, disabled
- **Features**: Password validation, error display, and form submission

### `SocialLinksForm.tsx`
Handles social media links configuration.
- **Props**: settings, onChange
- **Features**: Support for Facebook, Instagram, Twitter, TikTok, YouTube

### `PoliciesForm.tsx`
Handles policy documents (terms, privacy, refund).
- **Props**: settings, onChange
- **Features**: Text areas for policy content with proper styling

## Benefits of Refactoring

1. **Better Maintainability**: Each component has a single responsibility
2. **Improved Readability**: Smaller, focused components are easier to understand
3. **Reusability**: Components can be reused in other parts of the application
4. **Easier Testing**: Individual components can be tested in isolation
5. **Better Developer Experience**: Easier to locate and modify specific functionality

## Usage

The main AdminSettings component is imported and used the same way as before:
```tsx
import AdminSettings from '@/components/admin/AdminSettings';
```

All functionality remains exactly the same as the original component, including:
- Gym settings management (name, logo, address, phone, email, working hours)
- Social media links configuration
- Policy documents management
- Password change functionality
- File upload with preview
- Form validation and error handling
- Save functionality with proper feedback

## State Management

The main component (`index.tsx`) manages all state and passes down necessary data and handlers to child components through props. This maintains a clear data flow and makes the application easier to debug and maintain.

## Data Flow

1. Main component loads and manages all data
2. GymSettingsForm handles basic gym information
3. SocialLinksForm handles social media configuration
4. PoliciesForm handles policy documents
5. PasswordChangeForm handles password changes
6. FileInput provides reusable file upload functionality
7. All components share common data through props from the main component

## Key Features Preserved

- **Form Validation**: Comprehensive validation for all form fields
- **File Upload**: Logo upload with preview and remove functionality
- **Password Security**: Secure password change with validation
- **Responsive Design**: Mobile-friendly layout with proper breakpoints
- **Error Handling**: Comprehensive error states and user feedback
- **Type Safety**: All interfaces and props properly typed
- **Accessibility**: Proper labels and semantic HTML structure
