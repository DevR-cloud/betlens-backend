# BetLens Backend

Node.js + PostgreSQL API. Handles user accounts and bet storage.

## Deploy to Railway (free, ~5 minutes)

### Step 1 — Create a GitHub repo
1. Go to github.com → New repository → name it `betlens-backend`
2. Upload all these files to the repo root

### Step 2 — Deploy on Railway
1. Go to railway.app → sign up with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `betlens-backend` repo
4. Railway will detect Node.js and deploy automatically

### Step 3 — Add PostgreSQL database
1. In your Railway project, click **"New"** → **"Database"** → **"PostgreSQL"**
2. Railway creates the database and links it automatically
3. The `DATABASE_URL` environment variable is set for you automatically

### Step 4 — Add environment variables
1. Click your backend service → **"Variables"** tab
2. Add this variable:
   ```
   JWT_SECRET = any_long_random_string_you_make_up_at_least_32_chars
   ```
   Example: `JWT_SECRET = betlens_super_secret_key_nigeria_2024_xk29`

### Step 5 — Get your backend URL
1. Click your service → **"Settings"** → **"Domains"**
2. Click **"Generate Domain"**
3. You'll get a URL like `betlens-backend-production.up.railway.app`
4. This is your `BACKEND_URL` — you'll need it for the extension and PWA

## API Endpoints

### POST /auth/register
```json
{ "email": "user@example.com", "password": "their_password" }
```
Returns: `{ "token": "jwt...", "email": "user@example.com" }`

### POST /auth/login
```json
{ "email": "user@example.com", "password": "their_password" }
```
Returns: `{ "token": "jwt...", "email": "user@example.com" }`

### POST /bets/sync
Header: `Authorization: Bearer <token>`
```json
{ "bets": [ { "orderId": "...", "name": "...", "stake": 500, ... } ] }
```
Returns: `{ "success": true, "inserted": 10, "updated": 2 }`

### GET /bets
Header: `Authorization: Bearer <token>`
Returns: `{ "bets": [ ... ] }`

## Test it's working
Visit: `https://your-railway-url.railway.app/health`
Should return: `{ "ok": true }`
