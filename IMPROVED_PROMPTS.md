# Improved Gemini 3 Prompts for n8n Workflow

## How to Use These Prompts

1. Open n8n at http://localhost:5678
2. Find each node mentioned below
3. Replace the `contents` parameter with the improved version
4. Save and test

---

## 1. Gemini Scorer Node - IMPROVED PROMPT

**Node Name:** `Gemini Scorer`

**Replace the contents value with:**

```javascript
=[
  {
    "parts": [
      {
        "text": "You are an expert career analyst AI specializing in job-candidate matching.\n\n## CANDIDATE PROFILE\nTarget Role: " + ($node["Get Preference"].json["profile"]["targetRole"] || "AI Engineer") + "\nCore Skills: " + ($node["Get Preference"].json["profile"]["skills"] || "") + "\nYears of Experience: " + ($node["Get Preference"].json["profile"]["yearsExperience"] || "0") + "\nWork History: " + ($node["Get Preference"].json["profile"]["workHistory"] || "") + "\n\n## JOB POSTING\nTitle: " + ($node["LinkedIn Scraper"].json["job_position"] || "") + "\nCompany: " + ($node["LinkedIn Scraper"].json["company_name"] || "") + "\nLocation: " + ($node["LinkedIn Scraper"].json["job_location"] || "") + "\n\nFull Job Description:\n" + ($node["Fetch Full Job Description"].json["job_description"] || $json["description"] || "No description available") + "\n\n## ANALYSIS FRAMEWORK\n\n### Step 1: Title Relevance\nIs this title relevant to the candidate's target role?\n- Immediate reject if completely unrelated (e.g., \"Accountant\" for \"AI Engineer\")\n\n### Step 2: Skills Match\n- Extract required skills from job description\n- Compare with candidate's skills\n- Calculate overlap percentage\n\n### Step 3: Experience Level\n- Does seniority match?\n- Are years of experience appropriate?\n\n### Step 4: Location & Culture\n- Remote vs on-site alignment\n- Company culture indicators\n\n### Step 5: Score Calculation\n- 1-3: Poor fit, skip\n- 4-6: Marginal fit\n- 7-8: Good fit, apply\n- 9-10: Excellent fit, priority\n\n## OUTPUT FORMAT\nOutput ONLY valid JSON with this exact structure:\n\n{\n  \"thought_process\": \"Step-by-step analysis...\",\n  \"score\": 8,\n  \"confidence\": 0.85,\n  \"reasoning_summary\": \"Strong match on technical skills with growth potential\",\n  \"decision\": \"APPLY\",\n  \"skills_overlap_percentage\": 75,\n  \"matching_skills\": [\"Python\", \"ML\", \"LLMs\"],\n  \"missing_skills\": [\"Kubernetes\"],\n  \"red_flags\": [],\n  \"green_flags\": [\"Remote-first\", \"AI focus\"]\n}"
      }
    ]
  }
]
```

**Also add this to the HTTP Request node options:**

```json
{
  "bodyParameters": {
    "parameters": [
      {
        "name": "contents",
        "value": "... (the prompt above)"
      },
      {
        "name": "generationConfig",
        "value": "={\"temperature\": 0.4, \"topK\": 40, \"topP\": 0.95, \"maxOutputTokens\": 2048, \"responseMimeType\": \"application/json\"}"
      }
    ]
  }
}
```

---

## 2. Analyze Image Node - IMPROVED PROMPT

**Node Name:** `Analyze Image`

**Replace with:**

```javascript
=[
  {
    "parts": [
      {
        "text": "Analyze this company's visual brand identity (logo, office photos, website design).\n\nConsider:\n1. Design Style: Modern/traditional, minimalist/complex\n2. Color Psychology: What emotions do the colors evoke?\n3. Industry Signals: Tech startup, enterprise, creative agency, etc.\n4. Culture Indicators: Formal/casual, innovative/stable, fast-paced/methodical\n\nOutput EXACTLY 3 culture hashtags that describe this company.\n\nFormat: #Tag1 #Tag2 #Tag3\n\nExamples:\n- Tech startup: #InnovativeStartup #FastPaced #RemoteFirst\n- Enterprise: #EstablishedLeader #CorporateCulture #GlobalImpact\n- Creative: #DesignDriven #CollaborativeTeam #WorkLifeBalance\n\nOutput only the 3 hashtags, space-separated, no other text."
      },
      {
        "image_url": "=" + $node["LinkedIn Scraper"].json["company_logo_url"]
      }
    ]
  }
]
```

---

## 3. Tailor Resume Node - IMPROVED PROMPT

**Node Name:** `Tailor Resume`

**Replace with:**

