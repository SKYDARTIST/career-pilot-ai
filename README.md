# CareerPilot AI - The Autonomous Job Application Agent

> 🏆 **Built for the Gemini 3 Global Hackathon**

An AI-powered autonomous agent that automates the end-to-end job application process using **Gemini** and **n8n**.

![CareerPilot AI Banner](./public/banner.png)

## ✨ Features

- **🔍 Intelligent Discovery**: Autonomous job scraping based on your career preferences
- **🧠 Multi-Strategy Analysis**: Gemini evaluates each job using advanced reasoning chains
- **📊 Smart Scoring**: AI-powered fit scoring (1-10) based on skills, experience, and culture
- **📄 Personalized Tailoring**: Auto-generates customized resumes and cover letters
- **📱 Beautiful Dashboard**: Track and manage all your job opportunities in one place

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- n8n (for workflow automation)
- Supabase account
- Gemini API key
- SerpAPI key (or Serper.dev)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/career-pilot-ai
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
│           Gemini 2.0 Flash              │
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
- **AI**: Gemini 2.0 Flash (4 specialized nodes)
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
│   ├── job-discovery.template.json  # n8n workflow (use this!)
│   └── job-discovery.json           # Local development
├── prompts/               # AI system prompts
├── data/                  # Example data files
└── docs/                  # Documentation
```

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- API key authentication for n8n integration
- User isolation - each user only sees their own data
- No hardcoded credentials in distribution files

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

## 🚧 Roadmap

- [ ] Auto-Apply: One-click application submission
- [ ] Interview Prep: AI-powered mock interviews
- [ ] Salary Negotiation: AI coach for offers
- [ ] Network Analysis: LinkedIn graph for warm intros
- [ ] Mobile App: iOS/Android companion

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📞 Contact

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your-email@example.com

---

**Built with ❤️ and Gemini for the Gemini 3 Global Hackathon**
