# Netlify Client Deployment Guide

## Quick Setup (3 minutes)

### 1. Create Netlify Account
- Go to [netlify.com](https://netlify.com)
- Sign up with GitHub (recommended)

### 2. Deploy Your Client
- Click "New site from Git"
- Choose "GitHub" and select your `artmak` repository
- Netlify will auto-detect the build settings from `netlify.toml`

### 3. Configure Build Settings
Netlify should auto-detect from `netlify.toml`, but verify:
- **Base directory**: `.` (root of repository)
- **Build command**: `pnpm install && pnpm build`
- **Publish directory**: `packages/client/dist`

### 4. Set Environment Variables
In Netlify dashboard, go to Site settings → Environment variables:
```
VITE_SERVER_URL=https://your-server.railway.app
```

### 5. Deploy!
- Click "Deploy site"
- Netlify will build and deploy your client
- You'll get a URL like: `https://your-game.netlify.app`

## Benefits of Netlify for Client
- ✅ **Free tier** - Unlimited static sites
- ✅ **Global CDN** - Fast loading worldwide
- ✅ **Automatic deployments** on every GitHub push
- ✅ **Branch previews** - Preview deployments for PRs
- ✅ **Custom domains** - Free subdomain + custom domains
- ✅ **Form handling** - Built-in form processing
- ✅ **Edge functions** - Serverless functions if needed

## Cost
- **Free tier**: Unlimited static sites
- **Pro plan**: $19/month for advanced features (not needed for your game)

## Why Not Railway for Client?
- ❌ **More expensive** - Paying for server instance to serve static files
- ❌ **No CDN** - Single server location vs global CDN
- ❌ **Overkill** - Railway is designed for backend services
- ❌ **Slower** - No edge caching for static assets

## Perfect Architecture
```
Client (Netlify) ←→ Server (Railway)
     Free              $5/month
   Global CDN        Real-time
   Static files      WebSockets
```

This gives you the best of both worlds!
