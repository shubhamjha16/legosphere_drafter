# Troubleshooting Guide - Legosphere Drafter

This guide helps resolve common issues when setting up and running Legosphere Drafter.

## Table of Contents

1. [Gemini AI Issues](#gemini-ai-issues)
2. [Backend Connection Issues](#backend-connection-issues)
3. [Database Connection Issues](#database-connection-issues)
4. [Build and Dependency Issues](#build-and-dependency-issues)
5. [Authentication Issues](#authentication-issues)

---

## Gemini AI Issues

### Problem: "GEMINI_API_KEY is missing" or No AI Response

**Symptoms:**
- Error message about missing API key
- AI features not generating any content
- Console shows "API key is missing"

**Solutions:**

#### Step 1: Verify API Key is Set

Check frontend `.env`:
```bash
cat .env | grep VITE_GEMINI_API_KEY
```

Check backend `server/.env`:
```bash
cat server/.env | grep GEMINI_API_KEY
```

Both should show a key starting with `AIza` and approximately 39 characters long.

#### Step 2: Verify API Key Format

The API key should look like:
```
AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX (example format)
```

Common mistakes:
- ❌ Extra spaces: `VITE_GEMINI_API_KEY= AIzaSy...` (space after =)
- ❌ Quotes: `VITE_GEMINI_API_KEY="AIzaSy..."` (unnecessary in .env)
- ❌ Wrong prefix: Using `NEXT_PUBLIC_` instead of `VITE_`

#### Step 3: Get a New API Key

If your API key is invalid or revoked:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"** or **"Get API Key"**
4. Copy the new key
5. Update both `.env` files:
   ```env
   # Frontend .env
   VITE_GEMINI_API_KEY=your_new_key_here
   
   # Backend server/.env
   GEMINI_API_KEY=your_new_key_here
   ```

#### Step 4: Restart Both Servers

After updating the API key:
```bash
# Stop both servers (Ctrl+C in their terminals)

# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend (new terminal)
npm run dev
```

#### Step 5: Test the API Key

Test using curl:
```bash
curl -X POST http://localhost:3001/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Say hello", "userId": 1}'
```

Expected response:
```json
{"text":"Hello! How can I help you today?","wordCount":7}
```

### Problem: "Failed to generate text" or API Errors

**Possible Causes:**

1. **API Quota Exceeded**
   - Check your usage at [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Free tier has limits (e.g., 60 requests per minute)
   - Solution: Wait or upgrade your plan

2. **API Key Restrictions**
   - Your API key might have IP or referrer restrictions
   - Solution: Check restrictions in [Google Cloud Console](https://console.cloud.google.com/)
   - Remove restrictions or add your domain/IP

3. **Network Issues**
   - Check your internet connection
   - Try accessing https://generativelanguage.googleapis.com/ in a browser
   - Check if a firewall is blocking the connection

4. **Invalid Request Format**
   - Ensure your prompt is not empty
   - Check that the request body is valid JSON

---

## Backend Connection Issues

### Problem: "Backend unavailable" or CORS Errors

**Symptoms:**
- Frontend cannot connect to backend
- CORS policy errors in browser console
- "Failed to fetch" errors

**Solutions:**

#### Step 1: Verify Backend is Running

```bash
# Check if backend is running
curl http://localhost:3001/api/health
```

Expected response:
```json
{"status":"ok","message":"Legosphere Drafter Backend is running"}
```

If this fails, the backend is not running.

#### Step 2: Start the Backend

```bash
cd server
npm run dev
```

Look for the message:
```
Server running on http://localhost:3001
```

#### Step 3: Check Port Conflicts

If port 3001 is already in use:

```bash
# Find what's using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or change the port in server/.env
PORT=3002
```

Then update `src/services/backendService.ts` to match.

#### Step 4: Verify CORS Configuration

Check `server/index.ts` has:
```typescript
app.use(cors());
```

If issues persist, try explicit CORS configuration:
```typescript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Problem: Backend Starts But Immediately Exits

**Solutions:**

1. **Check for Syntax Errors**
   ```bash
   cd server
   npx tsc --noEmit
   ```

2. **Check for Missing Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Check Environment Variables**
   ```bash
   cat server/.env
   ```
   Ensure all required variables are set.

4. **Check Server Logs**
   ```bash
   cd server
   npm start
   ```
   Look for error messages in the output.

---

## Database Connection Issues

### Problem: "Can't reach database server"

**Symptoms:**
- `P1001` Prisma error
- "Can't reach database server at `db.xxx.supabase.co`"
- Failed to fetch users

**Solutions:**

#### Step 1: Verify Database URL

Check `server/.env`:
```bash
cat server/.env | grep DATABASE_URL
```

Should look like:
```
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true
```

#### Step 2: Verify Database Password

The password in the URL should be URL-encoded if it contains special characters.

Example with special characters in password:
- `@` should be encoded as `%40`
- `#` should be encoded as `%23`
- Example: `...postgres.xxx:MyPass%40word@aws-...`

#### Step 3: Get Correct Connection String

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Database**
4. Scroll to **Connection string**
5. Select **Connection pooling** (recommended)
6. Copy the connection string
7. Replace `[YOUR-PASSWORD]` with your actual password
8. Update `server/.env`

#### Step 4: Test Database Connection

```bash
cd server
npx prisma db pull
```

If successful, your database connection works.

#### Step 5: Regenerate Prisma Client

```bash
cd server
npx prisma generate
```

### Problem: Database Password Issues

**If you don't remember your database password:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Database**
4. Click **"Reset database password"**
5. Copy the new password immediately (you won't see it again!)
6. Update `server/.env` with the new password

### Problem: Prisma Migration Issues

**Solutions:**

1. **Push schema without migration:**
   ```bash
   cd server
   npx prisma db push
   ```

2. **Reset database (WARNING: Deletes all data):**
   ```bash
   cd server
   npx prisma migrate reset
   ```

3. **Create new migration:**
   ```bash
   cd server
   npx prisma migrate dev --name init
   ```

---

## Build and Dependency Issues

### Problem: Module Not Found Errors

**Solutions:**

1. **Clear and reinstall dependencies:**
   ```bash
   # Frontend
   rm -rf node_modules package-lock.json
   npm install
   
   # Backend
   cd server
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Clear build cache:**
   ```bash
   # Frontend
   rm -rf .vite node_modules/.vite
   npm run dev
   ```

### Problem: TypeScript Errors

**Solutions:**

1. **Check TypeScript version:**
   ```bash
   npm list typescript
   cd server && npm list typescript
   ```

2. **Rebuild TypeScript:**
   ```bash
   # Frontend
   npx tsc --noEmit
   
   # Backend
   cd server
   npx tsc --noEmit
   ```

### Problem: Build Fails

**Solutions:**

1. **Check Node.js version:**
   ```bash
   node -v
   ```
   Should be v18 or higher.

2. **Clear build artifacts:**
   ```bash
   rm -rf dist
   npm run build
   ```

3. **Check for ESLint errors:**
   ```bash
   npm run lint
   ```

---

## Authentication Issues

### Problem: Supabase Authentication Not Working

**Symptoms:**
- Can't sign in or sign up
- "Invalid API credentials" error
- Auth state not persisting

**Solutions:**

#### Step 1: Verify Supabase Configuration

Check `.env`:
```bash
cat .env | grep VITE_SUPABASE
```

Should show both:
- `VITE_SUPABASE_URL=https://xxx.supabase.co`
- `VITE_SUPABASE_ANON_KEY=eyJ...`

#### Step 2: Verify Supabase Project is Active

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Check project status
3. Ensure project is not paused

#### Step 3: Check Authentication Settings

1. In Supabase Dashboard → **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure any other providers you want to use

#### Step 4: Check Email Configuration

If using email authentication:
1. Supabase Dashboard → **Authentication** → **Email Templates**
2. Verify email templates are configured
3. Check your spam folder for confirmation emails

### Problem: User Not Persisting After Refresh

**Solutions:**

1. **Check localStorage:**
   Open browser DevTools → Application → Local Storage
   Look for Supabase auth token

2. **Check AuthContext:**
   Verify `src/context/AuthContext.tsx` is properly set up

3. **Clear browser cache and cookies:**
   Sometimes cached data causes issues

---

## Quick Diagnostic Commands

Run these commands to quickly diagnose issues:

```bash
# 1. Check all environment variables
./verify-setup.sh

# 2. Check Node.js and npm versions
node -v && npm -v

# 3. Check if servers are running
curl http://localhost:3001/api/health
curl http://localhost:5173

# 4. Check backend logs
cd server && npm start

# 5. Check database connection
cd server && npx prisma db pull

# 6. Test Gemini API
curl -X POST http://localhost:3001/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test", "userId": 1}'
```

---

## Still Having Issues?

If you're still experiencing problems:

1. **Check the logs:**
   - Backend: Look at terminal output when running `npm run dev`
   - Frontend: Open browser DevTools → Console tab
   - Prisma: Run with debug flag: `DEBUG="prisma:*" npx prisma db pull`

2. **Enable verbose logging:**
   ```typescript
   // In aiRoutes.ts, the logs are already verbose
   // Check terminal output for detailed error messages
   ```

3. **Isolate the problem:**
   - Test each component separately
   - Try API endpoints with curl
   - Check browser network tab for failed requests

4. **Create a minimal reproduction:**
   - Start with a fresh clone
   - Follow setup steps exactly
   - Document what fails

5. **Get help:**
   - Open an issue on GitHub with:
     - Error messages (full stack trace)
     - Steps to reproduce
     - Your environment (OS, Node version, etc.)
     - What you've already tried

---

## Environment Variables Checklist

Use this checklist to ensure all variables are set:

### Frontend `.env`
- [ ] `VITE_GEMINI_API_KEY` - Starts with `AIza`, 39 chars
- [ ] `VITE_SUPABASE_URL` - HTTPS URL to Supabase
- [ ] `VITE_SUPABASE_ANON_KEY` - JWT token starting with `eyJ`

### Backend `server/.env`
- [ ] `GEMINI_API_KEY` - Same as frontend (starts with `AIza`)
- [ ] `DATABASE_URL` - PostgreSQL connection string with password
- [ ] `DIRECT_URL` - Direct PostgreSQL connection string
- [ ] `PORT` - Usually `3001`

### Validation
- [ ] No placeholder values like `your_key_here` or `[PASSWORD]`
- [ ] No extra spaces before or after `=`
- [ ] No quotes around values
- [ ] Files are named exactly `.env` (not `.env.txt` or similar)

---

## Common Error Messages Explained

| Error | Meaning | Solution |
|-------|---------|----------|
| `VITE_GEMINI_API_KEY is not set` | Frontend env var missing | Add to `.env` |
| `GEMINI_API_KEY is missing` | Backend env var missing | Add to `server/.env` |
| `P1001: Can't reach database` | Database connection failed | Check DATABASE_URL and password |
| `fetch failed` | Network/API issue | Check API key and internet |
| `CORS policy error` | Backend not accessible | Ensure backend is running |
| `Module not found` | Missing dependency | Run `npm install` |
| `Port 3001 already in use` | Port conflict | Kill process or change port |

---

**Last Updated:** November 2025
