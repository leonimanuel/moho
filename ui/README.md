# Tweet Viewer UI

A Next.js application for viewing and searching tweets stored in a PostgreSQL database.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (Neon format) |

### DATABASE_URL Format

For Neon databases, the connection string follows this format:

```
postgresql://username:password@host/database?sslmode=require
```

Example:
```
postgresql://user:pass@ep-cool-rain-123456.us-east-2.aws.neon.tech/tweets?sslmode=require
```

## Local Development

1. Copy the environment example file:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your database connection string.

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket).

2. Import the project in Vercel:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select your repository
   - Set the **Root Directory** to `ui`

3. Configure environment variables:
   - Add `DATABASE_URL` with your Neon connection string

4. Deploy. Vercel will automatically detect the Next.js framework and use the correct build settings.

### Vercel Build Settings

If needed, use these settings:
- **Framework Preset**: Next.js
- **Root Directory**: `ui`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

## Tech Stack

- [Next.js 16](https://nextjs.org) with App Router
- [React 19](https://react.dev)
- [Tailwind CSS 4](https://tailwindcss.com)
- [postgres](https://github.com/porsager/postgres) for database connectivity
- [Neon](https://neon.tech) PostgreSQL (recommended)
