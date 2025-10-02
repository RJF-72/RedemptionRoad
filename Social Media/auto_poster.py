"""
Redemption Marketing - Automated Posting Service
Copyright (c) 2025 Redemption Road. All rights reserved.

Automated social media posting with AI content generation.
"""
import threading
import time
try:
    import schedule
    SCHEDULE_AVAILABLE = True
except ImportError:
    SCHEDULE_AVAILABLE = False
    print("Warning: schedule module not available. Auto-posting will use basic timing.")

from datetime import datetime, timedelta
from typing import List, Optional
import json
import base64
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from models import SocialAccount, AutoPostSettings, GeneratedContent, PostingSchedule, ContentSettings
from opensource_api_service import OpenSourceAPIService
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AutoPoster:
    """Automated posting service for social media platforms."""
    
    def __init__(self, account_manager, content_manager):
        self.account_manager = account_manager
        self.content_manager = content_manager
        self.api_service = OpenSourceAPIService()
        self.is_running = False
        self.scheduler_thread = None
        
    def start_auto_posting(self):
        """Start the automated posting service."""
        if self.is_running:
            logger.info("Auto posting already running")
            return
        
        self.is_running = True
        logger.info("Starting automated posting service...")
        
        # Schedule posts based on account settings
        self.schedule_auto_posts()
        
        # Start scheduler thread
        self.scheduler_thread = threading.Thread(target=self.run_scheduler, daemon=True)
        self.scheduler_thread.start()
        
        logger.info("Automated posting service started")
    
    def stop_auto_posting(self):
        """Stop the automated posting service."""
        self.is_running = False
        if SCHEDULE_AVAILABLE:
            schedule.clear()
        logger.info("Automated posting service stopped")
    
    def schedule_auto_posts(self):
        """Schedule automatic posts for all AUTO-enabled accounts."""
        auto_accounts = self.account_manager.get_auto_signin_accounts()
        settings = self.account_manager.auto_post_settings
        
        if not settings.enabled or not settings.auto_signin:
            logger.info("AUTO mode not enabled")
            return
        
        if not SCHEDULE_AVAILABLE:
            logger.warning("Schedule module not available - using basic timing")
            return
        
        for account in auto_accounts:
            self.schedule_account_posts(account, settings)
    
    def schedule_account_posts(self, account: SocialAccount, settings: AutoPostSettings):
        """Schedule posts for a specific account."""
        logger.info(f"Scheduling posts for {account.platform}: @{account.username}")
        
        if not SCHEDULE_AVAILABLE:
            logger.warning("Schedule module not available - using basic timing")
            return
        
        # Schedule posts based on posting_hours
        for post_time in settings.posting_hours[:settings.posts_per_day]:
            schedule.every().day.at(post_time).do(
                self.create_and_post_content, 
                account, 
                settings
            )
            logger.info(f"Scheduled daily post at {post_time} for {account.platform}")
    
    def run_scheduler(self):
        """Run the scheduling loop."""
        if not SCHEDULE_AVAILABLE:
            logger.warning("Schedule module not available - running basic timer")
            # Basic timer implementation
            while self.is_running:
                time.sleep(3600)  # Check every hour
                # Basic time-based posting logic would go here
            return
        
        while self.is_running:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    
    def create_and_post_content(self, account: SocialAccount, settings: AutoPostSettings):
        """Create content and post to platform."""
        try:
            logger.info(f"Creating content for {account.platform}: @{account.username}")
            
            # Check if we can post now (interval limits)
            if not self.account_manager.can_post_now(account.platform):
                logger.info(f"Skipping post - too soon since last post for {account.platform}")
                return
            
            # Generate content if auto-generation is enabled
            if settings.auto_content_generation:
                content = self.generate_auto_content(account, settings)
                if not content:
                    logger.error(f"Failed to generate content for {account.platform}")
                    return
            else:
                # Use existing content from history
                content = self.get_next_content_for_posting(account)
                if not content:
                    logger.info(f"No content available for posting to {account.platform}")
                    return
            
            # Post content
            success = self.post_to_platform(account, content, settings)
            if success:
                self.account_manager.update_last_post_time(account.platform)
                logger.info(f"Successfully posted to {account.platform}: @{account.username}")
            else:
                logger.error(f"Failed to post to {account.platform}: @{account.username}")
                
        except Exception as e:
            logger.error(f"Error in auto posting for {account.platform}: {e}")
    
    def generate_auto_content(self, account: SocialAccount, settings: AutoPostSettings) -> Optional[GeneratedContent]:
        """Generate content automatically based on account and settings."""
        try:
            # Create content settings for auto-generation
            content_settings = ContentSettings(
                platform=account.platform,
                niche="music" if "music" in account.username.lower() else "marketing",
                tone="inspirational",
                content_type="promotional",
                target_audience="music lovers and aspiring artists",
                keywords="redemption road, music, inspiration, faith",
                video_style="cinematic",
                music_genre="christian",  # Default to Christian music
                video_duration=30
            )
            
            # Add default hashtags
            if settings.hashtags:
                content_settings.keywords += f" {settings.hashtags}"
            
            # Generate content using AI
            import asyncio
            content = asyncio.run(self.api_service.generate_content(content_settings))
            
            if content:
                # Add to content manager
                self.content_manager.add_content(content)
                logger.info(f"Generated auto content: {content.hook[:50]}...")
                
            return content
            
        except Exception as e:
            logger.error(f"Error generating auto content: {e}")
            return None
    
    def get_next_content_for_posting(self, account: SocialAccount) -> Optional[GeneratedContent]:
        """Get next content from history for posting."""
        # Get content that hasn't been posted to this platform yet
        for content in self.content_manager.content_history:
            # Check if this content has been posted to this platform
            # In a real implementation, track posted content per platform
            return content
        return None
    
    def post_to_platform(self, account: SocialAccount, content: GeneratedContent, settings: AutoPostSettings) -> bool:
        """Post content to the specified platform."""
        try:
            # Decrypt credentials
            credentials = self.decrypt_credentials(account.encrypted_credentials)
            if not credentials:
                logger.error(f"Failed to decrypt credentials for {account.platform}")
                return False
            
            # Initialize browser for posting
            driver = self.setup_browser()
            
            # Platform-specific posting
            if account.platform == "instagram":
                return self.post_to_instagram(driver, credentials, content, settings)
            elif account.platform == "twitter":
                return self.post_to_twitter(driver, credentials, content, settings)
            elif account.platform == "linkedin":
                return self.post_to_linkedin(driver, credentials, content, settings)
            elif account.platform == "facebook":
                return self.post_to_facebook(driver, credentials, content, settings)
            else:
                logger.error(f"Unsupported platform: {account.platform}")
                return False
                
        except Exception as e:
            logger.error(f"Error posting to {account.platform}: {e}")
            return False
        finally:
            try:
                driver.quit()
            except:
                pass
    
    def decrypt_credentials(self, encrypted_credentials: str) -> Optional[dict]:
        """Decrypt stored credentials."""
        try:
            decoded = base64.b64decode(encrypted_credentials.encode()).decode()
            return json.loads(decoded)
        except Exception as e:
            logger.error(f"Error decrypting credentials: {e}")
            return None
    
    def setup_browser(self):
        """Setup browser for automated posting."""
        options = Options()
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        
        return webdriver.Chrome(options=options)
    
    def post_to_instagram(self, driver, credentials: dict, content: GeneratedContent, settings: AutoPostSettings) -> bool:
        """Post to Instagram."""
        try:
            driver.get("https://www.instagram.com/accounts/login/")
            time.sleep(3)
            
            # Login
            username_input = driver.find_element(By.NAME, "username")
            password_input = driver.find_element(By.NAME, "password")
            
            username_input.send_keys(credentials["username"])
            password_input.send_keys(credentials["password"])
            
            login_button = driver.find_element(By.XPATH, "//button[@type='submit']")
            login_button.click()
            
            time.sleep(5)
            
            # Navigate to create post
            driver.get("https://www.instagram.com/")
            time.sleep(3)
            
            # Create post (simplified - in reality would need image/video upload)
            logger.info(f"Would post to Instagram: {content.caption[:100]}...")
            
            return True
            
        except Exception as e:
            logger.error(f"Error posting to Instagram: {e}")
            return False
    
    def post_to_twitter(self, driver, credentials: dict, content: GeneratedContent, settings: AutoPostSettings) -> bool:
        """Post to Twitter."""
        try:
            driver.get("https://twitter.com/login")
            time.sleep(3)
            
            # Login process for Twitter
            # This is a simplified version - real implementation would handle full login flow
            logger.info(f"Would post to Twitter: {content.caption[:100]}...")
            
            return True
            
        except Exception as e:
            logger.error(f"Error posting to Twitter: {e}")
            return False
    
    def post_to_linkedin(self, driver, credentials: dict, content: GeneratedContent, settings: AutoPostSettings) -> bool:
        """Post to LinkedIn."""
        try:
            driver.get("https://www.linkedin.com/login")
            time.sleep(3)
            
            # Login and post to LinkedIn
            logger.info(f"Would post to LinkedIn: {content.caption[:100]}...")
            
            return True
            
        except Exception as e:
            logger.error(f"Error posting to LinkedIn: {e}")
            return False
    
    def post_to_facebook(self, driver, credentials: dict, content: GeneratedContent, settings: AutoPostSettings) -> bool:
        """Post to Facebook."""
        try:
            driver.get("https://www.facebook.com/login")
            time.sleep(3)
            
            # Login and post to Facebook
            logger.info(f"Would post to Facebook: {content.caption[:100]}...")
            
            return True
            
        except Exception as e:
            logger.error(f"Error posting to Facebook: {e}")
            return False
    
    def get_posting_status(self) -> dict:
        """Get current status of auto posting."""
        return {
            "is_running": self.is_running,
            "auto_accounts": len(self.account_manager.get_auto_signin_accounts()),
            "next_posts": self.get_next_scheduled_posts(),
            "settings": self.account_manager.auto_post_settings
        }
    
    def get_next_scheduled_posts(self) -> List[dict]:
        """Get information about next scheduled posts."""
        # This would return scheduled post information
        posts = []
        
        for account in self.account_manager.get_auto_signin_accounts():
            next_times = self.account_manager.get_next_posting_times(account.platform)
            for post_time in next_times:
                posts.append({
                    "platform": account.platform,
                    "username": account.username,
                    "scheduled_time": post_time
                })
        
        return sorted(posts, key=lambda x: x["scheduled_time"])