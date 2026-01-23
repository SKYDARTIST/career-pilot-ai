import json
import os

data_path = "/Users/cryptobulla/.gemini/antigravity/scratch/career-pilot-ai/data/applications.json"
if os.path.exists(data_path):
    with open(data_path, 'r') as f:
        jobs = json.load(f)
        for job in jobs[-3:]:
            print(f"--- Job: {job.get('title')} at {job.get('company')} ---")
            print(f"Reasoning: {job.get('reasoning')[:100]}...")
            print(f"Resume snippet: {job.get('tailoredResume', '')[:100]}...")
            print(f"Cover Letter snippet: {job.get('coverLetter', '')[:100]}...")
            print("-" * 40)
