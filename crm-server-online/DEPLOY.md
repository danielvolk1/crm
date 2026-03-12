# Deploy CRM Online - Step by Step Guide

This guide will help you deploy your CRM to the cloud so it's always online and accessible from anywhere.

## Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Frontend      │──────▶│   Backend API    │──────▶│   Database      │
│  (Static Host)  │◀──────│   (Render.com)   │◀──────│  (MongoDB Atlas)│
└─────────────────┘      └──────────────────┘      └─────────────────┘
       ▲                          ▲
       │                          │
       └────────── WebSocket ─────┘
              (Real-time Sync)
```

## Services Used (All Free Tiers)

1. **MongoDB Atlas** - Database (Free forever - 512MB)
2. **Render.com** - Backend API hosting (Free tier)
3. **Kimi / Vercel / Netlify** - Frontend hosting (Free)

---

## Step 1: Set Up MongoDB Atlas (Database)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account
3. Create a new cluster (Free tier M0)
4. Choose a cloud provider (AWS, Google Cloud, or Azure)
5. Select a region close to you
6. Click "Create Cluster" (takes ~5 minutes)

### Create Database User

1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and password (SAVE THESE!)
5. Under "Database User Privileges", select "Read and write to any database"
6. Click "Add User"

### Get Connection String

1. Click "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (or add your specific IP)
4. Go back to "Clusters" and click "Connect"
5. Choose "Drivers" → "Node.js"
6. Copy the connection string, it looks like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/crm-database?retryWrites=true&w=majority
   ```
7. Replace `<username>` and `<password>` with your actual credentials

---

## Step 2: Deploy Backend to Render.com

1. Go to https://render.com
2. Sign up with GitHub or email
3. Click "New" → "Web Service"
4. Choose "Build and deploy from a Git repository" OR "Deploy from image"

### Option A: Deploy from GitHub (Recommended)

1. Push your `crm-server-online` folder to a GitHub repository
2. Connect your GitHub account to Render
3. Select your repository
4. Configure:
   - **Name**: `crm-backend` (or any name)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click "Advanced" and add Environment Variables:
   - `MONGODB_URI`: Your MongoDB connection string from Step 1
   - `FRONTEND_URL`: Leave blank for now (we'll update after Step 3)
   - `JWT_SECRET`: Any random string (e.g., `my-super-secret-key-12345`)
6. Click "Create Web Service"

### Option B: Deploy Manually (Without Git)

1. Download and install the Render CLI: https://render.com/docs/cli
2. Or use the Render Dashboard to upload files directly

### Get Your Backend URL

After deployment, Render will give you a URL like:
```
https://crm-backend.onrender.com
```

Save this URL - you'll need it for the frontend!

---

## Step 3: Deploy Frontend

### Option A: Kimi (Already Done!)

Your frontend is already deployed at:
```
https://dyu43kdgccpkq.ok.kimi.link
```

### Option B: Vercel (Recommended for Production)

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your repository or upload files
5. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add Environment Variable:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://crm-backend.onrender.com`)
7. Click "Deploy"

### Option C: Netlify

1. Go to https://netlify.com
2. Drag and drop your `app/dist` folder
3. Your site will be live instantly!

---

## Step 4: Connect Frontend to Backend

### Update Frontend API URL

1. Edit `app/src/lib/api.ts`:
   ```typescript
   const API_URL = 'https://your-render-backend-url.onrender.com';
   ```

2. Rebuild the frontend:
   ```bash
   cd app
   npm run build
   ```

3. Redeploy the frontend with the updated files

### Update Backend CORS (Important!)

1. Go to your Render dashboard
2. Click on your web service
3. Go to "Environment" tab
4. Update `FRONTEND_URL` to your actual frontend URL
5. Click "Save Changes"

---

## Step 5: Test Everything

1. Open your frontend URL in a browser
2. Login with:
   - Username: `Volk`
   - Password: `13012`
3. Create a test client
4. Check if data persists after refreshing
5. Open in another browser/device to test real-time sync

---

## Updating Your Deployment

### Update Backend

1. Push changes to GitHub (if using Git)
2. Render will auto-deploy
3. Or manually redeploy from Render dashboard

### Update Frontend

1. Make changes to your code
2. Rebuild: `npm run build`
3. Redeploy to your hosting service

---

## Troubleshooting

### "Cannot connect to database"
- Check your `MONGODB_URI` is correct
- Make sure IP whitelist allows Render's servers
- Verify database user credentials

### "CORS error"
- Update `FRONTEND_URL` in Render environment variables
- Make sure it matches your actual frontend URL exactly

### "404 Not Found"
- Check your API URL in the frontend is correct
- Verify the backend is running (check Render logs)

### "Real-time sync not working"
- WebSockets should work automatically on Render
- Check browser console for connection errors
- Make sure your firewall isn't blocking WebSockets

---

## Costs (Free Tier Limits)

| Service | Free Tier | Limits |
|---------|-----------|--------|
| MongoDB Atlas | Forever | 512MB storage |
| Render | Forever | 750 hours/month, sleeps after 15 min idle |
| Vercel | Forever | 100GB bandwidth/month |
| Netlify | Forever | 100GB bandwidth/month |

**Total Cost: $0/month** for small teams!

---

## Next Steps

1. Set up custom domain (optional)
2. Add SSL certificate (automatic on most platforms)
3. Set up monitoring and alerts
4. Regular database backups (MongoDB Atlas does this automatically)

---

## Need Help?

- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs

---

**Your CRM will now be online 24/7 and accessible from anywhere!** 🚀
