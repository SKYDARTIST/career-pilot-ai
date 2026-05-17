# Security Notes

CareerPilot AI is a portfolio/demo project. Treat it as a review-gated assistant, not an unattended job-application bot.

## Do Not Commit

- `.env*` files
- n8n workflow exports with real API keys
- Gemini, SerpAPI, Supabase, or Vercel tokens
- Personal resumes, cover letters, job logs, or profile exports
- Browser/debug output that includes request headers

## API Cost Controls

- Keep `NEXT_PUBLIC_DEMO_MODE=true` when showcasing the app.
- Disable n8n Cron Triggers while testing manually.
- Use `workflows/job-discovery.template.json` because it reads keys from n8n environment variables.
- Monitor Gemini and SerpAPI quota dashboards after every workflow run.

## Human Review Boundary

The app can generate scores and application drafts, but a human should review every resume, cover letter, and external application step before it is used.

## If A Key Was Committed

Sanitizing files after the fact does not protect a key that already exists in Git history. Rotate the exposed key in the provider dashboard, then redeploy with the replacement value.
