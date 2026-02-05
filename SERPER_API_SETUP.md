# Serper.dev Google Jobs Integration

## Why Serper.dev?

✅ **2,500 free searches/month** (vs SerpAPI's 250)
✅ **No credit card required**
✅ **1-2 second response time**
✅ **Production-ready API**
✅ **Supports Google Jobs search**

## Step 1: Get Your API Key

1. Go to https://serper.dev/
2. Click "Create a free account"
3. Sign up with your email
4. Copy your API key from the dashboard

## Step 2: Add to .env.local

```bash
SERPER_API_KEY=your_api_key_here
```

## Step 3: Update n8n Workflow

Replace the "LinkedIn Scraper" node with this configuration:

### Node Name: Google Jobs Search

**Type:** HTTP Request

**Method:** POST

**URL:** `https://google.serper.dev/jobs`

**Headers:**
```
X-API-KEY: YOUR_SERPER_API_KEY
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "q": "{{ $node['Get Preference'].json['profile']['targetRole'] || 'AI Engineer' }} {{ $node['Get Preference'].json['filters']['locations'][0] || 'Remote' }}",
  "num": 10,
  "location": "{{ $node['Get Preference'].json['filters']['locations'][0] || 'United States' }}"
}
```

## Step 4: Parse Response

The response will look like this:

```json
{
  "jobs": [
    {
      "title": "Senior AI Engineer",
      "company_name": "Anthropic",
      "location": "San Francisco, CA",
      "description": "...",
      "job_id": "...",
      "apply_link": "https://..."
    }
  ]
}
```

## Step 5: Update "Fetch Full Job Description" Node

Since Serper.dev returns full descriptions, you can skip this step or merge it.

## Full n8n Node Configuration

I'll create the updated workflow JSON for you...
