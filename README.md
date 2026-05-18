# AI Clinic Management SaaS — Backend API

A production-ready Node.js/Express REST API for AI-powered clinic management with RBAC, PDF prescriptions, and Gemini-powered intelligence.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Start development server:
   ```bash
   npm run dev
   ```

## API Base URL

`http://localhost:5000/api`

## Authentication

POST `/api/auth/register`
POST `/api/auth/login`
GET `/api/auth/me`

## Environment Variables

- `PORT`
- `NODE_ENV`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRE`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `GEMINI_API_KEY`