```javascript
=[
  {
    "parts": [
      {
        "text": "You are a professional resume writer specializing in tech roles.\n\n## JOB DETAILS\nPosition: " + $node["LinkedIn Scraper"].json["job_position"] + "\nCompany: " + $node["LinkedIn Scraper"].json["company_name"] + "\n\n## CANDIDATE'S ACTUAL WORK HISTORY\n" + ($node["Get Preference"].json["profile"]["workHistory"] || "") + "\n\n## YOUR TASK\nTailor the candidate's resume to highlight experiences relevant to this specific job.\n\nIMPORTANT RULES:\n1. DO NOT invent or hallucinate any experience\n2. ONLY use information from the candidate's actual work history\n3. Emphasize relevant accomplishments\n4. Use action verbs and quantifiable results\n5. Keep it concise and impactful\n\nOutput a tailored resume summary (3-5 bullet points) focusing on the most relevant experiences.\n\nFormat:\n• [Action verb] [accomplishment] resulting in [quantifiable impact]\n• [Action verb] [accomplishment] with [relevant technology/skill]\n\nOutput raw text only, no JSON or markdown."
      }
    ]
  }
]
```

---

## 4. Generate Cover Letter Node - IMPROVED PROMPT

**Node Name:** `Generate Cover Letter`

**Replace with:**

```javascript
=[
  {
    "parts": [
      {
        "text": "You are a professional career coach writing a compelling cover letter.\n\n## JOB DETAILS\nPosition: " + $node["LinkedIn Scraper"].json["job_position"] + "\nCompany: " + $node["LinkedIn Scraper"].json["company_name"] + "\n\n## CANDIDATE INFO\nName: " + ($node["Get Preference"].json["profile"]["name"] || "Candidate") + "\nTarget Role: " + ($node["Get Preference"].json["profile"]["targetRole"] || "") + "\nExperience: " + ($node["Get Preference"].json["profile"]["workHistory"] || "") + "\n\n## YOUR TASK\nWrite a concise, professional cover letter (3 short paragraphs).\n\nStructure:\n\nParagraph 1: Opening Hook\n- Express genuine enthusiasm for the role and company\n- Mention a specific achievement or qualification that makes you a strong fit\n\nParagraph 2: Value Proposition\n- Highlight 2-3 key experiences from the candidate's history that align with job requirements\n- Use specific examples and quantifiable results\n- Connect your skills to the company's needs\n\nParagraph 3: Strong Closing\n- Reiterate enthusiasm\n- Call to action (request for interview)\n- Professional sign-off\n\nIMPORTANT:\n- Use a confident but humble tone\n- NO generic phrases like \"I'm writing to apply\" - be creative\n- Keep each paragraph 2-3 sentences max\n- Write in first person\n- Be specific, not generic\n\nOutput raw text only (no markdown, no salutation/signature)."
      }
    ]
  }
]
```

---

## Summary of Improvements

### 1. Better Structure
- Clear step-by-step analysis framework
- Systematic scoring methodology
- Explicit output format

### 2. JSON Mode
- Added `responseMimeType: "application/json"` for reliable structured output
- Prevents markdown code blocks in responses
- Ensures consistent parsing

### 3. Better Instructions
- More specific guidelines
- Anti-hallucination safeguards
- Professional tone requirements

### 4. Error Prevention
- Explicit "DO NOT" rules
- Format examples
- Fallback values for missing data

---

## How to Apply These Changes

### Option A: Manual Update (5 minutes)

1. Open n8n workflow editor
2. Click on each node mentioned above
3. Find the `contents` parameter in the body
4. Copy-paste the improved prompt
5. Add `generationConfig` if not present
6. Save the workflow

### Option B: Reimport Workflow

The workflow JSON file has already been updated with Gemini 3. Just:

1. Export your current workflow as backup
2. Delete the current workflow in n8n
3. Import the updated `workflows/job-discovery.json`
4. Activate the workflow

---

## Testing the Improved Prompts

Run this command to test the scorer:

```bash
node test_gemini_3_api.js
```

You should see:
- ✅ Valid JSON output
- ✅ All required fields present
- ✅ Reasonable scores (1-10)
- ✅ Meaningful analysis

---

## Expected Output Quality

### Before (Old Prompt)
```json
{
  "score": 7,
  "reasoning": "Good match"
}
```

### After (New Prompt)
```json
{
  "thought_process": "Title 'Senior AI Engineer' aligns with target role. Required skills (Python, LLMs, full-stack) match 80% of candidate's skills. Remote work aligns with preferences. Company culture emphasizes innovation.",
  "score": 9,
  "confidence": 0.92,
  "reasoning_summary": "Excellent technical alignment with strong cultural fit and growth potential",
  "decision": "APPLY",
  "skills_overlap_percentage": 80,
  "matching_skills": ["Python", "LLMs", "ML", "Full-stack", "n8n"],
  "missing_skills": ["Kubernetes", "Docker"],
  "red_flags": [],
  "green_flags": ["Remote-first", "AI safety focus", "Competitive comp"]
}
```

Much more detailed and actionable!

---

## Next Steps

1. ✅ Apply improved prompts to n8n workflow
2. ⬜ Test with real job data
3. ⬜ Monitor for hallucinations
4. ⬜ Iterate based on results
5. ⬜ Document any edge cases

