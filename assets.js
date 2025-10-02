// Assumes React and ReactDOM are loaded globally via CDN in the HTML.
// No module imports required; icons are implemented as lightweight inline components.
const { useState, useEffect, useRef, useCallback } = React;

// Minimal inline icon components (replace lucide-react)
const Icon = ({ children, className, title }) => (
  React.createElement('span', { className, title }, children)
);
const Play = (p) => Icon({ ...p, children: '▶' });
const Square = (p) => Icon({ ...p, children: '■' });
const Settings = (p) => Icon({ ...p, children: '⚙️' });
const Save = (p) => Icon({ ...p, children: '💾' });
const Music = (p) => Icon({ ...p, children: '🎵' });
const Zap = (p) => Icon({ ...p, children: '⚡' });
const Download = (p) => Icon({ ...p, children: '⬇' });
const Plus = (p) => Icon({ ...p, children: '+' });
const Trash2 = (p) => Icon({ ...p, children: '🗑' });
const Edit3 = (p) => Icon({ ...p, children: '✏️' });
const Home = (p) => Icon({ ...p, children: '🏠' });
const ArrowLeft = (p) => Icon({ ...p, children: '←' });

// 🎨 PROFESSIONAL 8K STYLING CONSTANTS
const PROFESSIONAL_THEME = {
  colors: {
    primary: '#22d3ee', // cyan
    secondary: '#a855f7', // fuchsia/purple
    accent: '#0ea5e9', // sky
    background: 'linear-gradient(145deg, #0a0f1f 0%, #0b1225 40%, #0a0f1f 100%)',
    cardBackground: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
    border: 'rgba(103,232,249,0.25)',
    text: '#e5e7eb',
    textSecondary: 'rgba(229,231,235,0.7)',
    error: '#f87171',
    success: '#34d399'
  },
  effects: {
    glow: '0 0 30px rgba(103,232,249,0.35)',
    shadowLarge: '0 20px 60px rgba(0,0,0,0.5)',
    backdropBlur: 'blur(40px)'
  }
};

// 🔒 COPYRIGHT PROTECTION COMPONENT
const CopyrightProtection = () => {
  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e) => {
      e.preventDefault();
      alert('🔒 Content Protected - This software is strictly copyrighted and licensed.');
    };
    
    // Disable key combinations
    const handleKeyDown = (e) => {
      if (e.ctrlKey && (e.key === 's' || e.key === 'a' || e.key === 'c' || e.key === 'v' || e.key === 'u' || e.key === 'p')) {
        e.preventDefault();
        alert('🔒 Action Disabled - Unauthorized copying/printing is prohibited.');
      }
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
        alert('🔒 Developer Tools Disabled - Content protection active.');
      }
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  return null;
};

