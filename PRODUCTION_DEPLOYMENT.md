# Production Deployment Guide

## 🔗 **Production URLs**

- **Backend**: `https://web-production-09dde.up.railway.app`
- **Frontend**: `https://collab-board-jade.vercel.app`
- **WebSocket**: `https://web-production-09dde.up.railway.app`

## 🚀 **Backend Deployment (Railway)**

### Environment Variables Required

Set these environment variables in your Railway backend:

```env
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
PORT=5010
```

### CORS Configuration

The backend is configured to accept requests from:
- `https://collab-board-jade.vercel.app`
- `https://www.collab-board-jade.vercel.app`
- `https://web-production-09dde.up.railway.app`
- `https://www.web-production-09dde.up.railway.app`

## 🎨 **Frontend Deployment (Vercel)**

### Environment Variables Required

Set these environment variables in your Vercel frontend:

```env
REACT_APP_API_BASE_URL=https://web-production-09dde.up.railway.app
REACT_APP_SOCKET_URL=https://web-production-09dde.up.railway.app
REACT_APP_FRONTEND_URL=https://collab-board-jade.vercel.app
REACT_APP_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
```

### Build Configuration

The frontend will automatically use the production backend URLs when `NODE_ENV=production`.

## 🔧 **Current Status**

### ✅ Working
- Backend server is running on Railway
- All API endpoints are accessible
- CORS is properly configured
- Frontend is deployed on Vercel

### ⚠️ Issues to Fix
1. **Backend Environment**: The backend is running in development mode instead of production
2. **CORS Origins**: Need to ensure production CORS origins are active

## 🛠️ **Fix Backend Environment**

### Option 1: Set Environment Variable in Railway
1. Go to your Railway dashboard
2. Select your backend project
3. Go to Variables tab
4. Add: `NODE_ENV=production`

### Option 2: Update Railway Configuration
Add this to your `railway.json` or deployment settings:

```json
{
  "variables": {
    "NODE_ENV": "production"
  }
}
```

## 🧪 **Testing Production Connection**

### Test Backend Health
```bash
curl https://web-production-09dde.up.railway.app/health
```

### Test CORS from Frontend
```bash
curl -H "Origin: https://collab-board-jade.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://web-production-09dde.up.railway.app/api/auth/login
```

### Test Login Endpoint
```bash
curl -X POST https://web-production-09dde.up.railway.app/api/auth/login \
     -H "Content-Type: application/json" \
     -H "Origin: https://collab-board-jade.vercel.app" \
     -d '{"username":"test","password":"test"}'
```

## 🔍 **Debugging Steps**

1. **Check Backend Environment**:
   ```bash
   curl https://web-production-09dde.up.railway.app/health
   ```
   Look for `"environment": "production"` in the response.

2. **Check CORS Configuration**:
   ```bash
   curl -H "Origin: https://collab-board-jade.vercel.app" \
        -X OPTIONS \
        https://web-production-09dde.up.railway.app/api/test
   ```
   Should return 200 with proper CORS headers.

3. **Test Frontend Connection**:
   - Open browser console on `https://collab-board-jade.vercel.app`
   - Try to login and check for network errors
   - Look for CORS errors in console

## 🚨 **Common Issues & Solutions**

### Issue: CORS Error
**Solution**: Ensure backend has `NODE_ENV=production` and proper CORS origins

### Issue: "Failed to fetch" Error
**Solution**: Check if backend is accessible and frontend environment variables are set

### Issue: WebSocket Connection Failed
**Solution**: Ensure `REACT_APP_SOCKET_URL` is set correctly in Vercel

## 📋 **Deployment Checklist**

- [ ] Backend deployed on Railway with `NODE_ENV=production`
- [ ] Frontend deployed on Vercel with correct environment variables
- [ ] CORS origins configured for both domains
- [ ] MongoDB connection string set in Railway
- [ ] JWT secret configured in Railway
- [ ] Gemini API key configured in both Railway and Vercel
- [ ] All endpoints tested and working
- [ ] WebSocket connection tested
- [ ] Login functionality tested

## 🔄 **Redeploy After Changes**

### Backend (Railway)
- Push changes to your repository
- Railway will automatically redeploy
- Check logs for any errors

### Frontend (Vercel)
- Push changes to your repository
- Vercel will automatically redeploy
- Check deployment logs

## 📞 **Support**

If you encounter issues:
1. Check Railway logs for backend errors
2. Check Vercel logs for frontend errors
3. Test endpoints individually
4. Verify environment variables are set correctly
