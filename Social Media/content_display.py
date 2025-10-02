"""
Redemption Marketing - Content Display Widget
Copyright (c) 2025 Redemption Road. All rights reserved.

Content display widget for showing generated social media content.
"""
import customtkinter as ctk
from typing import Optional
from models import GeneratedContent
from utils import copy_to_clipboard, format_hashtags, create_color_scheme


class ContentDisplay(ctk.CTkFrame):
    """Widget for displaying generated content."""
    
    def __init__(self, parent, **kwargs):
        super().__init__(parent, **kwargs)
        
        self.colors = create_color_scheme()
        self.content: Optional[GeneratedContent] = None
        
        self.setup_ui()
    
    def setup_ui(self):
        """Setup the content display UI."""
        self.configure(fg_color=self.colors['bg_secondary'])
        
        # Title
        title_frame = ctk.CTkFrame(self, fg_color="transparent")
        title_frame.pack(fill="x", padx=10, pady=(10, 5))
        
        ctk.CTkLabel(
            title_frame,
            text="✨ Generated Content",
            font=ctk.CTkFont(size=20, weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(side="left")
        
        # Content area
        self.content_frame = ctk.CTkScrollableFrame(self)
        self.content_frame.pack(fill="both", expand=True, padx=10, pady=5)
        
        self.show_empty_state()
    
    def show_empty_state(self):
        """Show empty state when no content is generated."""
        # Clear existing content
        for widget in self.content_frame.winfo_children():
            widget.destroy()
        
        empty_frame = ctk.CTkFrame(self.content_frame, fg_color="transparent")
        empty_frame.pack(expand=True, fill="both", padx=20, pady=50)
        
        ctk.CTkLabel(
            empty_frame,
            text="📄",
            font=ctk.CTkFont(size=48)
        ).pack(pady=(0, 10))
        
        ctk.CTkLabel(
            empty_frame,
            text="No content generated yet",
            font=ctk.CTkFont(size=18, weight="bold"),
            text_color=self.colors['text_secondary']
        ).pack(pady=(0, 5))
        
        ctk.CTkLabel(
            empty_frame,
            text="Fill in the form and click Generate Content",
            text_color=self.colors['text_secondary']
        ).pack()
    
    def update_content(self, content: GeneratedContent):
        """Update display with new content."""
        self.content = content
        
        # Clear existing content
        for widget in self.content_frame.winfo_children():
            widget.destroy()
        
        # Engagement Hook
        hook_frame = ctk.CTkFrame(
            self.content_frame,
            fg_color=self.colors['warning']
        )
        hook_frame.pack(fill="x", padx=5, pady=5)
        
        ctk.CTkLabel(
            hook_frame,
            text="ENGAGEMENT HOOK",
            font=ctk.CTkFont(size=10, weight="bold"),
            text_color=self.colors['bg_primary']
        ).pack(anchor="w", padx=10, pady=(10, 5))
        
        ctk.CTkLabel(
            hook_frame,
            text=content.hook,
            font=ctk.CTkFont(weight="bold"),
            text_color=self.colors['text_accent'],
            wraplength=400,
            justify="left"
        ).pack(anchor="w", padx=10, pady=(0, 10))
        
        # Full Caption
        caption_frame = ctk.CTkFrame(
            self.content_frame,
            fg_color=self.colors['bg_primary']
        )
        caption_frame.pack(fill="x", padx=5, pady=5)
        
        ctk.CTkLabel(
            caption_frame,
            text="FULL CAPTION",
            font=ctk.CTkFont(size=10, weight="bold"),
            text_color=self.colors['text_secondary']
        ).pack(anchor="w", padx=10, pady=(10, 5))
        
        caption_text = ctk.CTkTextbox(
            caption_frame,
            height=120,
            fg_color=self.colors['bg_secondary'],
            text_color=self.colors['text_accent']
        )
        caption_text.pack(fill="x", padx=10, pady=(0, 10))
        caption_text.insert("0.0", content.caption)
        caption_text.configure(state="disabled")
        
        # Call to Action
        cta_frame = ctk.CTkFrame(
            self.content_frame,
            fg_color="#1e40af"  # Blue
        )
        cta_frame.pack(fill="x", padx=5, pady=5)
        
        ctk.CTkLabel(
            cta_frame,
            text="CALL TO ACTION",
            font=ctk.CTkFont(size=10, weight="bold"),
            text_color="#60a5fa"  # Light blue
        ).pack(anchor="w", padx=10, pady=(10, 5))
        
        ctk.CTkLabel(
            cta_frame,
            text=content.cta,
            font=ctk.CTkFont(weight="bold"),
            text_color=self.colors['text_accent'],
            wraplength=400,
            justify="left"
        ).pack(anchor="w", padx=10, pady=(0, 10))
        
        # Hashtags
        hashtag_frame = ctk.CTkFrame(
            self.content_frame,
            fg_color=self.colors['warning']
        )
        hashtag_frame.pack(fill="x", padx=5, pady=5)
        
        ctk.CTkLabel(
            hashtag_frame,
            text="# HASHTAGS",
            font=ctk.CTkFont(size=10, weight="bold"),
            text_color="#ea580c"  # Orange
        ).pack(anchor="w", padx=10, pady=(10, 5))
        
        hashtag_text = format_hashtags(content.hashtags)
        ctk.CTkLabel(
            hashtag_frame,
            text=hashtag_text,
            text_color=self.colors['text_accent'],
            wraplength=400,
            justify="left"
        ).pack(anchor="w", padx=10, pady=(0, 10))
        
        # Best Posting Time
        time_frame = ctk.CTkFrame(
            self.content_frame,
            fg_color=self.colors['bg_primary']
        )
        time_frame.pack(fill="x", padx=5, pady=5)
        
        ctk.CTkLabel(
            time_frame,
            text="📅 BEST POSTING TIME",
            font=ctk.CTkFont(size=10, weight="bold"),
            text_color=self.colors['text_secondary']
        ).pack(anchor="w", padx=10, pady=(10, 5))
        
        ctk.CTkLabel(
            time_frame,
            text=content.best_time,
            text_color=self.colors['text_accent'],
            wraplength=400,
            justify="left"
        ).pack(anchor="w", padx=10, pady=(0, 10))
        
        # Strategy Notes
        strategy_frame = ctk.CTkFrame(
            self.content_frame,
            fg_color="#a16207"  # Yellow-brown
        )
        strategy_frame.pack(fill="x", padx=5, pady=5)
        
        ctk.CTkLabel(
            strategy_frame,
            text="📈 STRATEGY NOTES",
            font=ctk.CTkFont(size=10, weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(anchor="w", padx=10, pady=(10, 5))
        
        ctk.CTkLabel(
            strategy_frame,
            text=content.strategy_notes,
            text_color=self.colors['text_accent'],
            wraplength=400,
            justify="left"
        ).pack(anchor="w", padx=10, pady=(0, 10))
        
        # Video content sections (if applicable)
        if content.content_type in ["marketing_video", "music_video"]:
            self._add_video_sections(content)
        
        # Copy button
        copy_button = ctk.CTkButton(
            self.content_frame,
            text="📋 Copy Caption to Clipboard",
            command=self.copy_caption,
            fg_color=self.colors['bg_accent'],
            hover_color="#b91c1c",
            font=ctk.CTkFont(weight="bold"),
            height=40
        )
        copy_button.pack(fill="x", padx=5, pady=10)
    
    def _add_video_sections(self, content: GeneratedContent):
        """Add video-specific content sections."""
        # Video Script
        if content.video_script:
            script_frame = ctk.CTkFrame(
                self.content_frame,
                fg_color="#4c1d95"  # Purple
            )
            script_frame.pack(fill="x", padx=5, pady=5)
            
            ctk.CTkLabel(
                script_frame,
                text="🎬 VIDEO SCRIPT",
                font=ctk.CTkFont(size=10, weight="bold"),
                text_color="#c4b5fd"  # Light purple
            ).pack(anchor="w", padx=10, pady=(10, 5))
            
            script_text = ctk.CTkTextbox(
                script_frame,
                height=100,
                fg_color=self.colors['bg_secondary'],
                text_color=self.colors['text_accent']
            )
            script_text.pack(fill="x", padx=10, pady=(0, 10))
            script_text.insert("0.0", content.video_script)
            script_text.configure(state="disabled")
        
        # Video Scenes
        if content.video_scenes:
            scenes_frame = ctk.CTkFrame(
                self.content_frame,
                fg_color="#059669"  # Green
            )
            scenes_frame.pack(fill="x", padx=5, pady=5)
            
            ctk.CTkLabel(
                scenes_frame,
                text="🎥 VIDEO SCENES",
                font=ctk.CTkFont(size=10, weight="bold"),
                text_color="#6ee7b7"  # Light green
            ).pack(anchor="w", padx=10, pady=(10, 5))
            
            for i, scene in enumerate(content.video_scenes, 1):
                ctk.CTkLabel(
                    scenes_frame,
                    text=f"{i}. {scene}",
                    text_color=self.colors['text_accent'],
                    wraplength=400,
                    justify="left"
                ).pack(anchor="w", padx=10, pady=2)
            
            ctk.CTkLabel(scenes_frame, text="").pack(pady=5)  # Spacer
        
        # Music Suggestions (for music videos)
        if content.music_suggestions:
            music_frame = ctk.CTkFrame(
                self.content_frame,
                fg_color="#dc2626"  # Red
            )
            music_frame.pack(fill="x", padx=5, pady=5)
            
            ctk.CTkLabel(
                music_frame,
                text="🎵 MUSIC SUGGESTIONS",
                font=ctk.CTkFont(size=10, weight="bold"),
                text_color="#fca5a5"  # Light red
            ).pack(anchor="w", padx=10, pady=(10, 5))
            
            for suggestion in content.music_suggestions:
                ctk.CTkLabel(
                    music_frame,
                    text=f"• {suggestion}",
                    text_color=self.colors['text_accent'],
                    wraplength=400,
                    justify="left"
                ).pack(anchor="w", padx=10, pady=2)
            
            ctk.CTkLabel(music_frame, text="").pack(pady=5)  # Spacer
        
        # Visual Elements (for marketing videos)
        if content.visual_elements:
            visual_frame = ctk.CTkFrame(
                self.content_frame,
                fg_color="#7c3aed"  # Violet
            )
            visual_frame.pack(fill="x", padx=5, pady=5)
            
            ctk.CTkLabel(
                visual_frame,
                text="🎨 VISUAL ELEMENTS",
                font=ctk.CTkFont(size=10, weight="bold"),
                text_color="#c4b5fd"  # Light violet
            ).pack(anchor="w", padx=10, pady=(10, 5))
            
            for element in content.visual_elements:
                ctk.CTkLabel(
                    visual_frame,
                    text=f"• {element}",
                    text_color=self.colors['text_accent'],
                    wraplength=400,
                    justify="left"
                ).pack(anchor="w", padx=10, pady=2)
            
            ctk.CTkLabel(visual_frame, text="").pack(pady=5)  # Spacer
    
    def copy_caption(self):
        """Copy caption to clipboard."""
        if self.content:
            success = copy_to_clipboard(self.content.caption)
            if success:
                print("Caption copied to clipboard!")
            else:
                print("Failed to copy caption")