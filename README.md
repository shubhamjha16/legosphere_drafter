# Legosphere Drafter

An AI-powered legal drafting and research platform built with React, TypeScript, and Node.js. This application helps legal professionals draft documents, generate arguments, conduct research, and visualize case flows using Google's Gemini AI.

## Features

- 📝 **AI-Powered Drafting:** Generate legal documents with AI assistance
- 💬 **Legal Chat:** Interactive AI chat for legal queries
- 🔍 **Legal Research:** AI-assisted legal research and case analysis
- ⚖️ **Argument Generation:** Generate legal arguments and counterarguments
- 📊 **Case Flow Visualization:** Visualize legal case flows and relationships
- 📄 **PDF Chat:** Chat with PDF documents for analysis
- 🔐 **User Authentication:** Secure user authentication with Supabase
- 📈 **Usage Tracking:** Track AI usage and word counts

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- TailwindCSS
- React Router
- TipTap (Rich text editor)
- React Flow (Flowchart visualization)
- Supabase (Authentication & Database)
- Google Generative AI (Gemini)

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL (Supabase)
- Google Generative AI (Gemini)

## Prerequisites

- Node.js v18 or higher
- npm or yarn
- PostgreSQL database (Supabase recommended)
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/shubhamjha16/legosphere_drafter.git
cd legosphere_drafter
```

### 2. Setup Frontend

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `.env` file with your credentials:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Setup Backend

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `server/.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
PORT=3001
```

### 4. Initialize Database

```bash
# In the server directory
npx prisma generate
npx prisma db push
```

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:3001`.

## Configuration Guide

### Getting Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key and add it to both:
   - Frontend `.env` as `VITE_GEMINI_API_KEY`
   - Backend `server/.env` as `GEMINI_API_KEY`

**Note:** The same API key is used for both frontend and backend.

### Setting Up Supabase

1. Create a free account at [Supabase](https://supabase.com)
2. Create a new project
3. Go to **Settings** > **API** to get:
   - Project URL → `VITE_SUPABASE_URL`
   - Anon/Public Key → `VITE_SUPABASE_ANON_KEY`
4. Go to **Settings** > **Database** to get:
   - Connection string → `DATABASE_URL` (replace `[YOUR-PASSWORD]` with your database password)

### Architecture Overview

```
┌─────────────────┐
│   Frontend      │
│  (React/Vite)   │
│  Port: 5173     │
└────────┬────────┘
         │
         ├─────────────┐
         │             │
         ▼             ▼
┌────────────┐  ┌──────────┐
│  Gemini AI │  │ Backend  │
│  (Direct)  │  │ (Express)│
└────────────┘  │ Port:3001│
                └─────┬────┘
                      │
                      ▼
                ┌──────────┐
                │ Supabase │
                │(Postgres)│
                └──────────┘
```

The frontend can call Gemini AI directly or route through the backend for usage tracking and additional features.

## Project Structure

```
legosphere_drafter/
├── src/                      # Frontend source code
│   ├── components/          # React components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── context/            # React context providers
│   └── lib/                # Utility libraries
├── server/                  # Backend server
│   ├── routes/             # API routes
│   ├── prisma/             # Database schema & migrations
│   └── index.ts            # Server entry point
├── public/                  # Static assets
└── .env                    # Frontend environment variables
```

## Troubleshooting

### Issue: Gemini AI not working

**Symptoms:**
- No AI responses generated
- Error messages about missing API key
- "Server missing API Key configuration"

**Solutions:**

1. **Verify API Key is Set:**
   ```bash
   # Check frontend .env
   cat .env | grep VITE_GEMINI_API_KEY
   
   # Check backend .env
   cat server/.env | grep GEMINI_API_KEY
   ```

2. **Ensure API Key is Valid:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Verify your API key is active
   - Create a new key if needed

3. **Check API Key Format:**
   - Should start with `AIzaSy`
   - Should be 39 characters long
   - No extra spaces or quotes

4. **Restart Servers:**
   ```bash
   # Stop both servers (Ctrl+C)
   # Restart backend
   cd server && npm run dev
   
   # Restart frontend (in new terminal)
   npm run dev
   ```

### Issue: Backend-Frontend Connection

**Symptoms:**
- Backend unavailable errors
- CORS errors

**Solutions:**

1. **Verify Backend is Running:**
   ```bash
   curl http://localhost:3001/api/health
   # Should return: {"status":"ok","message":"Legosphere Drafter Backend is running"}
   ```

2. **Check Backend URL:**
   - Frontend expects backend at `http://localhost:3001`
   - Verify in `src/services/backendService.ts`

3. **Check CORS Configuration:**
   - Backend has CORS enabled by default
   - If issues persist, check `server/index.ts`

### Issue: Database Connection

**Symptoms:**
- "Can't reach database server"
- Failed to fetch users
- Prisma errors

**Solutions:**

1. **Verify Database URL:**
   ```bash
   cat server/.env | grep DATABASE_URL
   ```

2. **Check Database Password:**
   - Ensure `[YOUR-PASSWORD]` is replaced with actual password
   - Get password from Supabase Dashboard → Settings → Database

3. **Test Database Connection:**
   ```bash
   cd server
   npx prisma db pull
   ```

4. **Regenerate Prisma Client:**
   ```bash
   cd server
   npx prisma generate
   ```

### Issue: Build Errors

**Frontend Build:**
```bash
npm run build
```

**Backend Build:**
```bash
cd server
npx tsc
```

## Development Commands

### Frontend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend

```bash
npm run dev          # Start with auto-reload (nodemon)
npm start           # Start production server
npx prisma studio   # Open Prisma Studio (Database GUI)
npx prisma migrate dev  # Create and apply migrations
```

## Environment Variables Reference

### Frontend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_GEMINI_API_KEY` | Google Gemini API key | `AIzaSyD8y_3x8...` |
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGci...` |

### Backend (server/.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaSyD8y_3x8...` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `DIRECT_URL` | Direct database URL | `postgresql://...` |
| `PORT` | Server port | `3001` |

## Security Best Practices

⚠️ **Important Security Notes:**

1. **Never commit `.env` files** - They contain sensitive API keys
2. **Use environment variables** for all secrets
3. **Rotate API keys regularly**
4. **Set API restrictions** in Google Cloud Console:
   - Restrict by IP address
   - Restrict by HTTP referrer
   - Set usage quotas
5. **Use Supabase Row Level Security (RLS)** for database access control
6. **Enable 2FA** on your Google and Supabase accounts

## API Key Security Issue

⚠️ **SECURITY WARNING:** The provided API key `AIzaSyD8y_3x8-DfxlhCkFBq9JxIcHpig3fl3Vo` has been exposed. 

**Action Required:**
1. **Immediately revoke this API key** in [Google Cloud Console](https://console.cloud.google.com/)
2. **Generate a new API key**
3. **Update your `.env` files** with the new key
4. **Never share API keys** in public repositories, issues, or support requests

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For issues and questions:
- Open an issue on [GitHub](https://github.com/shubhamjha16/legosphere_drafter/issues)
- Check existing issues for solutions
- Provide detailed error messages and logs

## License

ISC

---

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
