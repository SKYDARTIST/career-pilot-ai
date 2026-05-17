# CareerPilot AI - AI Job Search Copilot

> 🏆 **Built for the Gemini 3 Global Hackathon**

An AI-assisted job search dashboard that discovers roles, scores fit, and drafts application material using **Gemini** and **n8n**. The project is intentionally review-gated: it demonstrates the workflow without submitting applications or spending API credits unless you configure external services yourself.

**[Live Demo →](https://career-pilot-ai-psi.vercel.app)**

![CareerPilot AI Banner](./public/banner.png)

## ✨ Features

- **🔍 Job Discovery Workflow**: Scheduled n8n workflow that can search roles from configured providers
- **🧠 Multi-Strategy Analysis**: Gemini can evaluate each job using reasoning prompts
- **📊 Smart Scoring**: AI-powered fit scoring (1-10) based on skills, experience, and culture
- **📄 Draft Generation**: Creates resume and cover-letter drafts for human review
- **📱 Beautiful Dashboard**: Track and manage all your job opportunities in one place
- **🔐 Demo-Safe Defaults**: Demo mode avoids external API calls and real application submission

## Demo Boundaries

CareerPilot is a portfolio project, not a production auto-apply bot. The live/demo experience should be used to understand the product flow:

- No job application is submitted automatically.
- Generated resumes and cover letters are drafts.
- Gemini, SerpAPI, and n8n calls happen only when you configure your own keys and run the workflow.
- API usage can cost money. Keep demo mode enabled when you only want to showcase the UI.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- n8n (for workflow automation)
- Supabase account
- Gemini API key (optional unless running AI workflow)
- SerpAPI key or Serper.dev key (optional unless running job search workflow)

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
   # Keep NEXT_PUBLIC_DEMO_MODE=true for portfolio/demo use
   # Add API keys only when you intentionally run the external workflow
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Import the n8n workflow**
   - Open n8n at http://localhost:5678
   - Import `workflows/job-discovery.template.json`
   - Configure n8n environment variables (see below)

### n8n Environment Variables

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
│  n8n Workflow   │────▶│ Job Search API  │
│  (Cron: 6hrs)   │     │  (SerpAPI)      │
└────────┬────────┘     └─────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│           Gemini                         │
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

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL), Next.js API Routes
- **Automation**: n8n (workflow engine)
- **AI**: Gemini workflow nodes for scoring and draft generation
- **APIs**: SerpAPI (job data), Google AI Studio

## 📁 Project Structure

```
career-pilot-ai/
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── dashboard/     # Job dashboard
│   │   ├── settings/      # User preferences
│   │   ├── login/         # Authentication
│   │   └── components/    # UI components
│   ├── hooks/             # React hooks
│   └── lib/               # Supabase clients
├── workflows/
│   ├── job-discovery.template.json  # n8n workflow template with env placeholders
│   └── job-discovery.json           # Local export, ignored for future commits
├── prompts/               # AI system prompts
├── data/                  # Example data files
└── docs/                  # Documentation
```

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- API key authentication for n8n integration
- User isolation - each user only sees their own data
- Workflow templates use environment placeholders instead of committed keys
- Debug endpoints and API-key logging are not part of the production surface
- Human review is required before using generated application material

## 📖 Documentation

- [Production Setup Guide](./PRODUCTION_SETUP_GUIDE.md)
- [Security Notes](./SECURITY.md)
- [Hackathon Submission](./HACKATHON_SUBMISSION.md)
- [Enhancements Guide](./ENHANCEMENTS.md)
- [Terms of Service](./TERMS_OF_SERVICE.md)
- [Privacy Policy](./PRIVACY_POLICY.md)

## 🎯 Gemini Integration

This project showcases Gemini's capabilities across 4 review-gated workflow nodes:

1. **Job Scorer**: Advanced reasoning for job-fit analysis
2. **Culture Analyzer**: Multimodal vision + text for company culture
3. **Resume Tailor**: Personalized resume draft generation
4. **Cover Letter Generator**: Custom cover letter draft writing

## 🚧 Roadmap

- [ ] Approval checklist: review every draft before applying
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

**Built with Gemini for the Gemini 3 Global Hackathon**
