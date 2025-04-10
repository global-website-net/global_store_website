# Global Store Website

A Next.js-based e-commerce platform for managing global store operations.

## Features

- User Authentication
- Admin Dashboard
- Package Tracking
- Shop Management
- Balance Management
- Blog System

## Tech Stack

- Next.js 14
- PostgreSQL
- Prisma ORM
- NextAuth.js
- Tailwind CSS
- Recharts

## Deployment Requirements

1. Node.js 18+ installed
2. PostgreSQL database (e.g., Supabase)
3. Environment variables configured

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.uviaefxhirpjnaytqjow.supabase.co:5432/postgres
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up the database:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. For production:
   ```bash
   npm run build
   npm start
   ```

## Deployment

This project is optimized for deployment on Vercel:

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

## Database Management

Access Prisma Studio locally:
```bash
npx prisma studio
``` 