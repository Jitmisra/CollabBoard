# Vercel Frontend Connection Fix

## 🚨 Current Issue

The Vercel frontend at [https://collab-board-jade.vercel.app/](https://collab-board-jade.vercel.app/) is getting a "Failed to fetch" error when trying to connect to the Railway backend.

## 🔍 Root Cause Analysis

### 1. Backend Status ✅
- **Railway Backend**: https://web-production-09dde.up.railway.app
- **Health Check**: ✅ Working (returns status OK)
- **Auth Endpoint**: ✅ Working (returns "Invalid credentials" for test login)

### 2. CORS Issue ❌
- **Problem**: CORS headers are not being returned
- **Test Result**: `Access-Control-Allow-Origin: null`
- **Impact**: Browser blocks requests due to CORS policy

### 3. Railway Configuration Issue ❌
- **Problem**: Railway is configured with root directory `/backend` but using wrong start command
- **Current**: `npm start` (runs from root)
- **Should be**: `cd backend && npm start` (runs from backend directory)

## 🛠️ Fix Steps

### Step 1: Update Railway Configuration

The Railway service needs to be redeployed with the correct configuration:

1. **Railway Dashboard**: Go to your Railway project
2. **Service Settings**: Click on the backend service
3. **Update Configuration**:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd backend && npm install"
  },
  "deploy": {
    "startCommand": "cd backend && npm start"
  }
}
```

### Step 2: Verify Environment Variables

Ensure these environment variables are set in Railway:

```env
NODE_ENV=production
PORT=5010
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Step 3: Redeploy Backend

1. **Trigger Redeploy**: In Railway dashboard, click "Deploy" or push a new commit
2. **Wait for Build**: Monitor the build logs
3. **Verify Deployment**: Check that the service starts successfully

### Step 4: Test Connection

After redeployment, test the connection:

```bash
# Test health endpoint
curl https://web-production-09dde.up.railway.app/health

# Test auth endpoint with CORS
curl -X POST https://web-production-09dde.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://collab-board-jade.vercel.app" \
  -d '{"username":"test","password":"test"}'
```

## 🔧 Alternative Solutions

### Option 1: Use Dockerfile (Recommended)

If Nixpacks continues to have issues, switch to Dockerfile:

1. **Update railway.json**:
```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  }
}
```

2. **Ensure Dockerfile is correct**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm install
RUN cd backend && npm install
COPY . .
RUN cd frontend && npm run build:prod
EXPOSE 5010
ENV NODE_ENV=production
ENV PORT=5010
CMD ["npm", "start"]
```

### Option 2: Fix Root Directory

If Railway is set to `/backend` root directory:

1. **Update Start Command**: Change to `npm start` (without cd backend)
2. **Update Build Command**: Change to `npm install` (without cd backend)

## 🎯 Expected Results

After fixing the configuration:

1. **CORS Headers**: Should return proper headers
2. **Frontend Connection**: Vercel should connect successfully
3. **Login Functionality**: Authentication should work
4. **Real-time Features**: WebSocket connections should work

## 📋 Verification Checklist

- [ ] Railway backend redeployed successfully
- [ ] CORS headers are returned properly
- [ ] Vercel frontend can connect to backend
- [ ] Login/Register functionality works
- [ ] Real-time features (chat, whiteboard) work
- [ ] AI features (chatbot, mind maps) work

## 🚀 Quick Fix Commands

If you have access to Railway CLI:

```bash
# Redeploy the service
railway up

# Check service status
railway status

# View logs
railway logs
```

## 📞 Support

If the issue persists after following these steps:

1. Check Railway build logs for errors
2. Verify all environment variables are set
3. Test backend endpoints directly
4. Check CORS configuration in browser dev tools

The main issue is the Railway configuration mismatch between the root directory setting and the start command. Once this is fixed, the Vercel frontend should connect successfully! 🎉
