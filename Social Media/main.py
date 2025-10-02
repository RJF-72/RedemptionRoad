"""
Redemption Marketing - Social Media Content Generator
Copyright (c) 2025 Redemption Road. All rights reserved.

This software is licensed under strict commercial terms.
See LICENSE file for full terms and conditions.
"""
import customtkinter as ctk
import asyncio
import threading
from typing import Optional

from models import ContentManager, GeneratedContent, AnalyticsData
from content_settings import ContentSettingsForm
from content_display import ContentDisplay
from analytics_display import AnalyticsDisplay
from history_display import HistoryDisplay
from video_library import VideoLibraryTab
from social_accounts import SocialAccountTab
from opensource_api_service import OpenSourceAPIService
from utils import create_color_scheme, StatusManager
from cpu_optimizer import CPUOptimizer


class RedemptionMarketing:
    """Main application class."""
    
    def __init__(self):
        # Initialize managers
        self.content_manager = ContentManager()
        self.status_manager = StatusManager()
        self.api_service = OpenSourceAPIService()
        self.cpu_optimizer = CPUOptimizer()
        self.colors = create_color_scheme()
        
        # Setup UI
        self.setup_window()
        self.setup_ui()
        
        # Status callbacks
        self.status_manager.add_callback(self.on_status_change)
    
    def setup_window(self):
        """Setup the main window."""
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")
        
        self.root = ctk.CTk()
        self.root.title("Redemption Marketing v1.0 - © 2025 Redemption Road")
        self.root.geometry("1400x900")
        self.root.configure(fg_color=self.colors['bg_primary'])
        
        # Make window resizable
        self.root.grid_rowconfigure(0, weight=1)
        self.root.grid_columnconfigure(0, weight=1)
    
    def setup_ui(self):
        """Setup the main UI."""
        # Main container
        main_frame = ctk.CTkFrame(self.root, fg_color="transparent")
        main_frame.grid(row=0, column=0, sticky="nsew", padx=20, pady=20)
        main_frame.grid_rowconfigure(2, weight=1)
        main_frame.grid_columnconfigure(0, weight=1)
        
        # Header
        self.create_header(main_frame)
        
        # Tab navigation
        self.create_tab_navigation(main_frame)
        
        # Content area
        self.create_content_area(main_frame)
    
    def create_header(self, parent):
        """Create the application header."""
        header_frame = ctk.CTkFrame(
            parent,
            fg_color=self.colors['bg_secondary'],
            corner_radius=15
        )
        header_frame.grid(row=0, column=0, sticky="ew", pady=(0, 10))
        
        content_frame = ctk.CTkFrame(header_frame, fg_color="transparent")
        content_frame.pack(fill="x", padx=20, pady=15)
        
        # Title and logo
        title_frame = ctk.CTkFrame(content_frame, fg_color="transparent")
        title_frame.pack(side="left")
        
        ctk.CTkLabel(
            title_frame,
            text="✨ Redemption Marketing",
            font=ctk.CTkFont(size=28, weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(anchor="w")
        
        ctk.CTkLabel(
            title_frame,
            text="Professional AI-Powered Social Media Content Generator",
            text_color=self.colors['text_secondary']
        ).pack(anchor="w")
        
        # Copyright notice
        ctk.CTkLabel(
            title_frame,
            text="© 2025 Redemption Road - All Rights Reserved",
            font=ctk.CTkFont(size=10),
            text_color=self.colors['text_secondary']
        ).pack(anchor="w", pady=(5, 0))
        
        # Performance indicator
        perf_frame = ctk.CTkFrame(content_frame, fg_color="transparent")
        perf_frame.pack(side="right")
        
        cpu_info = self.cpu_optimizer.get_system_info()
        perf_text = f"🖥️ {cpu_info['cpu_count']} cores | 🎯 {cpu_info['optimal_threads']} threads"
        
        ctk.CTkLabel(
            perf_frame,
            text=perf_text,
            font=ctk.CTkFont(size=10),
            text_color=self.colors['text_secondary']
        ).pack()
    
    def create_tab_navigation(self, parent):
        """Create tab navigation."""
        nav_frame = ctk.CTkFrame(
            parent,
            fg_color=self.colors['bg_secondary'],
            corner_radius=15
        )
        nav_frame.grid(row=1, column=0, sticky="ew", pady=(0, 10))
        
        button_frame = ctk.CTkFrame(nav_frame, fg_color="transparent")
        button_frame.pack(fill="x", padx=10, pady=10)
        
        # Tab buttons
        self.active_tab = "content"
        
        self.content_tab_btn = ctk.CTkButton(
            button_frame,
            text="📄 Content Generator",
            command=lambda: self.switch_tab("content"),
            fg_color=self.colors['bg_accent'],
            hover_color="#b91c1c",
            font=ctk.CTkFont(weight="bold"),
            width=150
        )
        self.content_tab_btn.pack(side="left", padx=(0, 5))
        
        self.library_tab_btn = ctk.CTkButton(
            button_frame,
            text="🎬 Video Library",
            command=lambda: self.switch_tab("library"),
            fg_color="transparent",
            text_color=self.colors['text_secondary'],
            hover_color=self.colors['bg_primary'],
            font=ctk.CTkFont(weight="bold"),
            width=150
        )
        self.library_tab_btn.pack(side="left", padx=5)
        
        self.social_tab_btn = ctk.CTkButton(
            button_frame,
            text="📱 Social Media",
            command=lambda: self.switch_tab("social"),
            fg_color="transparent",
            text_color=self.colors['text_secondary'],
            hover_color=self.colors['bg_primary'],
            font=ctk.CTkFont(weight="bold"),
            width=150
        )
        self.social_tab_btn.pack(side="left", padx=5)
        
        self.analytics_tab_btn = ctk.CTkButton(
            button_frame,
            text="📊 Analytics",
            command=lambda: self.switch_tab("analytics"),
            fg_color="transparent",
            text_color=self.colors['text_secondary'],
            hover_color=self.colors['bg_primary'],
            font=ctk.CTkFont(weight="bold"),
            width=150
        )
        self.analytics_tab_btn.pack(side="left", padx=5)
        
        # History button with count
        history_count = self.content_manager.get_history_count()
        self.history_tab_btn = ctk.CTkButton(
            button_frame,
            text=f"📅 History ({history_count})",
            command=lambda: self.switch_tab("history"),
            fg_color="transparent",
            text_color=self.colors['text_secondary'],
            hover_color=self.colors['bg_primary'],
            font=ctk.CTkFont(weight="bold"),
            width=150
        )
        self.history_tab_btn.pack(side="left", padx=5)
    
    def create_content_area(self, parent):
        """Create the main content area."""
        self.content_area = ctk.CTkFrame(
            parent,
            fg_color="transparent"
        )
        self.content_area.grid(row=2, column=0, sticky="nsew")
        self.content_area.grid_rowconfigure(0, weight=1)
        self.content_area.grid_columnconfigure(0, weight=1)
        self.content_area.grid_columnconfigure(1, weight=1)
        
        # Content Generator Tab
        self.content_generator_frame = ctk.CTkFrame(
            self.content_area,
            fg_color="transparent"
        )
        self.content_generator_frame.grid(row=0, column=0, columnspan=2, sticky="nsew")
        self.content_generator_frame.grid_rowconfigure(0, weight=1)
        self.content_generator_frame.grid_columnconfigure(0, weight=1)
        self.content_generator_frame.grid_columnconfigure(1, weight=1)
        
        # Settings form
        self.settings_form = ContentSettingsForm(
            self.content_generator_frame,
            on_generate=self.generate_content
        )
        self.settings_form.grid(row=0, column=0, sticky="nsew", padx=(0, 5))
        
        # Content display
        self.content_display = ContentDisplay(self.content_generator_frame)
        self.content_display.grid(row=0, column=1, sticky="nsew", padx=(5, 0))
        
        # Video Library Tab
        self.video_library = VideoLibraryTab(self.content_area)
        
        # Social Media Tab  
        self.social_accounts = SocialAccountTab(self.content_area)
        
        # Analytics Tab
        self.analytics_display = AnalyticsDisplay(
            self.content_area,
            on_analyze=self.analyze_content
        )
        
        # History Tab
        self.history_display = HistoryDisplay(
            self.content_area,
            on_select_content=self.select_content_from_history
        )
    
    def switch_tab(self, tab_name: str):
        """Switch to a different tab."""
        self.active_tab = tab_name
        
        # Update button states
        self.update_tab_buttons()
        
        # Hide all tab content
        self.content_generator_frame.grid_remove()
        self.video_library.grid_remove()
        self.social_accounts.grid_remove()
        self.analytics_display.grid_remove()
        self.history_display.grid_remove()
        
        # Show selected tab
        if tab_name == "content":
            self.content_generator_frame.grid()
        elif tab_name == "library":
            self.video_library.grid(row=0, column=0, columnspan=2, sticky="nsew")
        elif tab_name == "social":
            self.social_accounts.grid(row=0, column=0, columnspan=2, sticky="nsew")
        elif tab_name == "analytics":
            self.analytics_display.grid(row=0, column=0, columnspan=2, sticky="nsew")
        elif tab_name == "history":
            self.history_display.grid(row=0, column=0, columnspan=2, sticky="nsew")
    
    def update_tab_buttons(self):
        """Update tab button appearances."""
        buttons = {
            "content": self.content_tab_btn,
            "library": self.library_tab_btn,
            "social": self.social_tab_btn,
            "analytics": self.analytics_tab_btn,
            "history": self.history_tab_btn
        }
        
        for tab, button in buttons.items():
            if tab == self.active_tab:
                button.configure(
                    fg_color=self.colors['bg_accent'],
                    text_color=self.colors['text_primary']
                )
            else:
                button.configure(
                    fg_color="transparent",
                    text_color=self.colors['text_secondary']
                )
    
    def generate_content(self, settings):
        """Generate content using AI API."""
        self.status_manager.set_loading(True, "Generating content...")
        
        # Run async function in thread
        def run_async():
            asyncio.run(self._generate_content_async(settings))
        
        thread = threading.Thread(target=run_async)
        thread.daemon = True
        thread.start()
    
    async def _generate_content_async(self, settings):
        """Async content generation."""
        try:
            content = await self.api_service.generate_content(settings)
            
            # Update UI in main thread
            self.root.after(0, self._on_content_generated, content)
            
        except Exception as e:
            print(f"Error generating content: {e}")
            self.root.after(0, self._on_generation_error, str(e))
    
    def _on_content_generated(self, content: Optional[GeneratedContent]):
        """Handle successful content generation."""
        self.status_manager.set_loading(False)
        
        if content:
            self.content_manager.add_content(content)
            self.content_display.update_content(content)
            self.update_history_tab_count()
        else:
            print("Failed to generate content")
    
    def _on_generation_error(self, error: str):
        """Handle content generation error."""
        self.status_manager.set_loading(False)
        print(f"Generation error: {error}")
    
    def analyze_content(self):
        """Analyze content history."""
        if not self.content_manager.content_history:
            print("No content to analyze")
            return
        
        self.status_manager.set_loading(True, "Analyzing content...")
        
        # Run async function in thread
        def run_async():
            asyncio.run(self._analyze_content_async())
        
        thread = threading.Thread(target=run_async)
        thread.daemon = True
        thread.start()
    
    async def _analyze_content_async(self):
        """Async content analysis."""
        try:
            analytics = await self.api_service.analyze_content(
                self.content_manager.content_history
            )
            
            # Update UI in main thread
            self.root.after(0, self._on_analytics_generated, analytics)
            
        except Exception as e:
            print(f"Error analyzing content: {e}")
            self.root.after(0, self._on_analysis_error, str(e))
    
    def _on_analytics_generated(self, analytics: Optional[AnalyticsData]):
        """Handle successful analytics generation."""
        self.status_manager.set_loading(False)
        
        if analytics:
            self.content_manager.analytics_data = analytics
            self.analytics_display.update_analytics(analytics)
        else:
            print("Failed to generate analytics")
    
    def _on_analysis_error(self, error: str):
        """Handle analytics generation error."""
        self.status_manager.set_loading(False)
        print(f"Analysis error: {error}")
    
    def select_content_from_history(self, content: GeneratedContent):
        """Select content from history and switch to content tab."""
        self.content_display.update_content(content)
        self.switch_tab("content")
    
    def update_history_tab_count(self):
        """Update the history tab button with current count."""
        count = self.content_manager.get_history_count()
        self.history_tab_btn.configure(text=f"📅 History ({count})")
        
        # Update history display
        self.history_display.update_history(self.content_manager.content_history)
    
    def on_status_change(self, is_loading: bool, message: str):
        """Handle status changes."""
        # Update UI components based on loading state
        self.settings_form.set_loading(is_loading)
        self.analytics_display.set_loading(is_loading)
    
    def run(self):
        """Start the application."""
        self.root.mainloop()


def main():
    """Main entry point."""
    app = RedemptionMarketing()
    app.run()


if __name__ == "__main__":
    main()