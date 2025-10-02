"""
Redemption Marketing - Content Settings Form
Copyright (c) 2025 Redemption Road. All rights reserved.

Content settings form widget for Redemption Marketing.
"""
import customtkinter as ctk
from typing import Callable
from models import ContentSettings, PLATFORMS, TONES, CONTENT_TYPES, VIDEO_STYLES, MUSIC_GENRES, VIDEO_DURATION_LIMITS, VIDEO_CONTENT_TYPES, SUPPORTED_AUDIO_FORMATS
from utils import validate_required_fields, create_color_scheme
import tkinter.filedialog as fd


class ContentSettingsForm(ctk.CTkFrame):
    """Form for content generation settings."""
    
    def __init__(self, parent, on_generate: Callable, **kwargs):
        super().__init__(parent, **kwargs)
        
        self.on_generate = on_generate
        self.colors = create_color_scheme()
        self.settings = ContentSettings()
        
        self.setup_ui()
    
    def setup_ui(self):
        """Setup the form UI."""
        # Configure colors
        self.configure(fg_color=self.colors['bg_secondary'])
        
        # Title
        title_frame = ctk.CTkFrame(self, fg_color="transparent")
        title_frame.pack(fill="x", padx=10, pady=(10, 5))
        
        ctk.CTkLabel(
            title_frame,
            text="🎯 Content Settings",
            font=ctk.CTkFont(size=20, weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(side="left")
        
        # Main form
        form_frame = ctk.CTkScrollableFrame(self)
        form_frame.pack(fill="both", expand=True, padx=10, pady=5)
        
        # Platform selection
        ctk.CTkLabel(
            form_frame,
            text="Platform",
            font=ctk.CTkFont(weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(anchor="w", pady=(10, 5))
        
        self.platform_var = ctk.StringVar(value=self.settings.platform)
        self.platform_dropdown = ctk.CTkOptionMenu(
            form_frame,
            values=PLATFORMS,
            variable=self.platform_var,
            fg_color=self.colors['bg_primary'],
            button_color=self.colors['bg_accent']
        )
        self.platform_dropdown.pack(fill="x", pady=(0, 10))
        
        # Niche input
        ctk.CTkLabel(
            form_frame,
            text="Your Niche *",
            font=ctk.CTkFont(weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(anchor="w", pady=(0, 5))
        
        self.niche_entry = ctk.CTkEntry(
            form_frame,
            placeholder_text="e.g., fitness, tech reviews, cooking",
            fg_color=self.colors['bg_primary']
        )
        self.niche_entry.pack(fill="x", pady=(0, 10))
        
        # Target audience input
        ctk.CTkLabel(
            form_frame,
            text="Target Audience *",
            font=ctk.CTkFont(weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(anchor="w", pady=(0, 5))
        
        self.audience_entry = ctk.CTkEntry(
            form_frame,
            placeholder_text="e.g., busy professionals 25-40",
            fg_color=self.colors['bg_primary']
        )
        self.audience_entry.pack(fill="x", pady=(0, 10))
        
        # Tone selection
        ctk.CTkLabel(
            form_frame,
            text="Tone",
            font=ctk.CTkFont(weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(anchor="w", pady=(0, 5))
        
        self.tone_var = ctk.StringVar(value=self.settings.tone)
        self.tone_dropdown = ctk.CTkOptionMenu(
            form_frame,
            values=TONES,
            variable=self.tone_var,
            fg_color=self.colors['bg_primary'],
            button_color=self.colors['bg_accent']
        )
        self.tone_dropdown.pack(fill="x", pady=(0, 10))
        
        # Content type selection
        ctk.CTkLabel(
            form_frame,
            text="Content Type",
            font=ctk.CTkFont(weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(anchor="w", pady=(0, 5))
        
        self.content_type_var = ctk.StringVar(value=self.settings.content_type)
        self.content_type_dropdown = ctk.CTkOptionMenu(
            form_frame,
            values=CONTENT_TYPES,
            variable=self.content_type_var,
            fg_color=self.colors['bg_primary'],
            button_color=self.colors['bg_accent']
        )
        self.content_type_dropdown.pack(fill="x", pady=(0, 10))
        
        # Keywords input
        ctk.CTkLabel(
            form_frame,
            text="Keywords (optional)",
            font=ctk.CTkFont(weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(anchor="w", pady=(0, 5))
        
        self.keywords_entry = ctk.CTkEntry(
            form_frame,
            placeholder_text="e.g., motivation, productivity",
            fg_color=self.colors['bg_primary']
        )
        self.keywords_entry.pack(fill="x", pady=(0, 15))
        
        # Video-specific settings (show when video content type is selected)
        self.video_frame = ctk.CTkFrame(form_frame, fg_color="transparent")
        
        # Video style selection
        ctk.CTkLabel(
            self.video_frame,
            text="Video Style",
            font=ctk.CTkFont(weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(anchor="w", pady=(0, 5))
        
        self.video_style_var = ctk.StringVar(value="cinematic")
        self.video_style_dropdown = ctk.CTkOptionMenu(
            self.video_frame,
            values=VIDEO_STYLES,
            variable=self.video_style_var,
            fg_color=self.colors['bg_primary'],
            button_color=self.colors['bg_accent']
        )
        self.video_style_dropdown.pack(fill="x", pady=(0, 10))
        
        # Music genre selection
        ctk.CTkLabel(
            self.video_frame,
            text="Music Genre",
            font=ctk.CTkFont(weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(anchor="w", pady=(0, 5))
        
        self.music_genre_var = ctk.StringVar(value="pop")
        self.music_genre_dropdown = ctk.CTkOptionMenu(
            self.video_frame,
            values=MUSIC_GENRES,
            variable=self.music_genre_var,
            fg_color=self.colors['bg_primary'],
            button_color=self.colors['bg_accent']
        )
        self.music_genre_dropdown.pack(fill="x", pady=(0, 10))
        
        # Video duration with dynamic limits
        ctk.CTkLabel(
            self.video_frame,
            text="Video Duration (seconds)",
            font=ctk.CTkFont(weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(anchor="w", pady=(0, 5))
        
        # Duration info label
        self.duration_info_label = ctk.CTkLabel(
            self.video_frame,
            text="Range: 20-90 seconds",
            font=ctk.CTkFont(size=10),
            text_color=self.colors['text_secondary']
        )
        self.duration_info_label.pack(anchor="w", pady=(0, 5))
        
        # Duration slider
        self.duration_var = ctk.IntVar(value=30)
        self.duration_slider = ctk.CTkSlider(
            self.video_frame,
            from_=20,
            to=90,
            variable=self.duration_var,
            number_of_steps=70
        )
        self.duration_slider.pack(fill="x", pady=(0, 5))
        
        # Duration display
        self.duration_display = ctk.CTkLabel(
            self.video_frame,
            text="30 seconds",
            font=ctk.CTkFont(weight="bold"),
            text_color=self.colors['text_primary']
        )
        self.duration_display.pack(pady=(0, 15))
        
        # Bind slider to update display
        self.duration_var.trace("w", self._on_duration_change)
        
        # Audio file upload for full-length music videos
        self.audio_frame = ctk.CTkFrame(self.video_frame, fg_color="transparent")
        
        ctk.CTkLabel(
            self.audio_frame,
            text="Audio File (for Full-Length Music Videos)",
            font=ctk.CTkFont(weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(anchor="w", pady=(10, 5))
        
        # Audio file selection
        audio_select_frame = ctk.CTkFrame(self.audio_frame, fg_color="transparent")
        audio_select_frame.pack(fill="x", pady=(0, 5))
        
        self.audio_file_button = ctk.CTkButton(
            audio_select_frame,
            text="🎵 Select Audio File",
            command=self._select_audio_file,
            fg_color=self.colors['bg_accent'],
            hover_color="#b91c1c",
            width=150
        )
        self.audio_file_button.pack(side="left", padx=(0, 10))
        
        self.clear_audio_button = ctk.CTkButton(
            audio_select_frame,
            text="❌ Clear",
            command=self._clear_audio_file,
            fg_color="#7f1d1d",
            hover_color="#991b1b",
            width=80
        )
        self.clear_audio_button.pack(side="left")
        
        # Audio file info display
        self.audio_info_label = ctk.CTkLabel(
            self.audio_frame,
            text="No audio file selected",
            font=ctk.CTkFont(size=10),
            text_color=self.colors['text_secondary'],
            wraplength=300
        )
        self.audio_info_label.pack(anchor="w", pady=(0, 5))
        
        # Auto-duration checkbox
        self.auto_duration_var = ctk.BooleanVar(value=False)
        self.auto_duration_checkbox = ctk.CTkCheckBox(
            self.audio_frame,
            text="Auto-set duration from audio file",
            variable=self.auto_duration_var,
            command=self._on_auto_duration_change,
            text_color=self.colors['text_primary']
        )
        self.auto_duration_checkbox.pack(anchor="w", pady=(0, 10))
        
        # Bind content type changes to show/hide video options
        self.content_type_var.trace("w", self._on_content_type_change)
        
        # Generate button
        self.generate_button = ctk.CTkButton(
            form_frame,
            text="⚡ Generate Content",
            command=self.handle_generate,
            fg_color=self.colors['bg_accent'],
            hover_color="#b91c1c",
            font=ctk.CTkFont(size=16, weight="bold"),
            height=50
        )
        self.generate_button.pack(fill="x", pady=(0, 10))
        
        # Generate Video button
        self.generate_video_button = ctk.CTkButton(
            form_frame,
            text="🎬 Generate Video",
            command=self.handle_generate_video,
            fg_color="#059669",  # Green color for video generation
            hover_color="#047857",
            font=ctk.CTkFont(size=16, weight="bold"),
            height=50
        )
        self.generate_video_button.pack(fill="x", pady=(0, 10))
    
    def _on_content_type_change(self, *args):
        """Handle content type change to show/hide video options."""
        content_type = self.content_type_var.get()
        
        if content_type in VIDEO_CONTENT_TYPES:
            self.video_frame.pack(fill="x", pady=(0, 15))
            self._update_duration_limits(content_type)
            
            # Show audio upload for full-length music videos
            if content_type == "full_length_music_video":
                self.audio_frame.pack(fill="x", pady=(10, 0))
            else:
                self.audio_frame.pack_forget()
        else:
            self.video_frame.pack_forget()
    
    def _select_audio_file(self):
        """Open file dialog to select audio file."""
        file_types = [
            ("Audio Files", " ".join([f"*{ext}" for ext in SUPPORTED_AUDIO_FORMATS])),
            ("MP3 Files", "*.mp3"),
            ("WAV Files", "*.wav"),
            ("FLAC Files", "*.flac"),
            ("All Files", "*.*")
        ]
        
        file_path = fd.askopenfilename(
            title="Select Audio File for Music Video",
            filetypes=file_types
        )
        
        if file_path:
            self.settings.audio_file_path = file_path
            self._update_audio_info(file_path)
    
    def _clear_audio_file(self):
        """Clear selected audio file."""
        self.settings.audio_file_path = ""
        self.audio_info_label.configure(text="No audio file selected")
        self.auto_duration_checkbox.deselect()
        self.settings.auto_duration = False
    
    def _update_audio_info(self, file_path: str):
        """Update audio file information display."""
        try:
            from audio_analyzer import AudioAnalyzer
            analyzer = AudioAnalyzer()
            
            # Quick analysis for display
            import os
            filename = os.path.basename(file_path)
            
            # Try to get duration
            try:
                from pydub import AudioSegment
                audio = AudioSegment.from_file(file_path)
                duration = len(audio) / 1000.0  # Convert to seconds
                minutes = int(duration // 60)
                seconds = int(duration % 60)
                duration_text = f"{minutes}:{seconds:02d}"
            except:
                duration_text = "Unknown"
                duration = 0
            
            info_text = f"📁 {filename}\n⏱️ Duration: {duration_text}"
            self.audio_info_label.configure(text=info_text)
            
            # Auto-update duration if checkbox is checked
            if self.auto_duration_var.get() and duration > 0:
                self.duration_slider.set(min(duration, 3600))  # Cap at 1 hour
                
        except Exception as e:
            self.audio_info_label.configure(text=f"Error loading file: {str(e)[:50]}...")
    
    def _on_auto_duration_change(self):
        """Handle auto-duration checkbox change."""
        self.settings.auto_duration = self.auto_duration_var.get()
        
        if self.auto_duration_var.get() and self.settings.audio_file_path:
            self._update_audio_info(self.settings.audio_file_path)
    
    def _update_duration_limits(self, content_type: str):
        """Update duration slider limits based on content type."""
        limits = VIDEO_DURATION_LIMITS.get(content_type, {"min": 20, "max": 90, "default": 30})
        
        # Update slider range
        self.duration_slider.configure(from_=limits["min"], to=limits["max"])
        self.duration_slider.set(limits["default"])
        
        # Update info label
        if content_type == "music_video":
            self.duration_info_label.configure(
                text=f"Range: {limits['min']}-{limits['max']} seconds (up to 5 minutes for music videos)"
            )
        else:
            self.duration_info_label.configure(
                text=f"Range: {limits['min']}-{limits['max']} seconds"
            )
        
        # Update display
        self._on_duration_change()
    
    def _on_duration_change(self, *args):
        """Update duration display when slider changes."""
        duration = self.duration_var.get()
        minutes = duration // 60
        seconds = duration % 60
        
        if minutes > 0:
            time_text = f"{minutes}m {seconds}s"
        else:
            time_text = f"{duration} seconds"
        
        self.duration_display.configure(text=time_text)
    
    def handle_generate(self):
        """Handle generate button click."""
        # Update settings from form
        self.settings.platform = self.platform_var.get()
        self.settings.niche = self.niche_entry.get()
        self.settings.target_audience = self.audience_entry.get()
        self.settings.tone = self.tone_var.get()
        self.settings.content_type = self.content_type_var.get()
        self.settings.keywords = self.keywords_entry.get()
        self.settings.video_style = self.video_style_var.get()
        self.settings.music_genre = self.music_genre_var.get()
        self.settings.video_duration = self.duration_var.get()
        self.settings.auto_duration = self.auto_duration_var.get()
        
        # Validate required fields
        valid, error_msg = validate_required_fields(
            self.settings.niche,
            self.settings.target_audience
        )
        
        if not valid:
            # Show error (in a real app, you'd use a proper dialog)
            print(f"Validation error: {error_msg}")
            return
        
        # Call the generate callback
        self.on_generate(self.settings)
    
    def handle_generate_video(self):
        """Handle generate video button click."""
        # Update settings from form
        self.settings.platform = self.platform_var.get()
        self.settings.niche = self.niche_entry.get()
        self.settings.target_audience = self.audience_entry.get()
        self.settings.tone = self.tone_var.get()
        self.settings.content_type = self.content_type_var.get()
        self.settings.keywords = self.keywords_entry.get()
        self.settings.video_style = self.video_style_var.get()
        self.settings.music_genre = self.music_genre_var.get()
        self.settings.video_duration = self.duration_var.get()
        self.settings.auto_duration = self.auto_duration_var.get()
        
        # Validate required fields
        valid, error_msg = validate_required_fields(
            self.settings.niche,
            self.settings.target_audience
        )
        
        if not valid:
            # Show error (in a real app, you'd use a proper dialog)
            print(f"Validation error: {error_msg}")
            return
        
        # Force content type to be video-related if not already
        if self.settings.content_type not in VIDEO_CONTENT_TYPES:
            self.settings.content_type = "marketing_video"
            self.content_type_var.set("marketing_video")
        
        # Call the generate callback with video-specific handling
        self.on_generate(self.settings)
    
    def set_loading(self, loading: bool):
        """Set loading state."""
        if loading:
            self.generate_button.configure(text="🔄 Generating...", state="disabled")
            self.generate_video_button.configure(text="🔄 Generating Video...", state="disabled")
        else:
            self.generate_button.configure(text="⚡ Generate Content", state="normal")
            self.generate_video_button.configure(text="🎬 Generate Video", state="normal")
    
    def get_settings(self) -> ContentSettings:
        """Get current settings."""
        return self.settings