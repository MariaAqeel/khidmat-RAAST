# Free Deployment Guide (Render + Vercel)

**Total cost:** $0/month (free tier)

## Part 1: Push Your Code to GitHub

```bash
cd /Users/rafayaadnan/Desktop/khidmat-RAAST

# Commit your changes
git add -A
git commit -m "feat: implement therapist portal and API routes"
git push origin main
```

---

## Part 2: Deploy Backend + Database on Render (FREE)

Render offers a **free tier** that includes 1 database instance + 1 web service (enough for your NGO prototype).

### Step 1: Create a Render Account
1. Go to https://render.com
2. Sign up with GitHub (easiest)
3. Authorize the app to access your repos

### Step 2: Create a PostgreSQL Database
1. Click **New** → **PostgreSQL**
2. Name it: `rast-db`
3. Region: Choose closest to your users
4. PostgreSQL version: 15
5. Pricing Plan: **Free** (scroll down to see it)
6. Click **Create Database**
7. **Wait 2–3 minutes** while it spins up
8. Once ready, copy the **Internal Database URL** (you'll need this in Step 4)

### Step 3: Deploy the Backend
1. Click **New** → **Web Service**
2. Connect your GitHub repo (`khidmat-RAAST`)
3. Fill in:
   - **Name:** `rast-backend`
   - **Environment:** Node
   - **Build Command:** `cd backend && npm install && npm run build`
   - **Start Command:** `cd backend && npm run start`
   - **Pricing Plan:** Free
4. Click **Create Web Service**

### Step 4: Set Environment Variables
While the backend is deploying, add environment variables:

1. On the Render dashboard, go to your **rast-backend** service
2. Click **Environment** (left sidebar)
3. Add these variables:
   ```
   DATABASE_URL=<paste the PostgreSQL Internal Database URL from Step 2>
   JWT_SECRET=khidmat-secret-key-change-in-production
   PORT=4000
   CORS_ORIGIN=<your-frontend-vercel-url> (e.g., https://rast-frontend.vercel.app)
   NODE_ENV=production
   ```
4. Click **Save**

### Step 5: Wait for Backend to Deploy
- Takes 2–5 minutes
- You'll see a green "live" badge when ready
- Copy your backend URL: `https://rast-backend.onrender.com` (Render generates this)

---

## Part 3: Deploy Frontend on Vercel (FREE)

### Step 1: Create a Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize to access your repos

### Step 2: Import Your Project
1. Click **Add New** → **Project**
2. Select `khidmat-RAAST` repo
3. Configure:
   - **Framework:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (Vercel detects this)
   - **Install Command:** `npm install`
4. Click **Deploy**

### Step 3: Add Environment Variables
1. Once deployed, go to **Settings** → **Environment Variables**
2. Add this variable:
   ```
   VITE_API_BASE_URL=https://rast-backend.onrender.com
   ```
   (This tells your frontend where the backend lives)
3. Click **Save**

### Step 4: Redeploy Frontend
1. Go to **Deployments** tab
2. Click the three dots next to the latest deployment
3. Select **Redeploy** (so it picks up the new env var)

---

## Part 4: Update Vite Config for Production

Replace the proxy in `frontend/vite.config.ts` with environment-aware config:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_API_BASE_URL || "http://localhost:4000",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
  },
});
```

Commit and push:
```bash
git add frontend/vite.config.ts
git commit -m "feat: add production API base URL"
git push origin main
```

Vercel will auto-redeploy.

---

## Part 5: Initialize Database (One-Time Setup)

After the backend is live, run the Prisma migrations on Render:

1. Open Render Dashboard
2. Go to **rast-backend** service
3. Click **Shell** tab at the top
4. Run:
   ```bash
   cd backend && npx prisma migrate deploy
   npx prisma db seed
   ```

This creates all tables and seeds demo accounts.

---

## Part 6: Test the Live App

1. Go to your Vercel frontend URL (e.g., `https://rast-frontend.vercel.app`)
2. Log in with demo account:
   - **Email:** `therapist@rast.local`
   - **Password:** `RastDev!2026`
3. Select **Therapist** role
4. You should see the therapist dashboard with student data from the backend

---

## Demo Accounts (After Seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@rast.local | RastDev!2026 |
| Therapist | therapist@rast.local | RastDev!2026 |
| Parent | parent@rast.local | RastDev!2026 |
| Student | student@rast.local | RastDev!2026 |

---

## Troubleshooting

### "Connection refused" on Vercel
- Check that `DATABASE_URL` is set correctly in Render backend
- Verify `CORS_ORIGIN` includes your Vercel frontend URL

### "Database connection error" on Render
- Go to Render PostgreSQL instance → Click **Connect**
- Verify the Internal Database URL is copied correctly (not External)

### Frontend still calling `localhost:4000`
- Vercel needs the env var **before** the build
- Re-read Part 3, Step 3 carefully
- Click **Redeploy** after adding env var

---

## Next Steps (Adding Features)

Any time you want to add features:
1. Push code to GitHub
2. Vercel auto-deploys frontend
3. Render auto-deploys backend (if you push changes to `backend/` folder)

Enjoy your free deployment! 🚀
