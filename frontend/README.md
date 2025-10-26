# PdfGateway - Supplier Portal Frontend

A React + TypeScript + Tailwind CSS frontend for the PdfGateway supplier portal.

## Features

- **PDF Upload**: Suppliers can upload PDF files for conversion
- **File Management**: View all uploaded files with status tracking
- **Download Results**: Download converted files when ready
- **Authentication**: JWT-based authentication with role-based access
- **Responsive Design**: Mobile-first design that works on all devices

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Zustand** for state management

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── FileTable.tsx   # File list table
│   ├── StatusBadge.tsx # Status indicator
│   └── UploadCard.tsx  # PDF upload form
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state
├── hooks/              # Custom React hooks
│   └── useSupplierFiles.ts # File management hook
├── lib/                # Utilities and configurations
│   └── api.ts         # Axios configuration
├── pages/              # Page components
│   ├── LoginPage.tsx  # Login page
│   └── SupplierDashboardPage.tsx # Main dashboard
├── types/              # TypeScript type definitions
│   └── api.ts         # API response types
├── utils/              # Utility functions
│   ├── dateUtils.ts   # Date formatting
│   └── fileUtils.ts   # File download utilities
├── App.tsx            # Main app component
├── main.tsx           # App entry point
└── index.css          # Global styles
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

3. **Build for Production**
   ```bash
   npm run build
   ```

## API Integration

The frontend expects a backend API with the following endpoints:

### Authentication
- `POST /api/auth/login` - User login
  - Request: `{ username: string, password: string }`
  - Response: `{ token: string, role: string, username: string }`

### File Management
- `POST /api/files/upload` - Upload PDF file
  - Request: `multipart/form-data` with `pdfFile`
  - Response: `{ fileId: string, status: string, message: string }`

- `GET /api/files` - Get user's files
  - Response: `Array<{ id: string, status: string, createdAtUtc: string, convertedAvailable: boolean, convertedSizeKB: number, failureReason?: string }>`

- `GET /api/files/{id}/download` - Download converted file
  - Response: PDF file binary

## Authentication Flow

1. User visits `/dashboard` without authentication
2. Redirected to `/login` page
3. After successful login, redirected back to `/dashboard`
4. JWT token stored in localStorage
5. Axios interceptor adds `Authorization: Bearer <token>` to all requests

## Key Components

### SupplierDashboardPage
Main dashboard page that:
- Checks authentication and redirects if needed
- Displays welcome message with username
- Shows upload form and file list in responsive grid
- Handles file refresh after successful uploads

### UploadCard
PDF upload component that:
- Validates file type (PDF only)
- Shows upload progress
- Displays success/error messages
- Triggers file list refresh on success

### FileTable
File management component that:
- Displays files in a clean table format
- Shows status badges (Success/Pending/Failed)
- Handles file downloads
- Shows file size and creation date

### useSupplierFiles Hook
Custom hook that:
- Manages file list state
- Handles API calls to fetch files
- Provides refresh functionality
- Manages loading and error states

## Styling

The app uses Tailwind CSS with a clean, professional design:
- Soft shadows and rounded corners
- Neutral color palette
- Responsive grid layout
- Mobile-first approach
- Accessible form controls

## Error Handling

- Network errors are caught and displayed to users
- File validation prevents invalid uploads
- Authentication errors redirect to login
- Loading states provide user feedback

## Browser Support

- Modern browsers with ES2020 support
- Mobile browsers (iOS Safari, Chrome Mobile)
- Desktop browsers (Chrome, Firefox, Safari, Edge)
