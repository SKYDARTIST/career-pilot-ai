# n8n Workflow Setup Guide

This guide explains how to set up the CareerPilot AI workflow in n8n.

## Prerequisites

1. **n8n installed** - Either self-hosted or n8n Cloud
2. **API Keys** ready:
   - Gemini API Key ([get here](https://aistudio.google.com/apikey))
   - SerpAPI Key ([get here](https://serpapi.com/)) OR Serper.dev key
   - CareerPilot API Key (from your `.env.local`)
3. **CareerPilot running** at localhost:3000 (or your deployed URL)

## Step 1: Configure n8n Environment Variables

In n8n, go to **Settings > Variables** and add:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `GEMINI_API_KEY` | `AIzaSy...` | Your Gemini API key |
| `SERPAPI_KEY` | `615132...` | Your SerpAPI key |
| `CAREER_PILOT_API_KEY` | `your-secret-key` | Must match .env.local |
| `CAREER_PILOT_API_URL` | `http://localhost:3000` | Your app URL |
| `CAREER_PILOT_USER_ID` | `5629ed4f-...` | Your Supabase user ID |

### Finding Your User ID

1. Log in to your CareerPilot dashboard
2. Open browser dev tools (F12)
3. Go to Network tab
4. Click on any API request
5. Look for `user_id` in the request/response

Or query Supabase directly:
```sql
SELECT id FROM auth.users WHERE email = 'your-email@example.com';
```

## Step 2: Import the Workflow

1. Open n8n at http://localhost:5678
2. Click **"+ Add first step"** or **Workflows > Import**
3. Select **"Import from File"**
4. Choose: `workflows/job-discovery.template.json`
5. Click **Save**

## Step 3: Verify the Workflow

After importing, check these nodes are using environment variables:

### Get Preference Node
```
URL: {{$env.CAREER_PILOT_API_URL}}/api/preferences?userId={{$env.CAREER_PILOT_USER_ID}}
Header X-API-Key: {{$env.CAREER_PILOT_API_KEY}}
```

### Google Jobs Search Node
```
api_key: {{$env.SERPAPI_KEY}}
```

### Gemini Nodes (Scorer, Resume, Cover Letter)
```
URL: ...?key={{$env.GEMINI_API_KEY}}
```

### Push to Dashboard Nodes
```
URL: {{$env.CAREER_PILOT_API_URL}}/api/jobs
Header X-API-Key: {{$env.CAREER_PILOT_API_KEY}}
user_id: {{$env.CAREER_PILOT_USER_ID}}
```

## Step 4: Test the Workflow

1. Click **Execute Workflow** (play button)
2. Watch each node execute:
   - ✅ Cron Trigger
   - ✅ Get Preference
   - ✅ Google Jobs Search
   - ✅ Limit (10 jobs)
   - ✅ Parse Google Jobs
   - ✅ Gemini Scorer
   - ✅ Parse Result
   - ✅ Score >= Threshold?
   - ✅ Tailor Resume / Generate Cover Letter
   - ✅ Push to Dashboard

3. Check your dashboard at http://localhost:3000/dashboard

## Troubleshooting

### "Unauthorized" Error
- Verify `CAREER_PILOT_API_KEY` matches in both n8n and `.env.local`
- Make sure your app server is running

### "User not found" Error
- Check `CAREER_PILOT_USER_ID` is correct
- Verify the user exists in Supabase

### No Jobs Returned
- SerpAPI may have usage limits (250 free/month)
- Try a different search query in preferences
- Check SerpAPI dashboard for errors

### Gemini Errors
- Verify API key is valid
- Check for rate limits (1500 requests/day free)
- Look at n8n error logs for details

## Workflow Schedule

By default, the workflow runs every **6 hours**:
- 12:00 AM
- 6:00 AM
- 12:00 PM
- 6:00 PM

To change this, edit the **Cron Trigger** node.

## Alternative: Using Serper.dev

If you prefer Serper.dev (more free searches):

1. Sign up at https://serper.dev
2. Get your API key
3. In the **Google Jobs Search** node, change:
   - URL: `https://google.serper.dev/jobs`
   - Method: POST
   - Body:
   ```json
   {
     "q": "{{targetRole}}",
     "location": "{{location}}",
     "num": 10
   }
   ```
4. Add header: `X-API-KEY: {{$env.SERPER_API_KEY}}`

## Production Deployment

For production:

1. Update `CAREER_PILOT_API_URL` to your deployed URL
2. Consider using n8n Cloud for reliability
3. Set up error notifications
4. Monitor API usage and costs

## Security Notes

- Never share your workflow file with real API keys
- Always use environment variables
- The template file (`job-discovery.template.json`) uses `{{$env.VAR}}` placeholders
- Your local `job-discovery.json` may have real keys - don't commit it!