// 🏠 NAVIGATION HEADER COMPONENT  
const NavigationHeader = () => {
  const goToMainHub = () => {
    window.location.href = 'index.html';
  };
  
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(5,8,12,0.95) 0%, rgba(10,10,15,0.95) 100%)',
      backdropFilter: 'blur(40px)',
      borderBottom: '2px solid rgba(56,189,248,0.35)',
      padding: '20px 40px',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 10px 50px rgba(0,0,0,0.5)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1920px',
        margin: '0 auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={goToMainHub}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(56,189,248,0.45)',
              borderRadius: '12px',
              padding: '12px 20px',
              color: '#e5faff',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(56,189,248,0.35)';
              e.currentTarget.style.background = 'rgba(56,189,248,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            }}
          >
            <Home size={16} />
            SOTA Hub
          </button>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #a21caf 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              boxShadow: '0 0 30px rgba(6,182,212,0.35)'
            }}>
              🎹
            </div>
            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #67e8f9 0%, #e879f9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: 0
              }}>
                SOTA Professional Synthesizer
              </h1>
              <p style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.8)',
                margin: 0,
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>
                AI-Powered Music Creation Suite
              </p>
            </div>
          </div>
        </div>
        <div style={{
          display: 'flex',
          gap: '15px',
          alignItems: 'center'
        }}>
          <div style={{
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(56,189,248,0.35)',
            borderRadius: '8px',
            color: '#67e8f9',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            🔒 Licensed Software
          </div>
          <button
            onClick={() => alert('🔒 SOTA Professional Synthesizer License\n\nPrice: $299/year\n\n✅ Features:\n• AI Composition Engine\n• Voice-to-MIDI Technology\n• Premium Genre Packs\n• Commercial Music Rights\n• Professional Audio Effects\n\n⚖️ Strict Licensing:\n• No free usage permitted\n• Commercial license required\n• Educational discounts available\n\nContact sales for licensing.')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(56,189,248,0.45)',
              borderRadius: '8px',
              padding: '8px 16px',
              color: '#67e8f9',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(56,189,248,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            View License
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to create reverb impulse response
const createReverbImpulse = (audioContext, duration, decay, reverse) => {
  const sampleRate = audioContext.sampleRate;
  const length = sampleRate * duration;
  const impulse = audioContext.createBuffer(2, length, sampleRate);
  
  for (let channel = 0; channel < 2; channel++) {
    const channelData = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      const n = reverse ? length - i : i;
      channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    }
  }
  
  return impulse;
};

const CountryMusicWorkstation = () => {
  // Self-test visibility via query param (?selftest=1) or global flag
  const isSelfTest = (() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('selftest') === '1' || window.SOTA_SELF_TEST === true;
    } catch (_) {
      return false;
    }
  })();
  const [selfTestLogs, setSelfTestLogs] = useState([]);
  const logSelfTest = (msg) => setSelfTestLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} ${msg}`].slice(-200));

  const [polyphonyCount, setPolyphonyCount] = useState(0);
  const maxPolyphony = 512;
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeInstruments, setActiveInstruments] = useState(['acoustic-guitar']);
  const [currentBPM, setCurrentBPM] = useState(120);
  const [currentKey, setCurrentKey] = useState('G');
  const [songTitle, setSongTitle] = useState('');
  const [songLyrics, setSongLyrics] = useState('');
  const [songDescription, setSongDescription] = useState('');
  const [showSongEditor, setShowSongEditor] = useState(false);
  const [selectedChordProg, setSelectedChordProg] = useState('country-classic');
  const [currentSequence, setCurrentSequence] = useState([]);
  const [audioError, setAudioError] = useState(null);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [keyboardOctave, setKeyboardOctave] = useState(4);
  const [recentlyPlayedKeys, setRecentlyPlayedKeys] = useState(new Set());
  const [showHelp, setShowHelp] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);
  const [detectedPitch, setDetectedPitch] = useState(null);
  const [voiceNotes, setVoiceNotes] = useState([]);
  const [isListeningToVoice, setIsListeningToVoice] = useState(false);
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [aiComposerActive, setAiComposerActive] = useState(false);
  const [generatedMelody, setGeneratedMelody] = useState([]);
  const [compositionStyle, setCompositionStyle] = useState('country-ballad');
  // Creativity as a percentage (0-100) for UI consistency
  const [aiCreativity, setAiCreativity] = useState(70);
  
  const [instrumentVolumes, setInstrumentVolumes] = useState({
    'acoustic-guitar': 0.7,
    'steel-guitar': 0.6,
    'fiddle': 0.7,
    'banjo': 0.6,
    'piano': 0.6,
    'bass': 0.7,
    'harmonica': 0.5,
    'mandolin': 0.6,
    'dobro': 0.6,
    'pedal-steel': 0.6
  });
  
  const audioContextRef = useRef(null);
  const masterGainRef = useRef(null);
  const reverbRef = useRef(null);
  const delayRef = useRef(null);
  const compressorRef = useRef(null);
  const microphoneRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const pitchDetectionRef = useRef(null);
  const activeVoicesRef = useRef(new Map());
  const sequenceIntervalRef = useRef(null);
  const cleanupFunctionsRef = useRef(new Set());
  const aiComposerIntervalRef = useRef(null);
  const lastUserInputRef = useRef(Date.now());
  
  // 🤖 AI COMPOSITION STYLES - EXPANDED COUNTRY SUBGENRES
  const compositionStyles = {
    'country-ballad': {
      name: 'Country Ballad',
      tempo: [70, 90],
      scalePattern: [0, 2, 4, 5, 7, 9, 11], // Major scale
      rhythmPattern: [1, 0.5, 1, 0.5], // Quarter, eighth, quarter, eighth
      chordTendency: 0.7, // Likelihood to use chord tones
      stepwise: 0.8 // Preference for stepwise motion
    },
    'bluegrass-fiddle': {
      name: 'Bluegrass Fiddle',
      tempo: [120, 160],
      scalePattern: [0, 2, 4, 5, 7, 9, 11, 12, 14], // Major with upper octave
      rhythmPattern: [0.5, 0.5, 0.25, 0.25, 0.5], // Fast picking pattern
      chordTendency: 0.6,
      stepwise: 0.5 // More jumpy melodies
    },
    'honky-tonk': {
      name: 'Honky Tonk',
      tempo: [100, 130],
      scalePattern: [0, 2, 3, 4, 5, 7, 9, 10, 11], // Blues-influenced
      rhythmPattern: [1, 0.5, 0.5, 1], // Swing feel
      chordTendency: 0.8,
      stepwise: 0.6
    },
    'modern-country': {
      name: 'Modern Country Pop',
      tempo: [80, 120],
      scalePattern: [0, 2, 4, 5, 7, 9, 11], // Clean major
      rhythmPattern: [1, 1, 0.5, 0.5, 1], // Pop rhythm
      chordTendency: 0.9,
      stepwise: 0.7
    },
    'outlaw-country': {
      name: 'Outlaw Country',
      tempo: [90, 120],
      scalePattern: [0, 2, 3, 5, 7, 9, 10], // Minor pentatonic influence
      rhythmPattern: [1, 0.75, 0.25, 1], // Syncopated swagger
      chordTendency: 0.6,
      stepwise: 0.5
    },
    'country-rock': {
      name: 'Country Rock',
      tempo: [110, 140],
      scalePattern: [0, 2, 4, 5, 7, 9, 11], // Major with rock edge
      rhythmPattern: [0.5, 0.5, 1, 0.5, 0.5], // Driving rock rhythm
      chordTendency: 0.7,
      stepwise: 0.6
    },
    'alt-country': {
      name: 'Alternative Country',
      tempo: [85, 115],
      scalePattern: [0, 2, 3, 5, 7, 8, 11], // Dorian mode influence
      rhythmPattern: [1, 0.5, 0.5, 0.75, 0.25], // Irregular timing
      chordTendency: 0.5,
      stepwise: 0.7
    },
    'country-folk': {
      name: 'Country Folk',
      tempo: [60, 85],
      scalePattern: [0, 2, 4, 5, 7, 9, 11], // Pure major
      rhythmPattern: [1, 1, 1, 1], // Simple quarter notes
      chordTendency: 0.8,
      stepwise: 0.9
    },
    'nashville-sound': {
      name: 'Nashville Sound',
      tempo: [75, 105],
      scalePattern: [0, 2, 4, 5, 7, 9, 11], // Polished major
      rhythmPattern: [1, 0.5, 1, 0.5], // Smooth production
      chordTendency: 0.9,
      stepwise: 0.8
    },
    'texas-country': {
      name: 'Texas Country',
      tempo: [95, 125],
      scalePattern: [0, 2, 4, 5, 7, 9, 10, 11], // Mix major/minor
      rhythmPattern: [1, 0.5, 0.5, 0.75, 0.25], // Loose feel
      chordTendency: 0.6,
      stepwise: 0.6
    }
  };
  
  // Initialize audio context with proper error handling
  const initializeAudioContext = useCallback(async () => {
    try {
      // Check if Web Audio API is supported
      if (!window.AudioContext && !window.webkitAudioContext) {
        throw new Error('Web Audio API is not supported in this browser');
      }
      
      if (!audioContextRef.current) {
  audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        
        // Handle audio context state changes
        const handleStateChange = () => {
          if (audioContextRef.current.state === 'running') {
            setIsAudioInitialized(true);
            setAudioError(null);
          }
        };
        
        audioContextRef.current.addEventListener('statechange', handleStateChange);
        
        // Create master gain node
        masterGainRef.current = audioContextRef.current.createGain();
        masterGainRef.current.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
        
        // Create effects chain
        compressorRef.current = audioContextRef.current.createDynamicsCompressor();
        compressorRef.current.threshold.setValueAtTime(-24, audioContextRef.current.currentTime);
        compressorRef.current.knee.setValueAtTime(30, audioContextRef.current.currentTime);
        compressorRef.current.ratio.setValueAtTime(12, audioContextRef.current.currentTime);
        compressorRef.current.attack.setValueAtTime(0.003, audioContextRef.current.currentTime);
        compressorRef.current.release.setValueAtTime(0.25, audioContextRef.current.currentTime);
        
        delayRef.current = audioContextRef.current.createDelay(1.0);
        delayRef.current.delayTime.setValueAtTime(0.3, audioContextRef.current.currentTime);
        
        const delayGain = audioContextRef.current.createGain();
        delayGain.gain.setValueAtTime(0.15, audioContextRef.current.currentTime);
        
        const delayFeedback = audioContextRef.current.createGain();
        delayFeedback.gain.setValueAtTime(0.4, audioContextRef.current.currentTime);
        
        // Create a simple reverb using convolution
        try {
          reverbRef.current = audioContextRef.current.createConvolver();
          const reverbBuffer = createReverbImpulse(audioContextRef.current, 2, 2, false);
          reverbRef.current.buffer = reverbBuffer;
        } catch (e) {
          console.warn('Could not create reverb:', e);
        }
        
        const reverbGain = audioContextRef.current.createGain();
        reverbGain.gain.setValueAtTime(0.2, audioContextRef.current.currentTime);
        
        // Connect effects chain: compressor -> delay -> reverb -> master
        compressorRef.current.connect(delayRef.current);
        delayRef.current.connect(delayGain);
        delayGain.connect(delayFeedback);
        delayFeedback.connect(delayRef.current);
        
        if (reverbRef.current) {
          delayRef.current.connect(reverbRef.current);
          reverbRef.current.connect(reverbGain);
          reverbGain.connect(masterGainRef.current);
        } else {
          delayRef.current.connect(masterGainRef.current);
        }
        
        masterGainRef.current.connect(audioContextRef.current.destination);
        
        // Resume context if suspended
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        
        setIsAudioInitialized(true);
        setAudioError(null);
      }
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      setAudioError(error.message);
      setIsAudioInitialized(false);
    }
  }, []);
  
  // Keyboard shortcuts and QWERTY piano mapping
  useEffect(() => {
  const keyToFrequency = {
      'a': 261.63, // C
      'w': 277.18, // C#
      's': 293.66, // D
      'e': 311.13, // D#
      'd': 329.63, // E
      'f': 349.23, // F
      't': 369.99, // F#
      'g': 392.00, // G
      'y': 415.30, // G#
      'h': 440.00, // A
      'u': 466.16, // A#
      'j': 493.88, // B
      'k': 523.25, // C5
    };
    
  const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      
      // 🥁 DRUM KIT CONTROLS FIRST (highest priority)
      const drumKey = Object.entries(drumKit).find(([_, drum]) => drum.key.toLowerCase() === key);
      if (drumKey && !event.repeat) {
        event.preventDefault();
  playDrum(drumKey[0], 0.8);
        trackUserInput();
        return;
      }
      
      // Prevent default for our keys
      if (keyToFrequency[key] && !recentlyPlayedKeys.has(key)) {
        event.preventDefault();
        setRecentlyPlayedKeys(prev => new Set(prev.add(key)));
        playNote(keyToFrequency[key] * Math.pow(2, keyboardOctave - 4));
        trackUserInput();
      }
      
      // Global shortcuts
      switch (key) {
        case ' ':
          event.preventDefault();
          if (isPlaying) {
            stopSequence();
          } else {
            playSequence();
          }
          trackUserInput();
          break;
        case 'escape':
          event.preventDefault();
          stopSequence();
          if (drumPatternPlaying) stopDrumPattern();
          if (aiComposerActive) stopAIComposition();
          trackUserInput();
          break;
        case 'arrowup':
          event.preventDefault();
          setKeyboardOctave(prev => Math.min(7, prev + 1));
          trackUserInput();
          break;
        case 'arrowdown':
          event.preventDefault();
          setKeyboardOctave(prev => Math.max(1, prev - 1));
          trackUserInput();
          break;
      }
    };
    
  const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      if (keyToFrequency[key]) {
        setRecentlyPlayedKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, keyboardOctave, recentlyPlayedKeys]);
  
  // 🎤 REVOLUTIONARY VOICE PROCESSING SYSTEM
  const initializeMicrophone = async () => {
    try {
      if (!audioContextRef.current) {
        await initializeAudioContext();
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      
  mediaStreamRef.current = stream;
  microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
  // Create analyzer for pitch detection
  analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 4096;
      analyserRef.current.smoothingTimeConstant = 0.3;
      
      microphoneRef.current.connect(analyserRef.current);
      
      setMicrophoneEnabled(true);
      setAudioError(null);
      
      // Start pitch detection loop
      startPitchDetection();
      
    } catch (error) {
      console.error('Microphone access failed:', error);
      setAudioError(`Microphone error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setMicrophoneEnabled(false);
    }
  };
  
  // 🧠 AI-POWERED PITCH DETECTION
  const detectPitch = (audioData) => {
    const sampleRate = audioContextRef.current ? audioContextRef.current.sampleRate : 44100;
    const correlations = new Array(audioData.length / 2);
    
    // Autocorrelation-based pitch detection
    for (let lag = 0; lag < correlations.length; lag++) {
      let correlation = 0;
      for (let i = 0; i < audioData.length - lag; i++) {
        correlation += audioData[i] * audioData[i + lag];
      }
      correlations[lag] = correlation;
    }
    
    // Find the peak in correlation (indicates pitch)
    let maxCorrelation = 0;
    let bestLag = 0;
    const minPeriod = Math.floor(sampleRate / 800); // 800 Hz max
    const maxPeriod = Math.floor(sampleRate / 80);  // 80 Hz min
    
    for (let lag = minPeriod; lag < Math.min(maxPeriod, correlations.length); lag++) {
      if (correlations[lag] > maxCorrelation) {
        maxCorrelation = correlations[lag];
        bestLag = lag;
      }
    }
    
    const confidence = maxCorrelation / correlations[0];
    const pitch = bestLag > 0 ? sampleRate / bestLag : null;
    
    return { 
      pitch: (confidence > 0.3 && pitch && pitch > 80 && pitch < 800) ? pitch : null, 
      confidence 
    };
  };
  
  // 🔄 REAL-TIME PITCH DETECTION LOOP
  const startPitchDetection = () => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const audioData = new Float32Array(bufferLength);
    
    const detect = () => {
      if (!analyserRef.current || !isListeningToVoice) return;
      
      analyserRef.current.getFloatTimeDomainData(audioData);
      
      // Calculate RMS to detect if there's actual sound
      const rms = Math.sqrt(audioData.reduce((sum, sample) => sum + sample * sample, 0) / audioData.length);
      
      if (rms > 0.01) { // Only detect pitch if there's sufficient volume
        const { pitch, confidence } = detectPitch(audioData);
        
        if (pitch && confidence > 0.5) {
          setDetectedPitch(pitch);
          
          // Add to voice notes for learning
          setVoiceNotes(prev => {
            const newNote = { pitch, time: Date.now(), confidence };
            return [...prev.slice(-50), newNote]; // Keep last 50 notes
          });
          
          // 🎵 CONVERT VOICE TO SYNTHESIZER NOTES
          if (activeInstruments.length > 0) {
            activeInstruments.forEach((instrumentKey) => {
              createVoiceForInstrument(instrumentKey, pitch, confidence * 0.8, 0.2);
            });
          }
        } else {
          setDetectedPitch(null);
        }
      } else {
        setDetectedPitch(null);
      }
      
      pitchDetectionRef.current = requestAnimationFrame(detect);
    };
    
    detect();
  };
  
  const stopPitchDetection = () => {
    if (pitchDetectionRef.current) {
      cancelAnimationFrame(pitchDetectionRef.current);
      pitchDetectionRef.current = null;
    }
  };
  
  const toggleVoiceListening = () => {
    if (!microphoneEnabled) {
      initializeMicrophone();
      return;
    }
    
    if (isListeningToVoice) {
      setIsListeningToVoice(false);
      stopPitchDetection();
    } else {
      setIsListeningToVoice(true);
      startPitchDetection();
    }
  };
  
  // 🤖 AI COMPOSITION ENGINE
  const generateMelody = useCallback((style, bars = 4) => {
    const styleConfig = compositionStyles[style];
  const melody = [];
    const baseKey = 60; // C4
    let currentNote = baseKey;
    
    for (let bar = 0; bar < bars; bar++) {
      for (let beat = 0; beat < 4; beat++) {
        const rhythmIndex = beat % styleConfig.rhythmPattern.length;
        const duration = styleConfig.rhythmPattern[rhythmIndex];
        
        // AI CREATIVITY LOGIC
        let nextNote;
        if (Math.random() < styleConfig.chordTendency) {
          // Use chord tones (1, 3, 5, 7)
          const chordTones = [0, 4, 7, 11].map(interval => baseKey + interval);
          nextNote = chordTones[Math.floor(Math.random() * chordTones.length)];
        } else {
          // Use scale tones
          const scaleNote = styleConfig.scalePattern[Math.floor(Math.random() * styleConfig.scalePattern.length)];
          nextNote = baseKey + scaleNote;
        }
        
        // Apply stepwise motion preference
        if (Math.random() < styleConfig.stepwise && melody.length > 0) {
          const lastNote = melody[melody.length - 1].note;
          const direction = Math.random() < 0.5 ? 1 : -1;
          nextNote = lastNote + (direction * (Math.random() < 0.7 ? 1 : 2));
        }
        
        // Apply creativity factor
        if (Math.random() < aiCreativity / 100) {
          nextNote += Math.floor((Math.random() - 0.5) * 12); // Random octave jump
        }
        
        // Keep in reasonable range
        nextNote = Math.max(36, Math.min(84, nextNote));
        
        melody.push({
          note: nextNote,
          duration: duration,
          velocity: 0.6 + (Math.random() * 0.4) // Dynamic velocity
        });
        
        currentNote = nextNote;
      }
    }
    
    return melody;
  }, [aiCreativity]);

  const startAIComposition = useCallback(() => {
    if (!audioContextRef.current || aiComposerActive) return;
    
    setAiComposerActive(true);
    console.log(`🤖 Starting AI Composition in ${compositionStyle} style with DRUMS...`);
    
    // 🥁 START DRUMS FIRST - Automatically sync with composition style
    const drumStyle = compositionStyle === 'country-ballad' ? 'country-ballad' :
                     compositionStyle === 'honky-tonk' ? 'honky-tonk' : 
                     compositionStyle === 'bluegrass-fiddle' ? 'bluegrass' : 'country-ballad';
    
    playDrumPattern(drumStyle);
    
    const playAIMelody = () => {
  const melody = generateMelody(compositionStyle);
      setGeneratedMelody(melody);
      
      let noteIndex = 0;
      const scheduleNextNote = () => {
        if (!aiComposerActive || noteIndex >= melody.length) {
          if (aiComposerActive) {
            // Loop the composition
            setTimeout(() => {
              noteIndex = 0;
              scheduleNextNote();
            }, 1000);
          }
          return;
        }
        
        const note = melody[noteIndex];
        const frequency = 440 * Math.pow(2, (note.note - 69) / 12);
        
        // Play with current instrument
        playNote(frequency, note.velocity);
        
        setTimeout(() => {
          stopNote(frequency);
        }, note.duration * 500); // Convert to milliseconds
        
        noteIndex++;
        setTimeout(scheduleNextNote, note.duration * 500);
      };
      
      scheduleNextNote();
    };
    
    // Start composition after short delay
    setTimeout(playAIMelody, 500);
  }, [aiComposerActive, compositionStyle, generateMelody, aiCreativity]);

  const stopAIComposition = useCallback(() => {
    setAiComposerActive(false);
    setGeneratedMelody([]);
    
    // 🥁 STOP DRUMS TOO
    stopDrumPattern();
    
    if (aiComposerIntervalRef.current) {
      clearInterval(aiComposerIntervalRef.current);
      aiComposerIntervalRef.current = null;
    }
    console.log('🤖 AI Composition stopped (including drums)');
  }, [stopDrumPattern]);

  // Auto-trigger AI composition when user is inactive
  useEffect(() => {
    const checkForInactivity = () => {
      const timeSinceLastInput = Date.now() - lastUserInputRef.current;
      
      if (timeSinceLastInput > 10000 && !aiComposerActive && !voiceProcessing) { // 10 seconds
        console.log('🤖 User inactive - starting AI composition...');
        startAIComposition();
      }
    };
    
    const inactivityInterval = setInterval(checkForInactivity, 5000);
    
    return () => clearInterval(inactivityInterval);
  }, [aiComposerActive, startAIComposition]);

  // Track user input to reset inactivity timer
  const trackUserInput = useCallback(() => {
    lastUserInputRef.current = Date.now();
    if (aiComposerActive) {
      stopAIComposition();
    }
  }, [aiComposerActive, stopAIComposition]);

  // 🎤 VOICE HARMONIZATION - Creates harmonies from detected voice
  const generateVoiceHarmonies = (rootPitch) => {
    if (!rootPitch || activeInstruments.length === 0) return;
    
    // Generate intelligent harmonies based on current key
  const keyData = keyFrequencies[currentKey];
    const intervals = [1.26, 1.5, 1.78, 2.0]; // Major 3rd, Perfect 5th, Minor 7th, Octave
    
    intervals.forEach((interval, index) => {
      const harmonyPitch = rootPitch * interval;
      
      setTimeout(() => {
        activeInstruments.forEach((instrumentKey) => {
          createVoiceForInstrument(instrumentKey, harmonyPitch, 0.4, 0.15);
        });
      }, index * 50); // Stagger the harmonies slightly
    });
  };
  
  useEffect(() => {
    initializeAudioContext();
    
    // Cleanup function
    return () => {
      if (sequenceIntervalRef.current) {
        clearTimeout(sequenceIntervalRef.current);
      }
      
      // Clean up all active voices
      cleanupFunctionsRef.current.forEach((cleanup) => {
        try { if (typeof cleanup === 'function') cleanup(); } catch (e) {}
      });
      cleanupFunctionsRef.current.clear();
      
      // Close audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [initializeAudioContext]);

  // Expose a small testing API on window for manual/E2E driving
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.CountryMusicWorkstationTestAPI = {
      initializeAudio: initializeAudioContext,
      toggleInstrument,
      playNoteHz: (hz) => createVoiceForInstrument(activeInstruments[0] || 'acoustic-guitar', hz, 0.8, 0.6),
      stopNoteHz: stopNote,
      playDrum: (id, vel = 0.8) => playDrum(id, vel),
      startDrums: (pattern = currentDrumPattern) => playDrumPattern(pattern),
      stopDrums: stopDrumPattern,
      startAI: startAIComposition,
      stopAI: stopAIComposition,
      startRecording,
      stopRecording,
      exportProject,
      saveSong,
      setKey: setCurrentKey,
      setBPM: (bpm) => setCurrentBPM(Number(bpm) || currentBPM),
      setInstruments: setActiveInstruments,
    };
  }, [
    initializeAudioContext,
    toggleInstrument,
    createVoiceForInstrument,
    stopNote,
    playDrum,
    playDrumPattern,
    stopDrumPattern,
    startAIComposition,
    stopAIComposition,
    startRecording,
    stopRecording,
    exportProject,
    saveSong,
    setCurrentKey,
    setCurrentBPM,
    setActiveInstruments,
    activeInstruments,
    currentDrumPattern,
  ]);

  // Built-in self-test sequence to exercise main controls
  const runSelfTest = useCallback(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const results = [];
    try {
      logSelfTest('SELFTEST: Initializing audio...');
      await initializeAudioContext();
      results.push('audio:init:ok');

      logSelfTest('SELFTEST: Activating instruments...');
      setActiveInstruments(['acoustic-guitar', 'piano', 'fiddle']);
      await wait(200);
      results.push('instruments:set:ok');

      logSelfTest('SELFTEST: Play A4 then stop...');
      const A4 = 440;
      createVoiceForInstrument('acoustic-guitar', A4, 0.8, 0.5);
      await wait(400);
      stopNote(A4);
      results.push('note:playstop:ok');

      logSelfTest('SELFTEST: Play drum hits (kick/snare/hihat)...');
      playDrum('kick', 0.9); await wait(120);
      playDrum('snare', 0.8); await wait(120);
      playDrum('hihatClosed', 0.7); await wait(150);
      results.push('drums:hit:ok');

      logSelfTest('SELFTEST: Start drum pattern, then stop...');
      playDrumPattern('country-ballad'); await wait(1200);
      stopDrumPattern();
      results.push('drums:pattern:ok');

      logSelfTest('SELFTEST: Start AI composer, then stop...');
      startAIComposition(); await wait(1500);
      stopAIComposition();
      results.push('ai:compose:ok');

      logSelfTest('SELFTEST: Start/stop recording...');
      await startRecording(); await wait(1000); await stopRecording();
      results.push('recording:startstop:ok');

      logSelfTest('SELFTEST: Export project JSON...');
      exportProject();
      results.push('project:export:ok');

      logSelfTest('SELFTEST: Save song JSON...');
      setSongTitle('SelfTest Song');
      saveSong();
      results.push('song:save:ok');

      logSelfTest(`SELFTEST: Completed (${results.length} checks)`);
      return { ok: true, results };
    } catch (e) {
      logSelfTest(`SELFTEST: FAILED: ${e && e.message ? e.message : e}`);
      return { ok: false, error: e };
    }
  }, [
    initializeAudioContext,
    setActiveInstruments,
    createVoiceForInstrument,
    stopNote,
    playDrum,
    playDrumPattern,
    stopDrumPattern,
    startAIComposition,
    stopAIComposition,
    startRecording,
    stopRecording,
    exportProject,
    setSongTitle,
    saveSong,
  ]);

  // Auto-run when ?selftest=1
  useEffect(() => {
    if (isSelfTest) {
      // Defer to allow component to mount
      setTimeout(() => { runSelfTest(); }, 500);
    }
  }, [isSelfTest, runSelfTest]);
  
  const keyFrequencies = {
    'C': { I: 261.63, ii: 293.66, iii: 329.63, IV: 349.23, V: 392.00, vi: 440.00 },
    'G': { I: 196.00, ii: 220.00, iii: 246.94, IV: 261.63, V: 293.66, vi: 329.63 },
    'D': { I: 293.66, ii: 329.63, iii: 369.99, IV: 392.00, V: 440.00, vi: 493.88 },
    'A': { I: 220.00, ii: 246.94, iii: 277.18, IV: 293.66, V: 329.63, vi: 369.99 },
    'E': { I: 329.63, ii: 369.99, iii: 415.30, IV: 440.00, V: 493.88, vi: 554.37 },
  };
  
  const chordProgressions = {
    'country-classic': {
      name: 'Country Classic (I-V-vi-IV)',
      chords: ['I', 'V', 'vi', 'IV'],
      description: 'The most popular country progression'
    },
    'bluegrass': {
      name: 'Bluegrass (I-IV-I-V)',
      chords: ['I', 'IV', 'I', 'V'],
      description: 'Traditional bluegrass feel'
    },
    'honky-tonk': {
      name: 'Honky Tonk (I-I-IV-V)',
      chords: ['I', 'I', 'IV', 'V'],
      description: 'Classic honky tonk blues'
    },
    'modern-country': {
      name: 'Modern Country (vi-IV-I-V)',
      chords: ['vi', 'IV', 'I', 'V'],
      description: 'Contemporary country pop'
    },
    'jazz-country': {
      name: 'Jazz Country (I7-IV7-V7-I7)',
      chords: ['I7', 'IV7', 'V7', 'I7'],
      description: 'Country with jazz harmony'
    },
    'folk-progression': {
      name: 'Folk (I-V-vi-iii-IV-I-IV-V)',
      chords: ['I', 'V', 'vi', 'iii', 'IV', 'I', 'IV', 'V'],
      description: 'Extended folk progression'
    }
  };
  
  // 🎸 PROFESSIONAL PHYSICAL MODELING ENGINE - Studio Grade Accuracy
  const createPhysicalGuitarModel = useCallback((audioContext, frequency, stringTension = 0.8) => {
    // Karplus-Strong string synthesis with advanced modeling
    const bufferSize = Math.floor(audioContext.sampleRate / frequency);
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const bufferData = buffer.getChannelData(0);
    
    // Generate initial noise burst (pluck simulation)
    for (let i = 0; i < bufferSize; i++) {
      bufferData[i] = (Math.random() * 2 - 1) * 0.3;
    }
    
    // Apply string tension filtering
    const tensionFilter = audioContext.createBiquadFilter();
    tensionFilter.type = 'lowpass';
    tensionFilter.frequency.value = 3000 * stringTension;
    tensionFilter.Q.value = 5;
    
    // Body resonance modeling
    const bodyResonance = audioContext.createBiquadFilter();
    bodyResonance.type = 'peaking';
    bodyResonance.frequency.value = 120 + (frequency * 0.1);
    bodyResonance.Q.value = 8;
    bodyResonance.gain.value = 6;
    
    // Pickup simulation (magnetic pickup characteristics)
    const pickupFilter = audioContext.createBiquadFilter();
    pickupFilter.type = 'bandpass';
    pickupFilter.frequency.value = 2500;
    pickupFilter.Q.value = 0.8;
    
    return { tensionFilter, bodyResonance, pickupFilter, buffer };
  }, []);

  const createPhysicalFiddleModel = useCallback((audioContext, frequency, bowPressure = 0.7) => {
    // Advanced bow-string interaction modeling
    const fundamentalOsc = audioContext.createOscillator();
    fundamentalOsc.type = 'sawtooth';
    fundamentalOsc.frequency.value = frequency;
    
    // String resonance harmonics
    const harmonic2 = audioContext.createOscillator();
    harmonic2.type = 'sine';
    harmonic2.frequency.value = frequency * 2;
    
    const harmonic3 = audioContext.createOscillator();
    harmonic3.type = 'triangle';
    harmonic3.frequency.value = frequency * 3;
    
    // Bow noise simulation
    const bowNoise = audioContext.createBufferSource();
    const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * 0.02 * bowPressure;
    }
    bowNoise.buffer = noiseBuffer;
    bowNoise.loop = true;
    
    // Body resonance (wood characteristics)
    const woodResonance = audioContext.createBiquadFilter();
    woodResonance.type = 'peaking';
    woodResonance.frequency.value = 300 + (frequency * 0.15);
    woodResonance.Q.value = 12;
    woodResonance.gain.value = 8;
    
    // String vibrato modeling
    const vibrato = audioContext.createOscillator();
    vibrato.type = 'sine';
    vibrato.frequency.value = 6.5; // Natural vibrato rate
    
    const vibratoGain = audioContext.createGain();
    vibratoGain.gain.value = frequency * 0.015; // Vibrato depth
    
    vibrato.connect(vibratoGain);
    vibratoGain.connect(fundamentalOsc.frequency);
    
    return { fundamentalOsc, harmonic2, harmonic3, bowNoise, woodResonance, vibrato, vibratoGain };
  }, []);

  const createPhysicalBanjoModel = useCallback((audioContext, frequency, pluckVelocity = 0.8) => {
    // Banjo head (membrane) resonance modeling
    const membraneResonance = audioContext.createBiquadFilter();
    membraneResonance.type = 'peaking';
    membraneResonance.frequency.value = 200;
    membraneResonance.Q.value = 15;
    membraneResonance.gain.value = 10;
    
    // Metal string brightness
    const metalBrightness = audioContext.createBiquadFilter();
    metalBrightness.type = 'highshelf';
    metalBrightness.frequency.value = 3000;
    metalBrightness.gain.value = 4;
    
    // String attack modeling (very sharp attack)
    const attackShaper = audioContext.createWaveShaper();
    const attackCurve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i / 128) - 1;
      attackCurve[i] = Math.sign(x) * Math.pow(Math.abs(x), 0.3) * pluckVelocity;
    }
    attackShaper.curve = attackCurve;
    
    // Bridge resonance
    const bridgeResonance = audioContext.createBiquadFilter();
    bridgeResonance.type = 'peaking';
    bridgeResonance.frequency.value = 800;
    bridgeResonance.Q.value = 6;
    bridgeResonance.gain.value = 3;
    
    return { membraneResonance, metalBrightness, attackShaper, bridgeResonance };
  }, []);

  const createPhysicalPianoModel = useCallback((audioContext, frequency, velocity = 0.7) => {
    // Piano hammer modeling
    const hammerImpact = audioContext.createBufferSource();
    const impactBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.01, audioContext.sampleRate);
    const impactData = impactBuffer.getChannelData(0);
    
    // Simulate hammer felt impact
    for (let i = 0; i < impactData.length; i++) {
      const t = i / audioContext.sampleRate;
      impactData[i] = Math.exp(-t * 200) * Math.sin(t * frequency * Math.PI * 2) * velocity;
    }
    hammerImpact.buffer = impactBuffer;
    
    // String coupling (multiple strings per note)
    const string1 = audioContext.createOscillator();
    string1.type = 'triangle';
    string1.frequency.value = frequency;
    
    const string2 = audioContext.createOscillator();
    string2.type = 'triangle';
    string2.frequency.value = frequency * 1.001; // Slight detuning
    
    const string3 = audioContext.createOscillator();
    string3.type = 'triangle';
    string3.frequency.value = frequency * 0.999; // Slight detuning
    
    // Soundboard resonance
    const soundboard = audioContext.createBiquadFilter();
    soundboard.type = 'peaking';
    soundboard.frequency.value = 100 + (frequency * 0.08);
    soundboard.Q.value = 10;
    soundboard.gain.value = 5;
    
    // Damper simulation
    const damperFilter = audioContext.createBiquadFilter();
    damperFilter.type = 'lowpass';
    damperFilter.frequency.value = 8000;
    damperFilter.Q.value = 0.7;
    
    return { hammerImpact, string1, string2, string3, soundboard, damperFilter };
  }, []);

  // 🎚️ STUDIO-GRADE EFFECTS CHAIN
  const createStudioCompressor = useCallback((audioContext) => {
    const compressor = audioContext.createDynamicsCompressor();
    
    // Professional studio compressor settings
    compressor.threshold.value = -18; // dB
    compressor.knee.value = 8; // Soft knee
    compressor.ratio.value = 4; // 4:1 compression
    compressor.attack.value = 0.003; // 3ms attack
    compressor.release.value = 0.1; // 100ms release
    
    return compressor;
  }, []);

  const createMultibandEQ = useCallback((audioContext) => {
    // Professional 4-band EQ
    const lowShelf = audioContext.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = 80;
    lowShelf.gain.value = 2;
    
    const lowMid = audioContext.createBiquadFilter();
    lowMid.type = 'peaking';
    lowMid.frequency.value = 400;
    lowMid.Q.value = 0.8;
    lowMid.gain.value = 1;
    
    const highMid = audioContext.createBiquadFilter();
    highMid.type = 'peaking';
    highMid.frequency.value = 2500;
    highMid.Q.value = 1.2;
    highMid.gain.value = 2;
    
    const highShelf = audioContext.createBiquadFilter();
    highShelf.type = 'highshelf';
    highShelf.frequency.value = 8000;
    highShelf.gain.value = 1.5;
    
    // Chain the EQ bands
    lowShelf.connect(lowMid);
    lowMid.connect(highMid);
    highMid.connect(highShelf);
    
    return { input: lowShelf, output: highShelf, lowShelf, lowMid, highMid, highShelf };
  }, []);

  const createStereoImager = useCallback((audioContext) => {
    // Professional stereo width enhancement
    const splitter = audioContext.createChannelSplitter(2);
    const merger = audioContext.createChannelMerger(2);
    
    // Mid/Side processing
    const midGain = audioContext.createGain();
    midGain.gain.value = 0.7;
    
    const sideGain = audioContext.createGain();
    sideGain.gain.value = 1.3; // Enhance stereo width
    
    const delay = audioContext.createDelay(0.01);
    delay.delayTime.value = 0.002; // 2ms delay for stereo enhancement
    
    return { splitter, merger, midGain, sideGain, delay };
  }, []);

  const createHarmonicEnhancer = useCallback((audioContext) => {
    // Tube-style harmonic enhancement
    const enhancer = audioContext.createWaveShaper();
    const enhancerCurve = new Float32Array(256);
    
    for (let i = 0; i < 256; i++) {
      const x = (i / 128) - 1;
      // Subtle tube-style saturation
      enhancerCurve[i] = Math.tanh(x * 1.2) * 0.8;
    }
    enhancer.curve = enhancerCurve;
    enhancer.oversample = '4x'; // High quality oversampling
    
    return enhancer;
  }, []);

  // 🥁 PROFESSIONAL DRUM KIT MODELING
  const createKickDrum = useCallback((audioContext, velocity = 0.8) => {
    // 808-style kick with realistic thump
    const kickOsc = audioContext.createOscillator();
    kickOsc.type = 'sine';
    kickOsc.frequency.setValueAtTime(60, audioContext.currentTime);
    kickOsc.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 0.1);
    kickOsc.frequency.exponentialRampToValueAtTime(30, audioContext.currentTime + 0.3);
    
    // Add punch with triangle wave
    const punchOsc = audioContext.createOscillator();
    punchOsc.type = 'triangle';
    punchOsc.frequency.setValueAtTime(80, audioContext.currentTime);
    punchOsc.frequency.exponentialRampToValueAtTime(20, audioContext.currentTime + 0.05);
    
    // Click attack for beater impact
    const clickOsc = audioContext.createOscillator();
    clickOsc.type = 'square';
    clickOsc.frequency.value = 1000;
    
    // Envelope shaping
    const kickGain = audioContext.createGain();
    const punchGain = audioContext.createGain();
    const clickGain = audioContext.createGain();
    
    kickGain.gain.setValueAtTime(0.6 * velocity, audioContext.currentTime);
    kickGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);
    
    punchGain.gain.setValueAtTime(0.3 * velocity, audioContext.currentTime);
    punchGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
    
    clickGain.gain.setValueAtTime(0.1 * velocity, audioContext.currentTime);
    clickGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.01);
    
    // Low-pass filter for realistic thump
    const kickFilter = audioContext.createBiquadFilter();
    kickFilter.type = 'lowpass';
    kickFilter.frequency.value = 100;
    kickFilter.Q.value = 1;
    
    return { kickOsc, punchOsc, clickOsc, kickGain, punchGain, clickGain, kickFilter };
  }, []);

  const createSnareDrum = useCallback((audioContext, velocity = 0.8) => {
    // Realistic snare with noise and tone
    const snareBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.3, audioContext.sampleRate);
    const snareData = snareBuffer.getChannelData(0);
    
    // Generate snare noise (high-frequency burst)
    for (let i = 0; i < snareData.length; i++) {
      snareData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioContext.sampleRate * 0.1));
    }
    
    const snareSource = audioContext.createBufferSource();
    snareSource.buffer = snareBuffer;
    
    // Snare fundamental (wood/shell resonance)
    const snareTone = audioContext.createOscillator();
    snareTone.type = 'triangle';
    snareTone.frequency.value = 220;
    
    // Envelope and filtering
    const snareGain = audioContext.createGain();
    const toneGain = audioContext.createGain();
    
    snareGain.gain.setValueAtTime(0.7 * velocity, audioContext.currentTime);
    snareGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
    
    toneGain.gain.setValueAtTime(0.3 * velocity, audioContext.currentTime);
    toneGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
    
    // High-pass for snare character
    const snareFilter = audioContext.createBiquadFilter();
    snareFilter.type = 'highpass';
    snareFilter.frequency.value = 200;
    snareFilter.Q.value = 2;
    
    return { snareSource, snareTone, snareGain, toneGain, snareFilter };
  }, []);

  const createHiHat = useCallback((audioContext, velocity = 0.8, closed = true) => {
    // Metallic hi-hat sound
    const hihatBuffer = audioContext.createBuffer(1, audioContext.sampleRate * (closed ? 0.1 : 0.3), audioContext.sampleRate);
    const hihatData = hihatBuffer.getChannelData(0);
    
    // High-frequency metallic noise
    for (let i = 0; i < hihatData.length; i++) {
      const envelope = Math.exp(-i / (audioContext.sampleRate * (closed ? 0.05 : 0.15)));
      hihatData[i] = (Math.random() * 2 - 1) * envelope;
    }
    
    const hihatSource = audioContext.createBufferSource();
    hihatSource.buffer = hihatBuffer;
    
    const hihatGain = audioContext.createGain();
    hihatGain.gain.setValueAtTime(0.4 * velocity, audioContext.currentTime);
    hihatGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + (closed ? 0.1 : 0.3));
    
    // High-pass filter for metallic character
    const hihatFilter = audioContext.createBiquadFilter();
    hihatFilter.type = 'highpass';
    hihatFilter.frequency.value = 8000;
    hihatFilter.Q.value = 1;
    
    return { hihatSource, hihatGain, hihatFilter };
  }, []);

  const createCrashCymbal = useCallback((audioContext, velocity = 0.8) => {
    // Realistic crash cymbal
    const crashBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
    const crashData = crashBuffer.getChannelData(0);
    
    // Complex metallic noise with sustain
    for (let i = 0; i < crashData.length; i++) {
      const envelope = Math.exp(-i / (audioContext.sampleRate * 1.5));
      const shimmer = 1 + 0.3 * Math.sin(i * 0.001); // Metallic shimmer
      crashData[i] = (Math.random() * 2 - 1) * envelope * shimmer;
    }
    
    const crashSource = audioContext.createBufferSource();
    crashSource.buffer = crashBuffer;
    
    const crashGain = audioContext.createGain();
    crashGain.gain.setValueAtTime(0.6 * velocity, audioContext.currentTime);
    crashGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 2);
    
    // Band-pass for cymbal character
    const crashFilter = audioContext.createBiquadFilter();
    crashFilter.type = 'bandpass';
    crashFilter.frequency.value = 12000;
    crashFilter.Q.value = 0.5;
    
    return { crashSource, crashGain, crashFilter };
  }, []);

  const createTom = useCallback((audioContext, pitch = 100, velocity = 0.8) => {
    // Realistic tom-tom
    const tomOsc = audioContext.createOscillator();
    tomOsc.type = 'sine';
    tomOsc.frequency.setValueAtTime(pitch, audioContext.currentTime);
    tomOsc.frequency.exponentialRampToValueAtTime(pitch * 0.7, audioContext.currentTime + 0.2);
    
    // Add harmonics for realistic tom sound
    const tomHarmonic = audioContext.createOscillator();
    tomHarmonic.type = 'triangle';
    tomHarmonic.frequency.setValueAtTime(pitch * 1.5, audioContext.currentTime);
    tomHarmonic.frequency.exponentialRampToValueAtTime(pitch * 1.2, audioContext.currentTime + 0.15);
    
    const tomGain = audioContext.createGain();
    const harmonicGain = audioContext.createGain();
    
    tomGain.gain.setValueAtTime(0.7 * velocity, audioContext.currentTime);
    tomGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.6);
    
    harmonicGain.gain.setValueAtTime(0.2 * velocity, audioContext.currentTime);
    harmonicGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);
    
    // Low-pass for tom character
    const tomFilter = audioContext.createBiquadFilter();
    tomFilter.type = 'lowpass';
    tomFilter.frequency.value = pitch * 8;
    tomFilter.Q.value = 2;
    
    return { tomOsc, tomHarmonic, tomGain, harmonicGain, tomFilter };
  }, []);

  // 🥁 DRUM KIT INTERFACE
  const drumKit = {
    kick: { name: 'Kick Drum', key: 'C', icon: '🦵', color: 'from-red-600 to-red-800' },
    snare: { name: 'Snare', key: 'D', icon: '🥁', color: 'from-yellow-500 to-orange-600' },
    hihatClosed: { name: 'Hi-Hat (Closed)', key: 'F', icon: '🎩', color: 'from-gray-400 to-gray-600' },
    hihatOpen: { name: 'Hi-Hat (Open)', key: 'G', icon: '👒', color: 'from-gray-300 to-gray-500' },
    crash: { name: 'Crash Cymbal', key: 'A', icon: '💥', color: 'from-yellow-400 to-amber-500' },
    ride: { name: 'Ride Cymbal', key: 'B', icon: '🌊', color: 'from-blue-400 to-blue-600' },
    tom1: { name: 'High Tom', key: 'E', icon: '🎯', color: 'from-green-500 to-green-700' },
    tom2: { name: 'Mid Tom', key: 'R', icon: '🎯', color: 'from-green-600 to-green-800' },
    tom3: { name: 'Floor Tom', key: 'T', icon: '🎯', color: 'from-green-700 to-green-900' }
  };

  const playDrum = useCallback((drumType, velocity = 0.8) => {
    if (!audioContextRef.current || !isAudioInitialized) return;
    
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    
    try {
  let drumModel;
      const compressor = createStudioCompressor(ctx);
      const eq = createMultibandEQ(ctx);
      
      switch (drumType) {
        case 'kick':
          drumModel = createKickDrum(ctx, velocity);
          
          drumModel.kickOsc.connect(drumModel.kickGain);
          drumModel.punchOsc.connect(drumModel.punchGain);
          drumModel.clickOsc.connect(drumModel.clickGain);
          
          drumModel.kickGain.connect(drumModel.kickFilter);
          drumModel.punchGain.connect(drumModel.kickFilter);
          drumModel.clickGain.connect(drumModel.kickFilter);
          
          drumModel.kickFilter.connect(eq.input);
          
          drumModel.kickOsc.start(now);
          drumModel.punchOsc.start(now);
          drumModel.clickOsc.start(now);
          
          drumModel.kickOsc.stop(now + 0.8);
          drumModel.punchOsc.stop(now + 0.15);
          drumModel.clickOsc.stop(now + 0.01);
          break;
          
        case 'snare':
          drumModel = createSnareDrum(ctx, velocity);
          
          drumModel.snareSource.connect(drumModel.snareGain);
          drumModel.snareTone.connect(drumModel.toneGain);
          
          drumModel.snareGain.connect(drumModel.snareFilter);
          drumModel.toneGain.connect(drumModel.snareFilter);
          
          drumModel.snareFilter.connect(eq.input);
          
          drumModel.snareSource.start(now);
          drumModel.snareTone.start(now);
          
          drumModel.snareTone.stop(now + 0.15);
          break;
          
        case 'hihatClosed':
        case 'hihatOpen':
          drumModel = createHiHat(ctx, velocity, drumType === 'hihatClosed');
          
          drumModel.hihatSource.connect(drumModel.hihatGain);
          drumModel.hihatGain.connect(drumModel.hihatFilter);
          drumModel.hihatFilter.connect(eq.input);
          
          drumModel.hihatSource.start(now);
          break;
          
        case 'crash':
        case 'ride':
          drumModel = createCrashCymbal(ctx, velocity);
          
          drumModel.crashSource.connect(drumModel.crashGain);
          drumModel.crashGain.connect(drumModel.crashFilter);
          drumModel.crashFilter.connect(eq.input);
          
          drumModel.crashSource.start(now);
          break;
          
        case 'tom1':
          drumModel = createTom(ctx, 150, velocity); // High tom
          break;
        case 'tom2':
          drumModel = createTom(ctx, 120, velocity); // Mid tom
          break;
        case 'tom3':
          drumModel = createTom(ctx, 80, velocity);  // Floor tom
          break;
      }
      
      if (drumType.startsWith('tom')) {
        drumModel.tomOsc.connect(drumModel.tomGain);
        drumModel.tomHarmonic.connect(drumModel.harmonicGain);
        
        drumModel.tomGain.connect(drumModel.tomFilter);
        drumModel.harmonicGain.connect(drumModel.tomFilter);
        
        drumModel.tomFilter.connect(eq.input);
        
        drumModel.tomOsc.start(now);
        drumModel.tomHarmonic.start(now);
        
        drumModel.tomOsc.stop(now + 0.6);
        drumModel.tomHarmonic.stop(now + 0.4);
      }
      
      // Professional drum processing chain
      eq.output.connect(compressor);
      compressor.connect(masterGainRef.current);
      
      // Add reverb send for realistic drum ambience
      if (reverbRef.current) {
        const reverbSend = ctx.createGain();
        reverbSend.gain.value = 0.2; // Subtle drum reverb
        compressor.connect(reverbSend);
        reverbSend.connect(reverbRef.current);
      }
      
    } catch (error) {
      console.error('Drum playback error:', error);
    }
  }, [isAudioInitialized, createKickDrum, createSnareDrum, createHiHat, createCrashCymbal, createTom, createStudioCompressor, createMultibandEQ]);

  // 🎵 EXPANDED COUNTRY DRUM PATTERNS
  const countryDrumPatterns = {
    'country-ballad': [
      { drum: 'kick', time: 0, velocity: 0.8 },
      { drum: 'hihatClosed', time: 0.5, velocity: 0.6 },
      { drum: 'snare', time: 1, velocity: 0.7 },
      { drum: 'hihatClosed', time: 1.5, velocity: 0.6 },
      { drum: 'kick', time: 2, velocity: 0.8 },
      { drum: 'hihatClosed', time: 2.5, velocity: 0.6 },
      { drum: 'snare', time: 3, velocity: 0.7 },
      { drum: 'hihatClosed', time: 3.5, velocity: 0.6 }
    ],
    'honky-tonk': [
      { drum: 'kick', time: 0, velocity: 0.9 },
      { drum: 'hihatClosed', time: 0.25, velocity: 0.5 },
      { drum: 'kick', time: 0.5, velocity: 0.7 },
      { drum: 'snare', time: 1, velocity: 0.8 },
      { drum: 'hihatClosed', time: 1.25, velocity: 0.5 },
      { drum: 'kick', time: 1.5, velocity: 0.6 },
      { drum: 'kick', time: 2, velocity: 0.9 },
      { drum: 'hihatClosed', time: 2.25, velocity: 0.5 },
      { drum: 'kick', time: 2.5, velocity: 0.7 },
      { drum: 'snare', time: 3, velocity: 0.8 },
      { drum: 'hihatClosed', time: 3.25, velocity: 0.5 },
      { drum: 'tom1', time: 3.75, velocity: 0.6 }
    ],
    'bluegrass': [
      { drum: 'kick', time: 0, velocity: 0.7 },
      { drum: 'snare', time: 0.5, velocity: 0.6 },
      { drum: 'kick', time: 1, velocity: 0.8 },
      { drum: 'snare', time: 1.5, velocity: 0.7 },
      { drum: 'kick', time: 2, velocity: 0.7 },
      { drum: 'snare', time: 2.5, velocity: 0.6 },
      { drum: 'kick', time: 3, velocity: 0.8 },
      { drum: 'snare', time: 3.25, velocity: 0.5 },
      { drum: 'snare', time: 3.75, velocity: 0.6 }
    ],
    'outlaw-country': [
      { drum: 'kick', time: 0, velocity: 0.9 },
      { drum: 'hihatClosed', time: 0.75, velocity: 0.4 },
      { drum: 'snare', time: 1, velocity: 0.8 },
      { drum: 'kick', time: 1.5, velocity: 0.6 },
      { drum: 'kick', time: 2, velocity: 0.9 },
      { drum: 'hihatClosed', time: 2.75, velocity: 0.4 },
      { drum: 'snare', time: 3, velocity: 0.8 },
      { drum: 'kick', time: 3.25, velocity: 0.5 },
      { drum: 'snare', time: 3.75, velocity: 0.6 }
    ],
    'country-rock': [
      { drum: 'kick', time: 0, velocity: 0.9 },
      { drum: 'hihatClosed', time: 0.5, velocity: 0.7 },
      { drum: 'snare', time: 1, velocity: 0.9 },
      { drum: 'hihatClosed', time: 1.5, velocity: 0.7 },
      { drum: 'kick', time: 2, velocity: 0.8 },
      { drum: 'kick', time: 2.5, velocity: 0.6 },
      { drum: 'snare', time: 3, velocity: 0.9 },
      { drum: 'crash', time: 3.5, velocity: 0.7 }
    ],
    'alt-country': [
      { drum: 'kick', time: 0, velocity: 0.7 },
      { drum: 'hihatClosed', time: 0.5, velocity: 0.5 },
      { drum: 'snare', time: 1.25, velocity: 0.6 },
      { drum: 'kick', time: 2, velocity: 0.8 },
      { drum: 'hihatOpen', time: 2.5, velocity: 0.4 },
      { drum: 'snare', time: 3, velocity: 0.7 },
      { drum: 'tom2', time: 3.75, velocity: 0.5 }
    ],
    'nashville-sound': [
      { drum: 'kick', time: 0, velocity: 0.8 },
      { drum: 'hihatClosed', time: 0.5, velocity: 0.6 },
      { drum: 'snare', time: 1, velocity: 0.8 },
      { drum: 'hihatClosed', time: 1.5, velocity: 0.6 },
      { drum: 'kick', time: 2, velocity: 0.8 },
      { drum: 'kick', time: 2.25, velocity: 0.5 },
      { drum: 'snare', time: 3, velocity: 0.8 },
      { drum: 'hihatClosed', time: 3.5, velocity: 0.6 }
    ],
    'texas-country': [
      { drum: 'kick', time: 0, velocity: 0.9 },
      { drum: 'hihatClosed', time: 0.75, velocity: 0.5 },
      { drum: 'snare', time: 1, velocity: 0.7 },
      { drum: 'kick', time: 1.5, velocity: 0.6 },
      { drum: 'kick', time: 2, velocity: 0.9 },
      { drum: 'hihatOpen', time: 2.25, velocity: 0.4 },
      { drum: 'snare', time: 3, velocity: 0.8 },
      { drum: 'tom3', time: 3.5, velocity: 0.6 }
    ]
  };

  // State for drum machine
  const [drumPatternPlaying, setDrumPatternPlaying] = useState(false);
  const [currentDrumPattern, setCurrentDrumPattern] = useState('country-ballad');
  const drumPatternRef = useRef(null);

  // 🎙️ DAW RECORDING STATE
  const [isDawRecording, setIsDawRecording] = useState(false);
  const [recordedTracks, setRecordedTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [masterRecorder, setMasterRecorder] = useState(null);
  const recordingRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // 🎚️ MIXING CONSOLE STATE
  const [trackVolumes, setTrackVolumes] = useState({});
  const [trackMuted, setTrackMuted] = useState({});
  const [trackSoloed, setTrackSoloed] = useState({});
  const [trackPanned, setTrackPanned] = useState({});

  // 🎵 PROJECT STATE
  const [projectName, setProjectName] = useState('Untitled Country Project');
  const [projectBPM, setProjectBPM] = useState(120);
  const [projectKey, setProjectKey] = useState('C');

  // 💰 PREMIUM GENRE PACK SYSTEM
  const [purchasedGenres, setPurchasedGenres] = useState(['country']); // Country is free/included
  const [availableGenres, setAvailableGenres] = useState({
    'country': {
      name: 'Country & Folk Collection',
      price: 0,
      description: 'Complete country music suite with 10 subgenres, authentic instruments, and AI composition',
      preview: true,
      subgenres: ['Country Ballad', 'Bluegrass', 'Honky Tonk', 'Outlaw', 'Nashville Sound', 'Texas Country', 'Alt-Country', 'Country Rock', 'Country Folk', 'Modern Country'],
      instruments: 10,
      patterns: 24,
      status: 'purchased'
    },
    'christian': {
      name: 'Christian & Gospel Pack',
      price: 29.99,
      description: 'Contemporary Christian, Gospel, Worship, Southern Gospel, Christian Rock, Praise & Worship',
      preview: false,
      subgenres: ['Contemporary Christian', 'Traditional Gospel', 'Modern Worship', 'Southern Gospel', 'Christian Rock', 'Praise & Worship', 'Gospel Blues', 'Christian Pop'],
      instruments: 12,
      patterns: 32,
      status: 'available'
    },
    'rock': {
      name: 'Rock & Metal Collection',
      price: 34.99,
      description: 'Classic Rock, Hard Rock, Metal, Punk, Alternative, Progressive Rock, Grunge',
      preview: false,
      subgenres: ['Classic Rock', 'Hard Rock', 'Heavy Metal', 'Punk Rock', 'Alternative Rock', 'Progressive Rock', 'Grunge', 'Indie Rock'],
      instruments: 15,
      patterns: 40,
      status: 'available'
    },
    'pop': {
      name: 'Pop & Dance Pack',
      price: 27.99,
      description: 'Pop, Dance Pop, Synth Pop, Indie Pop, Teen Pop, Adult Contemporary',
      preview: false,
      subgenres: ['Mainstream Pop', 'Dance Pop', 'Synth Pop', 'Indie Pop', 'Teen Pop', 'Adult Contemporary', 'Electropop', 'Dream Pop'],
      instruments: 11,
      patterns: 28,
      status: 'available'
    },
    'jazz': {
      name: 'Jazz & Swing Collection',
      price: 39.99,
      description: 'Traditional Jazz, Swing, Bebop, Smooth Jazz, Fusion, Big Band arrangements',
      preview: false,
      subgenres: ['Traditional Jazz', 'Swing', 'Bebop', 'Cool Jazz', 'Hard Bop', 'Smooth Jazz', 'Jazz Fusion', 'Big Band'],
      instruments: 18,
      patterns: 35,
      status: 'available'
    },
    'edm': {
      name: 'EDM & Electronic Pack',
      price: 32.99,
      description: 'House, Techno, Dubstep, Trance, Drum & Bass, Future Bass, Ambient Electronic',
      preview: false,
      subgenres: ['House', 'Techno', 'Dubstep', 'Trance', 'Drum & Bass', 'Future Bass', 'Ambient', 'Progressive House'],
      instruments: 20,
      patterns: 45,
      status: 'available'
    },
    'blues': {
      name: 'Blues & Soul Collection',
      price: 24.99,
      description: 'Delta Blues, Chicago Blues, Soul, R&B, Electric Blues, Acoustic Blues',
      preview: false,
      subgenres: ['Delta Blues', 'Chicago Blues', 'Electric Blues', 'Acoustic Blues', 'Soul Blues', 'Blues Rock', 'Modern Blues', 'Gospel Blues'],
      instruments: 9,
      patterns: 26,
      status: 'available'
    },
    'hiphop': {
      name: 'Hip-Hop & Rap Pack',
      price: 31.99,
      description: 'Old School Hip-Hop, Trap, Boom Bap, Conscious Rap, Drill, Lo-Fi Hip-Hop',
      preview: false,
      subgenres: ['Old School Hip-Hop', 'Trap', 'Boom Bap', 'Conscious Rap', 'Drill', 'Lo-Fi Hip-Hop', 'Cloud Rap', 'Memphis Rap'],
      instruments: 16,
      patterns: 38,
      status: 'available'
    }
  });

  // 🔐 GENRE PACK VALIDATION
  const [genrePackLicenses, setGenrePackLicenses] = useState({
    'country': {
      licenseKey: 'FREE-COUNTRY-PACK',
      purchaseDate: Date.now(),
      activations: 1,
      maxActivations: 999
    }
  });

  // 💰 PURCHASE & LICENSING FUNCTIONS
  const purchaseGenrePack = useCallback(async (genreId) => {
    const genre = availableGenres[genreId];
    if (!genre || genre.status === 'purchased') return;

    // In real implementation, this would integrate with payment processor
    const simulatePurchase = () => {
  return new Promise((resolve) => {
        setTimeout(() => {
          resolve(`LICENSE-${genreId.toUpperCase()}-${Date.now()}`);
        }, 2000);
      });
    };

    try {
      setAvailableGenres(prev => ({
        ...prev,
        [genreId]: { ...prev[genreId], status: 'downloading' }
      }));

      const licenseKey = await simulatePurchase();
      
      // Add to purchased genres
      setPurchasedGenres(prev => [...prev, genreId]);
      
      // Store license
      setGenrePackLicenses(prev => ({
        ...prev,
        [genreId]: {
          licenseKey,
          purchaseDate: Date.now(),
          activations: 1,
          maxActivations: 5 // Allow 5 device activations
        }
      }));

      // Update status
      setAvailableGenres(prev => ({
        ...prev,
        [genreId]: { ...prev[genreId], status: 'purchased' }
      }));

      console.log(`🎵 Successfully purchased ${genre.name}!`);
      
    } catch (error) {
      console.error('Purchase failed:', error);
      setAvailableGenres(prev => ({
        ...prev,
        [genreId]: { ...prev[genreId], status: 'available' }
      }));
    }
  }, [availableGenres]);

  const validateGenreLicense = useCallback((genreId) => {
    if (genreId === 'country') return true; // Country is always free
    
    const license = genrePackLicenses[genreId];
    if (!license) return false;
    
    // Check expiry (if applicable)
    if (license.expiryDate && Date.now() > license.expiryDate) {
      return false;
    }
    
    // Check activation limits
    if (license.activations >= license.maxActivations) {
      return false;
    }
    
    return true;
  }, [genrePackLicenses]);

  const getGenreContent = useCallback((genreId) => {
    if (!validateGenreLicense(genreId)) {
      return null; // No access without valid license
    }

    // Return genre-specific content based on genreId
    switch (genreId) {
      case 'country':
        return {
          instruments: instruments, // Current country instruments
          patterns: countryDrumPatterns,
          styles: compositionStyles
        };
      
      case 'christian':
        return {
          instruments: {
            'acoustic-guitar': instruments['acoustic-guitar'],
            'piano': instruments['piano'],
            'organ': { name: 'Church Organ', icon: '⛪', color: 'from-purple-600 to-indigo-700' },
            'choir': { name: 'Gospel Choir', icon: '👥', color: 'from-blue-500 to-cyan-600' },
            'bass': instruments['bass'],
            'electric-guitar': { name: 'Electric Guitar', icon: '🎸', color: 'from-yellow-500 to-orange-600' }
          },
          patterns: {
            'contemporary-christian': [/* Christian drum patterns */],
            'gospel': [/* Gospel patterns */],
            'worship': [/* Worship patterns */]
          },
          styles: {
            'contemporary-christian': { tempo: [80, 120], scalePattern: [0, 2, 4, 5, 7, 9, 11] },
            'gospel': { tempo: [90, 140], scalePattern: [0, 2, 3, 5, 7, 9, 10] },
            'worship': { tempo: [70, 100], scalePattern: [0, 2, 4, 5, 7, 9, 11] }
          }
        };
      
      case 'rock':
        return {
          instruments: {
            'electric-guitar': { name: 'Electric Guitar', icon: '🎸', color: 'from-red-600 to-orange-700' },
            'bass-guitar': { name: 'Bass Guitar', icon: '🎸', color: 'from-gray-700 to-black' },
            'rock-drums': { name: 'Rock Kit', icon: '🥁', color: 'from-red-500 to-red-800' },
            'keyboard': { name: 'Rock Keyboard', icon: '🎹', color: 'from-blue-600 to-purple-700' }
          },
          patterns: {
            'classic-rock': [/* Rock patterns */],
            'hard-rock': [/* Hard rock patterns */],
            'metal': [/* Metal patterns */]
          },
          styles: {
            'classic-rock': { tempo: [120, 160], scalePattern: [0, 2, 3, 5, 7, 9, 10] },
            'hard-rock': { tempo: [140, 180], scalePattern: [0, 2, 3, 5, 7, 9, 10] },
            'metal': { tempo: [160, 220], scalePattern: [0, 2, 3, 5, 6, 8, 10] }
          }
        };
      
      // Add other genres...
      default:
        return null;
    }
  }, [validateGenreLicense, instruments, countryDrumPatterns, compositionStyles]);

  // 🎙️ DAW RECORDING FUNCTIONS
  const startRecording = useCallback(async () => {
    if (!audioContextRef.current || isDawRecording) return;
    
    try {
      // Create a destination for recording the master output
      const destination = audioContextRef.current.createMediaStreamDestination();
      
      // Connect master gain to recording destination
      if (masterGainRef.current) {
        masterGainRef.current.connect(destination);
      }
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(destination.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      recordedChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        
        // Convert to audio for playback
        const reader = new FileReader();
        reader.onload = async () => {
          const arrayBuffer = reader.result;
          const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
          
          // Create new track
          const newTrack = {
            id: `track-${Date.now()}`,
            name: `Recording ${recordedTracks.length + 1}`,
            data: audioBuffer.getChannelData(0),
            duration: audioBuffer.duration,
            timestamp: Date.now(),
            instrument: 'Recording'
          };
          
          setRecordedTracks(prev => [...prev, newTrack]);
          setTrackVolumes(prev => ({ ...prev, [newTrack.id]: 0.8 }));
          setTrackMuted(prev => ({ ...prev, [newTrack.id]: false }));
          setTrackSoloed(prev => ({ ...prev, [newTrack.id]: false }));
          setTrackPanned(prev => ({ ...prev, [newTrack.id]: 0 }));
        };
        
        reader.readAsArrayBuffer(blob);
  setIsDawRecording(false);
      };
      
      mediaRecorder.start(100); // Record in 100ms chunks
      recordingRef.current = mediaRecorder;
  setIsDawRecording(true);
      
      console.log('🎙️ Recording started...');
      
    } catch (error) {
      console.error('Recording failed:', error);
      setAudioError('Recording failed. Please check microphone permissions.');
    }
  }, [isDawRecording, recordedTracks.length]);

  const stopRecording = useCallback(() => {
    if (recordingRef.current && isDawRecording) {
      recordingRef.current.stop();
      recordingRef.current = null;
      console.log('🎙️ Recording stopped');
    }
  }, [isDawRecording]);

  const playTrack = useCallback((trackId) => {
    if (!audioContextRef.current) return;
    
    const track = recordedTracks.find(t => t.id === trackId);
    if (!track) return;
    
    const ctx = audioContextRef.current;
    const buffer = ctx.createBuffer(1, track.data.length, ctx.sampleRate);
    buffer.copyToChannel(track.data, 0);
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    
    // Apply track settings
    const trackGain = ctx.createGain();
    const trackPanner = ctx.createStereoPanner();
    
    trackGain.gain.value = trackVolumes[trackId] || 0.8;
    trackPanner.pan.value = trackPanned[trackId] || 0;
    
    // Check mute/solo
    const isMuted = trackMuted[trackId];
    const anySoloed = Object.values(trackSoloed).some(Boolean);
    const isSoloed = trackSoloed[trackId];
    
    if (isMuted || (anySoloed && !isSoloed)) {
      trackGain.gain.value = 0;
    }
    
    source.connect(trackGain);
    trackGain.connect(trackPanner);
  if (masterGainRef.current) trackPanner.connect(masterGainRef.current);
    
    source.start();
    source.stop(ctx.currentTime + track.duration);
    
    console.log(`🎵 Playing track: ${track.name}`);
  }, [recordedTracks, trackVolumes, trackMuted, trackSoloed, trackPanned]);

  const deleteTrack = useCallback((trackId) => {
    setRecordedTracks(prev => prev.filter(t => t.id !== trackId));
    setTrackVolumes(prev => {
      const newVolumes = { ...prev };
      delete newVolumes[trackId];
      return newVolumes;
    });
    setTrackMuted(prev => {
      const newMuted = { ...prev };
      delete newMuted[trackId];
      return newMuted;
    });
    setTrackSoloed(prev => {
      const newSoloed = { ...prev };
      delete newSoloed[trackId];
      return newSoloed;
    });
    setTrackPanned(prev => {
      const newPanned = { ...prev };
      delete newPanned[trackId];
      return newPanned;
    });
    
    if (selectedTrack === trackId) {
      setSelectedTrack(null);
    }
  }, [selectedTrack]);

  const exportProject = useCallback(() => {
    const projectData = {
      name: projectName,
      bpm: projectBPM,
      key: projectKey,
      tracks: recordedTracks,
      trackSettings: {
        volumes: trackVolumes,
        muted: trackMuted,
        soloed: trackSoloed,
        panned: trackPanned
      },
      timestamp: Date.now()
    };
    
    const dataStr = JSON.stringify(projectData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `${projectName.replace(/\s+/g, '_')}.sota`;
    link.click();
    
    console.log('💾 Project exported:', projectName);
  }, [projectName, projectBPM, projectKey, recordedTracks, trackVolumes, trackMuted, trackSoloed, trackPanned]);

  // 🥁 DRUM PATTERN PLAYBACK
  const playDrumPattern = useCallback((patternName) => {
    if (!audioContextRef.current || drumPatternPlaying) return;
    
    setDrumPatternPlaying(true);
    const pattern = countryDrumPatterns[patternName];
    const beatDuration = 60 / currentBPM; // Duration of one beat in seconds
    
    const schedulePattern = () => {
      if (!drumPatternPlaying) return;
      
  pattern.forEach(hit => {
        const scheduleTime = (hit.time * beatDuration * 1000); // Convert to milliseconds
        
        setTimeout(() => {
          if (drumPatternPlaying) {
            playDrum(hit.drum, hit.velocity);
          }
        }, scheduleTime);
      });
      
      // Schedule next pattern loop
      const patternDuration = 4 * beatDuration * 1000; // 4 beats per pattern
      drumPatternRef.current = window.setTimeout(schedulePattern, patternDuration);
    };
    
    schedulePattern();
  }, [drumPatternPlaying, currentBPM, playDrum]);

  const stopDrumPattern = useCallback(() => {
    setDrumPatternPlaying(false);
    if (drumPatternRef.current) {
      clearTimeout(drumPatternRef.current);
      drumPatternRef.current = null;
    }
  }, []);

  // 🎸 INSTRUMENT DEFINITIONS WITH PHYSICAL MODELING
  const instruments = {
    'acoustic-guitar': {
      name: 'Acoustic Guitar',
      color: 'from-amber-600 to-orange-700',
      icon: '🎸',
      osc1: { wave: 'sawtooth', gain: 0.4, detune: 0, freq: 1.0 },
      osc2: { wave: 'triangle', gain: 0.3, detune: -3, freq: 2.0 },
      osc3: { wave: 'sine', gain: 0.15, freq: 3.0 },
      filter: { freq: 3200, res: 3, type: 'lowpass', envAmount: 1800 },
      envelope: { attack: 0.003, decay: 0.25, sustain: 0.35, release: 0.7 },
      unison: { voices: 3, detune: 6 }
    },
    'steel-guitar': {
      name: 'Steel Guitar',
      color: 'from-blue-500 to-cyan-600',
      icon: '🎼',
      osc1: { wave: 'sawtooth', gain: 0.45, detune: 0, freq: 1.0 },
      osc2: { wave: 'sine', gain: 0.35, detune: 5, freq: 2.0 },
      osc3: { wave: 'triangle', gain: 0.25, freq: 1.5 },
      filter: { freq: 3800, res: 6, type: 'bandpass', envAmount: 2800 },
      envelope: { attack: 0.08, decay: 0.4, sustain: 0.65, release: 1.3 },
      unison: { voices: 5, detune: 10 }
    },
    'fiddle': {
      name: 'Fiddle',
      color: 'from-red-600 to-pink-600',
      icon: '🎻',
      osc1: { wave: 'sawtooth', gain: 0.5, detune: 0, freq: 1.0 },
      osc2: { wave: 'sawtooth', gain: 0.45, detune: -2, freq: 1.0 },
      osc3: { wave: 'triangle', gain: 0.25, freq: 2.0 },
      filter: { freq: 3300, res: 8, type: 'lowpass', envAmount: 3500 },
      envelope: { attack: 0.04, decay: 0.18, sustain: 0.75, release: 0.35 },
      unison: { voices: 4, detune: 12 }
    },
    'banjo': {
      name: 'Banjo',
      color: 'from-yellow-500 to-amber-600',
      icon: '🪕',
      osc1: { wave: 'square', gain: 0.45, detune: 0, freq: 1.0 },
      osc2: { wave: 'sawtooth', gain: 0.35, detune: 8, freq: 2.0 },
      osc3: { wave: 'triangle', gain: 0.25, freq: 4.0 },
      filter: { freq: 4800, res: 5, type: 'highpass', envAmount: 2800 },
      envelope: { attack: 0.001, decay: 0.12, sustain: 0.18, release: 0.25 },
      unison: { voices: 2, detune: 18 }
    },
    'piano': {
      name: 'Piano',
      color: 'from-gray-700 to-gray-900',
      icon: '🎹',
      osc1: { wave: 'triangle', gain: 0.45, detune: 0, freq: 1.0 },
      osc2: { wave: 'sine', gain: 0.35, detune: 0, freq: 2.0 },
      osc3: { wave: 'sine', gain: 0.25, freq: 4.0 },
      filter: { freq: 7500, res: 1.5, type: 'lowpass', envAmount: 1800 },
      envelope: { attack: 0.002, decay: 0.35, sustain: 0.45, release: 0.9 },
      unison: { voices: 3, detune: 4 }
    },
    'bass': {
      name: 'Upright Bass',
      color: 'from-brown-700 to-brown-900',
      icon: '🎸',
      osc1: { wave: 'sine', gain: 0.75, detune: 0, freq: 0.5 },
      osc2: { wave: 'triangle', gain: 0.35, detune: 0, freq: 1.0 },
      osc3: { wave: 'sawtooth', gain: 0.15, freq: 1.0 },
      filter: { freq: 380, res: 6, type: 'lowpass', envAmount: 520 },
      envelope: { attack: 0.008, decay: 0.25, sustain: 0.35, release: 0.45 },
      unison: { voices: 2, detune: 3 }
    },
    'harmonica': {
      name: 'Harmonica',
      color: 'from-indigo-500 to-purple-600',
      icon: '🎵',
      osc1: { wave: 'square', gain: 0.45, detune: 0, freq: 1.0 },
      osc2: { wave: 'sawtooth', gain: 0.35, detune: 4, freq: 1.0 },
      osc3: { wave: 'triangle', gain: 0.25, freq: 2.0 },
      filter: { freq: 2300, res: 10, type: 'bandpass', envAmount: 1800 },
      envelope: { attack: 0.04, decay: 0.18, sustain: 0.65, release: 0.28 },
      unison: { voices: 6, detune: 15 }
    },
    'mandolin': {
      name: 'Mandolin',
      color: 'from-green-600 to-emerald-700',
      icon: '🎶',
      osc1: { wave: 'sawtooth', gain: 0.45, detune: 0, freq: 2.0 },
      osc2: { wave: 'square', gain: 0.35, detune: 6, freq: 2.0 },
      osc3: { wave: 'triangle', gain: 0.25, freq: 4.0 },
      filter: { freq: 4200, res: 6, type: 'lowpass', envAmount: 3200 },
      envelope: { attack: 0.002, decay: 0.18, sustain: 0.28, release: 0.35 },
      unison: { voices: 4, detune: 13 }
    },
    'dobro': {
      name: 'Dobro',
      color: 'from-orange-600 to-red-700',
      icon: '🎸',
      osc1: { wave: 'sawtooth', gain: 0.45, detune: 0, freq: 1.0 },
      osc2: { wave: 'triangle', gain: 0.35, detune: -5, freq: 1.5 },
      osc3: { wave: 'sine', gain: 0.25, freq: 3.0 },
      filter: { freq: 3300, res: 8, type: 'bandpass', envAmount: 2300 },
      envelope: { attack: 0.008, decay: 0.35, sustain: 0.45, release: 0.9 },
      unison: { voices: 4, detune: 10 }
    },
    'pedal-steel': {
      name: 'Pedal Steel',
      color: 'from-cyan-600 to-blue-700',
      icon: '🎚️',
      osc1: { wave: 'sawtooth', gain: 0.45, detune: 0, freq: 1.0 },
      osc2: { wave: 'sine', gain: 0.45, detune: 10, freq: 1.5 },
      osc3: { wave: 'triangle', gain: 0.35, freq: 2.0 },
      filter: { freq: 4200, res: 7, type: 'lowpass', envAmount: 3800 },
      envelope: { attack: 0.12, decay: 0.55, sustain: 0.75, release: 1.8 },
      unison: { voices: 6, detune: 13 }
    }
  };
  
  const toggleInstrument = (instrumentKey) => {
    if (activeInstruments.includes(instrumentKey)) {
  setActiveInstruments(activeInstruments.filter((i) => i !== instrumentKey));
    } else {
      setActiveInstruments([...activeInstruments, instrumentKey]);
    }
  };
  
  const setInstrumentVolume = (instrumentKey, volume) => {
    setInstrumentVolumes({
      ...instrumentVolumes,
      [instrumentKey]: volume
    });
  };
  
  const createVoiceForInstrument = useCallback((instrumentKey, frequency, velocity, duration) => {
    if (!audioContextRef.current || !instruments[instrumentKey] || !isAudioInitialized) return;
    
    try {
      const ctx = audioContextRef.current;
      const now = ctx.currentTime;
      const voiceId = Math.random();
  const instrument = instruments[instrumentKey];
  const instrumentVolume = instrumentVolumes[instrumentKey];
      
      // 🎸 PROFESSIONAL PHYSICAL MODELING SELECTION
  let physicalModel = null;
  let audioNodes = [];
      
      // Create studio-grade compressor and EQ for this voice
      const studioCompressor = createStudioCompressor(ctx);
      const multibandEQ = createMultibandEQ(ctx);
      const harmonicEnhancer = createHarmonicEnhancer(ctx);
      const stereoImager = createStereoImager(ctx);
      
      if (instrumentKey === 'acoustic-guitar' || instrumentKey === 'dobro') {
        physicalModel = createPhysicalGuitarModel(ctx, frequency, velocity);
        
        // Create realistic guitar voice using Karplus-Strong synthesis
        const bufferSource = ctx.createBufferSource();
        bufferSource.buffer = physicalModel.buffer;
        bufferSource.loop = true;
        
        // Apply physical modeling chain: String → Body → Pickup
        bufferSource.connect(physicalModel.tensionFilter);
        physicalModel.tensionFilter.connect(physicalModel.bodyResonance);
        physicalModel.bodyResonance.connect(physicalModel.pickupFilter);
        
        audioNodes = [bufferSource, physicalModel.tensionFilter, physicalModel.bodyResonance, physicalModel.pickupFilter];
        
      } else if (instrumentKey === 'fiddle') {
        physicalModel = createPhysicalFiddleModel(ctx, frequency, velocity);
        
        // Start all fiddle components
        physicalModel.fundamentalOsc.start(now);
        physicalModel.harmonic2.start(now);
        physicalModel.harmonic3.start(now);
        physicalModel.bowNoise.start(now);
        physicalModel.vibrato.start(now);
        
        // Mix harmonics for realistic fiddle sound
        const harmonicMixer = ctx.createGain();
        const harmonic2Gain = ctx.createGain();
        const harmonic3Gain = ctx.createGain();
        
        harmonic2Gain.gain.value = 0.3;
        harmonic3Gain.gain.value = 0.15;
        
        physicalModel.fundamentalOsc.connect(harmonicMixer);
        physicalModel.harmonic2.connect(harmonic2Gain);
        harmonic2Gain.connect(harmonicMixer);
        physicalModel.harmonic3.connect(harmonic3Gain);
        harmonic3Gain.connect(harmonicMixer);
        
        // Add bow noise for realism
        const bowGain = ctx.createGain();
        bowGain.gain.value = 0.1;
        physicalModel.bowNoise.connect(bowGain);
        bowGain.connect(harmonicMixer);
        
        // Apply wood resonance
        harmonicMixer.connect(physicalModel.woodResonance);
        
        audioNodes = [physicalModel.fundamentalOsc, physicalModel.harmonic2, physicalModel.harmonic3, 
                     physicalModel.bowNoise, physicalModel.vibrato, harmonicMixer, harmonic2Gain, 
                     harmonic3Gain, bowGain, physicalModel.woodResonance];
        
      } else if (instrumentKey === 'banjo') {
        physicalModel = createPhysicalBanjoModel(ctx, frequency, velocity);
        
        // Create bright, snappy banjo sound
        const banjoOsc = ctx.createOscillator();
        banjoOsc.type = 'sawtooth';
        banjoOsc.frequency.value = frequency;
        banjoOsc.start(now);
        
        // Apply banjo-specific modeling
        banjoOsc.connect(physicalModel.attackShaper);
        physicalModel.attackShaper.connect(physicalModel.metalBrightness);
        physicalModel.metalBrightness.connect(physicalModel.membraneResonance);
        physicalModel.membraneResonance.connect(physicalModel.bridgeResonance);
        
        audioNodes = [banjoOsc, physicalModel.attackShaper, physicalModel.metalBrightness, 
                     physicalModel.membraneResonance, physicalModel.bridgeResonance];
        
      } else if (instrumentKey === 'piano') {
        physicalModel = createPhysicalPianoModel(ctx, frequency, velocity);
        
        // Start all piano strings and hammer
        physicalModel.hammerImpact.start(now);
        physicalModel.string1.start(now);
        physicalModel.string2.start(now);
        physicalModel.string3.start(now);
        
        // Mix multiple strings for piano richness
        const stringMixer = ctx.createGain();
        const string1Gain = ctx.createGain();
        const string2Gain = ctx.createGain();
        const string3Gain = ctx.createGain();
        
        string1Gain.gain.value = 0.4;
        string2Gain.gain.value = 0.35;
        string3Gain.gain.value = 0.35;
        
        physicalModel.string1.connect(string1Gain);
        physicalModel.string2.connect(string2Gain);
        physicalModel.string3.connect(string3Gain);
        
        string1Gain.connect(stringMixer);
        string2Gain.connect(stringMixer);
        string3Gain.connect(stringMixer);
        
        // Add hammer impact
        const hammerGain = ctx.createGain();
        hammerGain.gain.value = 0.3;
        physicalModel.hammerImpact.connect(hammerGain);
        hammerGain.connect(stringMixer);
        
        // Apply soundboard resonance and damper
        stringMixer.connect(physicalModel.soundboard);
        physicalModel.soundboard.connect(physicalModel.damperFilter);
        
        audioNodes = [physicalModel.string1, physicalModel.string2, physicalModel.string3,
                     physicalModel.hammerImpact, stringMixer, string1Gain, string2Gain, 
                     string3Gain, hammerGain, physicalModel.soundboard, physicalModel.damperFilter];
        
      } else {
        // Fallback to enhanced synthesis for other instruments
  const osc1 = ctx.createOscillator();
  // Ensure wave type is valid for Web Audio API
  const validTypes = ['sine','square','sawtooth','triangle','custom'];
  osc1.type = validTypes.includes(instrument.osc1.wave) ? instrument.osc1.wave : 'sine';
        osc1.frequency.value = frequency * instrument.osc1.freq;
        osc1.start(now);
        
        const osc1Gain = ctx.createGain();
        osc1Gain.gain.value = instrument.osc1.gain * velocity;
        
        osc1.connect(osc1Gain);
        audioNodes = [osc1, osc1Gain];
      }
      
      // 🎚️ APPLY STUDIO-GRADE PROCESSING CHAIN
      if (audioNodes.length > 0) {
        const lastNode = audioNodes[audioNodes.length - 1];
        const voiceGain = ctx.createGain();
        voiceGain.gain.value = velocity * instrumentVolume * 0.3; // Professional level
        
        // Professional effects chain: EQ → Compression → Harmonic Enhancement → Stereo Imaging
        lastNode.connect(multibandEQ.input);
        multibandEQ.output.connect(studioCompressor);
        studioCompressor.connect(harmonicEnhancer);
        harmonicEnhancer.connect(stereoImager.splitter);
        
        // Route through stereo enhancement
        stereoImager.splitter.connect(stereoImager.midGain, 0);
        stereoImager.splitter.connect(stereoImager.sideGain, 1);
        stereoImager.midGain.connect(stereoImager.merger, 0, 0);
        stereoImager.sideGain.connect(stereoImager.delay);
        stereoImager.delay.connect(stereoImager.merger, 0, 1);
        
        stereoImager.merger.connect(voiceGain);
        
        // Professional envelope with studio-grade timing
        const attack = Math.max(0.001, instrument.envelope.attack);
        const decay = Math.max(0.01, instrument.envelope.decay);
        const sustain = Math.max(0.1, instrument.envelope.sustain);
        const release = Math.max(0.05, instrument.envelope.release);
        
        voiceGain.gain.setValueAtTime(0, now);
        voiceGain.gain.linearRampToValueAtTime(velocity * instrumentVolume * 0.3, now + attack);
        voiceGain.gain.linearRampToValueAtTime(sustain * velocity * instrumentVolume * 0.3, now + attack + decay);
        voiceGain.gain.linearRampToValueAtTime(0, now + attack + decay + duration + release);
        
        // Connect to master effects
        if (reverbRef.current && delayRef.current) {
          const reverbSend = ctx.createGain();
          const delaySend = ctx.createGain();
          
          reverbSend.gain.value = 0.25; // Professional reverb level
          delaySend.gain.value = 0.15; // Professional delay level
          
          voiceGain.connect(reverbSend);
          voiceGain.connect(delaySend);
          
          reverbSend.connect(reverbRef.current);
          delaySend.connect(delayRef.current);
          
          // Direct signal
          voiceGain.connect(masterGainRef.current);
        } else {
          voiceGain.connect(masterGainRef.current);
        }
        
        // Professional voice cleanup
        const cleanup = () => {
          try {
            audioNodes.forEach(node => {
              if ('stop' in node && typeof node.stop === 'function') {
                node.stop();
              }
              if ('disconnect' in node) {
                node.disconnect();
              }
            });
            voiceGain.disconnect();
            studioCompressor.disconnect();
            multibandEQ.output.disconnect();
            harmonicEnhancer.disconnect();
            stereoImager.merger.disconnect();
          } catch (e) {
            console.warn('Professional voice cleanup error:', e);
          }
        };
        
        // Schedule professional voice termination
        setTimeout(cleanup, (attack + decay + duration + release + 0.1) * 1000);
        
        // Track voice for polyphony management
        activeVoicesRef.current.set(voiceId, {
          cleanup,
          startTime: now,
          frequency,
          velocity,
          instrumentKey
        });
        
        // Auto-cleanup when voice naturally ends
        setTimeout(() => {
          activeVoicesRef.current.delete(voiceId);
        }, (attack + decay + duration + release + 0.2) * 1000);
      }
      
      // Update polyphony display
      setPolyphonyCount(activeVoicesRef.current.size);
      
    } catch (error) {
      console.error('Professional voice creation error:', error);
      setAudioError(`Professional voice error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [instruments, instrumentVolumes, isAudioInitialized, maxPolyphony, createPhysicalGuitarModel, 
      createPhysicalFiddleModel, createPhysicalBanjoModel, createPhysicalPianoModel, 
      createStudioCompressor, createMultibandEQ, createHarmonicEnhancer, createStereoImager]);

  // Simplified playNote function for the AI composer
  const playNoteSimple = useCallback((frequency) => {
    if (activeInstruments.length === 0) return;
    
    activeInstruments.forEach((instrumentKey) => {
      createVoiceForInstrument(instrumentKey, frequency, 0.7, 0.5);
    });
  }, [activeInstruments, createVoiceForInstrument]);

  // Stop a currently playing note by frequency: find and cleanup closest voice(s)
  const stopNote = (frequency) => {
    try {
      if (!activeVoicesRef.current || activeVoicesRef.current.size === 0) return;
      // Find voices within small tolerance of frequency
      const tol = 0.5; // Hz tolerance
      for (const [id, voice] of activeVoicesRef.current.entries()) {
        if (Math.abs(voice.frequency - frequency) <= tol && typeof voice.cleanup === 'function') {
          try { voice.cleanup(); } catch (e) {}
          activeVoicesRef.current.delete(id);
        }
      }
      setPolyphonyCount(activeVoicesRef.current.size);
    } catch (e) {
      // no-op
    }
  };
  
  const playChord = (chordName, duration = 1.0) => {
    if (!audioContextRef.current || !keyFrequencies[currentKey] || !isAudioInitialized) return;
    
    const keyData = keyFrequencies[currentKey];
    const baseChord = chordName.replace('7', ''); // Remove 7 for base chord lookup
    const root = keyData[baseChord];
    if (!root) return;
    
    const third = root * 1.26; // Major third
    const fifth = root * 1.5;  // Perfect fifth
    
    let chordTones = [root, third, fifth];
    
    // Add 7th if it's a 7th chord
    if (chordName.includes('7')) {
      const seventh = root * 1.78; // Minor 7th (dominant 7th)
      chordTones.push(seventh);
    }
    
    // Add some voicing variations for richer sound
    const octaveRoot = root * 2;
    chordTones.push(octaveRoot);
    
    chordTones.forEach(freq => {
      activeInstruments.forEach((instrumentKey) => {
        createVoiceForInstrument(instrumentKey, freq, 0.7, duration);
      });
    });
  };
  
  const playSequence = () => {
    if (!audioContextRef.current || !isAudioInitialized) return;
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
  const progression = chordProgressions[selectedChordProg];
    if (!progression) return;
    
    setIsPlaying(true);
    let chordIndex = 0;
    const beatDuration = 60 / currentBPM;
    
    const playNextChord = () => {
      if (chordIndex < progression.chords.length * 2) {
        const currentChord = progression.chords[Math.floor(chordIndex / 2)];
        playChord(currentChord, beatDuration * 1.8);
        chordIndex++;
        sequenceIntervalRef.current = setTimeout(playNextChord, beatDuration * 1000);
      } else {
        setIsPlaying(false);
      }
    };
    
    playNextChord();
  };
  
  const stopSequence = () => {
    if (sequenceIntervalRef.current) {
      clearTimeout(sequenceIntervalRef.current);
      sequenceIntervalRef.current = null;
    }
    setIsPlaying(false);
  };
  
  const saveSong = () => {
    const songData = {
      title: songTitle || 'Untitled Country Song',
      lyrics: songLyrics,
      description: songDescription,
      key: currentKey,
      bpm: currentBPM,
      instruments: activeInstruments,
      progression: selectedChordProg,
      volumes: instrumentVolumes,
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(songData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${songTitle || 'country-song'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  const playNote = (frequency) => {
    if (!audioContextRef.current || !isAudioInitialized) return;
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    activeInstruments.forEach((instrumentKey) => {
      createVoiceForInstrument(instrumentKey, frequency, 0.8, 1.5);
    });
  };
  
  const KeyboardKey = ({ note, frequency, isBlack }) => {
    const [isPressed, setIsPressed] = useState(false);
    
    const handleMouseDown = () => {
      setIsPressed(true);
      playNote(frequency);
    };
    
    const handleMouseUp = () => {
      setIsPressed(false);
    };
    
    return (
      <button
        className={`
          ${isBlack 
            ? 'bg-gray-900 hover:bg-gray-700 text-white w-8 h-20 -mx-4 z-10' 
            : 'bg-white hover:bg-gray-100 text-black w-12 h-32 border border-gray-300'
          }
          ${isPressed ? (isBlack ? 'bg-gray-600' : 'bg-gray-200') : ''}
          flex items-end justify-center text-xs font-mono pb-2 transition-colors shadow-lg
        `}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {note}
      </button>
    );
  };
  
  return (
    <div className="w-full h-screen bg-gradient-to-br from-[#070b14] via-[#0a0f1f] to-[#0b1225] text-white flex flex-col overflow-hidden">
      <div className="bg-black/40 backdrop-blur-md border-b border-cyan-300/20 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 via-sky-500 to-fuchsia-500 rounded-lg flex items-center justify-center font-bold text-2xl shadow-[0_0_30px_rgba(103,232,249,0.25)]">
              🎸
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-200 to-fuchsia-300 bg-clip-text text-transparent">
                Country Music Workstation Pro
              </h1>
              <div className="text-xs text-gray-300">
                Intelligent Composition Engine • 10 Authentic Instruments
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-right mr-4">
              <div className="text-xs text-gray-300">Voices</div>
              <div className="text-xl font-bold text-green-400 font-mono">{polyphonyCount}/{maxPolyphony}</div>
            </div>
            
            {/* Audio Status Indicator */}
            <div className={`w-3 h-3 rounded-full ${isAudioInitialized ? 'bg-green-400' : 'bg-red-400'}`} 
                 title={isAudioInitialized ? 'Audio Ready' : 'Audio Error'}></div>
            
            {/* 🎤 REVOLUTIONARY VOICE CONTROLS */}
            <div className="flex items-center space-x-2 border-l border-white/20 pl-2">
              <button 
                onClick={toggleVoiceListening}
                className={`p-2 rounded transition-colors ${
                  isListeningToVoice 
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                    : microphoneEnabled 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-600 hover:bg-gray-700'
                }`}
                title={isListeningToVoice ? 'Stop Voice Input' : 'Start Voice Input'}
              >
                🎤
              </button>
              
              {detectedPitch && (
                <div className="text-xs bg-purple-600/50 px-2 py-1 rounded">
                  {Math.round(detectedPitch)}Hz
                </div>
              )}
              
              <button 
                onClick={() => generateVoiceHarmonies(detectedPitch || 440)}
                disabled={!detectedPitch}
                className="p-2 bg-purple-600 rounded hover:bg-purple-700 transition-colors disabled:opacity-50 text-xs"
                title="Generate Harmonies"
              >
                🎵
              </button>
            </div>
            
            <button 
              onClick={() => setShowSongEditor(!showSongEditor)}
              className="p-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
            >
              <Edit3 className="w-5 h-5" />
            </button>
            <button 
              onClick={saveSong}
              className="p-2 bg-green-600 rounded hover:bg-green-700 transition-colors"
            >
              <Save className="w-5 h-5" />
            </button>
            <button className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Error Display */}
        {audioError && (
          <div className="mt-2 p-2 bg-red-900/50 border border-red-500/50 rounded text-red-200 text-sm">
            Audio Error: {audioError}
            <button 
              onClick={initializeAudioContext}
              className="ml-2 px-2 py-1 bg-red-600 rounded text-xs hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 bg-black/30 backdrop-blur-sm border-r border-cyan-300/10 p-3 overflow-y-auto">
          <div className="space-y-3">
            <div className="bg-white/5 border border-white/10 p-3 rounded-lg">
              <h3 className="text-sm font-semibold mb-2 text-orange-200 uppercase tracking-wide flex items-center">
                <Music className="w-4 h-4 mr-2" />
                Active: {activeInstruments.length}/10
              </h3>
              <div className="text-xs text-gray-300 mb-2">
                Click to add/remove instruments
              </div>
            </div>
            
            <h3 className="text-sm font-semibold text-cyan-200 uppercase tracking-wide">
              Instruments
            </h3>
            
            {Object.entries(instruments).map(([key, instrument]) => {
              const isActive = activeInstruments.includes(key);
              return (
                <div key={key} className={`bg-white/5 ${isActive ? 'ring-2 ring-cyan-300/40' : 'opacity-70'} p-3 rounded-lg transition-all border border-white/10`}>
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={() => toggleInstrument(key)}
                      className="flex items-center space-x-2 flex-1 text-left"
                    >
                      <span className="text-2xl">{instrument.icon}</span>
                      <span className="font-semibold text-sm">{instrument.name}</span>
                      {isActive && <span className="text-xs bg-white/20 px-2 py-1 rounded">ON</span>}
                    </button>
                    <button
                      onClick={() => toggleInstrument(key)}
                      className="p-1 bg-black/40 rounded hover:bg-black/60 w-8 h-8 flex items-center justify-center font-bold border border-white/10"
                    >
                      {isActive ? '−' : '+'}
                    </button>
                  </div>
                  
                  {isActive && (
                    <div>
                      <label className="block text-xs mb-1">Volume: {Math.round(instrumentVolumes[key] * 100)}%</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={instrumentVolumes[key]}
                        onChange={(e) => setInstrumentVolume(key, Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* 🥁 DRUM KIT SECTION */}
            <div className="mt-6 border-t border-white/10 pt-4">
              <h3 className="text-sm font-semibold text-cyan-200 uppercase tracking-wide mb-3">
                🥁 Professional Drum Kit
              </h3>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                {Object.entries(drumKit).map(([key, drum]) => (
                  <button
                    key={key}
                    onMouseDown={() => playDrum(key, 0.8)}
                    className={`bg-white/5 p-2 rounded text-xs font-bold text-white hover:scale-105 transition-all active:scale-95 shadow border border-white/10`}
                  >
                    <div className="text-lg mb-1">{drum.icon}</div>
                    <div>{drum.name}</div>
                    <div className="text-xs opacity-75">Key: {drum.key}</div>
                  </button>
                ))}
              </div>
              
              <div className="bg-black/40 p-3 rounded-lg border border-white/10">
                <h4 className="text-sm font-semibold text-amber-200 mb-2">Drum Patterns</h4>
                
                <div className="flex gap-2 mb-3">
                  {Object.keys(countryDrumPatterns).map((pattern) => (
                    <button
                      key={pattern}
                      onClick={() => {
                        setCurrentDrumPattern(pattern);
                        if (!drumPatternPlaying) {
                          playDrumPattern(pattern);
                        }
                      }}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-all border ${
                        currentDrumPattern === pattern 
                          ? 'bg-cyan-500/90 text-black border-cyan-300/50' 
                          : 'bg-white/10 text-white hover:bg-white/20 border-white/10'
                      }`}
                    >
                      {pattern.replace('-', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => drumPatternPlaying ? stopDrumPattern() : playDrumPattern(currentDrumPattern)}
                    className={`flex-1 px-3 py-2 rounded font-semibold transition-all border ${
                      drumPatternPlaying
                        ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-400/30'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-400/30'
                    }`}
                  >
                    {drumPatternPlaying ? '⏹️ Stop Drums' : '▶️ Play Pattern'}
                  </button>
                  
                  <div className="text-xs text-gray-300 flex items-center">
                    BPM: {currentBPM}
                  </div>
                </div>
                
                {drumPatternPlaying && (
                  <div className="mt-2 text-center text-xs text-cyan-300 animate-pulse">
                    🥁 Playing {currentDrumPattern.replace('-', ' ')} pattern...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4 overflow-y-auto">
            {showSongEditor ? (
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="bg-black/40 backdrop-blur-sm border border-white/10 p-6 rounded-xl">
                  <h2 className="text-2xl font-bold mb-4 text-amber-200">Song Details</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-300">Song Title (max 50 characters)</label>
                      <input
                        type="text"
                        maxLength={50}
                        value={songTitle}
                        onChange={(e) => setSongTitle(e.target.value)}
                        placeholder="My Country Song"
                        className="w-full p-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-400"
                      />
                      <div className="text-xs text-gray-400 mt-1">{songTitle.length}/50</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-300">Key</label>
                        <select
                          value={currentKey}
                          onChange={(e) => setCurrentKey(e.target.value)}
                          className="w-full p-3 bg-black/50 border border-white/10 rounded-lg text-white"
                        >
                          <option value="C">C Major</option>
                          <option value="G">G Major</option>
                          <option value="D">D Major</option>
                          <option value="A">A Major</option>
                          <option value="E">E Major</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-300">Tempo (BPM)</label>
                        <input
                          type="number"
                          min="60"
                          max="200"
                          value={currentBPM}
                          onChange={(e) => setCurrentBPM(Number(e.target.value))}
                          className="w-full p-3 bg-black/50 border border-white/10 rounded-lg text-white"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-300">Description (max 2500 characters)</label>
                      <textarea
                        maxLength={2500}
                        rows={4}
                        value={songDescription}
                        onChange={(e) => setSongDescription(e.target.value)}
                        placeholder="Describe the mood, story, and feel of your country song..."
                        className="w-full p-3 bg-black/40 border border-white/20 rounded-lg text-white placeholder-gray-400"
                      />
                      <div className="text-xs text-gray-400 mt-1">{songDescription.length}/2500</div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-300">Lyrics (max 5000 characters)</label>
                      <textarea
                        maxLength={5000}
                        rows={8}
                        value={songLyrics}
                        onChange={(e) => setSongLyrics(e.target.value)}
                        placeholder="Write your country song lyrics here..."
                        className="w-full p-3 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-400 font-mono text-sm"
                      />
                      <div className="text-xs text-gray-400 mt-1">{songLyrics.length}/5000</div>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowSongEditor(false)}
                        className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors border border-white/10"
                      >
                        Close
                      </button>
                      <button
                        onClick={saveSong}
                        className="px-4 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2 border border-emerald-400/30"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Song</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-black/30 backdrop-blur-sm border border-white/10 p-6 rounded-xl max-w-3xl mx-auto">
                  <h3 className="text-2xl font-bold mb-4 text-amber-200 text-center">Country Music Composer</h3>
                  <p className="text-gray-300 mb-6 text-center">
                    Select instruments, choose a progression, and let the workstation create authentic country music!
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                      <div className="text-sm text-gray-300 mb-2">Active Instruments:</div>
                      <div className="font-bold text-lg text-white">
                        {activeInstruments.length > 0 
                          ? activeInstruments.map(key => instruments[key].icon).join(' ')
                          : 'None selected'}
                      </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                      <div className="text-sm text-gray-300 mb-2">Polyphony:</div>
                      <div className="font-bold text-lg text-green-400">{polyphonyCount} voices</div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-3 text-cyan-200">Song Settings</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2 text-gray-300">Key: {currentKey} Major</label>
                        <select
                          value={currentKey}
                          onChange={(e) => setCurrentKey(e.target.value)}
                          className="w-full p-2 bg-black/50 border border-white/10 rounded text-white"
                        >
                          <option value="C">C Major</option>
                          <option value="G">G Major</option>
                          <option value="D">D Major</option>
                          <option value="A">A Major</option>
                          <option value="E">E Major</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm mb-2 text-gray-300">Tempo: {currentBPM} BPM</label>
                        <input
                          type="range"
                          min="60"
                          max="180"
                          value={currentBPM}
                          onChange={(e) => setCurrentBPM(Number(e.target.value))}
                          className="w-full accent-cyan-400"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-3 text-cyan-200">🤖 AI Composition Engine</h4>
                    <div className="bg-black/50 p-4 rounded-lg border border-cyan-300/20">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm mb-2 text-gray-300">Style:</label>
                          <select
                            value={compositionStyle}
                            onChange={(e) => {
                              setCompositionStyle(e.target.value);
                              trackUserInput();
                            }}
                            className="w-full p-2 bg-black/50 border border-white/10 rounded text-white"
                          >
                            <option value="country-ballad">Country Ballad</option>
                            <option value="bluegrass-fiddle">Bluegrass Fiddle</option>
                            <option value="honky-tonk">Honky Tonk</option>
                            <option value="modern-country">Modern Country Pop</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm mb-2 text-gray-300">Creativity: {aiCreativity}%</label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={aiCreativity}
                            onChange={(e) => {
                              setAiCreativity(Number(e.target.value));
                              trackUserInput();
                            }}
                            className="w-full accent-fuchsia-400"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            aiComposerActive ? stopAIComposition() : startAIComposition();
                            trackUserInput();
                          }}
                          className={`flex-1 px-4 py-2 rounded font-semibold transition-all border ${
                            aiComposerActive
                              ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-400/30'
                              : 'bg-sky-600 hover:bg-sky-700 text-white border-sky-400/30'
                          }`}
                        >
                          {aiComposerActive ? '🛑 Stop AI' : '🤖 Start AI Composer'}
                        </button>
                        <button
                          onClick={() => {
                            const newMelody = generateMelody(compositionStyle, 8);
                            setGeneratedMelody(newMelody);
                            trackUserInput();
                          }}
                          className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded font-semibold transition-all border border-fuchsia-400/30"
                        >
                          🎲 New Melody
                        </button>
                      </div>
                      
                      {aiComposerActive && (
                        <div className="mt-3 text-center">
                          <div className="text-cyan-300 font-semibold animate-pulse">
                            🤖 AI is composing amazing {compositionStyle.replace('-', ' ')} music...
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            Playing with {activeInstruments.length} instrument{activeInstruments.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      )}
                      
                      {generatedMelody.length > 0 && !aiComposerActive && (
                        <div className="mt-3 text-center text-sm text-emerald-300">
                          ✨ Generated {generatedMelody.length} note melody
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 💰 PREMIUM GENRE PACK STORE */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-3 text-cyan-200">💰 Genre Pack Store</h4>
                    <div className="bg-black/50 p-4 rounded-lg border border-white/10">
                      
                      <div className="mb-4 text-center text-sm text-gray-300">
                        Expand your musical horizons with premium genre collections
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                        {Object.entries(availableGenres).map(([genreId, genre]) => (
                          <div 
                            key={genreId}
                            className={`p-3 rounded-lg border transition-all bg-white/5 ${
                              genre.status === 'purchased' 
                                ? 'border-emerald-400/40' 
                                : genre.status === 'downloading'
                                ? 'border-sky-400/40'
                                : 'border-white/10 hover:border-cyan-300/30'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-semibold text-white">{genre.name}</h5>
                                  {genre.status === 'purchased' && (
                                    <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-1 rounded">OWNED</span>
                                  )}
                                  {genre.status === 'downloading' && (
                                    <span className="text-xs bg-sky-500/20 text-sky-300 border border-sky-400/30 px-2 py-1 rounded animate-pulse">DOWNLOADING</span>
                                  )}
                                </div>
                                
                                <p className="text-xs text-gray-300 mb-2">{genre.description}</p>
                                
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {genre.subgenres.slice(0, 3).map(subgenre => (
                                    <span key={subgenre} className="text-xs bg-white/20 px-2 py-1 rounded">
                                      {subgenre}
                                    </span>
                                  ))}
                                  {genre.subgenres.length > 3 && (
                                    <span className="text-xs text-gray-400">+{genre.subgenres.length - 3} more</span>
                                  )}
                                </div>
                                
                                <div className="flex gap-4 text-xs text-gray-400">
                                  <span>🎸 {genre.instruments} instruments</span>
                                  <span>🥁 {genre.patterns} patterns</span>
                                </div>
                              </div>
                              
                              <div className="ml-4 text-center">
                                {genre.status === 'purchased' ? (
                                  <button
                                    onClick={() => {
                                      // Switch to this genre
                                      if (genreId !== 'country') {
                                        console.log(`Switching to ${genre.name}`);
                                      }
                                    }}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition-all"
                                  >
                                    SELECT
                                  </button>
                                ) : genre.status === 'downloading' ? (
                                  <div className="px-4 py-2 bg-blue-600 text-white rounded font-semibold">
                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mx-auto"></div>
                                  </div>
                                ) : (
                                  <div className="text-center">
                                    <div className="text-lg font-bold text-cyan-300 mb-1">
                                      {genre.price === 0 ? 'FREE' : `$${genre.price}`}
                                    </div>
                                    <button
                                      onClick={() => purchaseGenrePack(genreId)}
                                      className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded font-semibold transition-all border border-fuchsia-400/30"
                                    >
                                      {genre.price === 0 ? 'GET FREE' : 'PURCHASE'}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 text-center">
                        <div className="text-xs text-gray-400 mb-2">
                          💎 You own {purchasedGenres.length} of {Object.keys(availableGenres).length} genre packs
                        </div>
                        <div className="text-xs text-purple-400">
                          🔒 Premium packs include: Professional instruments • AI composition styles • Authentic patterns • Studio effects
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-3 text-cyan-200">Chord Progression</h4>
                    <select
                      value={selectedChordProg}
                      onChange={(e) => setSelectedChordProg(e.target.value)}
                      className="w-full p-3 bg-black/50 border border-white/10 rounded-lg text-white"
                    >
                      {Object.entries(chordProgressions).map(([key, prog]) => (
                        <option key={key} value={key}>
                          {prog.name} - {prog.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={isPlaying ? stopSequence : playSequence}
                      disabled={activeInstruments.length === 0}
          className={`px-6 py-3 rounded-lg flex items-center space-x-2 font-semibold shadow-lg transition-all border ${
                        activeInstruments.length === 0
            ? 'bg-white/10 cursor-not-allowed opacity-50 border-white/10'
            : isPlaying
            ? 'bg-rose-600 hover:bg-rose-700 border-rose-400/30'
            : 'bg-emerald-600 hover:bg-emerald-700 border-emerald-400/30'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Square className="w-5 h-5" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          <span>Play Progression</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* 🎤 VOICE CONTROL SECTION */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-3 text-amber-200 flex items-center">
                      🎤 Voice-Powered Synthesis
                      {isListeningToVoice && <span className="ml-2 text-sm text-red-400 animate-pulse">● LISTENING</span>}
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={toggleVoiceListening}
                        disabled={!isAudioInitialized}
                        className={`p-4 rounded-lg font-semibold shadow-lg transition-all ${
                          isListeningToVoice
                            ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                            : microphoneEnabled
                              ? 'bg-blue-600 hover:bg-blue-700'
                              : 'bg-gray-600 hover:bg-gray-700'
                        } ${!isAudioInitialized ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isListeningToVoice ? '🛑 Stop Voice Input' : '🎤 Start Voice Input'}
                      </button>
                      
                      <button
                        onClick={() => generateVoiceHarmonies(detectedPitch || 440)}
                        disabled={!detectedPitch || !isAudioInitialized}
                        className="p-4 bg-purple-600 rounded-lg hover:bg-purple-700 font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        🎵 Generate Harmonies
                      </button>
                    </div>
                    
                    {/* PITCH VISUALIZATION */}
                    <div className="mt-4 p-3 bg-black/40 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-300">Detected Pitch:</span>
                        <span className="font-mono text-green-400">
                          {detectedPitch ? `${Math.round(detectedPitch)} Hz` : 'No signal'}
                        </span>
                      </div>
                      
                      {/* Voice Notes History */}
                      {voiceNotes.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-400">Recent Voice Notes:</span>
                          <div className="flex space-x-1 mt-1 overflow-x-auto">
                            {voiceNotes.slice(-10).map((note, idx) => (
                              <div 
                                key={idx}
                                className="px-2 py-1 bg-purple-600/30 rounded text-xs whitespace-nowrap"
                                style={{ opacity: note.confidence }}
                              >
                                {Math.round(note.pitch)}Hz
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {!microphoneEnabled && (
                      <div className="mt-3 p-2 bg-yellow-900/30 border border-yellow-500/30 rounded text-sm text-yellow-200">
                        🎤 Click "Start Voice Input" to enable revolutionary voice-to-synthesis features!
                      </div>
                    )}
                  </div>
                  
                  {activeInstruments.length === 0 && (
                    <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-500/30 rounded text-sm text-yellow-200 text-center">
                      Select at least one instrument to play music
                    </div>
                  )}
                </div>
                
                <div className="bg-black/30 backdrop-blur-sm border border-white/10 p-6 rounded-xl max-w-3xl mx-auto">
                  <h4 className="text-lg font-semibold mb-3 text-cyan-200">Quick Instrument Setups</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setActiveInstruments(['acoustic-guitar', 'fiddle', 'banjo'])}
                      className="p-3 bg-white/10 rounded-lg hover:bg-white/20 text-sm font-semibold border border-white/10"
                    >
                      🎸 Bluegrass Trio
                    </button>
                    <button
                      onClick={() => setActiveInstruments(['acoustic-guitar', 'piano', 'bass', 'steel-guitar'])}
                      className="p-3 bg-white/10 rounded-lg hover:bg-white/20 text-sm font-semibold border border-white/10"
                    >
                      🎹 Classic Country
                    </button>
                    <button
                      onClick={() => setActiveInstruments(['fiddle', 'banjo', 'mandolin', 'dobro'])}
                      className="p-3 bg-white/10 rounded-lg hover:bg-white/20 text-sm font-semibold border border-white/10"
                    >
                      🎻 String Band
                    </button>
                    <button
                      onClick={() => setActiveInstruments(['pedal-steel', 'acoustic-guitar', 'piano', 'harmonica'])}
                      className="p-3 bg-white/10 rounded-lg hover:bg-white/20 text-sm font-semibold border border-white/10"
                    >
                      🎚️ Honky Tonk
                    </button>
                    <button
                      onClick={() => setActiveInstruments(['acoustic-guitar', 'bass', 'piano'])}
                      className="p-3 bg-white/10 rounded-lg hover:bg-white/20 text-sm font-semibold border border-white/10"
                    >
                      🎸 Singer-Songwriter
                    </button>
                    <button
                      onClick={() => setActiveInstruments(Object.keys(instruments))}
                      className="p-3 bg-white/10 rounded-lg hover:bg-white/20 text-sm font-semibold border border-white/10"
                    >
                      🎵 Full Band
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-black/40 backdrop-blur-sm border-t border-white/10 p-4">
            <div className="flex justify-center mb-4">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-300">
                  Octave: {keyboardOctave}
                </div>
                <button 
                  onClick={() => setKeyboardOctave(prev => Math.max(1, prev - 1))}
                  className="px-2 py-1 bg-gray-600 rounded text-xs hover:bg-gray-700"
                  disabled={keyboardOctave <= 1}
                >
                  ↓
                </button>
                <button 
                  onClick={() => setKeyboardOctave(prev => Math.min(7, prev + 1))}
                  className="px-2 py-1 bg-gray-600 rounded text-xs hover:bg-gray-700"
                  disabled={keyboardOctave >= 7}
                >
                  ↑
                </button>
                <button 
                  onClick={() => setShowHelp(true)}
                  className="px-3 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700"
                >
                  Help (?)
                </button>
              </div>
            </div>
            
            <div className="flex justify-center mb-2">
              <div className="text-sm text-gray-300">
                Playing: {activeInstruments.map(k => instruments[k].name).join(', ') || 'No instruments'}
              </div>
            </div>
            <div className="flex justify-center">
              <div className="flex relative">
                <KeyboardKey note="C" frequency={261.63 * Math.pow(2, keyboardOctave - 4)} isBlack={false} />
                <KeyboardKey note="C#" frequency={277.18 * Math.pow(2, keyboardOctave - 4)} isBlack={true} />
                <KeyboardKey note="D" frequency={293.66 * Math.pow(2, keyboardOctave - 4)} isBlack={false} />
                <KeyboardKey note="D#" frequency={311.13 * Math.pow(2, keyboardOctave - 4)} isBlack={true} />
                <KeyboardKey note="E" frequency={329.63 * Math.pow(2, keyboardOctave - 4)} isBlack={false} />
                <KeyboardKey note="F" frequency={349.23 * Math.pow(2, keyboardOctave - 4)} isBlack={false} />
                <KeyboardKey note="F#" frequency={369.99 * Math.pow(2, keyboardOctave - 4)} isBlack={true} />
                <KeyboardKey note="G" frequency={392.00 * Math.pow(2, keyboardOctave - 4)} isBlack={false} />
                <KeyboardKey note="G#" frequency={415.30 * Math.pow(2, keyboardOctave - 4)} isBlack={true} />
                <KeyboardKey note="A" frequency={440.00 * Math.pow(2, keyboardOctave - 4)} isBlack={false} />
                <KeyboardKey note="A#" frequency={466.16 * Math.pow(2, keyboardOctave - 4)} isBlack={true} />
                <KeyboardKey note="B" frequency={493.88 * Math.pow(2, keyboardOctave - 4)} isBlack={false} />
                <KeyboardKey note="C5" frequency={523.25 * Math.pow(2, keyboardOctave - 4)} isBlack={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/20 rounded-xl p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-amber-200">Keyboard Shortcuts & Help</h2>
              <button 
                onClick={() => setShowHelp(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Piano Keys (QWERTY Layout)</h3>
                <div className="grid grid-cols-2 gap-2 text-gray-300">
                  <div>A = C</div><div>W = C#</div>
                  <div>S = D</div><div>E = D#</div>
                  <div>D = E</div><div>F = F</div>
                  <div>T = F#</div><div>G = G</div>
                  <div>Y = G#</div><div>H = A</div>
                  <div>U = A#</div><div>J = B</div>
                  <div>K = C (next octave)</div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Global Controls</h3>
                <div className="space-y-1 text-gray-300">
                  <div><span className="font-mono bg-gray-800 px-2 py-1 rounded">SPACE</span> - Play/Stop sequence</div>
                  <div><span className="font-mono bg-gray-800 px-2 py-1 rounded">ESC</span> - Stop playback</div>
                  <div><span className="font-mono bg-gray-800 px-2 py-1 rounded">↑/↓</span> - Change octave</div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">🎤 Revolutionary Voice Features</h3>
                <div className="space-y-1 text-gray-300">
                  <div><strong>🎵 Voice-to-Synthesis:</strong> Hum or sing to control instruments</div>
                  <div><strong>🎶 Real-time Harmonization:</strong> Generate intelligent harmonies</div>
                  <div><strong>🎹 Pitch Detection:</strong> Convert your voice to MIDI notes</div>
                  <div><strong>🎚️ Live Processing:</strong> Real-time pitch correction and effects</div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Quick Tips</h3>
                <ul className="space-y-1 text-gray-300">
                  <li>• Select multiple instruments for richer sound</li>
                  <li>• Use the preset instrument combinations</li>
                  <li>• Adjust individual instrument volumes</li>
                  <li>• Try different chord progressions</li>
                  <li>• Save your songs as JSON files</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">🧪 Testing & API</h3>
                <div className="space-y-1 text-gray-300 text-sm">
                  <div><strong>Self-Test UI:</strong> Click the floating "Run Self-Test" button in the bottom-right.</div>
                  <div><strong>URL flag:</strong> Append <span className="font-mono bg-gray-800 px-2 py-0.5 rounded">?selftest=1</span> to auto-open and run tests.</div>
                  <div><strong>Window API:</strong> <span className="font-mono">window.CountryMusicWorkstationTestAPI</span> exposes helpers:</div>
                  <ul className="list-disc ml-6">
                    <li><span className="font-mono">initializeAudio()</span>, <span className="font-mono">playNoteHz(hz)</span>, <span className="font-mono">stopNoteHz(hz)</span></li>
                    <li><span className="font-mono">playDrum(id)</span>, <span className="font-mono">startDrums(pattern)</span>, <span className="font-mono">stopDrums()</span></li>
                    <li><span className="font-mono">startAI()</span>, <span className="font-mono">stopAI()</span>, <span className="font-mono">startRecording()</span>, <span className="font-mono">stopRecording()</span></li>
                    <li><span className="font-mono">exportProject()</span>, <span className="font-mono">saveSong()</span>, <span className="font-mono">setKey('G')</span>, <span className="font-mono">setBPM(120)</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-black/40 backdrop-blur-sm border-t border-white/10 p-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-rose-400' : 'bg-emerald-400'}`}></div>
              <span>{isPlaying ? 'Playing' : 'Ready'}</span>
            </div>
            <div>Instruments: {activeInstruments.length}/10</div>
            <div>Key: {currentKey}</div>
            <div>BPM: {currentBPM}</div>
          </div>
          <div>Country Workstation Pro v2.0</div>
        </div>
        {isSelfTest && (
          <div className="mt-2 p-2 bg-black/50 border border-cyan-300/20 rounded">
            <div className="flex items-center justify-between mb-1">
              <div className="text-cyan-300 font-semibold">Self-Test Panel</div>
              <button onClick={runSelfTest} className="px-2 py-1 bg-cyan-600 hover:bg-cyan-700 rounded text-white text-xs">Run Again</button>
            </div>
            <div className="max-h-32 overflow-auto text-[11px] text-gray-300 font-mono leading-tight">
              {selfTestLogs.slice(-12).map((l, i) => (<div key={i}>{l}</div>))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Self-Test Button */}
      {!showSelfTestPanel && (
        <button
          onClick={() => setShowSelfTestPanel(true)}
          className="fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg border border-cyan-300/40"
          title="Run Self-Test"
        >🧪 Run Self-Test</button>
      )}

      {/* Self-Test Panel */}
      {showSelfTestPanel && (
        <div className="fixed bottom-4 right-4 z-50 w-[360px] bg-gray-900/95 border border-cyan-300/30 rounded-xl shadow-2xl">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
            <div className="text-cyan-300 font-semibold">Self-Test</div>
            <button onClick={() => setShowSelfTestPanel(false)} className="text-gray-300 hover:text-white">✕</button>
          </div>
          <div className="p-3 space-y-2">
            <div className="flex gap-2">
              <button onClick={runSelfTest} className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 rounded text-white text-xs">Run Again</button>
              <button onClick={() => navigator.clipboard && navigator.clipboard.writeText(selfTestLogs.join('\n'))} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-gray-200 text-xs border border-white/10">Copy Logs</button>
              <label className="flex items-center gap-1 text-xs text-gray-300 ml-auto">
                <input type="checkbox" checked={verboseLogs} onChange={(e) => setVerboseLogs(e.target.checked)} /> Verbose
              </label>
            </div>
            <div className="h-40 overflow-auto text-[11px] text-gray-300 font-mono leading-tight bg-black/40 border border-white/10 rounded p-2">
              {selfTestLogs.slice(-200).map((l, i) => (<div key={i}>{l}</div>))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Expose component globally for mounting in static pages (no bundler required)
if (typeof window !== 'undefined') {
  window.CountryMusicWorkstation = CountryMusicWorkstation;
}