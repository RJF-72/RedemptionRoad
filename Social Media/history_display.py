"""
Redemption Marketing - History Display Widget
Copyright (c) 2025 Redemption Road. All rights reserved.

History display widget for showing content generation history.
"""
import customtkinter as ctk
from typing import List, Callable
from models import GeneratedContent
from utils import format_timestamp, truncate_text, create_color_scheme


class HistoryDisplay(ctk.CTkFrame):
    """Widget for displaying content generation history."""
    
    def __init__(self, parent, on_select_content: Callable, **kwargs):
        super().__init__(parent, **kwargs)
        
        self.colors = create_color_scheme()
        self.content_history: List[GeneratedContent] = []
        self.on_select_content = on_select_content
        
        self.setup_ui()
    
    def setup_ui(self):
        """Setup the history display UI."""
        self.configure(fg_color=self.colors['bg_secondary'])
        
        # Title
        title_frame = ctk.CTkFrame(self, fg_color="transparent")
        title_frame.pack(fill="x", padx=10, pady=(10, 5))
        
        ctk.CTkLabel(
            title_frame,
            text="📅 Content History",
            font=ctk.CTkFont(size=20, weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(side="left")
        
        # Clear button
        self.clear_button = ctk.CTkButton(
            title_frame,
            text="🗑️ Clear History",
            command=self.clear_history,
            fg_color="#7f1d1d",  # Dark red
            hover_color="#991b1b",
            font=ctk.CTkFont(weight="bold"),
            width=120
        )
        self.clear_button.pack(side="right")
        
        # Content area
        self.content_frame = ctk.CTkScrollableFrame(self)
        self.content_frame.pack(fill="both", expand=True, padx=10, pady=5)
        
        self.show_empty_state()
    
    def show_empty_state(self):
        """Show empty state when no history available."""
        # Clear existing content
        for widget in self.content_frame.winfo_children():
            widget.destroy()
        
        empty_frame = ctk.CTkFrame(self.content_frame, fg_color="transparent")
        empty_frame.pack(expand=True, fill="both", padx=20, pady=50)
        
        ctk.CTkLabel(
            empty_frame,
            text="📅",
            font=ctk.CTkFont(size=48)
        ).pack(pady=(0, 10))
        
        ctk.CTkLabel(
            empty_frame,
            text="No content history yet",
            font=ctk.CTkFont(size=18, weight="bold"),
            text_color=self.colors['text_secondary']
        ).pack(pady=(0, 5))
        
        ctk.CTkLabel(
            empty_frame,
            text="Generated content will appear here",
            text_color=self.colors['text_secondary']
        ).pack()
    
    def update_history(self, history: List[GeneratedContent]):
        """Update display with new history."""
        self.content_history = history
        
        # Clear existing content
        for widget in self.content_frame.winfo_children():
            widget.destroy()
        
        if not history:
            self.show_empty_state()
            return
        
        # Display each content item
        for i, content in enumerate(history):
            self.create_history_item(content, i)
    
    def create_history_item(self, content: GeneratedContent, index: int):
        """Create a single history item widget."""
        item_frame = ctk.CTkFrame(
            self.content_frame,
            fg_color=self.colors['bg_primary'],
            corner_radius=10
        )
        item_frame.pack(fill="x", padx=5, pady=5)
        
        # Header with badges and timestamp
        header_frame = ctk.CTkFrame(item_frame, fg_color="transparent")
        header_frame.pack(fill="x", padx=10, pady=(10, 5))
        
        # Badges
        badges_frame = ctk.CTkFrame(header_frame, fg_color="transparent")
        badges_frame.pack(side="left")
        
        # Platform badge
        platform_badge = ctk.CTkLabel(
            badges_frame,
            text=content.platform.upper(),
            font=ctk.CTkFont(size=10, weight="bold"),
            fg_color=self.colors['warning'],
            text_color=self.colors['text_primary'],
            corner_radius=10,
            width=70,
            height=20
        )
        platform_badge.pack(side="left", padx=(0, 5))
        
        # Niche badge
        niche_badge = ctk.CTkLabel(
            badges_frame,
            text=content.niche.upper(),
            font=ctk.CTkFont(size=10, weight="bold"),
            fg_color="#1e40af",  # Blue
            text_color=self.colors['text_primary'],
            corner_radius=10,
            width=80,
            height=20
        )
        niche_badge.pack(side="left")
        
        # Timestamp
        timestamp_label = ctk.CTkLabel(
            header_frame,
            text=format_timestamp(content.timestamp),
            font=ctk.CTkFont(size=10),
            text_color=self.colors['text_secondary']
        )
        timestamp_label.pack(side="right")
        
        # Content preview
        content_frame = ctk.CTkFrame(item_frame, fg_color="transparent")
        content_frame.pack(fill="x", padx=10, pady=5)
        
        # Hook (prominent)
        hook_label = ctk.CTkLabel(
            content_frame,
            text=truncate_text(content.hook, 80),
            font=ctk.CTkFont(weight="bold"),
            text_color=self.colors['text_accent'],
            wraplength=500,
            justify="left"
        )
        hook_label.pack(anchor="w", pady=(0, 5))
        
        # Caption preview
        caption_preview = truncate_text(content.caption, 120)
        caption_label = ctk.CTkLabel(
            content_frame,
            text=caption_preview,
            text_color=self.colors['text_secondary'],
            wraplength=500,
            justify="left"
        )
        caption_label.pack(anchor="w")
        
        # View button
        view_button = ctk.CTkButton(
            item_frame,
            text="View Full Content →",
            command=lambda c=content: self.select_content(c),
            fg_color="transparent",
            text_color=self.colors['warning'],
            hover_color=self.colors['bg_secondary'],
            font=ctk.CTkFont(weight="bold"),
            height=30
        )
        view_button.pack(anchor="w", padx=10, pady=(5, 10))
    
    def select_content(self, content: GeneratedContent):
        """Select a content item and switch to content view."""
        self.on_select_content(content)
    
    def clear_history(self):
        """Clear all history."""
        self.content_history.clear()
        self.show_empty_state()
    
    def add_content(self, content: GeneratedContent):
        """Add new content to history."""
        self.content_history.insert(0, content)
        self.update_history(self.content_history)
    
    def get_history_count(self) -> int:
        """Get number of items in history."""
        return len(self.content_history)