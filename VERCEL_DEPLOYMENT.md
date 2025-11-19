# Deploying Xtractic AI Frontend to Vercel

This guide will help you deploy the Xtractic AI frontend to Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com/signup) (free tier works great)
- Your backend API deployed and accessible via HTTPS

## Quick Deploy

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Navigate to the UI directory:
```bash
cd ui
```

3. Login to Vercel:
```bash
vercel login
```

4. Deploy:
```bash
vercel
```

5. Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? Select your account
   - Link to existing project? **No**
   - What's your project's name? **xtractic-ai**
   - In which directory is your code located? **.**
   - Want to override the settings? **No**

6. Add environment variable:
```bash
vercel env add VITE_API_BASE_URL production
```
Then paste your backend API URL (e.g., `https://your-backend.com/api`)

7. Redeploy with environment variable:
```bash
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard

1. Push your code to GitHub

2. Go to [Vercel Dashboard](https://vercel.com/new)

3. Click "Import Project"

4. Import your GitHub repository

5. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `ui`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

6. Add Environment Variables:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://your-backend-api.com/api`

7. Click "Deploy"

## Configuration

### Environment Variables

In Vercel Dashboard, go to Settings → Environment Variables and add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_API_BASE_URL` | Your backend API URL | Production, Preview, Development |

Example: `https://api.xtractic-ai.com/api`

### Custom Domain (Optional)

1. Go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### Backend API Configuration

Update `vercel.json` to proxy API requests:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-actual-backend.com/api/:path*"
    }
  ]
}
```

Replace `your-actual-backend.com` with your backend API URL.

## CORS Configuration

Ensure your backend API allows requests from your Vercel domain:

```python
# Example for FastAPI
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://xtractic-ai.vercel.app",  # Your Vercel domain
        "https://your-custom-domain.com",   # Your custom domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Deployment Workflow

Every push to your main branch will automatically trigger a new deployment:

```bash
git add .
git commit -m "Update frontend"
git push origin main
```

Vercel will:
1. Detect the push
2. Run the build
3. Deploy to production
4. Provide a deployment URL

### Preview Deployments

Every pull request gets its own preview URL for testing.

## Monitoring

View deployment logs and analytics in the Vercel Dashboard:
- Real-time logs during build
- Runtime logs
- Analytics and performance metrics
- Error tracking

## Troubleshooting

### Build Fails

Check build logs in Vercel Dashboard. Common issues:
- Missing environment variables
- TypeScript errors
- Dependency issues

Solution:
```bash
# Test build locally first
npm run build
```

### API Connection Issues

1. Verify `VITE_API_BASE_URL` is set correctly
2. Check CORS configuration on backend
3. Ensure backend API is accessible via HTTPS

### Environment Variables Not Working

Remember to:
1. Redeploy after adding/changing environment variables
2. Prefix all Vite env vars with `VITE_`

## Production Checklist

- [ ] Backend API is deployed and accessible
- [ ] `VITE_API_BASE_URL` environment variable is set
- [ ] CORS is configured on backend
- [ ] Custom domain configured (optional)
- [ ] Test all features in production
- [ ] Monitor performance and errors

## Useful Commands

```bash
# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# View environment variables
vercel env ls

# Remove a deployment
vercel remove [deployment-url]
```

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Environment Variables in Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
