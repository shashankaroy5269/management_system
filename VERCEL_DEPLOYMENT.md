# 🚀 Vercel Live Deployment Guide (MERN RBAC System)

This project is pre-configured to deploy seamlessly on Vercel as a fullstack serverless application with both React Frontend and Express Backend running together!

---

## ⚡ Method 1: Deploy with Vercel CLI (Fastest - 1 Minute)

Open your terminal in `C:\Users\Rahul\Desktop\Management_System` and run:

```bash
npx vercel
```

### Steps during prompt:
1. **Log in to Vercel**: Press `Enter` (it opens your browser; log in with GitHub/Email).
2. **Set up and deploy?**: Type `y` and press `Enter`.
3. **Which scope?**: Press `Enter` (selects your account).
4. **Link to existing project?**: Type `n` and press `Enter`.
5. **Project name?**: Press `Enter` (defaults to `management-system` or type your preferred name).
6. **In which directory is your code located?**: Press `Enter` (default `./`).
7. **Want to modify build settings?**: Type `n` and press `Enter` (Vercel automatically uses our `vercel.json`).

For a production deployment, simply run:
```bash
npx vercel --prod
```

---

## 🌐 Method 2: Deploy via GitHub + Vercel Dashboard

1. Create a new repository on GitHub (e.g. `rbac-management-system`).
2. Run in terminal:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/rbac-management-system.git
   git push -u origin main
   ```
3. Go to [vercel.com/new](https://vercel.com/new).
4. Click **Import** next to your GitHub repository.
5. In **Framework Preset**, select **Vite** (Root directory: `./`).
6. Click **Deploy**!

---

## 🔐 Environment Variables for Vercel Dashboard

In your Vercel Project dashboard, navigate to:
**Settings** &rarr; **Environment Variables** and add the following keys:

| Key | Value |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `MONGO_URI` | `mongodb+srv://shashankaroy5269_db_user:Q6abjTx34Yc3XSB7@cluster0.62q4tig.mongodb.net/RBAC_Management` |
| `JWT_SECRET` | `production_super_secret_jwt_access_key_2026` |
| `JWT_REFRESH_SECRET` | `production_super_secret_jwt_refresh_key_2026` |
| `JWT_EXPIRES_IN` | `1h` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `CLOUDINARY_CLOUD_NAME` | `durzmmzav` |
| `CLOUDINARY_API_KEY` | `747313442461839` |
| `CLOUDINARY_API_SECRET` | `XXDwJlvSiRnR3A-5Sdo2tvQDHD8` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `rahul7908362@gmail.com` |
| `SMTP_PASS` | `zzjt icmv qdyf ipzm` |
| `EMAIL_FROM` | `"RBAC Task System" <rahul7908362@gmail.com>` |
| `CLIENT_URL` | `https://<YOUR_VERCEL_PROJECT_NAME>.vercel.app` |

---

✅ **Done! Your project is now 100% live on Vercel with Cloud MongoDB Atlas, Cloudinary Storage, and Real Gmail SMTP Verification.**
