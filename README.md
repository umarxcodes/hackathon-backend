# 🏥 AI Clinic Management SaaS — Backend API

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens)
![Claude AI](https://img.shields.io/badge/Claude-Sonnet_4-CC785C?style=for-the-badge)
![Yarn](https://img.shields.io/badge/Yarn-Package_Manager-2C8EBB?style=for-the-badge&logo=yarn)

**A production-ready REST API for AI-powered clinic management. Built with MERN stack, RBAC, input validation, and Anthropic Claude AI.**

> Live backend: https://hackathon-backend-woad-two.vercel.app

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [User Roles & Permissions](#-user-roles--permissions)
- [API Documentation](#-api-documentation)
- [Validation Layer](#-validation-layer)
- [AI Features](#-ai-features)
- [Database Schema](#-database-schema)
- [Security](#-security)
- [Deployment](#-deployment)

---

## ✨ Features

### 🔐 Auth & Security

- JWT Authentication with httpOnly cookie support
- Role-Based Access Control (4 roles: Admin, Doctor, Receptionist, Patient)
- Rate limiting on all routes (stricter on auth endpoints)
- XSS protection, NoSQL injection prevention, HTTP parameter pollution protection
- Input validation on every route via express-validator
- Passwords hashed with bcrypt (12 rounds), never returned in responses

### 👥 User Management

- Admin creates/manages all user accounts
- Soft delete (deactivate instead of hard delete)
- Subscription plan management (Free / Pro)
- Doctor specialization field

### 🧑‍⚕️ Patient Management

- Full patient profiles with medical history
- Search by name (case-insensitive)
- Paginated results
- Complete medical history timeline (appointments + prescriptions + diagnosis)
- Cascade delete (removes all related records)

### 📅 Appointment System

- Scheduling conflict detection (same doctor + same date + same time slot)
- Status workflow: pending → confirmed → completed / cancelled
- Doctor schedule view by date range
- Role-filtered views per user type

### 💊 Prescription System

- Digital prescriptions with medicines table
- Auto PDF generation using PDFKit
- PDF upload to Cloudinary
- PDF download endpoint
- Patient-friendly AI explanation

### 🤖 AI Features (Anthropic Claude claude-sonnet-4-20250514)

- Smart Symptom Checker — structured diagnosis from symptoms
- Prescription Explanation — simple patient-friendly language
- Risk Flagging — detects chronic patterns in history
- **Graceful fallback** on every AI endpoint — system never crashes if AI fails

### 📊 Analytics

- Admin dashboard with MongoDB aggregation pipelines
- Doctor personal performance stats
- Monthly appointment trends (last 6 months)
- Top diagnoses ranking
- Doctor completion rate tracking

---

## 🛠 Tech Stack

| Layer           | Technology                             | Purpose                           |
| --------------- | -------------------------------------- | --------------------------------- |
| Runtime         | Node.js 18+                            | Server runtime                    |
| Framework       | Express.js                             | HTTP framework                    |
| Database        | MongoDB + Mongoose                     | Primary database                  |
| Auth            | JWT + bcryptjs                         | Authentication & password hashing |
| AI              | Anthropic Claude API v1                | AI-powered features               |
| Storage         | Cloudinary                             | PDF & image storage               |
| PDF             | PDFKit                                 | Prescription PDF generation       |
| Validation      | express-validator                      | Input validation layer            |
| Security        | Helmet, HPP, XSS-Clean, mongo-sanitize | Security middleware stack         |
| Rate Limiting   | express-rate-limit                     | API throttling                    |
| Email           | Nodemailer                             | Email notifications               |
| HTTP Client     | Axios                                  | External API calls                |
| Logging         | Morgan                                 | Request logging                   |
| Package Manager | **Yarn**                               | Dependency management             |

---

## 📁 Project Structure

```
clinic-backend/
│
├── config/
│   ├── db.js                       # MongoDB connection
│   └── cloudinary.js               # Cloudinary + multer middleware
│
├── middleware/
│   ├── auth.js                     # JWT verify + isActive check
│   ├── roleCheck.js                # RBAC role protection
│   ├── errorHandler.js             # Global error handler
│   └── rateLimiter.js              # Auth + general rate limiters
│
├── models/
│   ├── User.js
│   ├── Patient.js
│   ├── Appointment.js
│   ├── Prescription.js
│   └── DiagnosisLog.js
│
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── patients.js
│   ├── appointments.js
│   ├── prescriptions.js
│   ├── diagnosis.js
│   ├── ai.js
│   └── analytics.js
│
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── patientController.js
│   ├── appointmentController.js
│   ├── prescriptionController.js
│   ├── diagnosisController.js
│   ├── aiController.js
│   └── analyticsController.js
│
├── validations/                    # ✅ Full validation layer
│   ├── authValidation.js
│   ├── userValidation.js
│   ├── patientValidation.js
│   ├── appointmentValidation.js
│   ├── prescriptionValidation.js
│   └── aiValidation.js
│
├── utils/
│   ├── generatePDF.js              # PDFKit prescription builder
│   ├── aiHelper.js                 # Anthropic Claude API caller
│   ├── signToken.js                # JWT signer
│   ├── sendEmail.js                # Nodemailer email sender
│   ├── ApiResponse.js             # Standardized response helper
│   └── validateRequest.js         # express-validator error checker
│
├── constants/
│   └── roles.js                    # Role constants
│
├── .env.example
├── .gitignore
├── package.json                    # Yarn scripts
└── server.js
```

---

## ⚡ Getting Started

### Prerequisites

| Requirement       | Version / Source                                       |
| ----------------- | ------------------------------------------------------ |
| Node.js           | 18+                                                    |
| Yarn              | 1.22+                                                  |
| MongoDB Atlas     | [mongodb.com/atlas](https://mongodb.com/atlas) — Free  |
| Cloudinary        | [cloudinary.com](https://cloudinary.com) — Free        |
| Anthropic API Key | [console.anthropic.com](https://console.anthropic.com) |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/clinic-backend.git
cd clinic-backend

# 2. Install dependencies (YARN only)
yarn install

# 3. Setup environment
cp .env.example .env
# Fill in your credentials in .env

# 4. Run development server
yarn dev

# 5. Test it works
curl http://localhost:5000/
# { "success": true, "message": "Clinic API Running 🚀" }
```

### Scripts

```bash
yarn dev      # Development with nodemon (auto-reload)
yarn start    # Production
yarn test     # Jest tests
```

---

## 🔐 Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/clinic-saas

# JWT
JWT_SECRET=minimum_32_character_random_secret_key_here
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Anthropic Claude AI (v1)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxx

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
```

> ⚠️ Never commit `.env` — already in `.gitignore`.

---

## 👥 User Roles & Permissions

| Action                  | Admin | Doctor | Receptionist | Patient |
| ----------------------- | :---: | :----: | :----------: | :-----: |
| Manage users            |  ✅   |   ❌   |      ❌      |   ❌    |
| View all patients       |  ✅   |   ✅   |      ✅      |   ❌    |
| Create patient          |  ✅   |   ❌   |      ✅      |   ❌    |
| Book appointment        |  ✅   |   ❌   |      ✅      |   ✅    |
| View appointments       |  All  |  Own   |     All      |   Own   |
| Write prescription      |  ❌   |   ✅   |      ❌      |   ❌    |
| Download PDF            |  ✅   |   ✅   |      ❌      |   ✅    |
| AI symptom checker      |  ❌   |   ✅   |      ❌      |   ❌    |
| AI prescription explain |  ❌   |   ✅   |      ❌      |   ✅    |
| AI risk flagging        |  ✅   |   ✅   |      ❌      |   ❌    |
| Admin analytics         |  ✅   |   ❌   |      ❌      |   ❌    |
| Doctor analytics        |  ❌   |   ✅   |      ❌      |   ❌    |

---

## 📡 API Documentation

### Base URL

```
http://localhost:5000/api
```

---

### 🔑 Auth — `/api/auth`

| Method | Route     | Auth      | Description       |
| ------ | --------- | --------- | ----------------- |
| POST   | /register | Public    | Register new user |
| POST   | /login    | Public    | Login + get JWT   |
| GET    | /me       | Protected | Current user info |
| GET    | /logout   | Protected | Clear auth cookie |

**POST /register — Body:**

```json
{
  "name": "Dr. Ahmed Ali",
  "email": "ahmed@clinic.com",
  "password": "Pass123",
  "role": "doctor"
}
```

**POST /login — Response:**

```json
{
  "success": true,
  "token": "eyJhbGci...",
  "data": { "user": { "_id": "...", "name": "...", "role": "doctor" } }
}
```

---

### 👤 Users — `/api/users` (Admin)

| Method | Route    | Description                      |
| ------ | -------- | -------------------------------- |
| GET    | /        | All users (paginated)            |
| POST   | /        | Create user                      |
| GET    | /doctors | All active doctors ← before /:id |
| GET    | /:id     | Single user                      |
| PUT    | /:id     | Update user                      |
| DELETE | /:id     | Soft delete (deactivate)         |

**Query:** `?page=1&limit=10&role=doctor`

**Paginated Response:**

```json
{
  "success": true,
  "count": 10,
  "total": 48,
  "totalPages": 5,
  "currentPage": 1,
  "data": { "users": [ ... ] }
}
```

---

### 🧑‍⚕️ Patients — `/api/patients`

| Method | Route         | Description                      |
| ------ | ------------- | -------------------------------- |
| GET    | /             | All patients (search + paginate) |
| POST   | /             | Create patient                   |
| GET    | /:id          | Patient + full history           |
| PUT    | /:id          | Update patient                   |
| DELETE | /:id          | Delete + cascade (admin)         |
| GET    | /:id/timeline | Full medical timeline            |

**Timeline Response:**

```json
{
  "success": true,
  "data": [
    { "type": "appointment", "date": "2024-02-15T10:00:00Z", "data": { ... } },
    { "type": "prescription", "date": "2024-02-15T11:30:00Z", "data": { ... } },
    { "type": "diagnosis", "date": "2024-01-10T09:00:00Z", "data": { ... } }
  ]
}
```

---

### 📅 Appointments — `/api/appointments`

| Method | Route             | Description                   |
| ------ | ----------------- | ----------------------------- |
| GET    | /                 | Role-filtered list            |
| POST   | /                 | Book (conflict check)         |
| GET    | /doctor/:doctorId | Doctor schedule ← before /:id |
| GET    | /:id              | Single appointment            |
| PUT    | /:id              | Update status/notes           |
| DELETE | /:id              | Cancel                        |

**POST Body:**

```json
{
  "patientId": "64f...",
  "doctorId": "64f...",
  "date": "2024-03-15",
  "timeSlot": "10:00 AM"
}
```

---

### 💊 Prescriptions — `/api/prescriptions`

| Method | Route    | Description          |
| ------ | -------- | -------------------- |
| GET    | /        | Role-filtered list   |
| POST   | /        | Create (doctor only) |
| GET    | /:id     | Single prescription  |
| PUT    | /:id     | Update (doctor only) |
| GET    | /:id/pdf | Download PDF         |

---

### 🤖 AI — `/api/ai`

| Method | Route                     | Role            | Description                |
| ------ | ------------------------- | --------------- | -------------------------- |
| POST   | /symptom-checker          | Doctor          | AI diagnosis from symptoms |
| POST   | /prescription-explanation | Doctor, Patient | Explain prescription       |
| POST   | /risk-flag                | Doctor, Admin   | Detect risk patterns       |

**Symptom Checker Request:**

```json
{
  "patientId": "64f...",
  "symptoms": ["fever", "cough", "fatigue"],
  "age": 45,
  "gender": "male",
  "history": "Smoker, mild hypertension"
}
```

**Symptom Checker Response (AI success):**

```json
{
  "success": true,
  "data": {
    "aiResponse": {
      "conditions": ["Acute Bronchitis", "Pneumonia", "COVID-19"],
      "riskLevel": "high",
      "suggestedTests": ["CBC", "Chest X-Ray", "COVID PCR"]
    },
    "fallback": false
  }
}
```

**Symptom Checker Response (AI unavailable — graceful):**

```json
{
  "success": true,
  "data": {
    "aiResponse": {
      "conditions": [],
      "riskLevel": "unknown",
      "suggestedTests": []
    },
    "fallback": true,
    "message": "AI service temporarily unavailable. Record saved."
  }
}
```

---

### 📊 Analytics — `/api/analytics`

| Method | Route   | Role   | Description       |
| ------ | ------- | ------ | ----------------- |
| GET    | /admin  | Admin  | Full system stats |
| GET    | /doctor | Doctor | Personal stats    |

**Admin Response:**

```json
{
  "success": true,
  "data": {
    "totalPatients": 312,
    "totalDoctors": 8,
    "totalAppointments": 1547,
    "appointmentsByMonth": [{ "month": "2025-01", "count": 301 }],
    "topDiagnoses": [{ "condition": "Flu", "count": 89 }],
    "doctorPerformance": [
      {
        "doctorName": "Dr. Ahmed",
        "total": 245,
        "completed": 231,
        "rate": 94.3
      }
    ]
  }
}
```

---

### Standard Error Response

```json
{ "success": false, "error": "Error message here" }
```

### Validation Error Response

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    { "field": "email", "message": "Must be a valid email address" },
    { "field": "age", "message": "Age must be between 0 and 150" }
  ]
}
```

---

## ✅ Validation Layer

All routes have validation in `validations/` using `express-validator`.

| Route                    | Validated                                                |
| ------------------------ | -------------------------------------------------------- |
| POST /auth/register      | name, email, password (strength), role                   |
| POST /auth/login         | email, password                                          |
| POST /users              | name, email, password, role                              |
| POST /patients           | name, age, gender, contact, bloodGroup                   |
| POST /appointments       | patientId (MongoId), doctorId, date (not past), timeSlot |
| POST /prescriptions      | patientId, medicines[] (min 1), each medicine fields     |
| POST /ai/symptom-checker | patientId, symptoms[] (min 1), age, gender               |

---

## 🤖 AI Integration Details

| Property | Value                                    |
| -------- | ---------------------------------------- |
| Endpoint | `https://api.anthropic.com/v1/messages`  |
| Model    | `claude-sonnet-4-20250514`               |
| Header   | `anthropic-version: 2023-06-01`          |
| Auth     | `x-api-key: ANTHROPIC_API_KEY`           |
| Timeout  | 30 seconds                               |
| Fallback | Always — never returns 500 on AI failure |

---

## 🗄 Database Schema

```
Users:         _id, name, email, password*, role, subscriptionPlan, isActive, avatar, specialization
Patients:      _id, name, age, gender, contact, address, bloodGroup, allergies[], medicalHistory, createdBy→User
Appointments:  _id, patientId→Patient, doctorId→User, date, timeSlot, status, notes, bookedBy→User
               Index: { doctorId, date, timeSlot }
Prescriptions: _id, patientId, doctorId, appointmentId, medicines[], instructions, aiExplanation, pdfUrl
DiagnosisLogs: _id, patientId, doctorId, symptoms[], aiResponse{}, riskLevel, isFallback, rawAiText

* password: select:false — never returned in any response
```

---

## 🔒 Security

| Layer           | Implementation                           |
| --------------- | ---------------------------------------- |
| Auth            | JWT + httpOnly cookie                    |
| Passwords       | bcrypt (12 rounds), select:false         |
| XSS             | xss-clean middleware                     |
| NoSQL Injection | express-mongo-sanitize                   |
| HTTP Pollution  | hpp middleware                           |
| Headers         | Helmet.js                                |
| Rate Limiting   | 100 req/15min general, 10 req/15min auth |
| CORS            | CLIENT_URL whitelist                     |
| Validation      | express-validator on every route         |

---

## 🌐 Deployment

### Backend → Vercel

Live backend: https://hackathon-backend-woad-two.vercel.app

```
Build Command: yarn install
Start Command: yarn start
```

Add all backend environment variables in Vercel dashboard, including:

- `MONGO_URI`
- `JWT_SECRET`
- `ANTHROPIC_API_KEY`
- `CLIENT_URL`
- email/SMTP keys
- Cloudinary keys (if used)

### Frontend → Vercel

If you also deploy the frontend to Vercel, point it at this backend:

```bash
VITE_API_URL=https://hackathon-backend-woad-two.vercel.app/api
```

### Database → MongoDB Atlas

1. Create free cluster
2. Create DB user
3. Whitelist `0.0.0.0/0`
4. Copy connection string to `MONGO_URI`

---

## 👨‍💻 Built For

**AI Hackathon — MERN Stack Final Track**

---

## 📄 License

MIT — Free to use and ship.

---

<div align="center">
  <strong>Go ship it bhai. 🚀</strong>
</div>
