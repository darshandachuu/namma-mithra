# Namma Mithra – Complete Cloud Deployment Guide

This guide covers deploying **Namma Mithra** to free, production-ready cloud platforms so your college evaluators, faculty, and students can access the application from any computer or mobile phone.

---

## 🌟 Recommended Deployment Approaches

| Deployment Option | Frontend | Backend | Database | Cost | Difficulty |
|---|---|---|---|---|---|
| **Option 1: Full-Stack on Render** (Easiest) | Render Static Site | Render Web Service | Built-in SQLite or Cloud MySQL | **100% Free** | ⭐ (5 mins) |
| **Option 2: Vercel + Render** (Fastest CDN) | Vercel | Render Web Service | Cloud MySQL / SQLite | **100% Free** | ⭐⭐ (7 mins) |
| **Option 3: Railway** (All-in-One) | Railway | Railway | Railway Managed MySQL | Free trial / \$5 | ⭐ (3 mins) |

---

## 🚀 Option 1: Full-Stack on Render (Step-by-Step)

[Render](https://render.com) is the most popular platform for Python Flask + React applications.

### Part A: Deploy the Flask Backend API

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** $\rightarrow$ **Web Service**.
2. Connect your GitHub repository containing Namma Mithra.
3. Fill in the settings:
   - **Name**: `namma-mithra-api`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Region**: Oregon (or nearest to you)
   - **Branch**: `main`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn wsgi:app`
   - **Instance Type**: `Free`
4. Under **Advanced** $\rightarrow$ **Environment Variables**, add:
   - `FLASK_ENV` = `production`
   - `SECRET_KEY` = *(click Generate or enter a random string)*
   - `JWT_SECRET_KEY` = *(click Generate or enter a random string)*
   - `DB_ENGINE` = `sqlite` *(or your MySQL connection string, see Section 4)*
5. Click **Create Web Service**.
6. Wait 2 minutes. Render will provide your public backend URL, e.g.:
   `https://namma-mithra-api.onrender.com`
   *(Test by visiting `https://namma-mithra-api.onrender.com/api/dashboard/summary` in your browser)*

---

### Part B: Deploy the React Frontend

1. On Render Dashboard, click **New +** $\rightarrow$ **Static Site**.
2. Select the same GitHub repository.
3. Configure the frontend:
   - **Name**: `namma-mithra`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Under **Advanced** $\rightarrow$ **Environment Variables**, add:
   - `VITE_API_BASE_URL` = `https://namma-mithra-api.onrender.com/api` *(use your Backend URL from Part A)*
5. Under **Redirects/Rewrites**:
   - Add a rewrite rule:
     - **Source**: `/*`
     - **Destination**: `/index.html`
     - **Action**: `Rewrite`
6. Click **Create Static Site**.
7. In ~60 seconds, your site is live! You will get your public URL, e.g.:
   `https://namma-mithra.onrender.com`

---

## ⚡ Option 2: Deploy Frontend on Vercel + Backend on Render

Vercel provides lightning-fast global CDN edge hosting for React.

### Deploy Frontend on Vercel:
1. Go to [Vercel.com](https://vercel.com/) and sign in with your GitHub account.
2. Click **Add New...** $\rightarrow$ **Project**.
3. Select your `namma-mithra` repository.
4. Set **Root Directory** to `frontend` (click Edit next to Root Directory and select `frontend`).
5. In **Environment Variables**, add:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://namma-mithra-api.onrender.com/api` *(your Render backend URL)*
6. Click **Deploy**.
7. Your app is live at `https://namma-mithra.vercel.app`!
*(The `vercel.json` file in `frontend/` automatically handles SPA routing for all dashboard pages).*

---

## 🗄️ Setting Up Free Cloud MySQL 8 (Optional)

If you want a dedicated cloud MySQL 8 instance rather than SQLite, you can use any of these free cloud providers:

### Using Aiven for MySQL (Free Tier):
1. Sign up at [Aiven.io](https://aiven.io/).
2. Create a free **MySQL** database.
3. Copy the **Service URI**:
   `mysql+pymysql://avnadmin:password@mysql-xxxxx.aivencloud.com:port/defaultdb?ssl_mode=REQUIRED`
4. Open your Render backend service $\rightarrow$ **Environment Variables**:
   - Add `DATABASE_URL` = *your Aiven MySQL Service URI*
5. Run the SQL schema and seeds once:
   ```cmd
   mysql -h mysql-xxxxx.aivencloud.com -P <port> -u avnadmin -p defaultdb < database/schema.sql
   mysql -h mysql-xxxxx.aivencloud.com -P <port> -u avnadmin -p defaultdb < database/seed_data.sql
   ```

---

## 🐳 Option 3: Local / Server Docker Deployment

If deploying to a dedicated VPS or institutional Linux/Windows server with Docker:

```cmd
cd "c:\Users\mca.d\Desktop\project 1\deployment"
docker compose up -d --build
```

This starts:
- MySQL 8 on port `3306`
- Flask API with Gunicorn on port `5000`
- React Frontend with Nginx on port `3000`

---

## 🛠️ Pre-Deployment Verification Checklist

Before presenting your deployed project:
- [x] Backend responds with HTTP 200 on `/api/dashboard/summary`
- [x] CORS is enabled for all origins (`r"/*": {"origins": "*"}`)
- [x] Uploaded photographs load properly across domains using `getFullImageUrl`
- [x] SPA rewrites (`/index.html`) configured for React Router
- [x] Login demo credentials autofill properly on public URL
