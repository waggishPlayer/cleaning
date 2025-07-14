# Vehicle Cleaning App - Hostinger Deployment Guide

## Overview
Since Hostinger doesn't support Node.js applications, we'll deploy:
- **Backend**: Render.com (free tier)
- **Frontend**: Hostinger (your existing hosting)
- **Database**: MongoDB Atlas (already configured)

## Prerequisites
- GitHub account
- Render.com account
- Hostinger hosting account
- MongoDB Atlas database (already set up)

## Step 1: Deploy Backend to Render

### 1.1 Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/vehicle-cleaning-app.git
git push -u origin main
```

### 1.2 Deploy to Render
1. Go to [render.com](https://render.com) and sign up
2. Connect your GitHub account
3. Click "New" → "Web Service"
4. Select your repository
5. Configure:
   - **Name**: `vehicle-cleaning-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 1.3 Set Environment Variables
In Render dashboard, add these environment variables:
- `NODE_ENV`: `production`
- `MONGODB_URI`: `your-mongodb-connection-string`
- `JWT_SECRET`: `your-secure-jwt-secret`
- `PORT`: `10000` (Render default)

### 1.4 Get Your API URL
After deployment, your API will be available at:
`https://vehicle-cleaning-api.onrender.com`

## Step 2: Deploy Frontend to Hostinger

### 2.1 Update API URL
Edit `client/.env.production`:
```
REACT_APP_API_URL=https://vehicle-cleaning-api.onrender.com/api
```

### 2.2 Build the Frontend
```bash
./build-for-hostinger.sh
```

### 2.3 Upload to Hostinger
1. Download the `client/hostinger-build.zip` file
2. Log into your Hostinger control panel
3. Go to File Manager
4. Navigate to `public_html` folder
5. Delete any existing files
6. Upload and extract `hostinger-build.zip`

## Step 3: Configure Domain

### 3.1 Update CORS (Optional)
In your backend server.js, update CORS configuration:
```javascript
app.use(cors({
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  credentials: true
}));
```

### 3.2 SSL Certificate
- Hostinger usually provides free SSL certificates
- Make sure your domain uses HTTPS

## Step 4: Test Your Application

1. Visit your domain: `https://yourdomain.com`
2. Test API connectivity: `https://vehicle-cleaning-api.onrender.com/api/health`
3. Try registering/logging in to ensure everything works

## Alternative Deployment Options

### Option 2: Full Deployment on Render
If you want everything on one platform:
1. Deploy both frontend and backend to Render
2. Use Render's static site hosting for frontend
3. Point your Hostinger domain to Render using custom domain feature

### Option 3: Use Vercel for Backend
1. Deploy backend to Vercel (supports Node.js)
2. Use the same frontend deployment process for Hostinger

## Troubleshooting

### Common Issues:
1. **CORS errors**: Update your backend CORS configuration
2. **API not accessible**: Check Render logs and environment variables
3. **Database connection**: Verify MongoDB URI and IP whitelist
4. **Build errors**: Check Node.js version compatibility

### Render Free Tier Limitations:
- Service sleeps after 15 minutes of inactivity
- 750 hours/month (sufficient for most projects)
- Limited build time

## Environment Variables Reference

### Backend (.env or Render environment variables):
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vehicle-cleaning
JWT_SECRET=your-super-secret-jwt-key-here
```

### Frontend (.env.production):
```
REACT_APP_API_URL=https://vehicle-cleaning-api.onrender.com/api
REACT_APP_ENV=production
```

## Cost Breakdown
- **Render**: Free tier (750 hours/month)
- **Hostinger**: Your existing hosting plan
- **MongoDB Atlas**: Free tier (512MB storage)
- **Total additional cost**: $0/month

## Next Steps
1. Set up monitoring for your API
2. Configure automated backups for your database
3. Set up domain monitoring
4. Consider upgrading to paid tiers for production use

## Support
If you encounter issues:
1. Check Render deployment logs
2. Verify all environment variables are set
3. Test API endpoints directly
4. Check browser console for frontend errors
