# Legosphere Drafter Backend

Backend server for the Legosphere Drafter application, providing AI-powered legal drafting and analysis features.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database (Supabase recommended)
- Gemini AI API key

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the server directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your actual credentials:

```env
# Gemini AI API Key
GEMINI_API_KEY=AIzaSyD8y_3x8-DfxlhCkFBq9JxIcHpig3fl3Vo

# Database Configuration
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Server Port
PORT=3001
```

#### Getting Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key or use an existing one
4. Copy the API key to your `.env` file

#### Getting Your Database Credentials

If using Supabase:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** > **Database**
4. Copy the **Connection string** (ensure you select "Connection pooling" for better performance)
5. Replace `[YOUR-PASSWORD]` with your database password
6. Update both `DATABASE_URL` and `DIRECT_URL` in your `.env` file

### 3. Initialize Database

Generate Prisma Client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate deploy
```

Or push the schema to your database:

```bash
npx prisma db push
```

### 4. Start the Server

Development mode (with auto-reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server will start on `http://localhost:3001` (or the PORT specified in your `.env` file).

## API Endpoints

### Health Check

```
GET /api/health
```

Returns the server status.

### AI Text Generation

```
POST /api/ai/generate
Content-Type: application/json

{
  "prompt": "Your prompt here",
  "userId": 1,
  "feature": "drafting"
}
```

Returns generated text from Gemini AI.

### AI Chat

```
POST /api/ai/chat
Content-Type: application/json

{
  "message": "Your message here",
  "history": [],
  "userId": 1
}
```

Returns chat response from Gemini AI.

### User Management

```
GET /api/users
```

Returns list of users (requires database connection).

## Troubleshooting

### Issue: "GEMINI_API_KEY is missing"

**Solution:** Ensure you have created a `.env` file in the server directory and added your Gemini API key:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

### Issue: "Can't reach database server"

**Solution:** Check your database connection string:

1. Verify your database password is correct
2. Ensure your database server is running
3. Check that your IP is whitelisted in Supabase (if applicable)
4. Verify the connection string format:
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

### Issue: "Failed to generate text"

**Possible causes:**

1. **Invalid API Key:** Verify your Gemini API key is correct
2. **Network Issues:** Check your internet connection
3. **API Quota Exceeded:** Check your Gemini API usage limits
4. **API Key Restrictions:** Ensure your API key doesn't have restrictions that prevent access

### Issue: Backend won't start

**Solution:**

1. Check that all dependencies are installed: `npm install`
2. Verify Node.js version: `node --version` (should be v18+)
3. Check for port conflicts: Ensure port 3001 is available
4. Review error logs for specific issues

## Project Structure

```
server/
├── index.ts              # Main server file
├── routes/
│   └── aiRoutes.ts      # AI-related API routes
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── package.json         # Dependencies
└── .env                 # Environment variables (not in git)
```

## Security Notes

⚠️ **IMPORTANT:**

- Never commit your `.env` file to version control
- Keep your API keys secure
- Use environment variables for all sensitive data
- Consider using API key restrictions in Google Cloud Console
- Use connection pooling for database connections in production

## Database Schema

The application uses Prisma ORM with PostgreSQL. Main models:

- **User:** User accounts with usage tracking
- **Document:** Legal documents (drafts, memos, research)
- **UsageLog:** Usage tracking for billing/limits

Run `npx prisma studio` to view and edit your database in a GUI.

## Contributing

When adding new features:

1. Update the Prisma schema if needed
2. Run `npx prisma migrate dev` to create migrations
3. Update API documentation in this README
4. Test endpoints thoroughly

## License

ISC
