# Document Management System - Setup Guide

## Overview

This is a comprehensive **Next.js 16** full-stack application for managing academic document requests and ID replacements. The system supports multiple user roles with different capabilities:

- **Students**: Submit requests, upload payments, track status
- **Admin**: Manage users, assign roles, view system statistics
- **Registrar**: Review requests, approve/reject, generate letters
- **Revenue**: Verify payments, issue receipts, manage delivery

## Prerequisites

1. **Node.js** (v18+)
2. **MongoDB** (local or cloud instance)
3. **npm** or **pnpm** (package manager)

## Installation

### 1. Install Dependencies

```bash
pnpm install
```

This installs all required packages including:
- `mongoose` for MongoDB
- `next-auth` for authentication
- `bcryptjs` for password hashing
- `nodemailer` for email notifications
- `jspdf` & `html2canvas` for PDF generation
- `qrcode.react` for QR code generation

### 2. Configure Environment Variables

Copy the example environment file and update with your credentials:

```bash
cp .env.example .env.local
```

Then update `.env.local` with:

```
MONGODB_URI=mongodb://localhost:27017/document
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM="App Name <your-email@gmail.com>"
```

### 3. Start MongoDB

Make sure MongoDB is running:

```bash
# On macOS with Homebrew
brew services start mongodb-community

# Or run directly
mongod
```

### 4. Run the Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: string,
  email: string (unique),
  password: string (hashed),
  studentId: string (optional, for students),
  role: 'student' | 'admin' | 'registrar' | 'revenue',
  createdAt: Date,
  updatedAt: Date
}
```

### Requests Collection
```javascript
{
  _id: ObjectId,
  studentId: ObjectId (ref User),
  requestType: 'ID_REPLACEMENT' | 'DOCUMENT',
  documentType: 'TRANSCRIPT' | 'CERTIFICATE' | 'ENROLLMENT_LETTER' | 'RECOMMENDATION_LETTER',
  status: 'PENDING' | 'PROCESSING' | 'APPROVED' | 'REJECTED',
  paymentFile: string (optional),
  paymentVerified: boolean,
  deliveryMethod: 'EMAIL' | 'POSTAL',
  deliveryDate: Date (optional),
  registrarNotes: string (optional),
  trackingNumber: string (unique),
  createdAt: Date,
  updatedAt: Date
}
```

### Notifications Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref User),
  message: string,
  read: boolean,
  requestId: ObjectId (ref Request, optional),
  createdAt: Date
}
```

### Letters Collection
```javascript
{
  _id: ObjectId,
  requestId: ObjectId (ref Request, unique),
  fileURL: string,
  sentToRevenue: boolean,
  generatedAt: Date,
  createdAt: Date
}
```

### Receipts Collection
```javascript
{
  _id: ObjectId,
  requestId: ObjectId (ref Request, unique),
  fileURL: string,
  paymentVerifiedAt: Date,
  generatedBy: ObjectId (ref User),
  createdAt: Date
}
```

## Key Features

### Student Portal
- Submit ID replacement or document requests
- Upload payment proof
- Track request status with unique tracking numbers
- Choose delivery method (Email/Postal)
- View request history
- Download approved documents with QR codes

### Admin Dashboard
- View system statistics (users, requests by role)
- Manage all users (add, update, delete)
- Assign roles to users (Student, Registrar, Revenue)
- Monitor all document requests
- Filter requests by status

### Registrar Dashboard
- View incoming student requests
- Verify uploaded payment documents
- Approve or reject requests
- Set delivery dates
- Add notes/comments
- Auto-generate formal letters
- View request statistics

### Revenue Dashboard
- View approved requests from Registrar
- Verify payments and generate receipts
- Track payment verification status
- Monitor delivery status
- Accept/reject payment requests

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth callback

### Document Requests
- `GET /api/requests` - Get requests (filtered by role)
- `POST /api/requests` - Create new request
- `GET /api/requests/[id]` - Get request details
- `PUT /api/requests/[id]` - Update request status
- `GET /api/requests/stats` - Get request statistics

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/[id]` - Update user role
- `DELETE /api/admin/users/[id]` - Delete user
- `GET /api/admin/stats` - Get system statistics

### Revenue
- `GET /api/revenue/stats` - Get revenue statistics
- `POST /api/revenue/verify/[id]` - Verify payment

### Documents
- `GET /api/documents/[id]/qrcode` - Generate QR code
- `POST /api/documents/[id]/notify` - Send email notification
- `GET /api/documents/[id]/pdf` - Generate PDF

## Routes & Protected Access

### Public Routes
- `/` - Landing page
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/track/[trackingNumber]` - Public tracking (no auth required)

### Protected Routes
- `/dashboard` - Student dashboard (requires student role)
- `/admin` - Admin dashboard (requires admin role)
- `/registrar` - Registrar dashboard (requires registrar role)
- `/revenue` - Revenue dashboard (requires revenue role)

## Testing the System

### 1. Create Test Accounts

**Student Account:**
- Email: student@example.com
- Password: password123
- Role: Student
- Student ID: STU123456

**Admin Account:**
- Email: admin@example.com
- Password: password123
- Role: Admin

**Registrar Account:**
- Email: registrar@example.com
- Password: password123
- Role: Registrar

**Revenue Account:**
- Email: revenue@example.com
- Password: password123
- Role: Revenue

### 2. Test Workflow

1. Login as Student
2. Submit document request with payment proof
3. Login as Admin, assign Registrar role to a user
4. Login as Registrar, review and approve request
5. Login as Admin, assign Revenue role to a user
6. Login as Revenue, verify payment
7. Track request using public tracking page

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env.local`
- Verify connection string format

### Email Not Sending
- Ensure Gmail app-specific password is generated
- Check `EMAIL_USER` and `EMAIL_PASS` are correct
- Verify SMTP settings

### Authentication Errors
- Clear browser cookies
- Restart dev server
- Check `NEXTAUTH_SECRET` is set

## Production Deployment

1. Generate a strong `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

2. Use environment variables from your hosting provider (Vercel, etc.)

3. Connect to MongoDB Atlas or managed MongoDB service

4. Deploy with:
   ```bash
   pnpm build
   pnpm start
   ```

## Project Structure

```
/app
  /api              - API routes
  /auth            - Authentication pages
  /admin           - Admin dashboard
  /registrar       - Registrar dashboard
  /revenue         - Revenue dashboard
  /dashboard       - Student dashboard
  /track           - Public tracking
/components
  /ui              - shadcn/ui components
  /admin           - Admin components
  /registrar       - Registrar components
  /revenue         - Revenue components
  /student         - Student components
  /auth            - Auth components
/lib
  /models          - Mongoose schemas
  auth.ts          - NextAuth configuration
  db.ts            - MongoDB connection
  email.ts         - Email utilities
  pdf.ts           - PDF generation utilities
```

## Technologies Used

- **Framework**: Next.js 16
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Password Hashing**: bcryptjs
- **Email**: Nodemailer
- **PDF**: jsPDF + html2canvas
- **QR Codes**: qrcode.react

## Support

For issues or questions, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Mongoose Documentation](https://mongoosejs.com/)
