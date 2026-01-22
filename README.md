# CareerPilot AI - The Job Application Robot

An autonomous agent that manages the end-to-end job application process using Gemini 3 and n8n.

## How it Works
1. **Discovery**: A recurring n8n workflow scrapes job boards (or uses APIs) to find new listings.
2. **Analysis**: Gemini 3 reads each job description and cross-references it with your `master-resume.md`.
3. **Scoring**: A "Fit Score" (1-10) is assigned based on skills, culture, and preferences.
4. **Tailoring**: For jobs with a score > 8, Gemini 3 creates a bespoke resume and cover letter.
5. **Action**: The agent prepares the application and notifies you via a Daily Digest.

## Project Structure
- `workflows/`: Exported n8n `.json` files.
- `prompts/`: System prompts for Gemini 3.
- `data/`: Your master resume and tracked applications.

## How to Use This Project

### Step 1: Initialize Your Data
Open [master-resume.md](file:///Users/cryptobulla/.gemini/antigravity/scratch/career-pilot-ai/data/master-resume.md) and fill in your actual professional details. This is what the AI uses to customize your applications.

### Step 2: Import Workflow to n8n
1. Open your n8n instance.
2. Go to **Workflows** > **Import from File**.
3. Select [job-discovery.json](file:///Users/cryptobulla/.gemini/antigravity/scratch/career-pilot-ai/workflows/job-discovery.json).
4. **Important**: Replace the `PLACEHOLDER` in the LinkedIn Scraper node with your own API key (e.g., from Scrapingdog or similar).

### Step 3: Set Up Gemini 3
Ensure you have your **Gemini API Key** connected in n8n. The workflow is configured to use the Pro model to analyze and score jobs.

### Step 4: Run the Marathon Agent
Activate the workflow. It will now run autonomously, searching for jobs and notifying you only of the ones that are a "High Fidelity" match!
