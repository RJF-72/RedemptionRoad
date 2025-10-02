"""
Redemption Marketing - Data Models
Copyright (c) 2025 Redemption Road. All rights reserved.

Data models for the Redemption Marketing application.
"""
from dataclasses import dataclass
from typing import List, Optional
from datetime import datetime


@dataclass
class MusicMetadata:
    """Metadata for music tracks and videos."""
    song_title: str = ""
    writer: str = ""
    artist: str = ""
    record_label: str = ""
    album: str = ""
    release_year: Optional[int] = None
    genre: str = ""
    duration: Optional[float] = None
    copyright_notice: str = ""
    
    def __post_init__(self):
        if not self.copyright_notice and self.record_label:
            current_year = datetime.now().year
            self.copyright_notice = f"© {current_year} {self.record_label}. All rights reserved."
    
    def get_random_outro_message(self) -> str:
        """Generate a random outro message for music videos."""
        import random
        
        outros = [
            "Thanks for listening! 🎵 Like, Subscribe and Comment below!",
            "Hope you enjoyed this track! 💫 Don't forget to Like, Subscribe and let us know your thoughts!",
            "Thanks for vibing with us! 🔥 Hit that Like button, Subscribe for more, and drop a comment!",
            "Music bringing us together! 🎶 Please Like, Subscribe and share your favorite moment in the comments!",
            "Grateful for your ears! 🙏 Like this video, Subscribe for more music, and comment your thoughts!",
            "Thanks for the listen! ✨ Show some love with a Like, Subscribe to stay tuned, and comment below!",
            "Music is meant to be shared! 🎤 Like, Subscribe and tell us what this song means to you!",
            "Thank you for listening! 🎵 Smash that Like button, Subscribe for more, and comment your vibe!",
            "Hope this touched your soul! 💝 Please Like, Subscribe and comment what you felt!",
            "Thanks for being part of our musical journey! 🚀 Like, Subscribe and comment your favorite lyrics!",
            "Music connects us all! 🌟 Hit Like, Subscribe for more content, and share your thoughts below!",
            "Grateful for your support! 🙌 Like this video, Subscribe to our channel, and comment your feedback!",
            "Thanks for listening to our heart! ❤️ Please Like, Subscribe and tell us how this made you feel!",
            "Hope you found your rhythm! 🥁 Like, Subscribe and comment what genre you want to hear next!",
            "Music heals everything! 🩹 Show love with a Like, Subscribe for healing vibes, and comment below!",
            "Thanks for turning up the volume on love! 📢 Like, Subscribe and comment your favorite part!",
            "Blessed to share this with you! 🙏 Like this track, Subscribe for blessings, and comment your prayers!",
            "Hope this soundtrack fits your life! 🎬 Like, Subscribe and comment where you'll play this!",
            "Thanks for letting music move you! 💃 Hit Like, Subscribe for more moves, and comment your dance!",
            "Music is our universal language! 🌍 Like, Subscribe and comment in your language below!"
        ]
        
        return random.choice(outros)


# Video content types that require video settings
VIDEO_CONTENT_TYPES = [
    "commercial_video", 
    "marketing_video", 
    "music_video", 
    "full_length_music_video",
    "product_demo", 
    "behind_scenes"
]

# Audio file extensions supported
SUPPORTED_AUDIO_FORMATS = [
    ".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a", ".wma"
]


@dataclass
class ContentSettings:
    """Settings for content generation."""
    platform: str = "instagram"
    niche: str = ""
    tone: str = "professional"
    content_type: str = "educational"
    target_audience: str = ""
    keywords: str = ""
    video_style: str = "cinematic"
    music_genre: str = "pop"
    video_duration: int = 30  # seconds
    audio_file_path: str = ""  # Path to user's audio file
    auto_duration: bool = False  # Whether to use audio file duration
    music_metadata: Optional[MusicMetadata] = None  # Music track metadata
    
    def __post_init__(self):
        if self.music_metadata is None:
            self.music_metadata = MusicMetadata()


@dataclass
class GeneratedContent:
    """Generated social media content structure."""
    hook: str
    caption: str
    cta: str
    hashtags: List[str]
    best_time: str
    strategy_notes: str
    variations: Optional[List[str]] = None
    platform: str = ""
    niche: str = ""
    tone: str = ""
    content_type: str = ""
    timestamp: str = ""
    video_script: Optional[str] = None
    video_scenes: Optional[List[str]] = None
    music_suggestions: Optional[List[str]] = None
    visual_elements: Optional[List[str]] = None
    scene_timeline: Optional[List[dict]] = None  # Detailed scene timing
    audio_analysis: Optional[dict] = None  # Audio file analysis
    total_scenes: int = 0  # Number of generated scenes
    audio_duration: float = 0.0  # Duration from audio file
    outro_message: Optional[str] = None  # Random outro for music videos

    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.now().isoformat()
        
        # Auto-generate outro message for music videos
        if self.content_type in ["music_video", "full_length_music_video"] and not self.outro_message:
            metadata = MusicMetadata()
            self.outro_message = metadata.get_random_outro_message()


