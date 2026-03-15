# Quick Start Guide

## 30-Second Setup

### Step 1: Install & Run
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Step 2: Configure Environment
Create `.env.local` with your MongoDB URI and email settings (see `.env.example`)

### Step 3: Access the App
- **App**: http://localhost:3000
- **Landing Page**: Shows all 4 roles

## Create Test Accounts

### 1. Student Account
1. Go to `/auth/register`
2. Enter:
   - Name: `John Student`
   - Email: `student@test.com`
   - Password: `password123`
   - Student ID: `STU001`
   - Role: Student
3. Click Create Account → Login

### 2. Admin Account
1. Go to `/auth/register`
2. Enter:
   - Name: `Admin User`
   - Email: `admin@test.com`
   - Password: `password123`
   - Role: Admin
3. Click Create Account → Login to Admin Dashboard

### 3. Assign Registrar Role
1. Login as Admin
2. Click "Management" → "Users" tab
3. Find first user
4. Click "Edit Role" → Select "Registrar"
5. Click "Update Role"

### 4. Assign Revenue Role
1. Repeat step 3 for another user but select "Revenue"

### 5. Registrar Account (Optional)
- Register as Student first, then Admin can change role to Registrar
- Or register directly as Admin role, then Admin changes to Registrar

## Test the Workflow

### As Student
1. Login to http://localhost:3000/dashboard
2. Click "Submit Request"
3. Fill form:
   - Request Type: Document
   - Document Type: Transcript
   - Delivery Method: Email
   - Upload a payment file (any file)
4. Submit → See tracking number
5. View on "My Requests" list

### As Registrar
1. Login to http://localhost:3000/registrar
2. See incoming requests in table
3. Click "Review"
4. Add delivery date and notes
5. Click "Approve" or "Reject"

### As Revenue
1. Login to http://localhost:3000/revenue
2. See approved requests
3. Click "Review"
4. Click "Verify & Generate Receipt"
5. Payment is now verified

### Track Public
1. Go to http://localhost:3000/track/{tracking-number}
2. View request status (public access, no login needed)

## Features Quick Demo

### Generate QR Code
1. Request must be APPROVED (by Registrar)
2. Student views request → "View Details"
3. Approved requests show QR code
4. QR code can be downloaded/shared

### Email Notifications
1. When Registrar approves/rejects → Email sent to student
2. Requires Gmail account with app-specific password
3. Check `/lib/email.ts` for email configuration

### PDF Download
1. Approved requests can be downloaded as PDF
2. Student sees "Download PDF" button
3. PDF contains request details

### Admin Dashboard
1. See total users, requests by role
2. Manage users (edit role, delete)
3. View all requests across system
4. System statistics

## Database Collections

After creating requests, check MongoDB collections:

```bash
# Connect to MongoDB
mongosh

# Use the database
use document

# Check collections
show collections

# View data
db.users.find()
db.requests.find()
db.notifications.find()
```

## Environment Variables

Update `.env.local`:

```env
# Required
MONGODB_URI=mongodb://localhost:27017/document
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# For Email (optional, but some features need it)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Your App Name <your-email@gmail.com>
```

## Troubleshooting

### "Please define the MONGODB_URI"
- App now loads without MongoDB
- But requests will fail without connection
- Add to `.env.local`: `MONGODB_URI=mongodb://localhost:27017/document`

### "Cannot connect to database"
- Ensure MongoDB is running: `mongod`
- Check connection string
- Verify database exists

### "Email not sending"
- Gmail requires app-specific password
- Enable "Less secure apps" (deprecated) or use app password
- Check SMTP settings

### "Page not found"
- Make sure you're logged in for protected routes
- Check role matches route requirements:
  - /dashboard → Student only
  - /admin → Admin only
  - /registrar → Registrar only
  - /revenue → Revenue only

## API Testing with cURL

### Get All Requests
```bash
curl http://localhost:3000/api/requests \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Request
```bash
curl -X POST http://localhost:3000/api/requests \
  -H "Content-Type: application/json" \
  -d '{"requestType":"DOCUMENT","documentType":"TRANSCRIPT","deliveryMethod":"EMAIL"}'
```

### Get Stats
```bash
curl http://localhost:3000/api/admin/stats
```

## What's Included

✅ 4 User Roles (Student, Admin, Registrar, Revenue)
✅ Request Management & Tracking
✅ Payment Verification Workflow
✅ Email Notifications
✅ QR Code Generation
✅ PDF Document Generation
✅ Public Tracking (no login)
✅ Role-Based Dashboards
✅ User Management
✅ System Statistics
✅ Full-Stack Next.js + MongoDB
✅ Authentication with NextAuth.js
✅ Tailwind CSS UI

## Next Steps

1. **Add Payment Gateway**: Integrate Stripe/PayPal
2. **Deploy to Vercel**: `vercel deploy`
3. **Use MongoDB Atlas**: Replace local MongoDB
4. **Send Real Emails**: Setup SendGrid/Mailgun
5. **Add File Upload**: Setup AWS S3 or similar
6. **Create Admin Panel**: Customize for your institution
7. **Mobile App**: Build React Native version
8. **Advanced Analytics**: Add charts and reports

## File Locations

| What | Where |
|------|-------|
| Database Models | `/lib/models/*.ts` |
| API Routes | `/app/api/**/*.ts` |
| Pages | `/app/**/page.tsx` |
| Components | `/components/**/*.tsx` |
| Styles | `/app/globals.css` |
| Config | `.env.local` |
| Auth | `/lib/auth.ts` |
| Documentation | `/*.md` |

## Default Behavior

- **New Users**: Registered as Student by default
- **Tracking Numbers**: Auto-generated, unique per request
- **Delivery Method**: Defaults to Email
- **Request Status**: Starts as PENDING
- **Payment Verification**: Defaults to false
- **Roles**: Can only be changed by Admin

## Commands

```bash
# Start development
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Check linting
pnpm lint

# Run TypeScript check
pnpm tsc --noEmit
```

## Testing Checklist

- [ ] Register as Student
- [ ] Submit document request
- [ ] View tracking page
- [ ] Login as Admin
- [ ] Assign Registrar role
- [ ] Login as Registrar
- [ ] Approve request
- [ ] Verify payment as Revenue
- [ ] Download approved document
- [ ] Check email received

## Support

- Full documentation: See `SETUP.md`
- Project overview: See `PROJECT_SUMMARY.md`
- All changes: See `CHANGES.md`
- Source code: Browse `/app` and `/lib`

## Key Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/requests` | GET | List requests |
| `/api/requests` | POST | Create request |
| `/api/admin/users` | GET | List users |
| `/api/admin/users/[id]` | PUT | Update user role |
| `/api/admin/stats` | GET | System statistics |
| `/api/revenue/verify/[id]` | POST | Verify payment |
| `/api/documents/[id]/qrcode` | GET | Generate QR |
| `/api/documents/[id]/pdf` | GET | Generate PDF |

---

**You're all set! Start with `pnpm dev` and explore at http://localhost:3000** 🚀
