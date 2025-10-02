"""
Redemption Marketing - Utility Functions
Copyright (c) 2025 Redemption Road. All rights reserved.

Utility functions for the Redemption Marketing application.
"""
import tkinter as tk
from datetime import datetime
from typing import Optional, Dict, List
import json
import os


def copy_to_clipboard(text: str) -> bool:
    """Copy text to clipboard."""
    try:
        root = tk.Tk()
        root.withdraw()  # Hide the window
        root.clipboard_clear()
        root.clipboard_append(text)
        root.update()
        root.destroy()
        return True
    except Exception as e:
        print(f"Error copying to clipboard: {e}")
        return False


def format_timestamp(timestamp: str = None) -> str:
    """Format ISO timestamp to readable format."""
    if timestamp is None:
        timestamp = datetime.now().isoformat()
    
    try:
        dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        return dt.strftime("%m/%d/%Y %I:%M %p")
    except Exception:
        return timestamp


def validate_required_fields(niche: str, target_audience: str) -> tuple[bool, str]:
    """Validate required form fields."""
    if not niche.strip():
        return False, "Niche is required"
    if not target_audience.strip():
        return False, "Target audience is required"
    return True, ""


def truncate_text(text: str, max_length: int = 100) -> str:
    """Truncate text to specified length with ellipsis."""
    if len(text) <= max_length:
        return text
    return text[:max_length - 3] + "..."


def safe_json_parse(json_str: str) -> Optional[dict]:
    """Safely parse JSON string."""
    try:
        # Clean up JSON string
        cleaned = json_str.replace('```json', '').replace('```', '').strip()
        return json.loads(cleaned)
    except Exception as e:
        print(f"JSON parse error: {e}")
        return None


def format_hashtags(hashtags: list) -> str:
    """Format hashtags for display."""
    return " ".join([f"#{tag}" for tag in hashtags])


def create_color_scheme():
    """Return the application color scheme."""
    return {
        'bg_primary': '#000000',      # Black
        'bg_secondary': '#1a1a1a',    # Dark gray
        'bg_accent': '#dc2626',       # Red
        'text_primary': '#fbbf24',    # Yellow
        'text_secondary': '#9ca3af',  # Light gray
        'text_accent': '#ffffff',     # White
        'border': '#dc2626',          # Red border
        'success': '#10b981',         # Green
        'warning': '#f59e0b',         # Orange
        'error': '#ef4444',           # Red
    }


def sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe file operations."""
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        filename = filename.replace(char, '_')
    return filename[:255]  # Limit length


def ensure_directory(path: str) -> None:
    """Ensure directory exists."""
    os.makedirs(path, exist_ok=True)


def get_file_size_mb(file_path: str) -> float:
    """Get file size in MB."""
    try:
        size_bytes = os.path.getsize(file_path)
        return size_bytes / (1024 * 1024)
    except:
        return 0.0


def format_duration(seconds: float) -> str:
    """Format duration in seconds to MM:SS format."""
    minutes = int(seconds // 60)
    seconds = int(seconds % 60)
    return f"{minutes}:{seconds:02d}"


def parse_hashtags(hashtag_string: str) -> List[str]:
    """Parse hashtag string into list of hashtags."""
    if not hashtag_string:
        return []
    
    # Split by spaces and commas, filter out empty strings
    tags = []
    for tag in hashtag_string.replace(',', ' ').split():
        tag = tag.strip()
        if tag:
            # Ensure hashtag starts with #
            if not tag.startswith('#'):
                tag = '#' + tag
            tags.append(tag)
    
    return tags


def validate_hashtags(hashtags: List[str]) -> List[str]:
    """Validate and clean hashtag list."""
    valid_hashtags = []
    
    for tag in hashtags:
        # Remove any characters that aren't letters, numbers, or underscores
        clean_tag = ''.join(c for c in tag if c.isalnum() or c in '#_')
        
        # Must start with # and have at least one character after
        if clean_tag.startswith('#') and len(clean_tag) > 1:
            valid_hashtags.append(clean_tag)
    
    return valid_hashtags


class StatusManager:
    """Manages application status and loading states."""
    
    def __init__(self):
        self.is_loading = False
        self.status_message = ""
        self.callbacks = []
    
    def set_loading(self, loading: bool, message: str = ""):
        """Set loading state and message."""
        self.is_loading = loading
        self.status_message = message
        self._notify_callbacks()
    
    def add_callback(self, callback):
        """Add status change callback."""
        self.callbacks.append(callback)
    
    def _notify_callbacks(self):
        """Notify all callbacks of status change."""
        for callback in self.callbacks:
            try:
                callback(self.is_loading, self.status_message)
            except Exception as e:
                print(f"Callback error: {e}")


class VideoCodec:
    """Video codec utilities."""
    
    @staticmethod
    def get_supported_formats() -> List[str]:
        """Get list of supported video formats."""
        return ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv']
    
    @staticmethod
    def is_supported_format(file_path: str) -> bool:
        """Check if file format is supported."""
        ext = os.path.splitext(file_path)[1].lower()
        return ext in VideoCodec.get_supported_formats()


class AudioCodec:
    """Audio codec utilities."""
    
    @staticmethod
    def get_supported_formats() -> List[str]:
        """Get list of supported audio formats."""
        return ['.mp3', '.wav', '.aac', '.flac', '.ogg', '.m4a']
    
    @staticmethod
    def is_supported_format(file_path: str) -> bool:
        """Check if file format is supported."""
        ext = os.path.splitext(file_path)[1].lower()
        return ext in AudioCodec.get_supported_formats()


class PlatformConfig:
    """Social media platform configurations."""
    
    PLATFORMS = {
        'instagram': {
            'name': 'Instagram',
            'icon': '📷',
            'max_video_duration': 60,
            'max_file_size_mb': 100,
            'aspect_ratios': ['1:1', '9:16', '4:5'],
            'supports_stories': True
        },
        'twitter': {
            'name': 'Twitter',
            'icon': '🐦', 
            'max_video_duration': 140,
            'max_file_size_mb': 512,
            'aspect_ratios': ['16:9', '1:1'],
            'supports_stories': False
        },
        'linkedin': {
            'name': 'LinkedIn',
            'icon': '💼',
            'max_video_duration': 600,
            'max_file_size_mb': 200,
            'aspect_ratios': ['16:9', '1:1'],
            'supports_stories': False
        },
        'facebook': {
            'name': 'Facebook',
            'icon': '👥',
            'max_video_duration': 7200,
            'max_file_size_mb': 1024,
            'aspect_ratios': ['16:9', '1:1', '9:16'],
            'supports_stories': True
        }
    }
    
    @classmethod
    def get_platform_config(cls, platform: str) -> Dict:
        """Get configuration for specific platform."""
        return cls.PLATFORMS.get(platform.lower(), {})
    
    @classmethod
    def get_all_platforms(cls) -> List[str]:
        """Get list of all supported platforms."""
        return list(cls.PLATFORMS.keys())


class ContentValidator:
    """Content validation utilities."""
    
    @staticmethod
    def validate_video_duration(duration: float, platform: str) -> bool:
        """Validate video duration for platform."""
        config = PlatformConfig.get_platform_config(platform)
        if not config:
            return True
        
        max_duration = config.get('max_video_duration', float('inf'))
        return duration <= max_duration
    
    @staticmethod
    def validate_file_size(file_path: str, platform: str) -> bool:
        """Validate file size for platform."""
        config = PlatformConfig.get_platform_config(platform)
        if not config:
            return True
        
        max_size_mb = config.get('max_file_size_mb', float('inf'))
        file_size_mb = get_file_size_mb(file_path)
        return file_size_mb <= max_size_mb
    
    @staticmethod
    def get_validation_errors(file_path: str, platform: str) -> List[str]:
        """Get list of validation errors for file and platform."""
        errors = []
        
        if not os.path.exists(file_path):
            errors.append("File does not exist")
            return errors
        
        # Check file format
        if not VideoCodec.is_supported_format(file_path):
            errors.append("Unsupported video format")
        
        # Check file size
        if not ContentValidator.validate_file_size(file_path, platform):
            config = PlatformConfig.get_platform_config(platform)
            max_size = config.get('max_file_size_mb', 0)
            errors.append(f"File size exceeds {max_size}MB limit for {platform}")
        
        return errors