@dataclass
class AnalyticsData:
    """Analytics data structure."""
    growth_score: int
    content_patterns: str
    top_performers: str
    posting_strategy: str
    hashtag_insights: str
    audience_engagement: str
    recommendations: List[str]


@dataclass
class VideoProject:
    """Video project for library management."""
    id: str
    title: str
    content_type: str  # "marketing_video" or "music_video"
    duration: float
    created_date: str
    file_path: Optional[str] = None
    thumbnail_path: Optional[str] = None
    script: Optional[str] = None
    scenes: Optional[List[str]] = None
    status: str = "draft"  # draft, rendering, completed, published
    music_metadata: Optional[MusicMetadata] = None  # Music track metadata
    
    def __post_init__(self):
        if not self.created_date:
            self.created_date = datetime.now().isoformat()
        if self.music_metadata is None and self.content_type == "music_video":
            self.music_metadata = MusicMetadata()


@dataclass
class SocialAccount:
    """Social media account information."""
    platform: str
    username: str
    display_name: str
    is_connected: bool = False
    access_token: Optional[str] = None
    profile_pic: Optional[str] = None
    follower_count: Optional[int] = None
    last_post_date: Optional[str] = None
    auto_signin_enabled: bool = False  # NEW: Enable auto sign-in
    encrypted_credentials: Optional[str] = None  # NEW: Encrypted login data
    last_auto_post: Optional[str] = None  # NEW: Last automatic post timestamp


@dataclass
class PostingSchedule:
    """Scheduled posting information."""
    id: str
    content_id: str
    platform: str
    scheduled_time: str
    status: str = "pending"  # pending, posted, failed, cancelled
    content: Optional[GeneratedContent] = None
    error_message: Optional[str] = None
    created_date: str = ""
    
    def __post_init__(self):
        if not self.created_date:
            self.created_date = datetime.now().isoformat()


@dataclass
class AutoPostSettings:
    """Settings for autonomous posting."""
    enabled: bool = False
    auto_signin: bool = False  # NEW: Auto sign-in to platforms
    posts_per_day: int = 3  # NEW: Number of posts per day
    posting_hours: List[str] = None  # NEW: Preferred posting hours
    schedule_time: Optional[str] = None
    platforms: List[str] = None
    auto_hashtags: bool = True
    auto_scheduling: bool = False
    content_approval: bool = True  # Require approval before posting
    min_interval_hours: int = 2  # NEW: Minimum hours between posts
    max_interval_hours: int = 8  # NEW: Maximum hours between posts
    auto_content_generation: bool = False  # NEW: Generate content automatically

    def __post_init__(self):
        if self.platforms is None:
            self.platforms = []
        if self.posting_hours is None:
            self.posting_hours = ["09:00", "13:00", "18:00"]  # Default posting times


class VideoLibraryManager:
    """Manages video project libraries."""
    
    def __init__(self):
        self.marketing_videos: List[VideoProject] = []
        self.music_videos: List[VideoProject] = []
        self.library_path = "./video_library"
        self._ensure_library_directories()
    
    def _ensure_library_directories(self):
        """Create library directories if they don't exist."""
        import os
        os.makedirs(f"{self.library_path}/marketing", exist_ok=True)
        os.makedirs(f"{self.library_path}/music", exist_ok=True)
        os.makedirs(f"{self.library_path}/thumbnails", exist_ok=True)
    
    def add_video(self, video: VideoProject):
        """Add video to appropriate library."""
        if video.content_type == "marketing_video":
            self.marketing_videos.append(video)
        elif video.content_type == "music_video":
            self.music_videos.append(video)
    
    def get_videos_by_type(self, content_type: str) -> List[VideoProject]:
        """Get videos by content type."""
        if content_type == "marketing_video":
            return self.marketing_videos
        elif content_type == "music_video":
            return self.music_videos
        return []


