# Demo Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173`

## Testing the Application

### Mock Login (No Backend Required)
The application now works completely without a backend:

1. Go to `/login`
2. Enter any username and password
3. Click "Sign in"
4. You'll be redirected to the supplier dashboard with a 1-second loading simulation

### Testing File Upload
1. On the dashboard, try uploading a PDF file
2. The upload will simulate a 2-second processing time
3. You'll see a success message: "File uploaded successfully! (Demo mode)"
4. The file validation works - try uploading a non-PDF file to see the error

### Testing File List
1. The file list will show 3 sample files with different statuses:
   - One "Success" file (ready for download)
   - One "Pending" file (still processing)
   - One "Failed" file (with error message)
2. Try clicking "Download PDF" on the successful file to see the mock download
3. All functionality works without requiring a backend server

## Backend Integration

To connect with a real backend:

1. Update the API base URL in `src/lib/api.ts`
2. Implement the actual login endpoint in `src/pages/LoginPage.tsx`
3. Ensure your backend matches the API contracts defined in `src/types/api.ts`

## API Endpoints Expected

- `POST /api/auth/login` - Returns `{ token, role, username }`
- `POST /api/files/upload` - Accepts multipart PDF file
- `GET /api/files` - Returns array of file objects
- `GET /api/files/{id}/download` - Returns PDF binary

## Features Implemented

✅ **Authentication Flow**
- Login page with form validation
- JWT token storage and management
- Role-based access control
- Automatic redirects

✅ **PDF Upload**
- File type validation (PDF only)
- Upload progress indication
- Success/error messaging
- Automatic file list refresh

✅ **File Management**
- Responsive file table
- Status badges (Success/Pending/Failed)
- File download functionality
- Date formatting
- File size display

✅ **UI/UX**
- Clean, professional design
- Mobile-responsive layout
- Loading states
- Error handling
- Accessible form controls

✅ **Code Quality**
- TypeScript with strict typing
- Custom hooks for state management
- Reusable components
- Proper error boundaries
- Clean code structure
