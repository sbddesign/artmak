# Railway Deployment Guide

## Quick Setup (5 minutes)

### 1. Create Railway Account
- Go to [railway.app](https://railway.app)
- Sign up with GitHub (recommended)

### 2. Deploy Your Server
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your `artmak` repository
- Railway will auto-detect it's a Node.js app

### 3. Configure Environment Variables
In Railway dashboard, go to Variables tab and add:
```
CLIENT_URL=https://your-netlify-app.netlify.app
NODE_ENV=production
```

### 4. Set Build Settings
Railway should auto-detect, but if needed:
- **Root Directory**: `packages/server`
- **Build Command**: `pnpm install && pnpm build`
- **Start Command**: `pnpm start`

### 5. Deploy!
- Click "Deploy"
- Railway will build and deploy your server
- You'll get a URL like: `https://your-app.railway.app`

### 6. Update Client
Update your Netlify environment variable:
```
VITE_SERVER_URL=https://your-app.railway.app
```

## Benefits of Railway
- ✅ **Automatic deployments** on every GitHub push
- ✅ **WebSocket support** built-in
- ✅ **Free tier** with $5/month credit
- ✅ **Custom domains** available
- ✅ **Zero configuration** needed
- ✅ **Health checks** included

## Cost
- **Free tier**: $5/month credit (plenty for your game)
- **Paid plans**: Start at $5/month for more resources

## Alternative: Render.com
If you prefer Render:
1. Go to [render.com](https://render.com)
2. Connect GitHub repo
3. Choose "Web Service"
4. Set root directory to `packages/server`
5. Deploy!

Both platforms are much easier than Digital Ocean for your use case!
