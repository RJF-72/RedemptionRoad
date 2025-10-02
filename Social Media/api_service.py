"""
API service for content generation and analytics.
"""
import json
import os
import asyncio
from typing import Optional
import replicate
from dotenv import load_dotenv
from models import GeneratedContent, AnalyticsData, ContentSettings
from utils import safe_json_parse

# Load environment variables
load_dotenv()


class APIService:
    """Handles API calls for content generation and analytics."""
    
    def __init__(self):
        self.api_key = os.getenv('Replicate')
        if self.api_key:
            os.environ["REPLICATE_API_TOKEN"] = self.api_key
        else:
            raise ValueError("Replicate API key not found in environment variables")
    
    async def generate_content(self, settings: ContentSettings) -> Optional[GeneratedContent]:
        """Generate content using Replicate API."""
        prompt = self._create_content_prompt(settings)
        
        try:
            # Run in thread to avoid blocking UI
            loop = asyncio.get_event_loop()
            response_data = await loop.run_in_executor(
                None, 
                self._run_replicate_model, 
                prompt
            )
            
            if not response_data:
                return None
            
            content_dict = safe_json_parse(response_data)
            if not content_dict:
                return None
            
            # Create GeneratedContent object
            content = GeneratedContent(
                hook=content_dict.get("hook", ""),
                caption=content_dict.get("caption", ""),
                cta=content_dict.get("cta", ""),
                hashtags=content_dict.get("hashtags", []),
                best_time=content_dict.get("bestTime", ""),
                strategy_notes=content_dict.get("strategyNotes", ""),
                variations=content_dict.get("variations", []),
                platform=settings.platform,
                niche=settings.niche,
                tone=settings.tone,
                content_type=settings.content_type
            )
            
            return content
            
        except Exception as e:
            print(f"Error generating content: {e}")
            return None
    
    async def analyze_content(self, content_history: list) -> Optional[AnalyticsData]:
        """Analyze content history for insights."""
        if not content_history:
            return None
        
        prompt = self._create_analytics_prompt(content_history)
        
        try:
            # Run in thread to avoid blocking UI
            loop = asyncio.get_event_loop()
            response_data = await loop.run_in_executor(
                None, 
                self._run_replicate_model, 
                prompt
            )
            
            if not response_data:
                return None
            
            analytics_dict = safe_json_parse(response_data)
            if not analytics_dict:
                return None
            
            analytics = AnalyticsData(
                growth_score=int(analytics_dict.get("growthScore", 0)),
                content_patterns=analytics_dict.get("contentPatterns", ""),
                top_performers=analytics_dict.get("topPerformers", ""),
                posting_strategy=analytics_dict.get("postingStrategy", ""),
                hashtag_insights=analytics_dict.get("hashtagInsights", ""),
                audience_engagement=analytics_dict.get("audienceEngagement", ""),
                recommendations=analytics_dict.get("recommendations", [])
            )
            
            return analytics
            
        except Exception as e:
            print(f"Error analyzing content: {e}")
            return None
    
    def _run_replicate_model(self, prompt: str) -> str:
        """Run Replicate model synchronously."""
        try:
            output = replicate.run(
                "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
                input={
                    "prompt": prompt,
                    "max_new_tokens": 2000,
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "repetition_penalty": 1.15
                }
            )
            
            # Join the output if it's a list
            if isinstance(output, list):
                return ''.join(output)
            return str(output)
            
        except Exception as e:
            print(f"Replicate API error: {e}")
            return ""
    
    def _create_content_prompt(self, settings: ContentSettings) -> str:
        """Create prompt for content generation."""
        return f"""You are a social media content expert. Generate a high-performing post for the following settings:
Platform: {settings.platform}
Niche: {settings.niche}
Tone: {settings.tone}
Content Type: {settings.content_type}
Target Audience: {settings.target_audience}
Keywords: {settings.keywords}

Format as JSON:
{{
  "hook": "...",
  "caption": "...",
  "cta": "...",
  "hashtags": ["", ...],
  "bestTime": "...",
  "strategyNotes": "...",
  "variations": ["...", "..."]
}}
DO NOT OUTPUT ANYTHING OTHER THAN VALID JSON."""
    
    def _create_analytics_prompt(self, content_history: list) -> str:
        """Create prompt for analytics generation."""
        history_json = json.dumps([
            {
                "platform": content.platform,
                "niche": content.niche,
                "tone": content.tone,
                "hook": content.hook,
                "hashtags": content.hashtags
            }
            for content in content_history[:10]
        ], indent=2)
        
        return f"""You are a social media analytics expert. Analyze the following content history and provide actionable insights.

Content History ({len(content_history)} posts):
{history_json}

Provide a comprehensive analysis with:
1. Content performance patterns
2. Best performing content types
3. Optimal posting strategy
4. Hashtag effectiveness
5. Audience engagement predictions
6. Recommendations for improvement

Format as JSON:
{{
  "contentPatterns": "analysis of what's working",
  "topPerformers": "best content types identified",
  "postingStrategy": "when and what to post",
  "hashtagInsights": "hashtag strategy recommendations",
  "audienceEngagement": "predicted engagement patterns",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "growthScore": "score out of 100"
}}

DO NOT OUTPUT ANYTHING OTHER THAN VALID JSON."""