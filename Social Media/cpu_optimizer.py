"""
Redemption Marketing - CPU Optimization Utilities
Copyright (c) 2025 Redemption Road. All rights reserved.

CPU optimization and performance utilities for video generation.
"""
import psutil
import multiprocessing
import threading
import os
from typing import Optional
import torch


class CPUOptimizer:
    """Optimizes CPU usage for video generation and AI processing."""
    
    def __init__(self):
        self.cpu_count = multiprocessing.cpu_count()
        self.optimal_threads = self._calculate_optimal_threads()
        self.process_priority = self._get_optimal_priority()
        
    def _calculate_optimal_threads(self) -> int:
        """Calculate optimal number of threads for video processing."""
        # Use 75% of available cores, minimum 2, maximum 8 for stability
        optimal = max(2, min(8, int(self.cpu_count * 0.75)))
        return optimal
    
    def _get_optimal_priority(self) -> str:
        """Get optimal process priority based on system load."""
        cpu_percent = psutil.cpu_percent(interval=1)
        memory_percent = psutil.virtual_memory().percent
        
        if cpu_percent < 30 and memory_percent < 70:
            return "high"
        elif cpu_percent < 60 and memory_percent < 85:
            return "normal"
        else:
            return "below_normal"
    
    def optimize_process_priority(self):
        """Set optimal process priority for video generation."""
        try:
            import psutil
            current_process = psutil.Process()
            
            if self.process_priority == "high":
                current_process.nice(psutil.HIGH_PRIORITY_CLASS if os.name == 'nt' else -10)
            elif self.process_priority == "below_normal":
                current_process.nice(psutil.BELOW_NORMAL_PRIORITY_CLASS if os.name == 'nt' else 10)
            
        except Exception as e:
            print(f"Could not set process priority: {e}")
    
    def configure_torch_settings(self):
        """Configure PyTorch for optimal performance."""
        if torch.cuda.is_available():
            # Use GPU if available
            torch.backends.cudnn.benchmark = True
            torch.backends.cudnn.enabled = True
        else:
            # Optimize CPU settings
            torch.set_num_threads(self.optimal_threads)
            torch.set_num_interop_threads(self.optimal_threads)
    
    def get_system_info(self) -> dict:
        """Get system performance information."""
        return {
            "cpu_count": self.cpu_count,
            "optimal_threads": self.optimal_threads,
            "cpu_percent": psutil.cpu_percent(),
            "memory_percent": psutil.virtual_memory().percent,
            "available_memory_gb": round(psutil.virtual_memory().available / (1024**3), 2),
            "gpu_available": torch.cuda.is_available(),
            "gpu_count": torch.cuda.device_count() if torch.cuda.is_available() else 0
        }
    
    def monitor_performance(self, callback=None):
        """Monitor system performance during video generation."""
        def monitor():
            while True:
                stats = {
                    "cpu": psutil.cpu_percent(interval=5),
                    "memory": psutil.virtual_memory().percent,
                    "disk_io": psutil.disk_io_counters()._asdict() if psutil.disk_io_counters() else {}
                }
                
                if callback:
                    callback(stats)
                
                threading.Event().wait(5)  # Wait 5 seconds
        
        monitor_thread = threading.Thread(target=monitor, daemon=True)
        monitor_thread.start()
        return monitor_thread


class VideoRenderOptimizer:
    """Optimizes video rendering performance."""
    
    def __init__(self, cpu_optimizer: CPUOptimizer):
        self.cpu_optimizer = cpu_optimizer
        self.render_settings = self._get_optimal_render_settings()
    
    def _get_optimal_render_settings(self) -> dict:
        """Get optimal rendering settings based on system capabilities."""
        system_info = self.cpu_optimizer.get_system_info()
        
        if system_info["gpu_available"] and system_info["available_memory_gb"] > 8:
            # High-end system with GPU
            return {
                "codec": "h264_nvenc",  # GPU accelerated
                "threads": self.cpu_optimizer.optimal_threads,
                "preset": "medium",
                "crf": 23,
                "audio_codec": "aac",
                "audio_bitrate": "128k"
            }
        elif system_info["available_memory_gb"] > 4:
            # Mid-range system
            return {
                "codec": "libx264",
                "threads": self.cpu_optimizer.optimal_threads,
                "preset": "fast",
                "crf": 25,
                "audio_codec": "aac",
                "audio_bitrate": "128k"
            }
        else:
            # Lower-end system
            return {
                "codec": "libx264",
                "threads": min(4, self.cpu_optimizer.optimal_threads),
                "preset": "ultrafast",
                "crf": 28,
                "audio_codec": "aac",
                "audio_bitrate": "96k"
            }
    
    def get_moviepy_settings(self) -> dict:
        """Get optimized settings for MoviePy."""
        return {
            "threads": self.render_settings["threads"],
            "codec": self.render_settings["codec"],
            "audio_codec": self.render_settings["audio_codec"],
            "preset": self.render_settings["preset"]
        }
    
    def estimate_render_time(self, video_duration: float, complexity: str = "medium") -> float:
        """Estimate video rendering time in minutes."""
        system_info = self.cpu_optimizer.get_system_info()
        
        # Base time per minute of video
        base_times = {
            "simple": 0.5,    # Static images, simple transitions
            "medium": 1.2,    # Some effects, text overlays
            "complex": 2.5    # Multiple effects, transitions, overlays
        }
        
        base_time = base_times.get(complexity, 1.2)
        
        # Adjust for system performance
        if system_info["gpu_available"]:
            base_time *= 0.6  # GPU acceleration
        
        if system_info["cpu_count"] >= 8:
            base_time *= 0.8  # Multi-core advantage
        
        if system_info["available_memory_gb"] < 4:
            base_time *= 1.5  # Memory limitation
        
        return video_duration * base_time


# Global optimizer instance
cpu_optimizer = CPUOptimizer()
video_render_optimizer = VideoRenderOptimizer(cpu_optimizer)