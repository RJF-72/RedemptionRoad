"""
Redemption Marketing - Audio Analysis Utility
Copyright (c) 2025 Redemption Road. All rights reserved.

Audio file analysis for full-length music video generation.
"""
import os
from typing import Optional, Dict, List
import librosa
import numpy as np
from pydub import AudioSegment
from mutagen import File as MutagenFile
from models import SUPPORTED_AUDIO_FORMATS


class AudioAnalyzer:
    """Analyzes audio files for music video generation."""
    
    def __init__(self):
        self.sample_rate = 22050
    
    def analyze_audio_file(self, file_path: str) -> Optional[Dict]:
        """Analyze audio file and extract useful information."""
        if not self._is_supported_format(file_path):
            return None
        
        try:
            # Basic file info
            file_info = self._get_file_info(file_path)
            
            # Load audio for analysis
            y, sr = librosa.load(file_path, sr=self.sample_rate)
            
            # Extract features
            analysis = {
                "file_path": file_path,
                "duration": file_info["duration"],
                "title": file_info.get("title", "Unknown"),
                "artist": file_info.get("artist", "Unknown"),
                "genre": file_info.get("genre", "Unknown"),
                "tempo": self._get_tempo(y, sr),
                "key": self._get_key(y, sr),
                "energy_sections": self._analyze_energy_sections(y, sr),
                "beat_times": self._get_beat_times(y, sr),
                "structural_segments": self._get_structural_segments(y, sr),
                "recommended_scenes": self._calculate_scene_count(file_info["duration"])
            }
            
            return analysis
            
        except Exception as e:
            print(f"Error analyzing audio file: {e}")
            return None
    
    def _is_supported_format(self, file_path: str) -> bool:
        """Check if audio format is supported."""
        _, ext = os.path.splitext(file_path.lower())
        return ext in SUPPORTED_AUDIO_FORMATS
    
    def _get_file_info(self, file_path: str) -> Dict:
        """Get basic file information using mutagen."""
        try:
            audio_file = MutagenFile(file_path)
            if audio_file is None:
                # Fallback to pydub
                audio = AudioSegment.from_file(file_path)
                return {"duration": len(audio) / 1000.0}
            
            info = {
                "duration": audio_file.info.length if hasattr(audio_file.info, 'length') else 0,
                "title": str(audio_file.get('TIT2', ['Unknown'])[0]) if audio_file.get('TIT2') else "Unknown",
                "artist": str(audio_file.get('TPE1', ['Unknown'])[0]) if audio_file.get('TPE1') else "Unknown",
                "genre": str(audio_file.get('TCON', ['Unknown'])[0]) if audio_file.get('TCON') else "Unknown"
            }
            
            return info
            
        except Exception as e:
            print(f"Error getting file info: {e}")
            # Fallback to pydub
            try:
                audio = AudioSegment.from_file(file_path)
                return {"duration": len(audio) / 1000.0}
            except:
                return {"duration": 0}
    
    def _get_tempo(self, y: np.ndarray, sr: int) -> float:
        """Extract tempo (BPM) from audio."""
        try:
            tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
            return float(tempo)
        except:
            return 120.0  # Default BPM
    
    def _get_key(self, y: np.ndarray, sr: int) -> str:
        """Estimate musical key."""
        try:
            # Simple chromagram-based key estimation
            chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
            key_profiles = self._get_key_profiles()
            
            # Calculate correlation with key profiles
            correlations = []
            for key_name, profile in key_profiles.items():
                correlation = np.corrcoef(chroma.mean(axis=1), profile)[0, 1]
                correlations.append((correlation, key_name))
            
            # Return key with highest correlation
            correlations.sort(reverse=True)
            return correlations[0][1]
            
        except:
            return "C Major"  # Default key
    
    def _get_key_profiles(self) -> Dict[str, List[float]]:
        """Get major and minor key profiles."""
        # Simplified key profiles (Krumhansl-Schmuckler)
        major_profile = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]
        minor_profile = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]
        
        keys = {}
        key_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        
        for i, key in enumerate(key_names):
            # Rotate profiles for different keys
            major = major_profile[i:] + major_profile[:i]
            minor = minor_profile[i:] + minor_profile[:i]
            keys[f"{key} Major"] = major
            keys[f"{key} Minor"] = minor
        
        return keys
    
    def _analyze_energy_sections(self, y: np.ndarray, sr: int) -> List[Dict]:
        """Analyze energy levels throughout the song."""
        try:
            # Calculate RMS energy
            rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=512)[0]
            
            # Smooth the energy curve
            rms_smooth = librosa.util.fix_length(rms, size=len(rms), mode='edge')
            
            # Divide into sections and calculate average energy
            section_length = len(rms_smooth) // 8  # 8 sections
            sections = []
            
            for i in range(8):
                start_idx = i * section_length
                end_idx = (i + 1) * section_length if i < 7 else len(rms_smooth)
                
                section_energy = np.mean(rms_smooth[start_idx:end_idx])
                start_time = (start_idx * 512) / sr
                end_time = (end_idx * 512) / sr
                
                # Classify energy level
                if section_energy > np.percentile(rms_smooth, 75):
                    energy_level = "high"
                elif section_energy > np.percentile(rms_smooth, 25):
                    energy_level = "medium"
                else:
                    energy_level = "low"
                
                sections.append({
                    "start_time": start_time,
                    "end_time": end_time,
                    "energy_level": energy_level,
                    "energy_value": float(section_energy)
                })
            
            return sections
            
        except Exception as e:
            print(f"Error analyzing energy sections: {e}")
            return []
    
    def _get_beat_times(self, y: np.ndarray, sr: int) -> List[float]:
        """Get beat times for synchronization."""
        try:
            tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units='time')
            return beats.tolist()
        except:
            return []
    
    def _get_structural_segments(self, y: np.ndarray, sr: int) -> List[Dict]:
        """Identify structural segments (verse, chorus, etc.)."""
        try:
            # Simple segmentation based on novelty
            chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
            novelty = librosa.segment.recurrence_matrix(chroma, mode='affinity')
            boundaries = librosa.segment.agglomerative(novelty, k=6)  # 6 segments max
            
            segment_times = librosa.frames_to_time(boundaries, sr=sr)
            
            segments = []
            segment_labels = ['intro', 'verse1', 'chorus1', 'verse2', 'chorus2', 'outro']
            
            for i, (start_time, end_time) in enumerate(zip(segment_times[:-1], segment_times[1:])):
                label = segment_labels[i] if i < len(segment_labels) else f"segment_{i+1}"
                segments.append({
                    "label": label,
                    "start_time": float(start_time),
                    "end_time": float(end_time),
                    "duration": float(end_time - start_time)
                })
            
            return segments
            
        except Exception as e:
            print(f"Error analyzing structural segments: {e}")
            return []
    
    def _calculate_scene_count(self, duration: float) -> int:
        """Calculate recommended number of scenes based on duration."""
        # Base formula: 1 scene per 8-12 seconds, with minimum scenes
        base_scenes = max(int(duration / 10), 6)  # Minimum 6 scenes
        
        # Add extra scenes for longer videos
        if duration > 180:  # 3 minutes
            base_scenes += int((duration - 180) / 15)  # Extra scene every 15s after 3min
        
        return min(base_scenes, 50)  # Cap at 50 scenes for very long videos
    
    def generate_scene_timeline(self, analysis: Dict, total_scenes: int) -> List[Dict]:
        """Generate detailed scene timeline based on audio analysis."""
        duration = analysis["duration"]
        energy_sections = analysis.get("energy_sections", [])
        structural_segments = analysis.get("structural_segments", [])
        beat_times = analysis.get("beat_times", [])
        
        scenes = []
        scene_duration = duration / total_scenes
        
        for i in range(total_scenes):
            start_time = i * scene_duration
            end_time = min((i + 1) * scene_duration, duration)
            
            # Determine scene characteristics based on audio
            scene_energy = self._get_scene_energy(start_time, end_time, energy_sections)
            scene_segment = self._get_scene_segment(start_time, structural_segments)
            
            # Generate scene description based on characteristics
            scene_type = self._determine_scene_type(scene_energy, scene_segment, i, total_scenes)
            
            scenes.append({
                "scene_number": i + 1,
                "start_time": start_time,
                "end_time": end_time,
                "duration": end_time - start_time,
                "energy_level": scene_energy,
                "segment_type": scene_segment,
                "scene_type": scene_type,
                "description": self._generate_scene_description(scene_type, scene_energy, i + 1)
            })
        
        return scenes
    
    def _get_scene_energy(self, start_time: float, end_time: float, energy_sections: List[Dict]) -> str:
        """Get energy level for scene timeframe."""
        for section in energy_sections:
            if section["start_time"] <= start_time < section["end_time"]:
                return section["energy_level"]
        return "medium"
    
    def _get_scene_segment(self, start_time: float, structural_segments: List[Dict]) -> str:
        """Get structural segment type for scene."""
        for segment in structural_segments:
            if segment["start_time"] <= start_time < segment["end_time"]:
                return segment["label"]
        return "main"
    
    def _determine_scene_type(self, energy: str, segment: str, scene_num: int, total_scenes: int) -> str:
        """Determine scene type based on audio characteristics."""
        if scene_num == 1:
            return "opening"
        elif scene_num == total_scenes:
            return "closing"
        elif energy == "high":
            return "performance_high_energy"
        elif energy == "low":
            return "atmospheric"
        elif "chorus" in segment:
            return "performance_focus"
        elif "verse" in segment:
            return "narrative"
        else:
            return "transition"
    
    def _generate_scene_description(self, scene_type: str, energy: str, scene_num: int) -> str:
        """Generate description for scene based on type and energy."""
        descriptions = {
            "opening": f"Scene {scene_num}: Atmospheric opening - Set the mood with {energy} energy introduction",
            "closing": f"Scene {scene_num}: Powerful finale - Memorable closing with emotional impact",
            "performance_high_energy": f"Scene {scene_num}: Dynamic performance - High-energy choreography and movement",
            "performance_focus": f"Scene {scene_num}: Artist spotlight - Close-up performance with strong visual impact",
            "atmospheric": f"Scene {scene_num}: Cinematic atmosphere - Moody visuals with {energy} energy pacing",
            "narrative": f"Scene {scene_num}: Story development - Visual storytelling with narrative elements",
            "transition": f"Scene {scene_num}: Creative transition - Smooth visual flow between concepts"
        }
        
        return descriptions.get(scene_type, f"Scene {scene_num}: Creative visual sequence with {energy} energy")