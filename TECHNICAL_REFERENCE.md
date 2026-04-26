# IITG Affairs Portal - Comprehensive Technical Reference

**Version**: 1.0 | **Last Updated**: April 2026 | **Framework**: MERN Stack

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Authentication & Security](#authentication--security)
5. [Database Schema](#database-schema)
6. [API Reference](#api-reference)
7. [Module Breakdown](#module-breakdown-with-code)
8. [Middleware & Utilities](#middleware--utilities)
9. [File Upload Handling](#file-upload-handling)
10. [Deployment & Configuration](#deployment--configuration)

---

## Architecture Overview

### System Design Pattern

The IITG Affairs Portal uses a **Modular Monolith** architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  Student UI  │  │  Faculty UI   │  │   Admin UI   │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│         │                  │                  │                  │
│         └──────────────────┼──────────────────┘                  │
│                            │ Axios (HTTP)                        │
│                            ▼                                      │
├──────────────────────────────────────────────────────────────────┤
│              Backend (Express 5 + Node.js)                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  API Router (/api/*)                                     │   │
│  │  ├─ /auth ──────► AuthController                         │   │
│  │  ├─ /student ──► StudentController                       │   │
│  │  ├─ /courses ──► CourseController                        │   │
│  │  ├─ /admin ────► AdminController                         │   │
│  │  └─ /hmc ──────► HMCController                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Middleware Pipeline                                     │   │
│  │  └─ authenticate → authorizeRoles → controller → handler │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  29 Controllers (Business Logic)                         │   │
│  │  31 Route Modules (Endpoint Definition)                  │   │
│  │  31 Mongoose Models (Data Layer)                         │   │
│  └──────────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│              MongoDB (Document Database)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Collections (31): User, Course, Enrollment, etc.        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Core Architectural Principles

| Principle | Implementation |
|-----------|-----------------|
| **Single Responsibility** | Each controller handles one domain; models define single entity types |
| **Separation of Concerns** | Routes → Controllers → Models; middleware for cross-cutting concerns |
| **Fail-Secure** | Authorization checks deny by default; explicit allow only |
| **Stateless API** | JWT tokens carry all required auth state; no server-side sessions |
| **Race Condition Protection** | Atomic database operations for critical resources (enrollment capacity) |

---

## Technology Stack

### Frontend Dependencies

```json
{
  "react": "^19.2.5",           // UI library
  "react-router-dom": "^7.14.2", // Client-side routing
  "axios": "^1.15.2",           // HTTP client
  "tailwindcss": "^4.2.4",      // Utility CSS framework
  "vite": "^8.0.10"             // Build tool & dev server
}
```

**Build Output**: Optimized SPA served as static files; Vite proxies API requests to backend.

### Backend Dependencies

```json
{
  "express": "^5.2.1",              // HTTP framework
  "mongoose": "^9.5.0",             // MongoDB ODM
  "jsonwebtoken": "^9.0.3",         // JWT token generation
  "bcryptjs": "^3.0.3",             // Password hashing
  "multer": "^2.1.1",               // File upload middleware
  "express-rate-limit": "^8.4.0",   // Rate limiting
  "pdfkit": "^0.18.0",              // PDF generation
  "csv-parse": "^6.2.1",            // CSV parsing
  "cookie-parser": "^1.4.7",        // Cookie handling
  "cors": "^2.8.6"                  // CORS support
}
```

**Node Version**: 16+ | **MongoDB Version**: 4.4+ (5.0+ recommended)

---

## Project Structure

```
backend/
├── server.js                      # Entry point; MongoDB + server init
├── app.js                         # Express app setup; middleware & route mounts
├── package.json
├── controllers/                   # 29 business logic files
│   ├── authController.js          # Login, logout, password reset
│   ├── studentAdminController.js  # Bulk import, CSV parsing
│   ├── enrollmentController.js    # Enrollment logic (atomic ops)
│   ├── facultyCourseController.js # Grade submission, attendance
│   └── ... (26 more)
├── models/                        # 31 Mongoose schemas
│   ├── User.js                    # User account (base)
│   ├── StudentProfile.js          # Student-specific details
│   ├── FacultyProfile.js          # Faculty-specific details
│   ├── CourseOffering.js          # Instance of a course in semester
│   ├── Enrollment.js              # Student-CourseOffering junction
│   ├── Assignment.js              # Assignment metadata + base64 file
│   ├── Submission.js              # Student assignment submission
│   ├── AttendanceSession.js       # Per-class attendance record
│   ├── LeaveRequest.js            # Hostel leave application
│   ├── Complaint.js               # Maintenance/facility complaint
│   ├── TranscriptRequest.js       # PDF transcript request
│   └── ... (20 more)
├── routes/                        # 31 route definition modules
│   ├── auth.js                    # POST /api/auth/login, etc.
│   ├── courses.js                 # GET/POST /api/courses
│   ├── enrollment.js              # POST /api/enrollment (atomic)
│   ├── admin.js                   # Admin CRUD operations
│   └── ... (27 more)
├── middleware/
│   ├── auth.js                    # authenticate() + authorizeRoles()
│   ├── auditLogger.js             # Append-only AuditLog writer
│   └── rateLimiter.js             # apiLimiter, authLimiter
├── config/
│   ├── multerConfig.js            # General file upload (whitelisted MIME)
│   ├── multerSubmissionConfig.js  # Assignment file upload
│   └── multerAvatarConfig.js      # Avatar upload (image-only)
└── utils/
    ├── jwt.js                     # generateToken(), verifyToken()
    ├── passwordPolicy.js          # validatePassword()
    └── ... (other helpers)

frontend/
├── index.html                     # HTML entry point
├── src/
│   ├── main.jsx                   # React initialization
│   ├── App.jsx                    # Router with 65+ protected routes
│   ├── App.css                    # App-level styles
│   ├── pages/                     # Role-based page components (40+)
│   │   ├── admin/
│   │   │   ├── DepartmentManagement.jsx
│   │   │   ├── StudentManagement.jsx
│   │   │   ├── BulkImport.jsx    # CSV upload UI
│   │   │   └── ... (6 more)
│   │   ├── student/
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── CourseRegistration.jsx
│   │   │   ├── AssignmentUpload.jsx
│   │   │   └── ... (9 more)
│   │   ├── faculty/
│   │   │   ├── AttendanceTracking.jsx
│   │   │   ├── GradeSubmission.jsx
│   │   │   └── ... (4 more)
│   │   ├── hmc/
│   │   │   ├── LeaveApprovals.jsx
│   │   │   ├── ComplaintResolution.jsx
│   │   │   └── ... (5 more)
│   │   ├── Login.jsx
│   │   ├── ForgotPassword.jsx
│   │   └── ... (5 more)
│   ├── components/
│   │   ├── Sidebar.jsx            # Navigation component
│   │   ├── Header.jsx
│   │   └── ... (reusable UI)
│   ├── context/
│   │   └── AuthContext.jsx        # Global auth state (user, role, token)
│   ├── services/
│   │   ├── authService.js         # login(), logout(), resetPassword()
│   │   ├── apiService.js          # Axios instance with interceptors
│   │   └── ... (domain-specific services)
│   ├── layouts/
│   │   └── AppShell.jsx           # Main layout wrapper
│   └── assets/                    # Static images, icons
├── vite.config.js                 # Vite config + proxy to /api
├── tailwind.config.js
├── eslint.config.js
└── package.json
```

---

## Authentication & Security

### JWT Token Flow

```
┌──────────────┐
│  User Login  │
│  (userId,    │
│   password)  │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ authController.login()                   │
│ 1. Find user by userId                   │
│ 2. bcrypt.compare(pwd, hashed)           │
│ 3. generateToken(userId, role)           │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ generateToken()                          │
│ jwt.sign({                               │
│   userId: user._id,                      │
│   role: 'student'|'faculty'|etc          │
│ }, JWT_SECRET, { expiresIn: '24h' })     │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ Set HTTP-Only Cookie                     │
│ secure: true (prod)                      │
│ sameSite: 'strict'                       │
│ maxAge: 24 hours                         │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ Client stores in HTTP-Only Cookie        │
│ Browser auto-includes on every request   │
└──────────────────────────────────────────┘
```

### Password Security

**Password Policy Enforcement**:

```javascript
// Backend validation (passwordPolicy.js)
const validatePassword = (password) => {
  const rules = {
    minLength: password.length >= 8,
    maxLength: password.length <= 16,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasDigit: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*]/.test(password)
  };
  
  const allValid = Object.values(rules).every(r => r === true);
  if (!allValid) throw new Error('Password does not meet policy requirements');
  
  return true;
};

// Hash before storage (User.js pre-save hook)
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
```

### Authorization Model

**Four-Role RBAC System**:

```javascript
// middleware/auth.js
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }
    next();
  };
};

// Usage in routes
router.get('/admin/users', 
  authenticate, 
  authorizeRoles('admin'), 
  adminController.getAllUsers
);

router.get('/student/dashboard', 
  authenticate, 
  authorizeRoles('student'), 
  studentDashboardController.getDashboard
);
```

### Token Blacklisting (Logout)

```javascript
// models/BlacklistToken.js
const blacklistSchema = new mongoose.Schema({
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 } // 24h TTL
});

// controllers/authController.js - logout
exports.logout = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (token) {
      await BlacklistToken.create({ token });
    }
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// middleware/auth.js - check blacklist
const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Authentication required' });

    const isBlacklisted = await BlacklistToken.findOne({ token });
    if (isBlacklisted) return res.status(401).json({ error: 'Token expired/revoked' });

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Auth middleware error' });
  }
};
```

### Audit Logging

All sensitive operations logged to `AuditLog` collection:

```javascript
// middleware/auditLogger.js
const auditLogger = (action) => async (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    if (res.statusCode >= 200 && res.statusCode < 400) {
      AuditLog.create({
        userId: req.user?.userId,
        action,
        resource: req.originalUrl,
        method: req.method,
        ipAddress: req.ip,
        timestamp: new Date()
      }).catch(err => console.error('Audit log error:', err));
    }
    return originalJson.call(this, data);
  };
  
  next();
};

// Usage on sensitive routes
router.post('/api/admin/users', 
  authenticate, 
  authorizeRoles('admin'), 
  auditLogger('USER_CREATED'), 
  adminController.createUser
);
```

### Rate Limiting

```javascript
// config/rateLimiter.js
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,        // 15 minutes
  max: 100,                         // 100 requests per window
  message: 'Too many requests, please try again later'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,                           // Stricter for auth (5 attempts)
  skip: (req) => req.method !== 'POST'
});

const heavyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,         // 1 hour
  max: 10,                          // Stricter for heavy ops (bulk import, etc.)
  message: 'Rate limit exceeded for this operation'
});

// Usage in app.js
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/admin/bulk-import', heavyLimiter);
```

---

## Database Schema

### Core Collections (31 total)

#### User Base Schema

```javascript
// User.js - Base user account
{
  _id: ObjectId,
  userId: String (unique),          // Display/login ID
  password: String (hashed),        // bcrypt(10 rounds)
  role: String (enum),              // 'student'|'faculty'|'admin'|'hmc_member'
  name: String,
  email: String (unique),
  department: String,               // Optional; admin/faculty dept
  avatar: String,                   // Base64 data URL
  hostel: String,                   // For students (hostel name)
  room: String,                     // Room number
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.users.createIndex({ userId: 1 }, { unique: true })
db.users.createIndex({ email: 1 }, { unique: true })
```

#### Academic Entities

```javascript
// Program.js
{
  _id: ObjectId,
  name: String,                    // e.g., "B.Tech Computer Science"
  code: String (unique),           // e.g., "CS"
  department: ObjectId (ref),      // Reference to Department
  totalCredits: Number,            // Total credits for degree
  createdAt: Date
}

// Course.js
{
  _id: ObjectId,
  code: String (unique),           // e.g., "CS101"
  title: String,
  credits: Number,
  department: ObjectId (ref),
  description: String,
  prerequisites: [ObjectId],       // List of prerequisite course IDs
  createdAt: Date
}

// CourseOffering.js - Specific instance of a course
{
  _id: ObjectId,
  course: ObjectId (ref),          // Reference to Course
  semester: String,                // e.g., "Spring 2026"
  year: Number,                    // e.g., 2026
  faculty: [ObjectId] (ref),       // Array of faculty IDs
  capacity: Number,                // Max enrollment
  enrolled: Number,                // Current enrollment (atomic)
  room: String,                    // Classroom location
  schedule: {
    days: [String],                // ['Mon', 'Wed', 'Fri']
    startTime: String,
    endTime: String
  },
  createdAt: Date
}

// Enrollment.js - Student-CourseOffering junction
{
  _id: ObjectId,
  student: ObjectId (ref),
  courseOffering: ObjectId (ref),
  semester: String,
  year: Number,
  status: String (enum),           // 'enrolled'|'dropped'|'completed'
  grade: String,                   // 'A'|'B'|'C'|'D'|'F'|null
  gradePoints: Number,             // Numeric grade
  isLocked: Boolean,               // Prevents post-deadline changes
  createdAt: Date,
  updatedAt: Date
}
// Unique index on (student, courseOffering) to prevent duplicates
db.enrollments.createIndex({ student: 1, courseOffering: 1 }, { unique: true })
```

#### Assessment Entities

```javascript
// Assignment.js
{
  _id: ObjectId,
  courseOffering: ObjectId (ref),
  faculty: ObjectId (ref),
  title: String,
  description: String,
  deadline: Date,
  maxScore: Number,                // Max points
  isPublished: Boolean,            // Visibility to students
  allowedFileTypes: [String],      // e.g., ['pdf', 'doc', 'docx']
  attachmentFileName: String,      // Assignment spec/brief filename
  attachmentData: String,          // Base64 data URL
  createdAt: Date
}

// Submission.js
{
  _id: ObjectId,
  assignment: ObjectId (ref),
  student: ObjectId (ref),
  fileName: String,
  fileData: String,                // Base64 data URL
  submittedAt: Date,
  isLate: Boolean,                 // Submitted after deadline
  score: Number,                   // Faculty-assigned score
  feedback: String,                // Faculty feedback
  createdAt: Date
}

// AttendanceSession.js
{
  _id: ObjectId,
  courseOffering: ObjectId (ref),
  sessionDate: Date,
  attendanceRecords: [{
    student: ObjectId (ref),
    status: String                 // 'present'|'absent'
  }],
  createdAt: Date
}
```

#### Communication Entities

```javascript
// Announcement.js
{
  _id: ObjectId,
  title: String,
  content: String,
  courseOffering: ObjectId (ref), // Optional; null = system-wide
  createdBy: ObjectId (ref),      // Admin or faculty
  visibility: String (enum),      // 'system'|'course'
  createdAt: Date
}

// Message.js
{
  _id: ObjectId,
  sender: ObjectId (ref),
  recipient: ObjectId (ref),
  courseOffering: ObjectId (ref), // Course context
  subject: String,
  body: String,
  isRead: Boolean,
  createdAt: Date
}

// Resource.js
{
  _id: ObjectId,
  title: String,
  description: String,
  courseOffering: ObjectId (ref),
  fileName: String,
  fileData: String,               // Base64 data URL
  fileType: String,               // 'pdf'|'doc'|'ppt'|etc
  uploadedBy: ObjectId (ref),
  createdAt: Date
}
```

#### Hostel & Welfare Entities

```javascript
// LeaveRequest.js
{
  _id: ObjectId,
  student: ObjectId (ref),
  hostel: String,
  startDate: Date,
  endDate: Date,
  reason: String,
  status: String (enum),          // 'pending'|'approved'|'rejected'
  approvedBy: ObjectId (ref),     // HMC member who approved
  comments: String,
  createdAt: Date
}

// Complaint.js
{
  _id: ObjectId,
  student: ObjectId (ref),
  hostel: String,
  title: String,
  description: String,
  category: String,               // 'maintenance'|'facility'|'other'
  priority: String (enum),        // 'low'|'medium'|'high'
  status: String (enum),          // 'open'|'in_progress'|'resolved'
  attachmentFileName: String,
  attachmentData: String,         // Base64 image data URL
  assignedTo: ObjectId (ref),     // HMC member
  resolution: String,
  createdAt: Date,
  updatedAt: Date
}

// HostelTransfer.js
{
  _id: ObjectId,
  student: ObjectId (ref),
  fromHostel: String,
  toHostel: String,
  reason: String,
  status: String (enum),          // 'pending'|'approved'|'completed'
  approvedBy: ObjectId (ref),
  createdAt: Date
}

// NoDues.js
{
  _id: ObjectId,
  student: ObjectId (ref),
  department: String,
  duesCleared: Boolean,
  clearedAt: Date,
  clearedBy: ObjectId (ref),      // Admin who cleared
  createdAt: Date
}
```

#### Document Entities

```javascript
// TranscriptRequest.js
{
  _id: ObjectId,
  student: ObjectId (ref),
  status: String (enum),          // 'pending'|'approved'|'rejected'
  requestedAt: Date,
  approvedAt: Date,
  approvedBy: ObjectId (ref),     // Admin
  copies: Number,                 // Copies requested
  createdAt: Date
}

// Certificate.js
{
  _id: ObjectId,
  student: ObjectId (ref),
  type: String,                   // 'bonafide'|'provisional'
  status: String (enum),
  issuedAt: Date,
  createdAt: Date
}
```

---

## API Reference

### Authentication Endpoints

#### POST /api/auth/login

Request:
```json
{
  "userId": "CS21B001",
  "password": "SecurePass123!",
  "role": "student"
}
```

Response (200):
```json
{
  "message": "Logged in successfully",
  "role": "student",
  "name": "John Doe"
}
```

Error (401):
```json
{
  "error": "Invalid credentials"
}
```

**Details**: 
- Sets HTTP-only cookie `token` with JWT
- Cookie maxAge: 24 hours
- Role parameter optional; if provided, validates user has that role

---

#### POST /api/auth/logout

Request:
```json
{}
```

Response (200):
```json
{
  "message": "Logged out successfully"
}
```

**Details**:
- Adds token to `BlacklistToken` collection (blacklist expires in 24h via MongoDB TTL)
- Clears `token` cookie

---

#### POST /api/auth/forgot-password

Request:
```json
{
  "userId": "CS21B001",
  "email": "john@example.com"
}
```

Response (200) - Always returns generic message for security:
```json
{
  "message": "If the account exists, a password reset link has been sent to the registered email address."
}
```

**Details**:
- Creates single-use `PasswordResetToken` with 15-minute TTL
- Email contains token (in production); returned in `devToken` field (dev mode)
- Token is hashed before storage

---

#### POST /api/auth/reset-password

Request:
```json
{
  "token": "abc123def456...",
  "newPassword": "NewPass456!"
}
```

Response (200):
```json
{
  "message": "Password reset successfully"
}
```

**Details**:
- Validates token not expired, not already used
- Validates new password against policy
- Invalidates all existing tokens for this user

---

### Enrollment Endpoints

#### POST /api/enrollment

**Role Required**: student

Request:
```json
{
  "courseOfferingId": "507f1f77bcf86cd799439011"
}
```

Response (201):
```json
{
  "_id": "507f191e810c19729de860ea",
  "student": "507f1f77bcf86cd799439012",
  "courseOffering": "507f1f77bcf86cd799439011",
  "semester": "Spring 2026",
  "year": 2026,
  "status": "enrolled",
  "grade": null,
  "gradePoints": null,
  "isLocked": false,
  "createdAt": "2026-04-26T10:30:00Z"
}
```

Error (409):
```json
{
  "error": "Course is at capacity"
}
```

**Details**:
- **Atomic operation**: Uses `findOneAndUpdate` with `$inc` to prevent race conditions
- Checks current enrollment against capacity
- Prevents duplicate enrollments (unique index on student + courseOffering)

---

#### GET /api/enrollment

**Role Required**: student

Response (200):
```json
{
  "enrollments": [
    {
      "_id": "507f191e810c19729de860ea",
      "student": "507f1f77bcf86cd799439012",
      "courseOffering": {
        "_id": "507f1f77bcf86cd799439011",
        "course": {
          "code": "CS101",
          "title": "Introduction to Programming",
          "credits": 3
        },
        "semester": "Spring 2026",
        "faculty": ["Dr. Smith"]
      },
      "status": "enrolled",
      "grade": "A",
      "gradePoints": 10,
      "createdAt": "2026-04-26T10:30:00Z"
    }
  ]
}
```

---

#### DELETE /api/enrollment/:id

**Role Required**: student

Response (200):
```json
{
  "message": "Enrollment dropped successfully"
}
```

Error (400):
```json
{
  "error": "Drop deadline has passed"
}
```

**Details**:
- Checks `isLocked` field (set to true after drop deadline)
- Updates status from 'enrolled' to 'dropped'

---

### Faculty Grade Submission

#### PATCH /api/faculty/courses/:courseOfferingId/grades

**Role Required**: faculty

Request:
```json
{
  "grades": [
    {
      "enrollmentId": "507f191e810c19729de860ea",
      "grade": "A",
      "gradePoints": 10
    },
    {
      "enrollmentId": "507f191e810c19729de860eb",
      "grade": "B",
      "gradePoints": 8
    }
  ]
}
```

Response (200):
```json
{
  "message": "Grades submitted successfully",
  "count": 2
}
```

**Details**:
- Validates all enrollments belong to this course offering
- Sets `isLocked: true` to prevent changes after grade finalization
- Logged to `AuditLog` (sensitive operation)

---

### Student Attendance

#### GET /api/student/attendance?courseOfferingId=...

**Role Required**: student

Response (200):
```json
{
  "courseOffering": {
    "code": "CS101",
    "title": "Introduction to Programming"
  },
  "totalSessions": 25,
  "attendedSessions": 23,
  "attendancePercentage": 92,
  "sessionDetails": [
    {
      "date": "2026-04-26",
      "status": "present"
    },
    {
      "date": "2026-04-25",
      "status": "absent"
    }
  ]
}
```

---

### Assignment Submission

#### POST /api/student/assignments/:assignmentId/submit

**Role Required**: student  
**Content-Type**: multipart/form-data

Request:
```
POST /api/student/assignments/507f191e810c19729de860ea/submit HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="solution.pdf"
Content-Type: application/pdf

[binary PDF data]
------WebKitFormBoundary--
```

Response (201):
```json
{
  "_id": "507f191e810c19729de860ec",
  "assignment": "507f191e810c19729de860ea",
  "student": "507f1f77bcf86cd799439012",
  "fileName": "solution.pdf",
  "submittedAt": "2026-04-26T10:30:00Z",
  "isLate": false,
  "score": null,
  "feedback": null,
  "createdAt": "2026-04-26T10:30:00Z"
}
```

Error (400):
```json
{
  "error": "File type not allowed. Allowed types: pdf, doc, docx"
}
```

**Details**:
- Multer stores file in memory as Base64 data URL in `fileData` field
- Validates `allowedFileTypes` from Assignment model
- `isLate` set to true if current time > `assignment.deadline`

---

### Admin Bulk User Import

#### POST /api/admin/bulk-import

**Role Required**: admin  
**Rate Limited**: heavyLimiter (10 requests/hour)  
**Content-Type**: multipart/form-data

Request:
```
CSV format (users.csv):
userId,name,email,role,department
CS21B001,John Doe,john@example.com,student,Computer Science
CS21B002,Jane Smith,jane@example.com,student,Computer Science
FAC001,Dr. Robert,robert@example.com,faculty,Computer Science
```

Response (200):
```json
{
  "message": "Bulk import completed",
  "created": 3,
  "updated": 0,
  "failed": 0,
  "details": [
    {
      "userId": "CS21B001",
      "status": "created",
      "message": "User created successfully"
    },
    {
      "userId": "CS21B002",
      "status": "created",
      "message": "User created successfully"
    },
    {
      "userId": "FAC001",
      "status": "created",
      "message": "User created successfully"
    }
  ]
}
```

Error (400):
```json
{
  "error": "Invalid CSV format or missing required fields"
}
```

**Details**:
- Uses `csv-parse` library with buffer parsing (in-memory, no temp files)
- Auto-maps human-readable headers to database fields
- Upserts: creates if doesn't exist, updates if exists (by userId)
- Transaction-safe: rolls back all changes on any failure
- Generates initial password from policy; first login requires change

---

## Module Breakdown with Code

### Module 1: Identity & Access Management (Services 1-6)

**Files**:
- Controllers: `authController.js`, `profileController.js`
- Models: `User.js`, `PasswordResetToken.js`, `BlacklistToken.js`
- Routes: `auth.js`, `profile.js`
- Middleware: `auth.js`

**Service 1: User Login**

```javascript
// routes/auth.js
router.post('/login', authLimiter, authController.login);

// controllers/authController.js
exports.login = async (req, res) => {
  try {
    const { userId, password, role } = req.body;

    // Validate input
    if (!userId || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    // Find user
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Optional: role check (for multi-account users)
    if (role && user.role !== role) {
      return res.status(403).json({ 
        error: `Access denied. You are a ${user.role}, not a ${role}.` 
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Log audit
    await AuditLog.create({
      userId: user._id,
      action: 'LOGIN',
      resource: 'auth',
      method: 'POST',
      ipAddress: req.ip,
      success: true
    });

    res.json({ 
      message: 'Logged in successfully', 
      role: user.role, 
      name: user.name 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
```

**Service 2: Password Reset Flow (OTP-based)**

```javascript
// Step 1: forgotPassword - Issue token
exports.forgotPassword = async (req, res) => {
  try {
    const { userId, email } = req.body;
    if (!userId || !email) {
      return res.status(400).json({ error: 'userId and email are required' });
    }

    // Find user
    const user = await User.findOne({ userId });
    
    // Generic message for both found and not-found (prevents enumeration)
    const message = 'If the account exists, a password reset link has been sent.';

    if (!user || user.email.toLowerCase() !== email.toLowerCase()) {
      return res.json({ message });
    }

    // Invalidate previous tokens
    await PasswordResetToken.deleteMany({ user: user._id });

    // Generate single-use token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = hashToken(resetToken);

    await PasswordResetToken.create({
      user: user._id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS)
    });

    // In production: send via email
    // In dev: return in response
    const devToken = process.env.NODE_ENV === 'development' ? resetToken : null;

    res.json({ 
      message,
      devToken // Only in dev mode
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Step 2: resetPassword - Verify token & update password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password required' });
    }

    // Validate password policy
    validatePassword(newPassword);

    // Find reset token
    const hashedToken = hashToken(token);
    const resetTokenDoc = await PasswordResetToken.findOne({ 
      token: hashedToken,
      expiresAt: { $gt: new Date() }
    }).populate('user');

    if (!resetTokenDoc) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const user = resetTokenDoc.user;

    // Update password (will be hashed in pre-save hook)
    user.password = newPassword;
    await user.save();

    // Invalidate all reset tokens for this user
    await PasswordResetToken.deleteMany({ user: user._id });

    // Invalidate all existing sessions
    await BlacklistToken.deleteMany({ userId: user._id });

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    if (err.message.includes('Password does not meet policy')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
};
```

---

### Module 2: Student Academic Portal (Services 7-12)

**Service 8: Course Registration with Atomic Capacity Check**

```javascript
// routes/enrollment.js
router.post('/', authenticate, authorizeRoles('student'), enrollmentController.enroll);

// controllers/enrollmentController.js
exports.enroll = async (req, res) => {
  try {
    const { courseOfferingId } = req.body;
    const studentId = req.user.userId;

    if (!courseOfferingId) {
      return res.status(400).json({ error: 'courseOfferingId required' });
    }

    // Get course offering to check capacity
    const courseOffering = await CourseOffering.findById(courseOfferingId);
    if (!courseOffering) {
      return res.status(404).json({ error: 'Course offering not found' });
    }

    // Check capacity BEFORE enrollment attempt (advisory check)
    if (courseOffering.enrolled >= courseOffering.capacity) {
      return res.status(409).json({ error: 'Course is at capacity' });
    }

    // **ATOMIC OPERATION**: Use findOneAndUpdate with $inc to prevent race conditions
    // If another student enrolls simultaneously, this operation fails
    const student = await User.findById(studentId);
    
    const updatedOffering = await CourseOffering.findByIdAndUpdate(
      courseOfferingId,
      { $inc: { enrolled: 1 } },
      { new: true, runValidators: true }
    );

    // Check if capacity exceeded after increment
    if (updatedOffering.enrolled > updatedOffering.capacity) {
      // Rollback the increment
      await CourseOffering.findByIdAndUpdate(courseOfferingId, { $inc: { enrolled: -1 } });
      return res.status(409).json({ error: 'Course filled during enrollment' });
    }

    // Create enrollment document
    const semester = 'Spring 2026';
    const year = 2026;

    const enrollment = await Enrollment.create({
      student: studentId,
      courseOffering: courseOfferingId,
      semester,
      year,
      status: 'enrolled'
    });

    // Populate references
    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate('courseOffering')
      .populate('student', 'userId name email');

    // Log audit
    await AuditLog.create({
      userId: studentId,
      action: 'ENROLLMENT_CREATED',
      resource: `enrollment/${enrollment._id}`,
      method: 'POST',
      success: true
    });

    res.status(201).json(populatedEnrollment);
  } catch (err) {
    // Handle duplicate enrollment error
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Already enrolled in this course' });
    }
    console.error('Enrollment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
```

**Service 9: Drop Course with Deadline Validation**

```javascript
exports.dropCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.userId;

    const enrollment = await Enrollment.findById(id).populate('courseOffering');
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    if (enrollment.student.toString() !== studentId.toString()) {
      return res.status(403).json({ error: 'Not your enrollment' });
    }

    // Check if drop deadline has passed
    if (enrollment.isLocked) {
      return res.status(400).json({ error: 'Drop deadline has passed' });
    }

    // Update status
    enrollment.status = 'dropped';
    await enrollment.save();

    // Decrement enrollment count
    await CourseOffering.findByIdAndUpdate(
      enrollment.courseOffering._id,
      { $inc: { enrolled: -1 } },
      { runValidators: true }
    );

    // Log audit
    await AuditLog.create({
      userId: studentId,
      action: 'ENROLLMENT_DROPPED',
      resource: `enrollment/${id}`,
      method: 'DELETE',
      success: true
    });

    res.json({ message: 'Enrollment dropped successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
```

---

### Module 3: Course Operations & Assessment (Services 17-20)

**Service 19: Faculty Assignment Configuration**

```javascript
// routes/facultyCourses.js
router.post('/:courseOfferingId/assignments', 
  authenticate, 
  authorizeRoles('faculty'), 
  upload.single('file'),
  facultyCourseController.createAssignment
);

// controllers/facultyCourseController.js
exports.createAssignment = async (req, res) => {
  try {
    const { courseOfferingId } = req.params;
    const { title, description, deadline, maxScore, allowedFileTypes } = req.body;

    // Validate faculty owns this course
    const offering = await CourseOffering.findById(courseOfferingId);
    if (!offering) {
      return res.status(404).json({ error: 'Course offering not found' });
    }

    if (!offering.faculty.includes(req.user.userId)) {
      return res.status(403).json({ error: 'Not instructor for this course' });
    }

    // Validate deadline is in future
    if (new Date(deadline) <= new Date()) {
      return res.status(400).json({ error: 'Deadline must be in the future' });
    }

    // Parse allowed file types (comma-separated string)
    const fileTypes = allowedFileTypes.split(',').map(t => t.trim().toLowerCase());
    
    // Validate no dangerous file types
    const DANGEROUS_TYPES = ['exe', 'sh', 'bat', 'cmd', 'svg'];
    for (const type of fileTypes) {
      if (DANGEROUS_TYPES.includes(type)) {
        return res.status(400).json({ error: `File type ${type} not allowed` });
      }
    }

    // Handle file upload (optional)
    let attachmentData = null;
    let attachmentFileName = null;

    if (req.file) {
      if (req.file.size > 10 * 1024 * 1024) {
        return res.status(413).json({ error: 'File too large (max 10MB)' });
      }
      
      const base64 = req.file.buffer.toString('base64');
      attachmentData = `data:${req.file.mimetype};base64,${base64}`;
      attachmentFileName = req.file.originalname;
    }

    // Create assignment
    const assignment = await Assignment.create({
      courseOffering: courseOfferingId,
      faculty: req.user.userId,
      title,
      description,
      deadline: new Date(deadline),
      maxScore: maxScore || 100,
      isPublished: true,
      allowedFileTypes: fileTypes,
      attachmentFileName,
      attachmentData
    });

    // Log audit
    await AuditLog.create({
      userId: req.user.userId,
      action: 'ASSIGNMENT_CREATED',
      resource: `assignment/${assignment._id}`,
      method: 'POST',
      success: true
    });

    res.status(201).json(assignment);
  } catch (err) {
    console.error('Assignment creation error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
```

---

### Module 5: Administration (Service 25: Bulk User Import)

```javascript
// routes/admin.js
router.post('/bulk-import',
  authenticate,
  authorizeRoles('admin'),
  heavyLimiter,
  upload.single('file'),
  adminController.bulkImportUsers
);

// controllers/adminController.js
const { parse } = require('csv-parse');

exports.bulkImportUsers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'CSV file required' });
    }

    // Validate file is CSV
    if (!req.file.originalname.endsWith('.csv')) {
      return res.status(400).json({ error: 'File must be CSV format' });
    }

    const results = [];
    const createdUsers = [];
    const errors = [];

    // Parse CSV from memory buffer
    return new Promise((resolve) => {
      parse(req.file.buffer.toString(), {
        columns: true,  // Use first row as headers
        skip_empty_lines: true,
        trim: true
      })
      .on('data', async (row) => {
        try {
          // Map CSV headers to database fields
          const { userId, name, email, role, department } = row;

          // Validate required fields
          if (!userId || !name || !email || !role) {
            errors.push({
              userId: userId || 'unknown',
              status: 'error',
              message: 'Missing required fields: userId, name, email, role'
            });
            return;
          }

          // Validate role enum
          const validRoles = ['student', 'faculty', 'admin', 'hmc_member'];
          if (!validRoles.includes(role)) {
            errors.push({
              userId,
              status: 'error',
              message: `Invalid role: ${role}`
            });
            return;
          }

          // Generate temporary password
          const tempPassword = generateTempPassword(); // Meets policy

          // Upsert user
          const user = await User.findOneAndUpdate(
            { userId },
            {
              userId,
              name,
              email,
              role,
              department: department || 'General',
              password: tempPassword  // Will be hashed in pre-save hook
            },
            {
              upsert: true,
              new: true,
              runValidators: true
            }
          );

          results.push({
            userId,
            status: 'created',
            message: 'User created. First login requires password change.'
          });

          createdUsers.push(user);
        } catch (rowErr) {
          errors.push({
            userId: row.userId || 'unknown',
            status: 'error',
            message: rowErr.message
          });
        }
      })
      .on('end', () => {
        // Log audit
        AuditLog.create({
          userId: req.user.userId,
          action: 'BULK_USER_IMPORT',
          resource: 'admin/bulk-import',
          method: 'POST',
          success: errors.length === 0,
          details: {
            created: results.length,
            errors: errors.length
          }
        }).catch(err => console.error('Audit log error:', err));

        res.json({
          message: 'Bulk import completed',
          created: results.length,
          failed: errors.length,
          details: [...results, ...errors]
        });

        resolve();
      })
      .on('error', (parseErr) => {
        res.status(400).json({ 
          error: 'CSV parsing error',
          details: parseErr.message 
        });
        resolve();
      });
    });
  } catch (err) {
    console.error('Bulk import error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Helper: Generate temporary password meeting policy
function generateTempPassword() {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '!@#$%^&*';

  let password = '';
  password += upper[Math.floor(Math.random() * upper.length)];
  password += lower[Math.floor(Math.random() * lower.length)];
  password += digits[Math.floor(Math.random() * digits.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill remaining 4-12 chars
  const all = upper + lower + digits + special;
  for (let i = password.length; i < 12; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  return password.split('').sort(() => 0.5 - Math.random()).join('');
}
```

---

## Middleware & Utilities

### JWT Utility (utils/jwt.js)

```javascript
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY = '24h';

const generateToken = (userId, role) => {
  return jwt.sign(
    {
      userId,
      role
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRY,
      issuer: 'iitg-affairs-portal'
    }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };
```

### Password Policy Utility

```javascript
// utils/passwordPolicy.js
const validatePassword = (password) => {
  const rules = {
    minLength: password.length >= 8,
    maxLength: password.length <= 16,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasDigit: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*]/.test(password)
  };

  const violations = [];
  if (!rules.minLength) violations.push('at least 8 characters');
  if (!rules.maxLength) violations.push('no more than 16 characters');
  if (!rules.hasUpperCase) violations.push('an uppercase letter');
  if (!rules.hasLowerCase) violations.push('a lowercase letter');
  if (!rules.hasDigit) violations.push('a digit');
  if (!rules.hasSpecial) violations.push('a special character (!@#$%^&*)');

  if (violations.length > 0) {
    throw new Error(
      `Password must contain ${violations.join(', ')}.`
    );
  }

  return true;
};

module.exports = { validatePassword };
```

---

## File Upload Handling

### Multer Configurations

**Avatar Upload** (Images only, small size)

```javascript
// config/multerAvatarConfig.js
const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error('Only image files allowed'));
  }
  cb(null, true);
};

const avatarUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024  // 2MB max
  }
});

module.exports = avatarUpload;
```

**Assignment Submission** (Faculty-configured types)

```javascript
// config/multerSubmissionConfig.js
const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const dangerousTypes = ['application/x-executable', 'application/x-msdownload'];
  if (dangerousTypes.includes(file.mimetype)) {
    return cb(new Error('File type not allowed'));
  }
  cb(null, true);
};

const submissionUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024  // 10MB max
  }
});

module.exports = submissionUpload;
```

**Base64 Storage in MongoDB**

```javascript
// Example in submission handler
exports.submitAssignment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File required' });
    }

    // Convert buffer to Base64 data URL
    const base64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const submission = await Submission.create({
      assignment: req.params.assignmentId,
      student: req.user.userId,
      fileName: req.file.originalname,
      fileData: dataUrl,  // Stored as Base64 data URL
      submittedAt: new Date(),
      isLate: new Date() > assignment.deadline
    });

    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
};

// Retrieval: Base64 can be directly used in <img>, <a href>, etc.
// Example in React:
// <img src={submission.fileData} alt={submission.fileName} />
// <a href={submission.fileData} download={submission.fileName}>Download</a>
```

---

## Deployment & Configuration

### Environment Variables (.env)

```bash
# Server
PORT=5000
NODE_ENV=development|production

# Database
MONGO_URI=mongodb://localhost:27017/iitg-affairs-portal

# Authentication
JWT_SECRET=your-super-secret-key-change-in-production-min-32-chars

# Security
CORS_ORIGIN=http://localhost:5173

# File Upload
MAX_FILE_SIZE=10485760  # 10MB in bytes

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Email (for production password reset emails)
EMAIL_SERVICE=gmail
EMAIL_USER=notifications@iitg.edu.in
EMAIL_PASS=app-specific-password
```

### MongoDB Connection

```javascript
// server.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  }
};

connectDB();
```

### Express App Initialization

```javascript
// app.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware
app.use(cors({ 
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb' }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', apiLimiter);

// Routes (31 total)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/enrollment', require('./routes/enrollment'));
app.use('/api/student', require('./routes/student'));
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/hmc', require('./routes/hmc'));
// ... 24 more routes

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
```

### Vite Frontend Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    target: 'esnext',
    minify: 'terser'
  }
})
```

### Running the Application

**Development Mode**:

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev

# Access at http://localhost:5173
```

**Production Deployment**:

```bash
# Backend
npm install --production
NODE_ENV=production npm start

# Frontend
npm run build
# Serve dist/ folder with reverse proxy to /api backend
```

---

## Security Best Practices Implemented

| Practice | Implementation | Location |
|----------|-----------------|----------|
| **HTTPS Only** | `secure: true` cookie flag in prod | authController.js |
| **CSRF Protection** | SameSite strict cookies | authController.js |
| **XSS Prevention** | React auto-escapes; Content-Security-Policy headers | Frontend + backend |
| **Mass Assignment** | Explicit field whitelisting on updates | All controllers |
| **SQL/NoSQL Injection** | Mongoose parameterization | All queries |
| **Password Hashing** | bcrypt 10 rounds | User.js pre-save |
| **Race Conditions** | Atomic DB operations ($inc, $findOneAndUpdate) | enrollmentController.js |
| **Token Expiry** | 24-hour JWT expiry; TTL on reset tokens | auth.js, jwt.js |
| **Brute Force Protection** | authLimiter (5 attempts/15min) | rateLimiter.js |
| **Audit Trail** | Immutable AuditLog collection | auditLogger.js |
| **CORS** | Whitelist only frontend origin | app.js |
| **Rate Limiting** | Global + per-operation limits | rateLimiter.js |

---

**End of Technical Reference**
