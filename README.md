# Document Management System

A comprehensive web application for managing academic document requests with approval workflows, QR code generation, and email notifications.

## Features

- **Student Portal**: Request documents, track status in real-time
- **Admin Dashboard**: Review and approve/reject document requests
- **QR Code Generation**: Generate QR codes for approved documents
- **Email Notifications**: Automatic email updates on request status changes
- **PDF Generation**: Download approved documents as PDFs
- **Public Tracking**: Track documents using tracking number (no login required)
- **Role-based Access**: Separate interfaces for students and admins

## Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Email**: Nodemailer with Gmail SMTP
- **Additional**: QR Code generation, PDF generation, bcryptjs for password hashing

## Prerequisites

- Node.js 18+ and npm/pnpm
- MongoDB instance (local or cloud like MongoDB Atlas)
- Gmail account with app password for email notifications (optional)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd document-management
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your configuration:
   ```
   MONGODB_URI=your-mongodb-connection-string
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=generate-a-secure-random-string
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASSWORD=your-app-specific-password
   ```

   To generate NEXTAUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## User Roles

### Student
- Create document requests
- View request status and history
- Generate QR codes for approved documents
- Download approved documents as PDF
- Cancel pending requests
- Track documents publicly using tracking number

### Admin
- View all document requests
- Approve/reject requests with optional reason
- Send email notifications
- View dashboard with request statistics

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/[...nextauth]` - NextAuth authentication

### Documents
- `GET /api/documents` - Get user's documents (students) or all documents (admins)
- `POST /api/documents` - Create new document request
- `GET /api/documents/[id]` - Get specific document
- `PUT /api/documents/[id]` - Update document status (admin only)
- `DELETE /api/documents/[id]` - Delete document (students only, pending requests)

### Premium Features
- `GET /api/documents/[id]/qrcode` - Generate QR code for approved document
- `GET /api/documents/[id]/pdf` - Download document as PDF
- `POST /api/documents/[id]/notify` - Send status notification email (admin only)

## Public Routes

- `/` - Home page
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/track/[trackingNumber]` - Public document tracking

## Protected Routes

- `/dashboard` - Student dashboard
- `/admin` - Admin dashboard

## Database Schema

### User Collection
- `email` - Unique email address
- `password` - Hashed password
- `name` - Full name
- `role` - 'student' or 'admin'
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

### DocumentRequest Collection
- `studentId` - Reference to User
- `studentName` - Name of requesting student
- `documentType` - Type of document (transcript, certificate, etc.)
- `description` - Detailed description
- `purpose` - Purpose of the request
- `quantity` - Number of copies
- `status` - Request status (pending, approved, rejected, completed)
- `paymentStatus` - Payment status (unpaid, paid)
- `amount` - Document cost
- `rejectionReason` - Reason if rejected
- `approvedBy` - Admin ID if approved
- `approvedAt` - Approval timestamp
- `qrCode` - QR code data URL
- `trackingNumber` - Unique tracking number
- `createdAt` - Request creation timestamp
- `updatedAt` - Last update timestamp

## Email Configuration

### Setting up Gmail SMTP

1. Enable 2-Factor Authentication in your Gmail account
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use the app password in `EMAIL_PASSWORD` environment variable

## Development

### File Structure
```
app/
├── api/                    # API routes
├── auth/                   # Authentication pages
├── admin/                  # Admin dashboard
├── dashboard/              # Student dashboard
├── track/                  # Public tracking
└── page.tsx               # Home page

components/
├── auth/                   # Authentication components
├── student/                # Student components
└── admin/                  # Admin components

lib/
├── db.ts                  # MongoDB connection
├── auth.ts                # Authentication config
├── models/                # Database models
├── email.ts              # Email utilities
└── pdf.ts                # PDF generation utilities

middleware.ts             # Route protection middleware
```

## Future Enhancements

- Payment gateway integration
- Document templates
- Bulk document requests
- Advanced analytics
- Document archiving
- API rate limiting
- Two-factor authentication
- Document versioning

## License

MIT