class SocialAccountManager:
    """Manages social media account connections."""
    
    def __init__(self):
        self.accounts: List[SocialAccount] = []
        self.auto_post_settings = AutoPostSettings()
        self.posting_schedule: List[PostingSchedule] = []
        self.auto_posting_active = False
    
    def add_account(self, account: SocialAccount):
        """Add or update social media account."""
        existing = next((acc for acc in self.accounts if acc.platform == account.platform), None)
        if existing:
            self.accounts.remove(existing)
        self.accounts.append(account)
    
    def get_connected_accounts(self) -> List[SocialAccount]:
        """Get all connected accounts."""
        return [acc for acc in self.accounts if acc.is_connected]
    
    def get_auto_signin_accounts(self) -> List[SocialAccount]:
        """Get accounts with auto sign-in enabled."""
        return [acc for acc in self.accounts if acc.auto_signin_enabled and acc.encrypted_credentials]
    
    def get_account_by_platform(self, platform: str) -> Optional[SocialAccount]:
        """Get account by platform."""
        return next((acc for acc in self.accounts if acc.platform == platform), None)
    
    def get_all_accounts(self) -> List[SocialAccount]:
        """Get all accounts."""
        return self.accounts
    
    def schedule_post(self, content: GeneratedContent, platform: str, scheduled_time: str) -> PostingSchedule:
        """Schedule a post for later."""
        import uuid
        
        schedule = PostingSchedule(
            id=str(uuid.uuid4()),
            content_id=getattr(content, 'id', str(uuid.uuid4())),
            platform=platform,
            scheduled_time=scheduled_time,
            content=content
        )
        
        self.posting_schedule.append(schedule)
        return schedule
    
    def get_pending_posts(self) -> List[PostingSchedule]:
        """Get all pending scheduled posts."""
        return [post for post in self.posting_schedule if post.status == "pending"]
    
    def can_post_now(self, platform: str) -> bool:
        """Check if we can post to platform now based on interval limits."""
        account = self.get_account_by_platform(platform)
        if not account or not account.last_auto_post:
            return True
        
        from datetime import datetime, timedelta
        
        try:
            last_post = datetime.fromisoformat(account.last_auto_post)
            min_interval = timedelta(hours=self.auto_post_settings.min_interval_hours)
            return datetime.now() >= last_post + min_interval
        except:
            return True
    
    def update_last_post_time(self, platform: str):
        """Update the last post time for a platform."""
        account = self.get_account_by_platform(platform)
        if account:
            account.last_auto_post = datetime.now().isoformat()
    
    def get_next_posting_times(self, platform: str) -> List[str]:
        """Get next suggested posting times for a platform."""
        from datetime import datetime, timedelta
        
        times = []
        now = datetime.now()
        
        # Generate times based on posts_per_day and posting_hours
        posting_hours = self.auto_post_settings.posting_hours
        posts_per_day = min(self.auto_post_settings.posts_per_day, len(posting_hours))
        
        for i in range(posts_per_day):
            if i < len(posting_hours):
                time_str = posting_hours[i]
                hour, minute = map(int, time_str.split(':'))
                
                # Schedule for today if time hasn't passed, otherwise tomorrow
                target_time = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
                if target_time <= now:
                    target_time += timedelta(days=1)
                
                times.append(target_time.isoformat())
        
        return times


class ContentManager:
    """Manages generated content and history."""
    
    def __init__(self):
        self.content_history: List[GeneratedContent] = []
        self.current_content: Optional[GeneratedContent] = None
        self.analytics_data: Optional[AnalyticsData] = None
    
    def add_content(self, content: GeneratedContent):
        """Add new content to history."""
        self.content_history.insert(0, content)
        self.current_content = content
    
    def get_history_count(self) -> int:
        """Get number of items in history."""
        return len(self.content_history)
    
    def clear_history(self):
        """Clear all content history."""
        self.content_history.clear()
        self.current_content = None
        self.analytics_data = None


# Platform options
PLATFORMS = ["instagram", "twitter", "linkedin", "facebook", "tiktok"]

# Tone options
TONES = ["professional", "casual", "humorous", "inspirational", "educational"]

# Content type options
CONTENT_TYPES = [
    "educational", 
    "promotional", 
    "storytelling", 
    "ugc", 
    "trending",
    "commercial_video",
    "marketing_video",
    "music_video",
    "full_length_music_video",
    "product_demo",
    "behind_scenes"
]

# Video duration limits by content type
VIDEO_DURATION_LIMITS = {
    "commercial_video": {"min": 20, "max": 90, "default": 30},
    "marketing_video": {"min": 20, "max": 90, "default": 45},
    "music_video": {"min": 30, "max": 300, "default": 180},
    "full_length_music_video": {"min": 60, "max": 3600, "default": 240},  # Up to 1 hour
    "product_demo": {"min": 30, "max": 120, "default": 60},
    "behind_scenes": {"min": 15, "max": 180, "default": 90}
}

# Video styles for marketing and music videos
VIDEO_STYLES = [
    "cinematic",
    "minimalist", 
    "energetic",
    "dramatic",
    "playful",
    "professional",
    "artistic",
    "documentary"
]

# Music genres for music videos
MUSIC_GENRES = [
    "pop",
    "hip_hop",
    "rock",
    "electronic",
    "acoustic",
    "jazz",
    "classical",
    "ambient",
    "country",
    "christian"
]