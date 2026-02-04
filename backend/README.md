# SellCraft Backend - Railway Deployment

## Quick Deploy to Railway

1. Go to https://railway.app and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your SellCraft repo (or upload this backend folder)
4. Railway will auto-detect and deploy

## Set Environment Variable

In Railway dashboard:
1. Go to your project → Variables tab
2. Add: `OPENAI_API_KEY` = your OpenAI API key

## Get Your URL

After deploy, Railway gives you a URL like:
`https://sellcraft-api-production-xxxx.up.railway.app`

Update this URL in your app's `constants/Config.ts`

## Local Development

```bash
npm install
OPENAI_API_KEY=your-key node index.js
```

Server runs on http://localhost:3000
