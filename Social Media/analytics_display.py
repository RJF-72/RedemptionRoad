"""
Redemption Marketing - Analytics Display Widget
Copyright (c) 2025 Redemption Road. All rights reserved.

Analytics display widget for showing content performance insights.
"""
import customtkinter as ctk
from typing import Optional, Callable
from models import AnalyticsData
from utils import create_color_scheme


class AnalyticsDisplay(ctk.CTkFrame):
    """Widget for displaying analytics and insights."""
    
    def __init__(self, parent, on_analyze: Callable, **kwargs):
        super().__init__(parent, **kwargs)
        
        self.colors = create_color_scheme()
        self.analytics: Optional[AnalyticsData] = None
        self.on_analyze = on_analyze
        
        self.setup_ui()
    
    def setup_ui(self):
        """Setup the analytics display UI."""
        self.configure(fg_color=self.colors['bg_secondary'])
        
        # Header with analyze button
        header_frame = ctk.CTkFrame(self, fg_color="transparent")
        header_frame.pack(fill="x", padx=10, pady=(10, 5))
        
        ctk.CTkLabel(
            header_frame,
            text="📊 Content Analytics",
            font=ctk.CTkFont(size=20, weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(side="left")
        
        self.analyze_button = ctk.CTkButton(
            header_frame,
            text="📈 Analyze Content",
            command=self.handle_analyze,
            fg_color=self.colors['bg_accent'],
            hover_color="#b91c1c",
            font=ctk.CTkFont(weight="bold")
        )
        self.analyze_button.pack(side="right")
        
        # Content area
        self.content_frame = ctk.CTkScrollableFrame(self)
        self.content_frame.pack(fill="both", expand=True, padx=10, pady=5)
        
        self.show_empty_state()
    
    def show_empty_state(self):
        """Show empty state when no analytics available."""
        # Clear existing content
        for widget in self.content_frame.winfo_children():
            widget.destroy()
        
        empty_frame = ctk.CTkFrame(self.content_frame, fg_color="transparent")
        empty_frame.pack(expand=True, fill="both", padx=20, pady=50)
        
        ctk.CTkLabel(
            empty_frame,
            text="📊",
            font=ctk.CTkFont(size=48)
        ).pack(pady=(0, 10))
        
        ctk.CTkLabel(
            empty_frame,
            text="No analytics available",
            font=ctk.CTkFont(size=18, weight="bold"),
            text_color=self.colors['text_secondary']
        ).pack(pady=(0, 5))
        
        ctk.CTkLabel(
            empty_frame,
            text="Generate some content first, then click 'Analyze Content'\nto get AI-powered insights",
            text_color=self.colors['text_secondary'],
            justify="center"
        ).pack()
    
    def update_analytics(self, analytics: AnalyticsData):
        """Update display with new analytics data."""
        self.analytics = analytics
        
        # Clear existing content
        for widget in self.content_frame.winfo_children():
            widget.destroy()
        
        # Create grid layout
        grid_frame = ctk.CTkFrame(self.content_frame, fg_color="transparent")
        grid_frame.pack(fill="both", expand=True, padx=5, pady=5)
        
        # Growth Score (prominent display)
        growth_frame = ctk.CTkFrame(
            grid_frame,
            fg_color=self.colors['bg_accent'],
            corner_radius=15
        )
        growth_frame.grid(row=0, column=0, padx=5, pady=5, sticky="ew")
        
        ctk.CTkLabel(
            growth_frame,
            text="📈 Growth Score",
            font=ctk.CTkFont(size=14, weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(pady=(15, 5))
        
        ctk.CTkLabel(
            growth_frame,
            text=str(analytics.growth_score),
            font=ctk.CTkFont(size=48, weight="bold"),
            text_color=self.colors['text_primary']
        ).pack()
        
        ctk.CTkLabel(
            growth_frame,
            text="Out of 100",
            text_color=self.colors['text_secondary']
        ).pack(pady=(0, 15))
        
        # Content Patterns
        patterns_frame = ctk.CTkFrame(
            grid_frame,
            fg_color="#1e40af",  # Blue
            corner_radius=15
        )
        patterns_frame.grid(row=0, column=1, padx=5, pady=5, sticky="ew")
        
        ctk.CTkLabel(
            patterns_frame,
            text="Content Patterns",
            font=ctk.CTkFont(size=14, weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(pady=(15, 10))
        
        ctk.CTkLabel(
            patterns_frame,
            text=analytics.content_patterns,
            text_color=self.colors['text_accent'],
            wraplength=250,
            justify="left"
        ).pack(padx=10, pady=(0, 15))
        
        # Configure grid weights
        grid_frame.grid_columnconfigure(0, weight=1)
        grid_frame.grid_columnconfigure(1, weight=1)
        
        # Top Performers
        performers_frame = ctk.CTkFrame(
            grid_frame,
            fg_color=self.colors['bg_primary'],
            corner_radius=15
        )
        performers_frame.grid(row=1, column=0, padx=5, pady=5, sticky="ew")
        
        ctk.CTkLabel(
            performers_frame,
            text="Top Performers",
            font=ctk.CTkFont(size=14, weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(pady=(15, 10))
        
        ctk.CTkLabel(
            performers_frame,
            text=analytics.top_performers,
            text_color=self.colors['text_accent'],
            wraplength=250,
            justify="left"
        ).pack(padx=10, pady=(0, 15))
        
        # Posting Strategy
        strategy_frame = ctk.CTkFrame(
            grid_frame,
            fg_color="#a16207",  # Yellow-brown
            corner_radius=15
        )
        strategy_frame.grid(row=1, column=1, padx=5, pady=5, sticky="ew")
        
        ctk.CTkLabel(
            strategy_frame,
            text="Posting Strategy",
            font=ctk.CTkFont(size=14, weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(pady=(15, 10))
        
        ctk.CTkLabel(
            strategy_frame,
            text=analytics.posting_strategy,
            text_color=self.colors['text_accent'],
            wraplength=250,
            justify="left"
        ).pack(padx=10, pady=(0, 15))
        
        # Hashtag Insights
        hashtag_frame = ctk.CTkFrame(
            grid_frame,
            fg_color=self.colors['warning'],
            corner_radius=15
        )
        hashtag_frame.grid(row=2, column=0, padx=5, pady=5, sticky="ew")
        
        ctk.CTkLabel(
            hashtag_frame,
            text="Hashtag Insights",
            font=ctk.CTkFont(size=14, weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(pady=(15, 10))
        
        ctk.CTkLabel(
            hashtag_frame,
            text=analytics.hashtag_insights,
            text_color=self.colors['text_accent'],
            wraplength=250,
            justify="left"
        ).pack(padx=10, pady=(0, 15))
        
        # Audience Engagement
        engagement_frame = ctk.CTkFrame(
            grid_frame,
            fg_color="#1e40af",  # Blue
            corner_radius=15
        )
        engagement_frame.grid(row=2, column=1, padx=5, pady=5, sticky="ew")
        
        ctk.CTkLabel(
            engagement_frame,
            text="Audience Engagement",
            font=ctk.CTkFont(size=14, weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(pady=(15, 10))
        
        ctk.CTkLabel(
            engagement_frame,
            text=analytics.audience_engagement,
            text_color=self.colors['text_accent'],
            wraplength=250,
            justify="left"
        ).pack(padx=10, pady=(0, 15))
        
        # Recommendations (full width)
        rec_frame = ctk.CTkFrame(
            grid_frame,
            fg_color=self.colors['bg_accent'],
            corner_radius=15
        )
        rec_frame.grid(row=3, column=0, columnspan=2, padx=5, pady=5, sticky="ew")
        
        ctk.CTkLabel(
            rec_frame,
            text="Recommendations",
            font=ctk.CTkFont(size=14, weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(pady=(15, 10))
        
        for i, rec in enumerate(analytics.recommendations, 1):
            ctk.CTkLabel(
                rec_frame,
                text=f"• {rec}",
                text_color=self.colors['text_accent'],
                wraplength=500,
                justify="left"
            ).pack(anchor="w", padx=15, pady=2)
        
        ctk.CTkLabel(rec_frame, text="").pack(pady=5)  # Spacer
    
    def handle_analyze(self):
        """Handle analyze button click."""
        self.on_analyze()
    
    def set_loading(self, loading: bool):
        """Set loading state."""
        if loading:
            self.analyze_button.configure(text="🔄 Analyzing...", state="disabled")
        else:
            self.analyze_button.configure(text="📈 Analyze Content", state="normal")