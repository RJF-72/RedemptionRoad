"""
Mock API service for testing without API credits.
"""
import json
import asyncio
from typing import Optional
from models import GeneratedContent, AnalyticsData, ContentSettings
import random


class MockAPIService:
    """Mock API service for testing without real API calls."""
    
    def __init__(self):
        self.demo_mode = True
    
    async def generate_content(self, settings: ContentSettings) -> Optional[GeneratedContent]:
        """Generate mock content for demo purposes."""
        # Simulate API delay
        await asyncio.sleep(2)
        
        # Create realistic mock content based on settings
        platform = settings.platform.title()
        niche = settings.niche.lower()
        tone = settings.tone
        
        mock_data = self._get_mock_content(settings)
        
        content = GeneratedContent(
            hook=mock_data["hook"],
            caption=mock_data["caption"],
            cta=mock_data["cta"],
            hashtags=mock_data["hashtags"],
            best_time=mock_data["bestTime"],
            strategy_notes=mock_data["strategyNotes"],
            variations=mock_data["variations"],
            platform=settings.platform,
            niche=settings.niche,
            tone=settings.tone,
            content_type=settings.content_type
        )
        
        return content
    
    async def analyze_content(self, content_history: list) -> Optional[AnalyticsData]:
        """Generate mock analytics for demo purposes."""
        if not content_history:
            return None
        
        # Simulate API delay
        await asyncio.sleep(1.5)
        
        analytics = AnalyticsData(
            growth_score=random.randint(65, 95),
            content_patterns="Your most engaging content uses storytelling approaches with personal anecdotes. Educational posts perform 40% better than promotional content.",
            top_performers="Educational content with actionable tips generates the highest engagement. Posts with questions in the caption increase comments by 60%.",
            posting_strategy="Optimal posting times are 8-10 AM and 6-8 PM on weekdays. Weekends show 25% higher engagement for lifestyle content.",
            hashtag_insights="Mix of 5-7 hashtags works best. Trending hashtags increase reach by 30%. Niche-specific tags drive more qualified engagement.",
            audience_engagement="Your audience responds well to authentic, behind-the-scenes content. User-generated content drives 45% more engagement.",
            recommendations=[
                "Post consistently 3-4 times per week for optimal growth",
                "Include more video content - it gets 2x more engagement",
                "Use storytelling to make your content more relatable",
                "Engage with comments within the first hour of posting",
                "Cross-promote content across different platforms"
            ]
        )
        
        return analytics
    
    def _get_mock_content(self, settings: ContentSettings):
        """Get mock content based on settings."""
        
        # Content templates by platform and niche
        templates = {
            "fitness": {
                "hook": "🔥 Ready to transform your {tone} mindset? Here's what changed everything for me...",
                "caption": "I used to think {niche} was just about showing up. But here's what I discovered:\n\n✨ Consistency beats perfection every time\n💪 Your mindset shapes your results\n🎯 Small daily actions compound into massive changes\n\nThe real game-changer? Understanding that every expert was once a beginner. Your journey starts with that first step.\n\nWhat's holding you back from starting today?",
                "cta": "Drop a 💪 if you're ready to commit to your {niche} journey!",
                "hashtags": ["fitness", "motivation", "healthylifestyle", "mindset", "transformation", "consistency", "goals"],
                "bestTime": "6:00 AM - 8:00 AM (when people plan their day) or 6:00 PM - 8:00 PM (post-workout motivation)",
                "strategyNotes": "Fitness content performs best with before/after visuals and personal transformation stories. Use motivational language and include actionable tips."
            },
            "tech": {
                "hook": "🚀 This {tone} approach to {niche} just changed how I think about innovation...",
                "caption": "Here's what 5 years in {niche} taught me:\n\n🔧 The best solutions are often the simplest ones\n💡 Innovation isn't about the latest trend - it's about solving real problems\n📱 User experience trumps fancy features every time\n🎯 Focus on one thing and do it exceptionally well\n\nThe tech that lasts isn't the most complex - it's the most useful.\n\nWhat's one tech solution that actually improved your daily life?",
                "cta": "Share your favorite productivity tool in the comments! 👇",
                "hashtags": ["technology", "innovation", "productivity", "techlife", "digitaltransformation", "futuretech", "problem solving"],
                "bestTime": "9:00 AM - 11:00 AM (when professionals check updates) or 1:00 PM - 3:00 PM (lunch break browsing)",
                "strategyNotes": "Tech content works well with demonstrations, tutorials, and industry insights. Keep language accessible and focus on practical applications."
            },
            "business": {
                "hook": "💰 This {tone} business lesson cost me $10K to learn. Here's what I wish I knew earlier...",
                "caption": "Building a business taught me these hard truths:\n\n📊 Revenue isn't profit (cash flow is king)\n🎯 Your first idea probably isn't your best idea\n💼 Systems beat motivation every single time\n🤝 Your network truly is your net worth\n⏰ Time is your most valuable asset - protect it\n\nThe biggest mistake? Trying to do everything yourself. Success comes from knowing when to delegate and when to double down.\n\nWhat's one business lesson you learned the hard way?",
                "cta": "Tag an entrepreneur who needs to see this! 🚀",
                "hashtags": ["entrepreneur", "business", "startup", "mindset", "success", "leadership", "growth"],
                "bestTime": "7:00 AM - 9:00 AM (commute time) or 12:00 PM - 2:00 PM (lunch break networking)",
                "strategyNotes": "Business content performs well with data, case studies, and lessons learned. Include practical advice and actionable insights."
            }
        }
        
        # Get template based on niche, fallback to generic
        niche_key = next((key for key in templates.keys() if key in settings.niche.lower()), "business")
        template = templates[niche_key]
        
        # Format content with settings
        formatted_content = {
            "hook": template["hook"].format(tone=settings.tone, niche=settings.niche),
            "caption": template["caption"].format(niche=settings.niche, tone=settings.tone),
            "cta": template["cta"].format(niche=settings.niche),
            "hashtags": template["hashtags"],
            "bestTime": template["bestTime"],
            "strategyNotes": template["strategyNotes"],
            "variations": [
                "Short version: Focus on the key benefit and call-to-action only",
                "Story version: Start with a personal anecdote that relates to your message",
                "Question version: Lead with an engaging question to boost comments"
            ]
        }
        
        return formatted_content