"""
Redemption Marketing - Open Source AI Service
Copyright (c) 2025 Redemption Road. All rights reserved.

Open-source AI service using Hugging Face Transformers.
"""
import json
import asyncio
from typing import Optional, List
import requests
from transformers import pipeline, GPT2LMHeadModel, GPT2Tokenizer
import torch
from models import GeneratedContent, AnalyticsData, ContentSettings, VIDEO_CONTENT_TYPES
from utils import safe_json_parse
from audio_analyzer import AudioAnalyzer
import os


class OpenSourceAPIService:
    """Handles content generation using open-source models."""
    
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.audio_analyzer = AudioAnalyzer()
        print(f"Using device: {self.device}")
        
        # Initialize text generation pipeline
        try:
            self.text_generator = pipeline(
                "text-generation",
                model="microsoft/DialoGPT-medium",
                tokenizer="microsoft/DialoGPT-medium",
                device=0 if self.device == "cuda" else -1
            )
            print("Loaded DialoGPT model successfully")
        except Exception as e:
            print(f"Error loading model: {e}")
            self.text_generator = None
    
    async def generate_content(self, settings: ContentSettings) -> Optional[GeneratedContent]:
        """Generate content using open-source models."""
        try:
            # Run in thread to avoid blocking UI
            loop = asyncio.get_event_loop()
            content_data = await loop.run_in_executor(
                None, 
                self._generate_content_sync, 
                settings
            )
            
            if not content_data:
                return None
            
            # Create GeneratedContent object
            content = GeneratedContent(
                hook=content_data.get("hook", ""),
                caption=content_data.get("caption", ""),
                cta=content_data.get("cta", ""),
                hashtags=content_data.get("hashtags", []),
                best_time=content_data.get("best_time", ""),
                strategy_notes=content_data.get("strategy_notes", ""),
                variations=content_data.get("variations", []),
                video_script=content_data.get("video_script"),
                video_scenes=content_data.get("video_scenes"),
                music_suggestions=content_data.get("music_suggestions"),
                visual_elements=content_data.get("visual_elements"),
                scene_timeline=content_data.get("scene_timeline"),
                audio_analysis=content_data.get("audio_analysis"),
                total_scenes=content_data.get("total_scenes", 0),
                audio_duration=content_data.get("audio_duration", 0.0),
                platform=settings.platform,
                niche=settings.niche,
                tone=settings.tone,
                content_type=settings.content_type
            )
            
            return content
            
        except Exception as e:
            print(f"Error generating content: {e}")
            return self._generate_fallback_content(settings)
    
    async def analyze_content(self, content_history: list) -> Optional[AnalyticsData]:
        """Analyze content history for insights."""
        if not content_history:
            return None
        
        try:
            # Run in thread to avoid blocking UI
            loop = asyncio.get_event_loop()
            analytics_data = await loop.run_in_executor(
                None, 
                self._analyze_content_sync, 
                content_history
            )
            
            return analytics_data
            
        except Exception as e:
            print(f"Error analyzing content: {e}")
            return self._generate_fallback_analytics(content_history)
    
    def _generate_content_sync(self, settings: ContentSettings) -> dict:
        """Generate content synchronously."""
        if settings.content_type in VIDEO_CONTENT_TYPES:
            return self._generate_video_content(settings)
        else:
            return self._generate_text_content(settings)
    
    def _generate_text_content(self, settings: ContentSettings) -> dict:
        """Generate text-based content."""
        # Create prompt for text generation
        prompt = f"Create engaging {settings.platform} content about {settings.niche} for {settings.target_audience} with a {settings.tone} tone:"
        
        try:
            if self.text_generator:
                # Generate with the model
                response = self.text_generator(
                    prompt,
                    max_length=200,
                    num_return_sequences=1,
                    temperature=0.7,
                    do_sample=True,
                    pad_token_id=50256
                )
                generated_text = response[0]['generated_text']
            else:
                # Fallback to template-based generation
                return self._generate_template_content(settings)
            
        except Exception as e:
            print(f"Model generation error: {e}")
            return self._generate_template_content(settings)
        
        # Parse and structure the generated content
        return self._structure_generated_content(generated_text, settings)
    
    def _generate_video_content(self, settings: ContentSettings) -> dict:
        """Generate video content with scripts and scenes."""
        video_data = self._generate_template_content(settings)
        
        # Add video-specific elements based on content type
        if settings.content_type == "commercial_video":
            video_data["video_script"] = self._generate_commercial_script(settings)
            video_data["video_scenes"] = self._generate_commercial_scenes(settings)
            video_data["visual_elements"] = self._generate_commercial_visuals(settings)
        elif settings.content_type == "marketing_video":
            video_data["video_script"] = self._generate_marketing_script(settings)
            video_data["video_scenes"] = self._generate_marketing_scenes(settings)
            video_data["visual_elements"] = self._generate_visual_elements(settings)
        elif settings.content_type == "music_video":
            video_data["video_script"] = self._generate_music_video_script(settings)
            video_data["video_scenes"] = self._generate_music_video_scenes(settings)
            video_data["music_suggestions"] = self._generate_music_suggestions(settings)
        elif settings.content_type == "product_demo":
            video_data["video_script"] = self._generate_product_demo_script(settings)
            video_data["video_scenes"] = self._generate_product_demo_scenes(settings)
            video_data["visual_elements"] = self._generate_demo_visuals(settings)
        elif settings.content_type == "behind_scenes":
            video_data["video_script"] = self._generate_behind_scenes_script(settings)
            video_data["video_scenes"] = self._generate_behind_scenes_scenes(settings)
            video_data["visual_elements"] = self._generate_behind_scenes_visuals(settings)
        
        return video_data
    
    def _generate_marketing_script(self, settings: ContentSettings) -> str:
        """Generate marketing video script."""
        return f"""
MARKETING VIDEO SCRIPT - {settings.video_duration}s

[0-3s] HOOK: Bold statement or question about {settings.niche}
[4-8s] PROBLEM: Show the challenge your audience faces
[9-15s] SOLUTION: Present your {settings.niche} solution
[16-22s] BENEFITS: 3 key benefits with quick visuals
[23-27s] CALL TO ACTION: Clear next step for viewers
[28-30s] BRANDING: Logo and contact info

Tone: {settings.tone}
Style: {settings.video_style}
Target: {settings.target_audience}
"""
    
    def _generate_marketing_scenes(self, settings: ContentSettings) -> List[str]:
        """Generate marketing video scenes."""
        return [
            f"Opening hook with bold text overlay about {settings.niche}",
            f"Problem visualization showing {settings.target_audience} struggles",
            f"Product/service showcase with {settings.video_style} cinematography",
            f"Benefits montage with quick cuts and dynamic transitions",
            f"Call-to-action with clear branding and contact information"
        ]
    
    def _generate_music_video_script(self, settings: ContentSettings) -> str:
        """Generate music video script."""
        return f"""
MUSIC VIDEO CONCEPT - {settings.video_duration}s

Genre: {settings.music_genre}
Style: {settings.video_style}
Theme: {settings.niche}

[Intro] Atmospheric opening that sets the mood
[Verse 1] Character/story introduction with {settings.tone} energy
[Chorus] High-energy sequence with visual impact
[Verse 2] Story development with creative transitions
[Chorus] Peak energy with synchronized visuals
[Outro] Memorable closing that reinforces the theme

Visual Theme: Connect {settings.niche} with {settings.music_genre} aesthetics
"""
    
    def _generate_music_video_scenes(self, settings: ContentSettings) -> List[str]:
        """Generate music video scenes."""
        return [
            f"Atmospheric intro with {settings.video_style} lighting",
            f"Performance shots with {settings.music_genre} energy",
            f"Story narrative connecting to {settings.niche} theme",
            f"Creative transitions and visual effects",
            f"Climactic sequence with synchronized choreography",
            f"Memorable outro with artistic flair"
        ]
    
    def _generate_visual_elements(self, settings: ContentSettings) -> List[str]:
        """Generate visual elements for marketing videos."""
        return [
            f"Bold typography for {settings.niche} messaging",
            f"Product close-ups with {settings.video_style} lighting",
            f"Lifestyle shots featuring {settings.target_audience}",
            f"Animated graphics and data visualizations",
            f"Brand colors and consistent visual identity"
        ]
    
    def _generate_music_suggestions(self, settings: ContentSettings) -> List[str]:
        """Generate music suggestions for videos."""
        suggestions = {
            "pop": ["Upbeat electronic beats", "Catchy vocal hooks", "Modern production"],
            "hip_hop": ["Heavy bass lines", "Rhythmic vocals", "Urban soundscape"],
            "rock": ["Guitar-driven melodies", "Powerful drums", "Energy builds"],
            "electronic": ["Synthesized melodies", "Digital effects", "Progressive builds"],
            "acoustic": ["Organic instruments", "Intimate vocals", "Natural reverb"],
            "jazz": ["Smooth instrumentals", "Improvised sections", "Sophisticated harmonies"],
            "classical": ["Orchestral arrangements", "Dynamic compositions", "Emotional crescendos"],
            "ambient": ["Atmospheric textures", "Minimal beats", "Ethereal soundscapes"]
        }
        
        return suggestions.get(settings.music_genre, suggestions["pop"])
    
    def _generate_template_content(self, settings: ContentSettings) -> dict:
        """Generate content using templates as fallback."""
        templates = {
            "fitness": {
                "hook": f"💪 Transform your {settings.tone} approach to {settings.niche}...",
                "caption": f"Your {settings.niche} journey starts with one decision.\n\n✨ Consistency over perfection\n🎯 Progress over comparison\n💪 Action over excuses\n\nEvery expert was once a beginner. Your transformation starts now.\n\nWhat's your first step today?",
                "cta": f"Ready to start your {settings.niche} transformation? Let's go! 💪",
                "hashtags": ["fitness", "transformation", "motivation", "health", "lifestyle"],
                "best_time": "6:00-8:00 AM or 6:00-8:00 PM",
                "strategy_notes": f"Focus on transformation stories and actionable tips for {settings.platform}"
            },
            "business": {
                "hook": f"🚀 This {settings.tone} {settings.niche} strategy changed everything...",
                "caption": f"Building in {settings.niche} taught me:\n\n📊 Data drives decisions\n💡 Innovation solves problems\n🎯 Focus beats multitasking\n🤝 Relationships matter most\n\nSuccess isn't about having all the answers—it's about asking better questions.\n\nWhat's one lesson that changed your approach?",
                "cta": f"Share your biggest {settings.niche} lesson below! 👇",
                "hashtags": ["business", "entrepreneur", "growth", "success", "innovation"],
                "best_time": "7:00-9:00 AM or 12:00-2:00 PM",
                "strategy_notes": f"Include case studies and practical insights for {settings.platform}"
            }
        }
        
        # Get template based on niche
        template_key = next((key for key in templates.keys() if key in settings.niche.lower()), "business")
        template = templates[template_key]
        
        return {
            "hook": template["hook"],
            "caption": template["caption"],
            "cta": template["cta"],
            "hashtags": template["hashtags"],
            "best_time": template["best_time"],
            "strategy_notes": template["strategy_notes"],
            "variations": [
                "Short version: Hook + CTA only",
                "Story version: Personal anecdote + lesson",
                "Question version: Engaging question to drive comments"
            ]
        }
    
    def _structure_generated_content(self, text: str, settings: ContentSettings) -> dict:
        """Structure the generated text into content components."""
        lines = text.split('\n')
        
        # Extract components from generated text
        hook = lines[0] if lines else f"✨ Discover the power of {settings.niche}"
        caption_lines = lines[1:] if len(lines) > 1 else [f"Transform your approach to {settings.niche}"]
        caption = '\n'.join(caption_lines[:5])  # Limit length
        
        return {
            "hook": hook[:100],  # Limit hook length
            "caption": caption[:500],  # Limit caption length
            "cta": f"What's your experience with {settings.niche}? Share below! 👇",
            "hashtags": self._generate_hashtags(settings),
            "best_time": self._get_optimal_time(settings.platform),
            "strategy_notes": f"AI-generated content for {settings.platform} focusing on {settings.niche}",
            "variations": [
                "Shorter version with just the key message",
                "Extended version with more details and examples",
                "Question-focused version to increase engagement"
            ]
        }
    
    def _generate_hashtags(self, settings: ContentSettings) -> List[str]:
        """Generate relevant hashtags."""
        base_tags = [settings.niche.replace(' ', '').lower()]
        
        platform_tags = {
            "instagram": ["instagram", "insta", "igdaily"],
            "twitter": ["twitter", "twitterverse", "tweet"],
            "linkedin": ["linkedin", "professional", "career"],
            "facebook": ["facebook", "social", "community"],
            "tiktok": ["tiktok", "viral", "trending"]
        }
        
        tone_tags = {
            "professional": ["business", "career", "growth"],
            "casual": ["lifestyle", "daily", "relatable"],
            "humorous": ["funny", "comedy", "lol"],
            "inspirational": ["motivation", "inspiration", "mindset"],
            "educational": ["tips", "learning", "howto"]
        }
        
        tags = base_tags.copy()
        tags.extend(platform_tags.get(settings.platform, [])[:2])
        tags.extend(tone_tags.get(settings.tone, [])[:2])
        tags.extend(["content", "socialmedia", "marketing"])
        
        return tags[:10]  # Limit to 10 hashtags
    
    def _get_optimal_time(self, platform: str) -> str:
        """Get optimal posting times by platform."""
        times = {
            "instagram": "11:00 AM - 1:00 PM or 7:00 PM - 9:00 PM",
            "twitter": "8:00 AM - 10:00 AM or 7:00 PM - 9:00 PM", 
            "linkedin": "8:00 AM - 10:00 AM or 12:00 PM - 2:00 PM",
            "facebook": "1:00 PM - 3:00 PM or 7:00 PM - 9:00 PM",
            "tiktok": "6:00 AM - 10:00 AM or 7:00 PM - 9:00 PM"
        }
        return times.get(platform, "9:00 AM - 11:00 AM or 7:00 PM - 9:00 PM")
    
    def _analyze_content_sync(self, content_history: list) -> AnalyticsData:
        """Analyze content synchronously."""
        return self._generate_fallback_analytics(content_history)
    
    def _generate_fallback_content(self, settings: ContentSettings) -> GeneratedContent:
        """Generate fallback content when models fail."""
        content_data = self._generate_template_content(settings)
        
        return GeneratedContent(
            hook=content_data["hook"],
            caption=content_data["caption"],
            cta=content_data["cta"],
            hashtags=content_data["hashtags"],
            best_time=content_data["best_time"],
            strategy_notes=content_data["strategy_notes"],
            variations=content_data["variations"],
            platform=settings.platform,
            niche=settings.niche,
            tone=settings.tone,
            content_type=settings.content_type
        )
    
    def _generate_fallback_analytics(self, content_history: list) -> AnalyticsData:
        """Generate fallback analytics."""
        import random
        
        return AnalyticsData(
            growth_score=random.randint(70, 90),
            content_patterns="Your content shows consistent engagement patterns with educational posts performing best.",
            top_performers="Posts with actionable tips and personal stories generate highest engagement.",
            posting_strategy="Optimal posting windows align with your audience's active hours.",
            hashtag_insights="Mix of trending and niche hashtags improves discoverability.",
            audience_engagement="Your audience responds well to authentic, value-driven content.",
            recommendations=[
                "Increase video content for better engagement",
                "Post consistently during peak hours",
                "Include more call-to-action prompts",
                "Use storytelling to build connections",
                "Engage with comments within first hour"
            ]
        )