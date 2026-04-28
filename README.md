# CareerPilot AI - The Autonomous Job Application Agent

> 🏆 **Built for the Gemini 3 Global Hackathon**

An AI-powered autonomous agent that automates job discovery, job-fit analysis, resume tailoring, and cover letter generation using **Gemini**, **SerpAPI**, **Supabase**, and **Next.js API routes**. The n8n workflow remains available as an optional production automation path.

**[Live Demo →](https://career-pilot-ai-psi.vercel.app)**

![CareerPilot AI Banner](./public/banner.png)

## ✨ Features

- **🔍 Autonomous job discovery**: `POST /api/discover` searches roles with SerpAPI based on stored Supabase preferences.
- **🧠 4 AI nodes per job**: Gemini runs scorer, culture analyzer, resume tailor, and cover letter generator for each discovered job.
- **⚡ Parallel Gemini execution**: The 4 Gemini nodes run with `Promise.all()` per job to keep demo runs fast on Vercel.
- **📊 Smart scoring**: Gemini returns a 1-10 fit score with reasoning, matching skills, missing skills, and culture tags.
- **📄 Job detail drawer**: Clicking a dashboard job opens a right-side drawer with tailored resume and cover letter rendered with ReactMarkdown.
- **📋 Copy Cover Letter**: One-click copy for the raw generated cover letter text.
- **🧪 Demo mode**: `NEXT_PUBLIC_DEMO_MODE=true` enables live preview access without real authentication.
- **📈 Dashboard analytics**: Pipeline Velocity and Sector Penetration stats summarize job status distribution and company concentration.
- **🎨 Polished UI**: Landing page, dashboard, auth, settings, stats, and job details support light/dark mode.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- Gemini API key
- SerpAPI key
- n8n, optional, for scheduled production automation

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SKYDARTIST/career-pilot-ai
   cd career-pilot-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your API keys
   ```

   For a public demo without real auth, set:

   ```bash
   NEXT_PUBLIC_DEMO_MODE=true
   ```

   For standalone job discovery, configure:

   ```bash
   GEMINI_API_KEY=your-gemini-key
   GEMINI_MODEL=gemini-2.5-flash-lite
   SERPAPI_KEY=your-serpapi-key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Run discovery from the dashboard**
   - Open `/login`
   - Click **Enter Demo Mode** if demo mode is enabled
   - Open `/dashboard`
   - Click **Run Discovery**

6. **Optional: import the n8n workflow for scheduled automation**
   - Open n8n at http://localhost:5678
   - Import `workflows/job-discovery.template.json`
   - Configure n8n environment variables (see below)

### Standalone Discovery API

CareerPilot now includes a self-contained Next.js route:

```http
POST /api/discover
```

The route:

1. Loads the authenticated user's Supabase profile and preferences.
2. Searches jobs with SerpAPI.
3. Processes each job through 4 Gemini nodes:
   - Job scorer
   - Culture analyzer
   - Resume tailor
   - Cover letter generator
4. Saves results to Supabase using the same jobs schema as the n8n workflow.
5. Returns a summary with discovered, saved, created, updated, and failed counts.

The default model is `gemini-2.5-flash-lite`, chosen for lower-cost demo runs. At the current cap of 5 jobs, one discovery run can make up to 20 Gemini calls because the 4 AI nodes run in parallel for each job.

### n8n Environment Variables

n8n is optional for demos. Use it when you want scheduled discovery outside the app.

Set these in n8n Settings > Variables:

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Your Gemini API key from [AI Studio](https://aistudio.google.com/apikey) |
| `SERPAPI_KEY` | Your SerpAPI key from [serpapi.com](https://serpapi.com/) |
| `CAREER_PILOT_API_KEY` | Same as in your `.env.local` |
| `CAREER_PILOT_API_URL` | `http://localhost:3000` (or your deployed URL) |
| `CAREER_PILOT_USER_ID` | Your Supabase user ID |

## 🏗️ Architecture

```
┌─────────────────┐
│  User Profile   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Next.js API     │────▶│ Job Search API  │
│ /api/discover   │     │  (SerpAPI)      │
└────────┬────────┘     └─────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│       Gemini 2.5 Flash Lite             │
│  ┌───────────┐ ┌───────────────────┐   │
│  │  Scorer   │ │ Culture Analyzer  │   │
│  └───────────┘ └───────────────────┘   │
│  ┌───────────┐ ┌───────────────────┐   │
│  │  Resume   │ │  Cover Letter     │   │
│  │  Tailor   │ │  Generator        │   │
│  └───────────┘ └───────────────────┘   │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│   Supabase DB   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Next.js Dashboard│
└─────────────────┘
```

The n8n workflow in `workflows/` mirrors this pipeline for scheduled automation and remains in the repo as an optional production setup.

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL), Next.js API Routes
- **Automation**: Next.js API route for demos, optional n8n workflow for scheduled production runs
- **AI**: Gemini 2.5 Flash Lite by default (4 specialized nodes)
- **APIs**: SerpAPI (job data), Google AI Studio

## 📁 Project Structure

```
career-pilot-ai/
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   └── discover/  # Standalone job discovery route
│   │   ├── dashboard/     # Job dashboard
│   │   ├── settings/      # User preferences
│   │   ├── login/         # Authentication
│   │   └── components/    # UI components
│   ├── hooks/             # React hooks
│   └── lib/               # Supabase clients
├── workflows/
│   ├── job-discovery.template.json  # n8n workflow (use this!)
│   └── job-discovery.json           # Local development
├── prompts/               # AI system prompts
├── data/                  # Example data files
└── docs/                  # Documentation
```

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- API key authentication for n8n/server-to-server integration
- User isolation - each user only sees their own data
- No hardcoded credentials in distribution files
- Demo mode avoids real auth for live previews when `NEXT_PUBLIC_DEMO_MODE=true`

## 📖 Documentation

- [Production Setup Guide](./PRODUCTION_SETUP_GUIDE.md)
- [Hackathon Submission](./HACKATHON_SUBMISSION.md)
- [Enhancements Guide](./ENHANCEMENTS.md)
- [Terms of Service](./TERMS_OF_SERVICE.md)
- [Privacy Policy](./PRIVACY_POLICY.md)

## 🎯 Gemini Integration

This project showcases Gemini's capabilities across 4 critical nodes:

1. **Job Scorer**: Advanced reasoning for job-fit analysis
2. **Culture Analyzer**: Multimodal vision + text for company culture
3. **Resume Tailor**: Personalized resume generation
4. **Cover Letter Generator**: Custom cover letter writing

In the standalone API route, these 4 nodes run in parallel per job with `Promise.all()`.

## 🚧 Roadmap

- [ ] Auto-Apply: One-click application submission
- [ ] Interview Prep: AI-powered mock interviews
- [ ] Salary Negotiation: AI coach for offers
- [ ] Network Analysis: LinkedIn graph for warm intros
- [ ] Mobile App: iOS/Android companion

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 📞 Contact

- GitHub: [@SKYDARTIST](https://github.com/SKYDARTIST)
- X: [@AakashBuild](https://x.com/AakashBuild)

---

**Built with ❤️ and Gemini for the Gemini 3 Global Hackathon**
