# CareerPilot AI - Production Setup Guide

## 🎉 What's Been Fixed

✅ **Resume & Cover Letter Display** - Modal now shows AI-generated content
✅ **Google Jobs API** - Replaced LinkedIn scraper with SerpAPI
✅ **10 Jobs Per Scan** - Increased from 5 to 10 jobs
✅ **User ID Fixed** - Workflow now saves to your account (skydartist369@gmail.com)
✅ **Dual Dashboard Nodes** - Separate paths for high/low scoring jobs
✅ **CRITICAL: Item Pairing Fix** - Added "Merge Job Data" node to combine job details with scores, ensuring high-scoring jobs get resumes and cover letters generated

---

## 📋 Setup Steps

### Step 1: Get SerpAPI Key

1. Go to https://serpapi.com/users/sign_up
2. Sign up for **free account** (250 searches/month)
3. Go to "API Key" section
4. Copy your API key

**Alternative (More Free Searches):**
- **Serper.dev**: 2,500 free searches/month at https://serper.dev/signup

### Step 2: Update Workflow

1. Open n8n at http://localhost:5678
2. **Delete the old workflow**
3. **Import the FIXED workflow:**
   - Click "Import from File"
   - Select: `/Users/cryptobulla/Desktop/CareerPilot-FIXED-FINAL.json`
   - **Important:** This version includes the critical "Merge Job Data" fix that ensures resumes and cover letters are generated correctly
4. Click "Save"
5. **SerpAPI key is already configured** (no need to change it unless you want to use your own key)

### Step 3: Test the Workflow

1. Click "Execute Workflow" button in n8n
2. Watch it run through all nodes:
   - ✅ Cron Trigger
   - ✅ Get Preference
   - ✅ Google Jobs Search
   - ✅ Limit (10 jobs)
   - ✅ Parse Google Jobs
   - ✅ Gemini Scorer (scores each job)
   - ✅ Parse Result
   - ✅ Score >= Threshold?
   - ✅ Tailor Resume / Generate Cover Letter (for high scores)
   - ✅ Push to Dashboard

3. **Check your dashboard** at http://localhost:3000/dashboard
4. You should see **10 real AI Engineer jobs**!

### Step 4: View Resume & Cover Letter

1. Click on any high-scoring job (score ≥ 7)
2. The modal now shows:
   - 🧠 **AI Analysis** - Why this job matches
   - 📄 **Tailored Resume** - AI-customized for this role
   - ✉️ **Cover Letter** - Personalized 3-paragraph pitch
   - 📝 **Notes** - Your personal notes

---

## 🚀 Production Deployment

### For Selling as a Service

1. **API Upgrade Plans:**
   - SerpAPI: $75/month for 5,000 searches
   - Serper.dev: $50/month for 50,000 searches (cheapest!)
   - Scale SERP: $125/month for 5,000 searches

2. **Recommended for Production:**
   - **Serper.dev** - Best price ($0.30-$1.00 per 1k searches)
   - Fast (1-2 second response)
   - Reliable uptime
   - 2,500 free tier for testing

3. **Backend Improvements:**
   - Add job deduplication (check if job already exists by URL)
   - Add retry logic for failed API calls
   - Add rate limiting for Gemini API
   - Add webhook notifications for high-scoring jobs

4. **Frontend Improvements:**
   - Add pagination for job list
   - Add filters by company, location, score
   - Add export to PDF for resume/cover letter
   - Add "Apply" button that opens job URL + copies resume/cover letter

---

## 📊 Current Workflow Flow

```
┌─────────────────┐
│  Cron Trigger   │ (Every 6 hours)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Get Preference  │ (Fetch user settings)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Google Jobs API │ (Fetch 10 jobs via SerpAPI)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Parse Response  │ (Extract 10 job details)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Limit (10)      │ (Keep 10 jobs)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Gemini Scorer   │ (Score each job 1-10)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Merge Job Data  │ (Combine job details + scores)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Threshold Check │ (Score >= minScore - 2?)
└────┬────────┬───┘
     │        │
   TRUE     FALSE
     │        │
     ▼        ▼
┌─────────┐ ┌──────────────┐
│ Tailor  │ │ Push Low     │
│ Resume  │ │ Score Job    │
└────┬────┘ └──────────────┘
     │
     ▼
┌──────────────┐
│ Gen Cover    │
│ Letter       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Push High    │
│ Score Job    │
└──────────────┘
```

---

## 🎯 Next Steps for Hackathon Submission

### Before Feb 10, 2026:

1. **Test with Real Jobs:**
   - Import updated workflow
   - Add SerpAPI key
   - Run workflow
   - Verify 10 jobs appear

2. **Create Demo Video (3 minutes):**
   - Show workflow execution in n8n
   - Show jobs appearing in dashboard
   - Click on high-scoring job to show resume/cover letter
   - Show changing job status (Found → Applied)
   - Highlight Gemini 3 Flash Preview usage

3. **Prepare Devpost Submission:**
   - **Title:** CareerPilot AI - Your Autonomous Job Application Agent
   - **Tagline:** Let AI find, analyze, and apply to jobs while you sleep
   - **Description:** Use HACKATHON_SUBMISSION.md as template
   - **Tech Stack:** Gemini 3, n8n, Next.js, Supabase, TypeScript
   - **Screenshots:** Dashboard, workflow, job details modal

4. **Deployment:**
   - Deploy Next.js to Vercel
   - Keep n8n running locally or on VPS
   - Set up custom domain (optional)

---

## 💡 Monetization Strategy

### Pricing Tiers:

**Free Tier:**
- 50 jobs scanned/month
- Basic scoring
- No resume/cover letter generation
- Email digest

**Pro - $29/month:**
- 500 jobs scanned/month
- AI scoring + resume/cover letters
- Daily notifications
- Priority support

**Lifetime - $299:**
- Unlimited job scans
- All Pro features forever
- Early access to new features
- Dedicated support

### Revenue Projection:
- 100 users × $29/month = $2,900/month
- 10 lifetime × $299 = $2,990 (one-time)
- **Year 1 Target:** $40,000 ARR

---

## 🔧 Technical Notes

### API Costs:
- Serper.dev: ~$0.001 per job search
- Gemini 3: Free (1500 requests/day)
- Supabase: $25/month (Pro plan)
- n8n: Self-hosted (free)

### Scaling:
- For 100 users × 50 jobs/month = 5,000 searches
- Cost: $5/month for Serper.dev
- Gemini: Still free
- **Total cost per user:** ~$0.30/month
- **Margin:** $28.70/month per Pro user (96%)

---

## 📚 Resources

- [SerpAPI Documentation](https://serpapi.com/google-jobs-api)
- [Serper.dev Pricing](https://serper.dev/)
- [Gemini 3 API](https://aistudio.google.com/apikey)
- [n8n Workflow Docs](https://docs.n8n.io/)
- [Devpost Hackathon](https://gemini3-hackathon.devpost.com/)

---

## ✅ Checklist Before Go-Live

- [ ] SerpAPI key configured
- [ ] Workflow imported and tested
- [ ] Jobs appearing in dashboard
- [ ] Resume/cover letters generating correctly
- [ ] Email notifications working
- [ ] Demo video recorded
- [ ] Devpost submission complete
- [ ] Landing page created
- [ ] Payment integration (Stripe)
- [ ] Terms of Service + Privacy Policy

---

**Need help?** Check WORKFLOW_FIX_SUMMARY.md or ask me!
