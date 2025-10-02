"""
Redemption Marketing - Video Library Interface
Copyright (c) 2025 Redemption Road. All rights reserved.

Video library interface for managing marketing and music videos.
"""
import customtkinter as ctk
from typing import List, Callable, Optional
import os
from PIL import Image, ImageTk
from models import VideoProject, VideoLibraryManager
from utils import create_color_scheme, format_timestamp
import uuid


class VideoLibraryTab(ctk.CTkFrame):
    """Video library management interface."""
    
    def __init__(self, parent, **kwargs):
        super().__init__(parent, **kwargs)
        
        self.colors = create_color_scheme()
        self.library_manager = VideoLibraryManager()
        self.current_view = "marketing"  # marketing or music
        
        self.setup_ui()
        self.load_videos()
    
    def setup_ui(self):
        """Setup the video library UI."""
        self.configure(fg_color=self.colors['bg_secondary'])
        
        # Header
        header_frame = ctk.CTkFrame(self, fg_color="transparent")
        header_frame.pack(fill="x", padx=10, pady=(10, 5))
        
        ctk.CTkLabel(
            header_frame,
            text="🎬 Video Library",
            font=ctk.CTkFont(size=20, weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(side="left")
        
        # Library type toggle
        toggle_frame = ctk.CTkFrame(header_frame, fg_color=self.colors['bg_primary'])
        toggle_frame.pack(side="right")
        
        self.marketing_btn = ctk.CTkButton(
            toggle_frame,
            text="📈 Marketing Videos",
            command=lambda: self.switch_library("marketing"),
            fg_color=self.colors['bg_accent'],
            hover_color="#b91c1c",
            width=140
        )
        self.marketing_btn.pack(side="left", padx=2, pady=2)
        
        self.music_btn = ctk.CTkButton(
            toggle_frame,
            text="🎵 Music Videos",
            command=lambda: self.switch_library("music"),
            fg_color="transparent",
            text_color=self.colors['text_secondary'],
            hover_color=self.colors['bg_secondary'],
            width=140
        )
        self.music_btn.pack(side="left", padx=2, pady=2)
        
        # Toolbar
        toolbar_frame = ctk.CTkFrame(self, fg_color="transparent")
        toolbar_frame.pack(fill="x", padx=10, pady=5)
        
        ctk.CTkButton(
            toolbar_frame,
            text="➕ New Project",
            command=self.create_new_project,
            fg_color=self.colors['success'],
            hover_color="#059669",
            width=120
        ).pack(side="left", padx=(0, 5))
        
        ctk.CTkButton(
            toolbar_frame,
            text="📁 Import Video",
            command=self.import_video,
            fg_color=self.colors['bg_accent'],
            hover_color="#b91c1c",
            width=120
        ).pack(side="left", padx=5)
        
        # Search and filter
        search_frame = ctk.CTkFrame(toolbar_frame, fg_color="transparent")
        search_frame.pack(side="right")
        
        self.search_entry = ctk.CTkEntry(
            search_frame,
            placeholder_text="Search videos...",
            width=200
        )
        self.search_entry.pack(side="left", padx=5)
        
        # Video grid
        self.video_grid_frame = ctk.CTkScrollableFrame(self)
        self.video_grid_frame.pack(fill="both", expand=True, padx=10, pady=5)
        
        # Configure grid
        for i in range(5):  # 5 columns max
            self.video_grid_frame.grid_columnconfigure(i, weight=1)
    
    def switch_library(self, library_type: str):
        """Switch between marketing and music video libraries."""
        self.current_view = library_type
        
        # Update button states
        if library_type == "marketing":
            self.marketing_btn.configure(
                fg_color=self.colors['bg_accent'],
                text_color=self.colors['text_primary']
            )
            self.music_btn.configure(
                fg_color="transparent",
                text_color=self.colors['text_secondary']
            )
        else:
            self.music_btn.configure(
                fg_color=self.colors['bg_accent'],
                text_color=self.colors['text_primary']
            )
            self.marketing_btn.configure(
                fg_color="transparent",
                text_color=self.colors['text_secondary']
            )
        
        self.refresh_video_grid()
    
    def create_new_project(self):
        """Create a new video project."""
        dialog = VideoProjectDialog(self, self.current_view)
        project = dialog.get_project()
        
        if project:
            self.library_manager.add_video(project)
            self.refresh_video_grid()
    
    def import_video(self):
        """Import existing video file."""
        from tkinter import filedialog
        
        file_path = filedialog.askopenfilename(
            title="Import Video File",
            filetypes=[
                ("Video files", "*.mp4 *.avi *.mov *.mkv *.wmv"),
                ("All files", "*.*")
            ]
        )
        
        if file_path:
            # Create project from imported video
            project = VideoProject(
                id=str(uuid.uuid4()),
                title=os.path.splitext(os.path.basename(file_path))[0],
                content_type=f"{self.current_view}_video",
                duration=self._get_video_duration(file_path),
                created_date="",
                file_path=file_path,
                status="completed"
            )
            
            self.library_manager.add_video(project)
            self.refresh_video_grid()
    
    def _get_video_duration(self, file_path: str) -> float:
        """Get video duration from file."""
        try:
            from moviepy.editor import VideoFileClip
            with VideoFileClip(file_path) as clip:
                return clip.duration
        except Exception:
            return 0.0
    
    def load_videos(self):
        """Load videos from storage."""
        # In a real implementation, this would load from database/files
        self.refresh_video_grid()
    
    def refresh_video_grid(self):
        """Refresh the video grid display."""
        # Clear existing widgets
        for widget in self.video_grid_frame.winfo_children():
            widget.destroy()
        
        # Get videos for current view
        videos = self.library_manager.get_videos_by_type(f"{self.current_view}_video")
        
        if not videos:
            self._show_empty_state()
            return
        
        # Display videos in grid
        row, col = 0, 0
        for video in videos:
            video_card = self._create_video_card(video)
            video_card.grid(row=row, column=col, padx=5, pady=5, sticky="ew")
            
            col += 1
            if col >= 3:  # 3 videos per row
                col = 0
                row += 1
    
    def _create_video_card(self, video: VideoProject) -> ctk.CTkFrame:
        """Create a video card widget."""
        card = ctk.CTkFrame(
            self.video_grid_frame,
            fg_color=self.colors['bg_primary'],
            corner_radius=10
        )
        
        # Thumbnail area
        thumbnail_frame = ctk.CTkFrame(card, height=120, fg_color="#333")
        thumbnail_frame.pack(fill="x", padx=10, pady=(10, 5))
        
        # Placeholder thumbnail
        ctk.CTkLabel(
            thumbnail_frame,
            text="🎬",
            font=ctk.CTkFont(size=40),
            text_color=self.colors['text_secondary']
        ).pack(expand=True)
        
        # Video info
        info_frame = ctk.CTkFrame(card, fg_color="transparent")
        info_frame.pack(fill="x", padx=10, pady=5)
        
        # Title
        ctk.CTkLabel(
            info_frame,
            text=video.title[:30] + "..." if len(video.title) > 30 else video.title,
            font=ctk.CTkFont(weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(anchor="w")
        
        # Duration and status
        details_frame = ctk.CTkFrame(info_frame, fg_color="transparent")
        details_frame.pack(fill="x", pady=2)
        
        duration_text = f"{int(video.duration//60)}:{int(video.duration%60):02d}"
        ctk.CTkLabel(
            details_frame,
            text=f"⏱️ {duration_text}",
            font=ctk.CTkFont(size=10),
            text_color=self.colors['text_secondary']
        ).pack(side="left")
        
        status_colors = {
            "draft": "#f59e0b",
            "rendering": "#3b82f6", 
            "completed": "#10b981",
            "published": "#8b5cf6"
        }
        
        ctk.CTkLabel(
            details_frame,
            text=f"● {video.status.title()}",
            font=ctk.CTkFont(size=10),
            text_color=status_colors.get(video.status, self.colors['text_secondary'])
        ).pack(side="right")
        
        # Action buttons
        button_frame = ctk.CTkFrame(card, fg_color="transparent")
        button_frame.pack(fill="x", padx=10, pady=(0, 10))
        
        ctk.CTkButton(
            button_frame,
            text="✏️ Edit",
            command=lambda v=video: self.edit_video(v),
            fg_color=self.colors['bg_accent'],
            hover_color="#b91c1c",
            width=60,
            height=25
        ).pack(side="left", padx=(0, 5))
        
        ctk.CTkButton(
            button_frame,
            text="▶️ Preview",
            command=lambda v=video: self.preview_video(v),
            fg_color=self.colors['success'],
            hover_color="#059669",
            width=60,
            height=25
        ).pack(side="left", padx=5)
        
        return card
    
    def _show_empty_state(self):
        """Show empty state when no videos exist."""
        empty_frame = ctk.CTkFrame(self.video_grid_frame, fg_color="transparent")
        empty_frame.pack(expand=True, fill="both", pady=50)
        
        icon = "📈" if self.current_view == "marketing" else "🎵"
        ctk.CTkLabel(
            empty_frame,
            text=icon,
            font=ctk.CTkFont(size=48)
        ).pack(pady=10)
        
        ctk.CTkLabel(
            empty_frame,
            text=f"No {self.current_view} videos yet",
            font=ctk.CTkFont(size=18, weight="bold"),
            text_color=self.colors['text_secondary']
        ).pack(pady=5)
        
        ctk.CTkLabel(
            empty_frame,
            text="Create your first video project to get started",
            text_color=self.colors['text_secondary']
        ).pack()
    
    def edit_video(self, video: VideoProject):
        """Edit video project."""
        print(f"Editing video: {video.title}")
        # TODO: Implement video editor
    
    def preview_video(self, video: VideoProject):
        """Preview video."""
        print(f"Previewing video: {video.title}")
        # TODO: Implement video preview


class VideoProjectDialog(ctk.CTkToplevel):
    """Dialog for creating new video projects."""
    
    def __init__(self, parent, project_type: str):
        super().__init__(parent)
        
        self.project_type = project_type
        self.result = None
        self.colors = create_color_scheme()
        
        self.setup_dialog()
    
    def setup_dialog(self):
        """Setup dialog UI."""
        self.title(f"New {self.project_type.title()} Video Project")
        self.geometry("400x300")
        self.configure(fg_color=self.colors['bg_secondary'])
        
        # Title
        ctk.CTkLabel(
            self,
            text=f"Create {self.project_type.title()} Video",
            font=ctk.CTkFont(size=18, weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(pady=20)
        
        # Project name
        ctk.CTkLabel(
            self,
            text="Project Name:",
            text_color=self.colors['text_primary']
        ).pack(anchor="w", padx=20)
        
        self.name_entry = ctk.CTkEntry(
            self,
            placeholder_text="Enter project name...",
            width=350
        )
        self.name_entry.pack(padx=20, pady=5)
        
        # Duration
        ctk.CTkLabel(
            self,
            text="Estimated Duration (seconds):",
            text_color=self.colors['text_primary']
        ).pack(anchor="w", padx=20, pady=(10, 0))
        
        self.duration_entry = ctk.CTkEntry(
            self,
            placeholder_text="30",
            width=350
        )
        self.duration_entry.pack(padx=20, pady=5)
        
        # Buttons
        button_frame = ctk.CTkFrame(self, fg_color="transparent")
        button_frame.pack(pady=20)
        
        ctk.CTkButton(
            button_frame,
            text="Create",
            command=self.create_project,
            fg_color=self.colors['success'],
            hover_color="#059669"
        ).pack(side="left", padx=10)
        
        ctk.CTkButton(
            button_frame,
            text="Cancel",
            command=self.destroy,
            fg_color=self.colors['bg_primary'],
            hover_color="#374151"
        ).pack(side="left", padx=10)
    
    def create_project(self):
        """Create the project."""
        name = self.name_entry.get().strip()
        if not name:
            return
        
        try:
            duration = float(self.duration_entry.get() or "30")
        except ValueError:
            duration = 30.0
        
        self.result = VideoProject(
            id=str(uuid.uuid4()),
            title=name,
            content_type=f"{self.project_type}_video",
            duration=duration,
            created_date="",
            status="draft"
        )
        
        self.destroy()
    
    def get_project(self) -> Optional[VideoProject]:
        """Get the created project."""
        self.wait_window()
        return self.result