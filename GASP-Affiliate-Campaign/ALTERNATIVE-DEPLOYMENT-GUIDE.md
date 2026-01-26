# 🚀 Alternative Deployment Guide: Express.js API

## **📋 Current Status**

**Issue:** Vercel has team-level SSO authentication that's blocking all API endpoints  
**Solution:** Deploy Express.js server to alternative platforms  
**Status:** ✅ Express.js server created and tested locally  

---

## **🔧 Express.js Server Details**

### **Server Features:**
- ✅ **Health Check:** `/api/health`
- ✅ **LeadDyno Submission:** `/api/leaddyno/submit` (POST)
- ✅ **Google Sheets Submission:** `/api/sheets/submit` (POST)
- ✅ **Test Endpoints:** `/api/hello`, `/api/simple`
- ✅ **CORS Enabled** for frontend integration
- ✅ **Environment Variable Support**

### **Local Testing:**
```bash
npm install
npm run dev
# Server runs on http://localhost:3000
```

---

## **🚀 Deployment Options**

### **Option 1: Railway (Recommended)**
**Pros:** Fast, reliable, good free tier  
**Cons:** Limited free tier  

**Steps:**
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select this repository
5. Railway will auto-detect Node.js and deploy
6. Set environment variables in Railway dashboard

**Environment Variables:**
```
LEADDYNO_API_KEY=your_key_here
LEADDYNO_BASE_URL=your_url_here
GOOGLE_SHEET_ID=your_sheet_id_here
```

---

### **Option 2: Render**
**Pros:** Generous free tier, reliable  
**Cons:** Slightly slower cold starts  

**Steps:**
1. Go to [render.com](https://render.com)
2. Sign in with GitHub
3. Click "New" → "Web Service"
4. Connect GitHub repository
5. Configure:
   - **Name:** `gasp-affiliate-api`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Set environment variables
7. Deploy

---

### **Option 3: Heroku**
**Pros:** Very reliable, good documentation  
**Cons:** No free tier anymore  

**Steps:**
1. Install Heroku CLI: `npm install -g heroku`
2. Login: `heroku login`
3. Create app: `heroku create gasp-affiliate-api`
4. Set environment variables:
   ```bash
   heroku config:set LEADDYNO_API_KEY=your_key
   heroku config:set LEADDYNO_BASE_URL=your_url
   heroku config:set GOOGLE_SHEET_ID=your_sheet_id
   ```
5. Deploy: `git push heroku main`

---

## **🔑 Environment Variables Setup**

### **Required Variables:**
```bash
LEADDYNO_API_KEY=your_leadyno_api_key
LEADDYNO_BASE_URL=https://api.leadyno.com
GOOGLE_SHEET_ID=your_google_sheet_id
```

### **Optional Variables:**
```bash
NODE_ENV=production
PORT=3000
```

---

## **📱 Frontend Integration**

### **Update API Base URL:**
Once deployed, update your frontend to use the new API URL:

```javascript
// Old Vercel URL (not working)
const API_BASE = 'https://leaddyno-affiliate.vercel.app/api';

// New alternative platform URL
const API_BASE = 'https://your-app-name.railway.app/api';
// or
const API_BASE = 'https://your-app-name.onrender.com/api';
```

### **Test Endpoints:**
```bash
# Health check
curl https://your-app-name.railway.app/api/health

# Test endpoint
curl https://your-app-name.railway.app/api/hello

# LeadDyno submission
curl -X POST https://your-app-name.railway.app/api/leaddyno/submit \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","firstName":"John","lastName":"Doe"}'
```

---

## **🚨 Emergency Deployment Commands**

### **Quick Railway Deploy:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### **Quick Render Deploy:**
```bash
# Render auto-deploys from GitHub
# Just push to main branch
git add .
git commit -m "Add Express.js server for alternative deployment"
git push origin main
```

---

## **✅ Success Criteria**

### **Immediate Success:**
- ✅ **Express.js server running locally**
- ✅ **All API endpoints responding**
- ✅ **CORS working for frontend**
- ✅ **Environment variables configurable**

### **Full Success:**
- ✅ **Deployed to alternative platform**
- ✅ **API endpoints accessible publicly**
- ✅ **Frontend integration working**
- ✅ **LeadDyno integration functional**
- ✅ **Google Sheets integration functional**

---

## **📞 Next Steps**

### **Immediate (Next 30 minutes):**
1. **Choose deployment platform** (Railway recommended)
2. **Deploy Express.js server**
3. **Test all endpoints**
4. **Update frontend API URLs**

### **Within 1 hour:**
1. **Verify LeadDyno integration**
2. **Test Google Sheets integration**
3. **Complete end-to-end testing**
4. **Document working configuration**

---

## **🔍 Troubleshooting**

### **Common Issues:**
- **Port conflicts:** Ensure PORT environment variable is set
- **CORS errors:** Check CORS configuration in server.js
- **Environment variables:** Verify all required vars are set
- **Build failures:** Check Node.js version compatibility

### **Debug Commands:**
```bash
# Check server logs
railway logs
# or
render logs

# Test endpoints locally
curl http://localhost:3000/api/health

# Check environment variables
railway variables
# or
render env
```

---

## **📚 Resources**

- **Railway Docs:** [railway.app/docs](https://railway.app/docs)
- **Render Docs:** [render.com/docs](https://render.com/docs)
- **Express.js Docs:** [expressjs.com](https://expressjs.com)
- **CORS Documentation:** [github.com/expressjs/cors](https://github.com/expressjs/cors)

---

**🎯 Goal: Get a working API system deployed within the next 1 hour, bypassing Vercel's authentication issues.**
