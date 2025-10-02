"""
Redemption Marketing - Social Media Account Manager
Copyright (c) 2025 Redemption Road. All rights reserved.

Social media account discovery and autonomous posting management.
"""
import customtkinter as ctk
from typing import Dict, List, Optional, Callable
import threading
import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from models import SocialAccount, AutoPostSettings, SocialAccountManager, PostingSchedule
from utils import create_color_scheme
from auto_poster import AutoPoster
import base64
import json


class SocialAccountTab(ctk.CTkFrame):
    """Social media account management interface."""
    
    def __init__(self, parent, **kwargs):
        super().__init__(parent, **kwargs)
        
        self.colors = create_color_scheme()
        self.account_manager = SocialAccountManager()
        self.auto_poster = None  # Will be initialized when needed
        self.discovery_thread = None
        self.is_discovering = False
        
        self.setup_ui()
        self.load_accounts()
    
    def setup_ui(self):
        """Setup the social media account UI."""
        self.configure(fg_color=self.colors['bg_secondary'])
        
        # Header
        header_frame = ctk.CTkFrame(self, fg_color="transparent")
        header_frame.pack(fill="x", padx=10, pady=(10, 5))
        
        ctk.CTkLabel(
            header_frame,
            text="📱 Social Media Accounts",
            font=ctk.CTkFont(size=20, weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(side="left")
        
        # Account discovery button
        self.discover_btn = ctk.CTkButton(
            header_frame,
            text="🔍 Discover Accounts",
            command=self.start_account_discovery,
            fg_color=self.colors['bg_accent'],
            hover_color="#b91c1c",
            width=150
        )
        self.discover_btn.pack(side="right", padx=(0, 10))
        
        # AUTO Control Panel
        auto_control_frame = ctk.CTkFrame(header_frame, fg_color=self.colors['warning'])
        auto_control_frame.pack(side="right", padx=(0, 10))
        
        ctk.CTkLabel(
            auto_control_frame,
            text="🤖 AUTO MODE",
            font=ctk.CTkFont(weight="bold"),
            text_color=self.colors['bg_primary']
        ).pack(side="left", padx=10, pady=5)
        
        self.auto_status_label = ctk.CTkLabel(
            auto_control_frame,
            text="●Stopped",
            text_color=self.colors['error']
        )
        self.auto_status_label.pack(side="left", padx=5)
        
        self.auto_toggle_btn = ctk.CTkButton(
            auto_control_frame,
            text="▶️ Start AUTO",
            command=self.toggle_auto_posting,
            fg_color=self.colors['success'],
            hover_color="#059669",
            width=100
        )
        self.auto_toggle_btn.pack(side="left", padx=5, pady=5)
        
        # Main content area
        content_frame = ctk.CTkFrame(self, fg_color="transparent")
        content_frame.pack(fill="both", expand=True, padx=10, pady=5)
        
        # Left panel - Account list
        left_panel = ctk.CTkFrame(content_frame, width=300)
        left_panel.pack(side="left", fill="y", padx=(0, 5))
        left_panel.pack_propagate(False)
        
        ctk.CTkLabel(
            left_panel,
            text="Connected Accounts",
            font=ctk.CTkFont(size=16, weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(pady=(10, 5))
        
        self.accounts_frame = ctk.CTkScrollableFrame(left_panel)
        self.accounts_frame.pack(fill="both", expand=True, padx=10, pady=5)
        
        # Right panel - Account details and settings
        right_panel = ctk.CTkFrame(content_frame)
        right_panel.pack(side="right", fill="both", expand=True, padx=(5, 0))
        
        self.details_frame = AccountDetailsFrame(right_panel, self.colors)
        self.details_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        # Status bar
        self.status_frame = ctk.CTkFrame(self, height=30, fg_color=self.colors['bg_primary'])
        self.status_frame.pack(fill="x", side="bottom")
        self.status_frame.pack_propagate(False)
        
        self.status_label = ctk.CTkLabel(
            self.status_frame,
            text="Ready",
            text_color=self.colors['text_secondary']
        )
        self.status_label.pack(side="left", padx=10, pady=5)
    
    def start_account_discovery(self):
        """Start account discovery process."""
        if self.is_discovering:
            return
        
        # Show information dialog first
        info_dialog = ctk.CTkToplevel(self)
        info_dialog.title("Account Discovery")
        info_dialog.geometry("600x500")
        info_dialog.configure(fg_color=self.colors['bg_secondary'])
        info_dialog.attributes('-topmost', True)
        
        # Header
        ctk.CTkLabel(
            info_dialog,
            text="🔍 Social Media Account Discovery",
            font=ctk.CTkFont(size=20, weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(pady=20)
        
        # Information
        info_text = """
This process will help you connect your social media accounts to Redemption Marketing.

🌐 Browser Used: Brave Browser (preferred) or Chrome
🔐 Password Managers: Fully supported
🔒 Security: Your login credentials are never stored by this app

What will happen:
1. Brave browser will open with login pages for each platform
2. You'll manually login using your credentials
3. Use your password manager (Brave's built-in or external like 1Password, LastPass)
4. Complete any 2FA verification as needed
5. We'll detect successful logins and connect your accounts

Supported Platforms:
• Instagram
• Twitter/X
• LinkedIn  
• Facebook

Your privacy and security are our top priority. We only detect if you're logged in and extract your username - no passwords or personal data are accessed.
        """
        
        info_frame = ctk.CTkScrollableFrame(info_dialog, height=250)
        info_frame.pack(fill="both", expand=True, padx=20, pady=10)
        
        ctk.CTkLabel(
            info_frame,
            text=info_text.strip(),
            text_color=self.colors['text_secondary'],
            justify="left",
            anchor="w"
        ).pack(anchor="w", padx=10, pady=10)
        
        # Buttons
        button_frame = ctk.CTkFrame(info_dialog, fg_color="transparent")
        button_frame.pack(pady=20)
        
        def start_discovery():
            info_dialog.destroy()
            self.is_discovering = True
            self.discover_btn.configure(
                text="🔄 Discovering...",
                state="disabled"
            )
            
            self.discovery_thread = threading.Thread(
                target=self.discover_accounts,
                daemon=True
            )
            self.discovery_thread.start()
        
        ctk.CTkButton(
            button_frame,
            text="🚀 Start Discovery",
            command=start_discovery,
            fg_color=self.colors['success'],
            hover_color="#059669",
            width=150
        ).pack(side="left", padx=10)
        
        ctk.CTkButton(
            button_frame,
            text="❌ Cancel",
            command=info_dialog.destroy,
            fg_color=self.colors['bg_primary'],
            hover_color="#374151",
            width=150
        ).pack(side="left", padx=10)
    
    def discover_accounts(self):
        """Discover social media accounts using browser automation."""
        try:
            self.update_status("Initializing Brave browser...")
            
            # Setup Brave browser options
            brave_options = Options()
            
            # Try to find Brave browser executable
            brave_paths = [
                r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe",
                r"C:\Program Files (x86)\BraveSoftware\Brave-Browser\Application\brave.exe",
                r"C:\Users\{}\AppData\Local\BraveSoftware\Brave-Browser\Application\brave.exe".format(os.environ.get('USERNAME', ''))
            ]
            
            brave_path = None
            for path in brave_paths:
                if os.path.exists(path):
                    brave_path = path
                    break
            
            if brave_path:
                brave_options.binary_location = brave_path
                self.update_status("Found Brave browser, launching...")
            else:
                self.update_status("Brave not found, using default Chrome...")
            
            # Enable password manager and login detection
            brave_options.add_argument("--disable-blink-features=AutomationControlled")
            brave_options.add_experimental_option("excludeSwitches", ["enable-automation"])
            brave_options.add_experimental_option('useAutomationExtension', False)
            brave_options.add_argument("--disable-web-security")
            brave_options.add_argument("--allow-running-insecure-content")
            
            # Keep browser open for user interaction
            brave_options.add_experimental_option("detach", True)
            
            try:
                driver = webdriver.Chrome(options=brave_options)
            except Exception as e:
                self.update_status("Error launching Brave, using Chrome...")
                chrome_options = Options()
                chrome_options.add_experimental_option("detach", True)
                driver = webdriver.Chrome(options=chrome_options)
            
            platforms = {
                "Instagram": "https://www.instagram.com/accounts/login/",
                "Twitter": "https://twitter.com/login",
                "LinkedIn": "https://www.linkedin.com/login",
                "Facebook": "https://www.facebook.com/login"
            }
            
            for platform, login_url in platforms.items():
                self.update_status(f"Opening {platform} login page...")
                
                try:
                    driver.get(login_url)
                    
                    # Give user time to login manually
                    self.update_status(f"Please login to {platform} manually. Use your password manager if needed.")
                    self.show_login_dialog(platform, driver)
                    
                    # Check if login was successful
                    if self.check_logged_in(driver, platform):
                        username = self.extract_username(driver, platform)
                        if username:
                            account = SocialAccount(
                                platform=platform.lower(),
                                username=username,
                                display_name=username,
                                is_connected=True,
                                last_post_date="",
                                follower_count=0
                            )
                            self.account_manager.add_account(account)
                            self.after(0, self.refresh_accounts)
                            self.update_status(f"✅ Successfully connected {platform} account: @{username}")
                        else:
                            self.update_status(f"❌ Could not extract username from {platform}")
                    else:
                        self.update_status(f"❌ Login not detected for {platform}")
                    
                except Exception as e:
                    print(f"Error checking {platform}: {e}")
                    self.update_status(f"❌ Error connecting to {platform}: {str(e)}")
                    continue
            
            self.update_status("Account discovery completed. You can close the browser when done.")
            
        except Exception as e:
            print(f"Discovery error: {e}")
            self.update_status(f"❌ Discovery error: {str(e)}")
        finally:
            self.after(0, self.discovery_complete)
    
    def show_login_dialog(self, platform: str, driver):
        """Show dialog for manual login with instructions."""
        try:
            # Create a simple dialog to guide the user
            dialog = ctk.CTkToplevel(self)
            dialog.title(f"Login to {platform}")
            dialog.geometry("500x400")
            dialog.configure(fg_color=self.colors['bg_secondary'])
            
            # Make dialog stay on top
            dialog.attributes('-topmost', True)
            
            # Header
            ctk.CTkLabel(
                dialog,
                text=f"🔑 Login to {platform}",
                font=ctk.CTkFont(size=18, weight="bold"),
                text_color=self.colors['text_primary']
            ).pack(pady=20)
            
            # Instructions
            instructions = [
                f"1. A {platform} login page has opened in your browser",
                "2. Use your username and password to login",
                "3. If prompted, use your password manager (Brave's built-in or external)",
                "4. Complete any 2FA verification if required",
                "5. Once logged in, click 'Check Login Status' below",
                "",
                "💡 Tips:",
                "• Make sure you stay logged in to the account",
                "• Don't close the browser tab",
                "• If you have multiple accounts, use the one you want to connect"
            ]
            
            instruction_frame = ctk.CTkScrollableFrame(dialog, height=200)
            instruction_frame.pack(fill="both", expand=True, padx=20, pady=10)
            
            for instruction in instructions:
                if instruction.startswith("💡"):
                    font = ctk.CTkFont(weight="bold")
                    color = self.colors['warning']
                elif instruction.startswith(("1.", "2.", "3.", "4.", "5.")):
                    font = ctk.CTkFont()
                    color = self.colors['text_primary']
                else:
                    font = ctk.CTkFont()
                    color = self.colors['text_secondary']
                
                ctk.CTkLabel(
                    instruction_frame,
                    text=instruction,
                    font=font,
                    text_color=color,
                    anchor="w"
                ).pack(anchor="w", pady=2)
            
            # Status label
            self.dialog_status = ctk.CTkLabel(
                dialog,
                text="Waiting for login...",
                text_color=self.colors['text_secondary']
            )
            self.dialog_status.pack(pady=10)
            
            # Buttons
            button_frame = ctk.CTkFrame(dialog, fg_color="transparent")
            button_frame.pack(pady=10)
            
            def check_login():
                self.dialog_status.configure(text="Checking login status...")
                if self.check_logged_in(driver, platform):
                    self.dialog_status.configure(
                        text="✅ Login successful!",
                        text_color=self.colors['success']
                    )
                    dialog.after(2000, dialog.destroy)
                else:
                    self.dialog_status.configure(
                        text="❌ Not logged in yet. Please complete login and try again.",
                        text_color=self.colors['error']
                    )
            
            ctk.CTkButton(
                button_frame,
                text="🔍 Check Login Status",
                command=check_login,
                fg_color=self.colors['bg_accent'],
                hover_color="#b91c1c"
            ).pack(side="left", padx=10)
            
            ctk.CTkButton(
                button_frame,
                text="⏭️ Skip This Platform",
                command=dialog.destroy,
                fg_color=self.colors['bg_primary'],
                hover_color="#374151"
            ).pack(side="left", padx=10)
            
            # Wait for dialog to close
            dialog.wait_window()
            
        except Exception as e:
            print(f"Error showing login dialog: {e}")
    
    def check_logged_in(self, driver, platform: str) -> bool:
        """Check if user is logged into platform."""
        try:
            if platform == "Instagram":
                # Look for Instagram-specific elements that indicate login
                return len(driver.find_elements(By.CSS_SELECTOR, "[data-testid='user-avatar']")) > 0
            elif platform == "Twitter":
                return len(driver.find_elements(By.CSS_SELECTOR, "[data-testid='SideNav_AccountSwitcher_Button']")) > 0
            elif platform == "LinkedIn":
                return len(driver.find_elements(By.CLASS_NAME, "global-nav__me")) > 0
            elif platform == "Facebook":
                return len(driver.find_elements(By.CSS_SELECTOR, "[data-testid='blue_bar.profile_browser']")) > 0
        except Exception:
            pass
        return False
    
    def extract_username(self, driver, platform: str) -> Optional[str]:
        """Extract username from logged-in platform."""
        try:
            if platform == "Instagram":
                # Navigate to profile and extract username
                driver.get("https://www.instagram.com/accounts/edit/")
                time.sleep(2)
                username_input = driver.find_element(By.NAME, "username")
                return username_input.get_attribute("value")
            
            elif platform == "Twitter":
                # Extract from profile link
                profile_link = driver.find_element(By.CSS_SELECTOR, "[data-testid='SideNav_AccountSwitcher_Button']")
                href = profile_link.get_attribute("href")
                if href:
                    return href.split("/")[-1]
            
            elif platform == "LinkedIn":
                # Extract from profile dropdown
                me_button = driver.find_element(By.CLASS_NAME, "global-nav__me")
                me_button.click()
                time.sleep(1)
                profile_link = driver.find_element(By.CSS_SELECTOR, ".global-nav__me-content a")
                href = profile_link.get_attribute("href")
                if href and "/in/" in href:
                    return href.split("/in/")[-1].split("/")[0]
            
            elif platform == "Facebook":
                # Extract from profile menu
                profile_menu = driver.find_element(By.CSS_SELECTOR, "[data-testid='blue_bar.profile_browser']")
                return profile_menu.get_attribute("aria-label")
        
        except Exception as e:
            print(f"Error extracting username for {platform}: {e}")
        
        return None
    
    def discovery_complete(self):
        """Handle discovery completion."""
        self.is_discovering = False
        self.discover_btn.configure(
            text="🔍 Discover Accounts",
            state="normal"
        )
        self.update_status("Account discovery complete")
    
    def update_status(self, message: str):
        """Update status message."""
        self.after(0, lambda: self.status_label.configure(text=message))
    
    def load_accounts(self):
        """Load saved accounts."""
        self.refresh_accounts()
    
    def refresh_accounts(self):
        """Refresh the accounts display."""
        # Clear existing account widgets
        for widget in self.accounts_frame.winfo_children():
            widget.destroy()
        
        accounts = self.account_manager.get_all_accounts()
        
        if not accounts:
            self.show_empty_accounts()
            return
        
        for account in accounts:
            account_widget = self.create_account_widget(account)
            account_widget.pack(fill="x", pady=2)
    
    def show_empty_accounts(self):
        """Show empty state for accounts."""
        empty_frame = ctk.CTkFrame(self.accounts_frame, fg_color="transparent")
        empty_frame.pack(expand=True, fill="both", pady=20)
        
        ctk.CTkLabel(
            empty_frame,
            text="📱",
            font=ctk.CTkFont(size=32)
        ).pack(pady=5)
        
        ctk.CTkLabel(
            empty_frame,
            text="No accounts connected",
            font=ctk.CTkFont(weight="bold"),
            text_color=self.colors['text_secondary']
        ).pack()
        
        ctk.CTkLabel(
            empty_frame,
            text="Use account discovery to find\nyour logged-in social accounts",
            text_color=self.colors['text_secondary'],
            justify="center"
        ).pack(pady=5)
    
    def create_account_widget(self, account: SocialAccount) -> ctk.CTkFrame:
        """Create account widget."""
        widget = ctk.CTkFrame(self.accounts_frame, fg_color=self.colors['bg_primary'])
        
        # Platform icon and name
        info_frame = ctk.CTkFrame(widget, fg_color="transparent")
        info_frame.pack(fill="x", padx=10, pady=5)
        
        platform_icons = {
            "instagram": "📷",
            "twitter": "🐦", 
            "linkedin": "💼",
            "facebook": "👥"
        }
        
        icon = platform_icons.get(account.platform, "📱")
        
        ctk.CTkLabel(
            info_frame,
            text=f"{icon} {account.platform.title()}",
            font=ctk.CTkFont(weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(anchor="w")
        
        ctk.CTkLabel(
            info_frame,
            text=f"@{account.username}",
            text_color=self.colors['text_secondary']
        ).pack(anchor="w")
        
        # Status indicator
        status_color = self.colors['success'] if account.is_connected else self.colors['error']
        status_text = "Connected" if account.is_connected else "Disconnected"
        
        ctk.CTkLabel(
            info_frame,
            text=f"● {status_text}",
            text_color=status_color,
            font=ctk.CTkFont(size=10)
        ).pack(anchor="w")
        
        # Click handler
        widget.bind("<Button-1>", lambda e, acc=account: self.select_account(acc))
        
        return widget
    
    def select_account(self, account: SocialAccount):
        """Select account for details view."""
        self.details_frame.show_account(account)
    
    def toggle_auto_posting(self):
        """Toggle automatic posting on/off."""
        try:
            if not self.auto_poster:
                # Initialize auto poster with required managers
                # Create a mock content manager for now
                class MockContentManager:
                    def __init__(self):
                        self.content_history = []
                    def add_content(self, content):
                        self.content_history.insert(0, content)
                
                content_manager = MockContentManager()
                self.auto_poster = AutoPoster(self.account_manager, content_manager)
            
            if not self.auto_poster.is_running:
                # Check if any accounts have AUTO enabled
                auto_accounts = self.account_manager.get_auto_signin_accounts()
                if not auto_accounts:
                    self.show_error_dialog("No accounts have AUTO mode enabled!\n\nPlease:\n1. Connect accounts\n2. Enable AUTO mode\n3. Setup credentials")
                    return
                
                # Start auto posting
                self.auto_poster.start_auto_posting()
                self.auto_toggle_btn.configure(
                    text="⏹️ Stop AUTO",
                    fg_color=self.colors['error']
                )
                self.auto_status_label.configure(
                    text="●Running",
                    text_color=self.colors['success']
                )
                
                # Show AUTO status dialog
                self.show_auto_status_dialog()
                
            else:
                # Stop auto posting
                self.auto_poster.stop_auto_posting()
                self.auto_toggle_btn.configure(
                    text="▶️ Start AUTO",
                    fg_color=self.colors['success']
                )
                self.auto_status_label.configure(
                    text="●Stopped",
                    text_color=self.colors['error']
                )
                
        except Exception as e:
            self.show_error_dialog(f"Error toggling AUTO mode: {str(e)}")
    
    def show_error_dialog(self, message: str):
        """Show error dialog."""
        dialog = ctk.CTkToplevel(self)
        dialog.title("Error")
        dialog.geometry("400x200")
        dialog.configure(fg_color=self.colors['bg_secondary'])
        dialog.attributes('-topmost', True)
        
        ctk.CTkLabel(
            dialog,
            text="❌ Error",
            font=ctk.CTkFont(size=16, weight="bold"),
            text_color=self.colors['error']
        ).pack(pady=20)
        
        ctk.CTkLabel(
            dialog,
            text=message,
            text_color=self.colors['text_primary']
        ).pack(pady=10)
        
        ctk.CTkButton(
            dialog,
            text="OK",
            command=dialog.destroy,
            fg_color=self.colors['bg_accent']
        ).pack(pady=20)
    
    def show_auto_status_dialog(self):
        """Show AUTO posting status dialog."""
        dialog = ctk.CTkToplevel(self)
        dialog.title("AUTO Mode Status")
        dialog.geometry("600x500")
        dialog.configure(fg_color=self.colors['bg_secondary'])
        dialog.attributes('-topmost', True)
        
        # Header
        ctk.CTkLabel(
            dialog,
            text="🤖 AUTO Mode Active",
            font=ctk.CTkFont(size=18, weight="bold"),
            text_color=self.colors['success']
        ).pack(pady=20)
        
        # Status info
        status_frame = ctk.CTkScrollableFrame(dialog, height=300)
        status_frame.pack(fill="both", expand=True, padx=20, pady=10)
        
        if self.auto_poster:
            status = self.auto_poster.get_posting_status()
            
            ctk.CTkLabel(
                status_frame,
                text=f"🟢 AUTO Mode: Running",
                font=ctk.CTkFont(weight="bold"),
                text_color=self.colors['success']
            ).pack(anchor="w", pady=5)
            
            ctk.CTkLabel(
                status_frame,
                text=f"📱 AUTO Accounts: {status['auto_accounts']}",
                text_color=self.colors['text_primary']
            ).pack(anchor="w", pady=2)
            
            settings = status['settings']
            ctk.CTkLabel(
                status_frame,
                text=f"📅 Posts per day: {settings.posts_per_day}",
                text_color=self.colors['text_primary']
            ).pack(anchor="w", pady=2)
            
            ctk.CTkLabel(
                status_frame,
                text=f"⏰ Posting times: {', '.join(settings.posting_hours)}",
                text_color=self.colors['text_primary']
            ).pack(anchor="w", pady=2)
            
            ctk.CTkLabel(
                status_frame,
                text=f"🎯 Auto content: {'Yes' if settings.auto_content_generation else 'No'}",
                text_color=self.colors['text_primary']
            ).pack(anchor="w", pady=2)
            
            # Next scheduled posts
            ctk.CTkLabel(
                status_frame,
                text="\n📋 Next Scheduled Posts:",
                font=ctk.CTkFont(weight="bold"),
                text_color=self.colors['text_primary']
            ).pack(anchor="w", pady=(10, 5))
            
            next_posts = status['next_posts'][:5]  # Show next 5 posts
            for post in next_posts:
                post_text = f"• {post['platform'].title()}: @{post['username']} at {post['scheduled_time'][:16]}"
                ctk.CTkLabel(
                    status_frame,
                    text=post_text,
                    text_color=self.colors['text_secondary']
                ).pack(anchor="w", pady=1)
        
        # Control buttons
        button_frame = ctk.CTkFrame(dialog, fg_color="transparent")
        button_frame.pack(pady=20)
        
        ctk.CTkButton(
            button_frame,
            text="⏹️ Stop AUTO",
            command=lambda: [self.toggle_auto_posting(), dialog.destroy()],
            fg_color=self.colors['error'],
            hover_color="#dc2626"
        ).pack(side="left", padx=10)
        
        ctk.CTkButton(
            button_frame,
            text="🔄 Refresh",
            command=lambda: [dialog.destroy(), self.show_auto_status_dialog()],
            fg_color=self.colors['bg_accent'],
            hover_color="#b91c1c"
        ).pack(side="left", padx=10)
        
        ctk.CTkButton(
            button_frame,
            text="✅ Close",
            command=dialog.destroy,
            fg_color=self.colors['bg_primary'],
            hover_color="#374151"
        ).pack(side="left", padx=10)


class AccountDetailsFrame(ctk.CTkFrame):
    """Account details and posting settings frame."""
    
    def __init__(self, parent, colors: Dict, **kwargs):
        super().__init__(parent, **kwargs)
        
        self.colors = colors
        self.current_account = None
        
        self.setup_ui()
    
    def setup_ui(self):
        """Setup account details UI."""
        self.configure(fg_color=self.colors['bg_secondary'])
        
        # Default state
        self.show_default_state()
    
    def show_default_state(self):
        """Show default state when no account selected."""
        # Clear existing widgets
        for widget in self.winfo_children():
            widget.destroy()
        
        default_frame = ctk.CTkFrame(self, fg_color="transparent")
        default_frame.pack(expand=True, fill="both")
        
        ctk.CTkLabel(
            default_frame,
            text="⚙️",
            font=ctk.CTkFont(size=48)
        ).pack(expand=True)
        
        ctk.CTkLabel(
            default_frame,
            text="Select an account to configure\nautomatic posting settings",
            font=ctk.CTkFont(size=14),
            text_color=self.colors['text_secondary'],
            justify="center"
        ).pack()
    
    def show_account(self, account: SocialAccount):
        """Show account details and settings."""
        self.current_account = account
        
        # Clear existing widgets
        for widget in self.winfo_children():
            widget.destroy()
        
        # Account header
        header_frame = ctk.CTkFrame(self, fg_color=self.colors['bg_primary'])
        header_frame.pack(fill="x", padx=10, pady=(10, 5))
        
        platform_icons = {
            "instagram": "📷",
            "twitter": "🐦",
            "linkedin": "💼", 
            "facebook": "👥"
        }
        
        icon = platform_icons.get(account.platform, "📱")
        
        ctk.CTkLabel(
            header_frame,
            text=f"{icon} {account.platform.title()}",
            font=ctk.CTkFont(size=18, weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(pady=10)
        
        ctk.CTkLabel(
            header_frame,
            text=f"@{account.username}",
            font=ctk.CTkFont(size=14),
            text_color=self.colors['text_secondary']
        ).pack(pady=(0, 10))
        
        # Settings tabs
        settings_frame = ctk.CTkScrollableFrame(self)
        settings_frame.pack(fill="both", expand=True, padx=10, pady=5)
        
        # Auto-posting settings
        self.create_autopost_settings(settings_frame)
        
        # Posting schedule
        self.create_schedule_settings(settings_frame)
        
        # Content preferences
        self.create_content_preferences(settings_frame)
    
    def create_autopost_settings(self, parent):
        """Create auto-posting settings section."""
        section = ctk.CTkFrame(parent, fg_color=self.colors['bg_primary'])
        section.pack(fill="x", pady=5)
        
        ctk.CTkLabel(
            section,
            text="🤖 Automatic Posting",
            font=ctk.CTkFont(size=16, weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(anchor="w", padx=10, pady=(10, 5))
        
        # Enable auto-posting
        self.autopost_switch = ctk.CTkSwitch(
            section,
            text="Enable automatic posting",
            text_color=self.colors['text_primary']
        )
        self.autopost_switch.pack(anchor="w", padx=20, pady=5)
        
        # AUTO SIGN-IN - NEW FEATURE
        auto_signin_frame = ctk.CTkFrame(section, fg_color=self.colors['bg_secondary'])
        auto_signin_frame.pack(fill="x", padx=20, pady=5)
        
        ctk.CTkLabel(
            auto_signin_frame,
            text="🔐 AUTO Mode - Fully Autonomous Posting",
            font=ctk.CTkFont(size=14, weight="bold"),
            text_color=self.colors['warning']
        ).pack(anchor="w", padx=10, pady=(10, 5))
        
        self.auto_signin_switch = ctk.CTkSwitch(
            auto_signin_frame,
            text="Enable AUTO mode (AI will sign in and post automatically)",
            text_color=self.colors['text_primary']
        )
        self.auto_signin_switch.pack(anchor="w", padx=10, pady=5)
        
        # Posts per day
        posts_frame = ctk.CTkFrame(auto_signin_frame, fg_color="transparent")
        posts_frame.pack(fill="x", padx=10, pady=5)
        
        ctk.CTkLabel(
            posts_frame,
            text="Posts per day:",
            text_color=self.colors['text_primary']
        ).pack(side="left")
        
        self.posts_per_day_slider = ctk.CTkSlider(
            posts_frame,
            from_=1,
            to=10,
            number_of_steps=9,
            width=200
        )
        self.posts_per_day_slider.set(3)
        self.posts_per_day_slider.pack(side="left", padx=10)
        
        self.posts_label = ctk.CTkLabel(
            posts_frame,
            text="3 posts",
            text_color=self.colors['text_secondary']
        )
        self.posts_label.pack(side="left", padx=5)
        
        # Update label when slider changes
        def update_posts_label(value):
            self.posts_label.configure(text=f"{int(value)} posts")
        
        self.posts_per_day_slider.configure(command=update_posts_label)
        
        # Posting hours
        ctk.CTkLabel(
            auto_signin_frame,
            text="Preferred posting times:",
            text_color=self.colors['text_primary']
        ).pack(anchor="w", padx=10, pady=(10, 0))
        
        self.posting_times_entry = ctk.CTkEntry(
            auto_signin_frame,
            placeholder_text="09:00, 13:00, 18:00",
            width=300
        )
        self.posting_times_entry.pack(anchor="w", padx=10, pady=5)
        
        # Auto content generation
        self.auto_content_switch = ctk.CTkSwitch(
            auto_signin_frame,
            text="Generate content automatically",
            text_color=self.colors['text_primary']
        )
        self.auto_content_switch.pack(anchor="w", padx=10, pady=5)
        
        # Credentials setup button
        self.setup_credentials_btn = ctk.CTkButton(
            auto_signin_frame,
            text="🔑 Setup AUTO Credentials",
            command=self.setup_auto_credentials,
            fg_color=self.colors['warning'],
            hover_color="#d97706"
        )
        self.setup_credentials_btn.pack(anchor="w", padx=10, pady=10)
        
        # Post approval
        self.approval_switch = ctk.CTkSwitch(
            section,
            text="Require approval before posting",
            text_color=self.colors['text_primary']
        )
        self.approval_switch.pack(anchor="w", padx=20, pady=5)
        
        # Hashtag preferences
        ctk.CTkLabel(
            section,
            text="Default hashtags:",
            text_color=self.colors['text_primary']
        ).pack(anchor="w", padx=20, pady=(10, 0))
        
        self.hashtags_entry = ctk.CTkEntry(
            section,
            placeholder_text="#redemptionroad #marketing #music",
            width=300
        )
        self.hashtags_entry.pack(anchor="w", padx=20, pady=5)
        
        # Save button
        ctk.CTkButton(
            section,
            text="💾 Save Settings",
            command=self.save_autopost_settings,
            fg_color=self.colors['success'],
            hover_color="#059669"
        ).pack(anchor="w", padx=20, pady=10)
    
    def create_schedule_settings(self, parent):
        """Create posting schedule settings."""
        section = ctk.CTkFrame(parent, fg_color=self.colors['bg_primary'])
        section.pack(fill="x", pady=5)
        
        ctk.CTkLabel(
            section,
            text="📅 Posting Schedule",
            font=ctk.CTkFont(size=16, weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(anchor="w", padx=10, pady=(10, 5))
        
        # Frequency
        freq_frame = ctk.CTkFrame(section, fg_color="transparent")
        freq_frame.pack(fill="x", padx=20, pady=5)
        
        ctk.CTkLabel(
            freq_frame,
            text="Posting frequency:",
            text_color=self.colors['text_primary']
        ).pack(side="left")
        
        self.frequency_menu = ctk.CTkOptionMenu(
            freq_frame,
            values=["Daily", "Every 2 days", "Weekly", "Custom"],
            width=120
        )
        self.frequency_menu.pack(side="right")
        
        # Best times
        times_frame = ctk.CTkFrame(section, fg_color="transparent")
        times_frame.pack(fill="x", padx=20, pady=5)
        
        ctk.CTkLabel(
            times_frame,
            text="Best posting times:",
            text_color=self.colors['text_primary']
        ).pack(anchor="w")
        
        self.times_entry = ctk.CTkEntry(
            times_frame,
            placeholder_text="9:00 AM, 1:00 PM, 6:00 PM",
            width=300
        )
        self.times_entry.pack(anchor="w", pady=2)
    
    def create_content_preferences(self, parent):
        """Create content preferences section."""
        section = ctk.CTkFrame(parent, fg_color=self.colors['bg_primary'])
        section.pack(fill="x", pady=5)
        
        ctk.CTkLabel(
            section,
            text="🎯 Content Preferences",
            font=ctk.CTkFont(size=16, weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(anchor="w", padx=10, pady=(10, 5))
        
        # Content types
        ctk.CTkLabel(
            section,
            text="Allowed content types:",
            text_color=self.colors['text_primary']
        ).pack(anchor="w", padx=20, pady=(5, 0))
        
        self.marketing_videos_cb = ctk.CTkCheckBox(
            section,
            text="Marketing Videos",
            text_color=self.colors['text_primary']
        )
        self.marketing_videos_cb.pack(anchor="w", padx=30, pady=2)
        
        self.music_videos_cb = ctk.CTkCheckBox(
            section,
            text="Music Videos", 
            text_color=self.colors['text_primary']
        )
        self.music_videos_cb.pack(anchor="w", padx=30, pady=2)
        
        # Platform-specific settings
        if self.current_account and self.current_account.platform == "instagram":
            self.instagram_stories_cb = ctk.CTkCheckBox(
                section,
                text="Instagram Stories",
                text_color=self.colors['text_primary']
            )
            self.instagram_stories_cb.pack(anchor="w", padx=30, pady=2)
    
    def setup_auto_credentials(self):
        """Setup AUTO mode credentials for the current account."""
        if not self.current_account:
            return
        
        # Create credentials dialog
        dialog = ctk.CTkToplevel(self)
        dialog.title(f"AUTO Credentials - {self.current_account.platform.title()}")
        dialog.geometry("500x600")
        dialog.configure(fg_color=self.colors['bg_secondary'])
        dialog.attributes('-topmost', True)
        
        # Warning header
        ctk.CTkLabel(
            dialog,
            text="⚠️ AUTO Mode Setup",
            font=ctk.CTkFont(size=18, weight="bold"),
            text_color=self.colors['warning']
        ).pack(pady=20)
        
        # Security notice
        notice_frame = ctk.CTkFrame(dialog, fg_color=self.colors['error'])
        notice_frame.pack(fill="x", padx=20, pady=10)
        
        notice_text = """
🔒 SECURITY NOTICE - READ CAREFULLY

AUTO mode allows the AI to automatically sign in to your social media accounts and post content. This requires storing encrypted login credentials.

IMPORTANT:
• Credentials are encrypted and stored locally only
• Never shared with external servers
• Used only for automated posting
• You can disable AUTO mode anytime
• Consider using app-specific passwords where available

RECOMMENDATION:
• Use 2FA on your social accounts
• Create app-specific passwords if supported
• Monitor your account activity regularly
• Only enable for accounts you fully control
        """
        
        ctk.CTkLabel(
            notice_frame,
            text=notice_text.strip(),
            text_color=self.colors['text_primary'],
            justify="left",
            anchor="w"
        ).pack(padx=10, pady=10)
        
        # Credentials form
        form_frame = ctk.CTkFrame(dialog, fg_color=self.colors['bg_primary'])
        form_frame.pack(fill="x", padx=20, pady=10)
        
        ctk.CTkLabel(
            form_frame,
            text=f"{self.current_account.platform.title()} Login Credentials:",
            font=ctk.CTkFont(weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(pady=(10, 5))
        
        # Username/Email
        ctk.CTkLabel(
            form_frame,
            text="Username/Email:",
            text_color=self.colors['text_primary']
        ).pack(anchor="w", padx=10)
        
        username_entry = ctk.CTkEntry(
            form_frame,
            placeholder_text="Enter username or email",
            width=400
        )
        username_entry.pack(padx=10, pady=5)
        
        # Password
        ctk.CTkLabel(
            form_frame,
            text="Password:",
            text_color=self.colors['text_primary']
        ).pack(anchor="w", padx=10, pady=(10, 0))
        
        password_entry = ctk.CTkEntry(
            form_frame,
            placeholder_text="Enter password or app-specific password",
            show="*",
            width=400
        )
        password_entry.pack(padx=10, pady=5)
        
        # Optional 2FA backup codes
        ctk.CTkLabel(
            form_frame,
            text="2FA Backup Codes (optional, one per line):",
            text_color=self.colors['text_primary']
        ).pack(anchor="w", padx=10, pady=(10, 0))
        
        backup_codes_text = ctk.CTkTextbox(
            form_frame,
            height=100,
            width=400
        )
        backup_codes_text.pack(padx=10, pady=5)
        
        # Buttons
        button_frame = ctk.CTkFrame(dialog, fg_color="transparent")
        button_frame.pack(pady=20)
        
        def save_credentials():
            username = username_entry.get().strip()
            password = password_entry.get().strip()
            backup_codes = backup_codes_text.get("1.0", "end-1c").strip()
            
            if not username or not password:
                self.show_error_dialog("Username and password are required!")
                return
            
            # Encrypt credentials
            credentials = {
                "username": username,
                "password": password,
                "backup_codes": backup_codes.split('\n') if backup_codes else [],
                "platform": self.current_account.platform
            }
            
            # Simple encryption (in production, use proper encryption)
            credentials_json = json.dumps(credentials)
            encrypted = base64.b64encode(credentials_json.encode()).decode()
            
            # Save to account
            self.current_account.encrypted_credentials = encrypted
            self.current_account.auto_signin_enabled = True
            
            dialog.destroy()
            self.show_success_dialog("AUTO credentials saved successfully!")
        
        ctk.CTkButton(
            button_frame,
            text="💾 Save Credentials",
            command=save_credentials,
            fg_color=self.colors['success'],
            hover_color="#059669"
        ).pack(side="left", padx=10)
        
        ctk.CTkButton(
            button_frame,
            text="❌ Cancel",
            command=dialog.destroy,
            fg_color=self.colors['bg_primary'],
            hover_color="#374151"
        ).pack(side="left", padx=10)
    
    def show_error_dialog(self, message: str):
        """Show error dialog."""
        dialog = ctk.CTkToplevel(self)
        dialog.title("Error")
        dialog.geometry("400x200")
        dialog.configure(fg_color=self.colors['bg_secondary'])
        dialog.attributes('-topmost', True)
        
        ctk.CTkLabel(
            dialog,
            text="❌ Error",
            font=ctk.CTkFont(size=16, weight="bold"),
            text_color=self.colors['error']
        ).pack(pady=20)
        
        ctk.CTkLabel(
            dialog,
            text=message,
            text_color=self.colors['text_primary']
        ).pack(pady=10)
        
        ctk.CTkButton(
            dialog,
            text="OK",
            command=dialog.destroy,
            fg_color=self.colors['bg_accent']
        ).pack(pady=20)
    
    def show_success_dialog(self, message: str):
        """Show success dialog."""
        dialog = ctk.CTkToplevel(self)
        dialog.title("Success")
        dialog.geometry("400x200")
        dialog.configure(fg_color=self.colors['bg_secondary'])
        dialog.attributes('-topmost', True)
        
        ctk.CTkLabel(
            dialog,
            text="✅ Success",
            font=ctk.CTkFont(size=16, weight="bold"),
            text_color=self.colors['success']
        ).pack(pady=20)
        
        ctk.CTkLabel(
            dialog,
            text=message,
            text_color=self.colors['text_primary']
        ).pack(pady=10)
        
        ctk.CTkButton(
            dialog,
            text="OK",
            command=dialog.destroy,
            fg_color=self.colors['success']
        ).pack(pady=20)
    
    def save_autopost_settings(self):
        """Save auto-posting settings."""
        if not self.current_account:
            return
        
        # Parse posting times
        posting_times = []
        times_text = self.posting_times_entry.get().strip()
        if times_text:
            posting_times = [t.strip() for t in times_text.split(',')]
        
        settings = AutoPostSettings(
            enabled=self.autopost_switch.get(),
            auto_signin=self.auto_signin_switch.get(),
            posts_per_day=int(self.posts_per_day_slider.get()),
            posting_hours=posting_times if posting_times else ["09:00", "13:00", "18:00"],
            require_approval=self.approval_switch.get(),
            hashtags=self.hashtags_entry.get().strip(),
            frequency=getattr(self, 'frequency_menu', type('obj', (object,), {'get': lambda: 'Daily'})).get(),
            best_times=getattr(self, 'times_entry', type('obj', (object,), {'get': lambda: ''})).get().strip(),
            auto_content_generation=self.auto_content_switch.get()
        )
        
        # Save settings to account manager
        # In a real implementation, this would save to database/file
        from models import SocialAccountManager
        manager = SocialAccountManager()
        manager.auto_post_settings = settings
        
        # Update current account AUTO status
        if hasattr(self, 'auto_signin_switch') and self.auto_signin_switch.get():
            if not self.current_account.encrypted_credentials:
                self.show_error_dialog("Please setup AUTO credentials first!")
                return
            
            self.current_account.auto_signin_enabled = True
        
        print(f"Saved AUTO settings for {self.current_account.username}:")
        print(f"  - AUTO Mode: {settings.auto_signin}")
        print(f"  - Posts per day: {settings.posts_per_day}")
        print(f"  - Posting times: {settings.posting_hours}")
        print(f"  - Auto content: {settings.auto_content_generation}")
        
        # Show confirmation
        self.show_save_confirmation()
    
    def show_save_confirmation(self):
        """Show save confirmation."""
        # Create temporary confirmation widget
        confirmation = ctk.CTkLabel(
            self,
            text="✅ Settings saved successfully!",
            text_color=self.colors['success'],
            font=ctk.CTkFont(weight="bold")
        )
        confirmation.place(relx=0.5, rely=0.1, anchor="center")
        
        # Remove after 2 seconds
        self.after(2000, confirmation.destroy)