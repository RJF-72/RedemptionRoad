// Use global React from the host page (loaded via CDN)
const React = (typeof window !== 'undefined' && window.React) ? window.React : null;
const { useState, useRef, useEffect, useCallback } = React || {};
// Lightweight inline icons for browser modules (avoid external deps)
const Icon = ({ children, className }) => React.createElement('span', { className, style: { display: 'inline-block' } }, children);
const Music = (p) => Icon({ ...p, children: '🎵' });

const AdvancedComposer = () => {
  const [samples, setSamples] = useState({});
  const [sampleMetadata, setSampleMetadata] = useState([]);
  const [songParams, setSongParams] = useState({
    title: '',
    genre: 'country-ballad',
    tempo: 120,
    key: 'C',
    mode: 'major',
    description: '',
    lyrics: '',
    instruments: ['piano', 'bass', 'drums', 'guitar']
  });
  
  const [composition, setComposition] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationLog, setGenerationLog] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dbStatus, setDbStatus] = useState('Initializing...');
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [metronomeOn, setMetronomeOn] = useState(false);
  const [previewPart, setPreviewPart] = useState('melody'); // 'melody' | 'bass'
  const [showImportSummary, setShowImportSummary] = useState(false);
  const [importSummary, setImportSummary] = useState(null);
  const [playbackProgress, setPlaybackProgress] = useState(0); // 0..1
  const [isReclassifying, setIsReclassifying] = useState(false);
  const [mixer, setMixer] = useState({
    melody: { vol: 1, mute: false, solo: false },
    bass: { vol: 0.9, mute: false, solo: false },
    drums: { vol: 0.8, mute: false, solo: false },
    guitar: { vol: 0.9, mute: false, solo: false },
    piano: { vol: 0.9, mute: false, solo: false }
  });
  const [sampleFilter, setSampleFilter] = useState('all');
  const [loopStartBeat, setLoopStartBeat] = useState(0);
  const [loopEndBeat, setLoopEndBeat] = useState(null);
  const [playbackStartBeat, setPlaybackStartBeat] = useState(0);
  
  const audioContextRef = useRef(null);
  const scheduledNotesRef = useRef([]); // active nodes for stop()
  const dbRef = useRef(null);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const masterGainRef = useRef(null);
  const limiterRef = useRef(null);
  const mixerNodesRef = useRef({});
  const stopRequestedRef = useRef(false);
  const sampleBuffersByIdRef = useRef({});
  const timelineRef = useRef(null);

  useEffect(() => {
    // Init audio graph
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioContextRef.current;
    masterGainRef.current = ctx.createGain();
    masterGainRef.current.gain.value = masterVolume;
    limiterRef.current = ctx.createDynamicsCompressor();
    // Limiter-style settings
    limiterRef.current.threshold.setValueAtTime(-8, ctx.currentTime);
    limiterRef.current.knee.setValueAtTime(0, ctx.currentTime);
    limiterRef.current.ratio.setValueAtTime(20, ctx.currentTime);
    limiterRef.current.attack.setValueAtTime(0.003, ctx.currentTime);
    limiterRef.current.release.setValueAtTime(0.25, ctx.currentTime);
    masterGainRef.current.connect(limiterRef.current);
    limiterRef.current.connect(ctx.destination);

    // Create per-channel mixer nodes (gain) and connect to master gain
    try {
      mixerNodesRef.current = mixerNodesRef.current || {};
      Object.keys(mixer).forEach(name => {
        if (!mixerNodesRef.current[name]) {
          const g = ctx.createGain();
          g.gain.value = mixer[name]?.vol ?? 1.0;
          g.connect(masterGainRef.current);
          mixerNodesRef.current[name] = g;
        }
      });
    } catch (e) {
      console.warn('Mixer nodes init failed', e);
    }

    // Load autosaved state
    try {
      const savedParams = localStorage.getItem('advancedComposer.params');
      if (savedParams) setSongParams(prev => ({ ...prev, ...JSON.parse(savedParams) }));
      const savedMetronome = localStorage.getItem('advancedComposer.metronome');
      if (savedMetronome) setMetronomeOn(savedMetronome === 'true');
    } catch (e) {
      console.warn('Autosave load failed:', e);
    }

    initIndexedDB();
    // Keyboard shortcuts: Space = Play/Pause, M = toggle metronome
    const onKey = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) stopPlayback(); else playComposition();
      } else if (e.key.toLowerCase() === 'm') {
        setMetronomeOn(v => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    // Expose the multi-MIDI export for host page helper
    try { window.exportMultiMIDI = exportMultiMIDI; } catch {}
    return () => {
      try {
        stopPlayback();
        ctx.close();
      } catch {}
      window.removeEventListener('keydown', onKey);
      try { delete window.exportMultiMIDI; } catch {}
    };
  }, []);

  // Update mixer node volumes when mixer UI changes (handles mute/solo/vol)
  useEffect(() => {
    const ctx = audioContextRef.current;
    if (!ctx || !mixerNodesRef.current) return;
    // Determine solo state
    const anySolo = Object.values(mixer).some(ch => ch.solo);
    Object.entries(mixer).forEach(([name, ch]) => {
      const node = mixerNodesRef.current[name];
      if (!node) return;
      const muted = ch.mute || (anySolo && !ch.solo);
      try {
        node.gain.setValueAtTime(muted ? 0 : ch.vol, ctx.currentTime);
      } catch (e) {
        try { node.gain.value = muted ? 0 : ch.vol; } catch {}
      }
    });
  }, [mixer]);

  // Persist master volume & metronome
  useEffect(() => {
    if (masterGainRef.current) masterGainRef.current.gain.value = masterVolume;
  }, [masterVolume]);

  useEffect(() => {
    try { localStorage.setItem('advancedComposer.metronome', String(metronomeOn)); } catch {}
  }, [metronomeOn]);

  // Autosave params and composition
  useEffect(() => {
    const t = setTimeout(() => {
      try { localStorage.setItem('advancedComposer.params', JSON.stringify(songParams)); } catch {}
    }, 250);
    return () => clearTimeout(t);
  }, [songParams]);

  useEffect(() => {
    if (!composition) return;
    const t = setTimeout(() => {
      try { localStorage.setItem('advancedComposer.composition', JSON.stringify(composition)); } catch {}
    }, 250);
    return () => clearTimeout(t);
  }, [composition]);

  // ============================================
  // INDEXEDDB SAMPLE PERSISTENCE
  // ============================================

  const initIndexedDB = () => {
    const request = indexedDB.open('ComposerSamplesDB', 1);
    
    request.onerror = () => {
      setDbStatus('❌ IndexedDB not available');
      console.error('IndexedDB error:', request.error);
    };
    
    request.onsuccess = () => {
      dbRef.current = request.result;
      setDbStatus('✅ Sample storage ready');
      loadSamplesFromDB();
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('samples')) {
        const objectStore = db.createObjectStore('samples', { keyPath: 'id' });
        objectStore.createIndex('midi', 'midi', { unique: false });
        objectStore.createIndex('instrument', 'instrument', { unique: false });
      }
    };
  };

  const saveSampleToDB = async (id, midi, audioBuffer, fileName, instrument) => {
    if (!dbRef.current) return;
    
    // Convert AudioBuffer to raw data for storage
    const channels = [];
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }
    
    const sampleData = {
      id,
      midi,
      fileName,
      instrument,
      sampleRate: audioBuffer.sampleRate,
      length: audioBuffer.length,
      numberOfChannels: audioBuffer.numberOfChannels,
      channels: channels.map(ch => Array.from(ch)),
      timestamp: Date.now()
    };
    
    const transaction = dbRef.current.transaction(['samples'], 'readwrite');
    const objectStore = transaction.objectStore('samples');
    
    await new Promise((resolve, reject) => {
      const request = objectStore.put(sampleData);
      request.onsuccess = resolve;
      request.onerror = reject;
    });
  };

  const loadSamplesFromDB = async () => {
    if (!dbRef.current) return;
    
    const transaction = dbRef.current.transaction(['samples'], 'readonly');
    const objectStore = transaction.objectStore('samples');
    
    const request = objectStore.getAll();
    
    request.onsuccess = async () => {
      const storedSamples = request.result;
      
      if (storedSamples.length === 0) {
        setDbStatus('📂 No samples stored yet');
        return;
      }
      
  const loadedSamples = {};
  const metadata = [];
      
      for (const sample of storedSamples) {
        // Reconstruct AudioBuffer from stored data
        const audioBuffer = audioContextRef.current.createBuffer(
          sample.numberOfChannels,
          sample.length,
          sample.sampleRate
        );
        
        for (let i = 0; i < sample.numberOfChannels; i++) {
          const channelData = audioBuffer.getChannelData(i);
          channelData.set(sample.channels[i]);
        }
        
        // Keep first buffer per MIDI for composition, store all by ID for audition
        if (loadedSamples[sample.midi] == null) {
          loadedSamples[sample.midi] = audioBuffer;
        }
        sampleBuffersByIdRef.current[sample.id] = audioBuffer;
        metadata.push({
          id: sample.id,
          midi: sample.midi,
          fileName: sample.fileName,
          instrument: sample.instrument
        });
      }
      
      setSamples(loadedSamples);
      setSampleMetadata(metadata);
      setDbStatus(`✅ Loaded ${storedSamples.length} samples from storage`);
    };
    
    request.onerror = () => {
      setDbStatus('❌ Failed to load samples');
    };
  };

  const deleteSampleFromDB = async (id) => {
    if (!dbRef.current) return;
    
    const transaction = dbRef.current.transaction(['samples'], 'readwrite');
    const objectStore = transaction.objectStore('samples');
    
    await new Promise((resolve, reject) => {
      const request = objectStore.delete(id);
      request.onsuccess = resolve;
      request.onerror = reject;
    });
  };

  const updateSampleInstrumentInDB = async (id, newInstrument) => {
    if (!dbRef.current) return;
    const tx = dbRef.current.transaction(['samples'], 'readwrite');
    const store = tx.objectStore('samples');
    const record = await new Promise((resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = reject;
    });
    if (!record) return;
    record.instrument = newInstrument;
    await new Promise((resolve, reject) => {
      const req = store.put(record);
      req.onsuccess = resolve;
      req.onerror = reject;
    });
  };

  const clearAllSamples = async () => {
    if (!dbRef.current) return;
    
    const transaction = dbRef.current.transaction(['samples'], 'readwrite');
    const objectStore = transaction.objectStore('samples');
    
    await new Promise((resolve, reject) => {
      const request = objectStore.clear();
      request.onsuccess = resolve;
      request.onerror = reject;
    });
    
    setSamples({});
    setSampleMetadata([]);
    setDbStatus('🗑️ All samples cleared');
    sampleBuffersByIdRef.current = {};
  };

  const deleteSingleSample = async (meta) => {
    try {
      await deleteSampleFromDB(meta.id);
      setSampleMetadata(prev => prev.filter(m => m.id !== meta.id));
      setSamples(prev => {
        const copy = { ...prev };
        delete copy[meta.midi];
        return copy;
      });
      setDbStatus(`🗑️ Removed ${meta.fileName}`);
      try { delete sampleBuffersByIdRef.current[meta.id]; } catch {}
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  // ============================================
  // FILE IMPORT (Browse + Drag & Drop)
  // ============================================

  const FLAT_TO_SHARP = {
    Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#'
  };

  const normalizeNoteName = (name) => {
    // Convert flats to sharps and uppercase the letter
    if (!name) return null;
    const up = name[0].toUpperCase() + name.slice(1);
    return FLAT_TO_SHARP[up] || up;
  };

  const KNOWN_FOLDERS = new Set(['bass','drums','guitar','piano','playable realdrums','playable realtracks','strings','synth','woodwind','world']);

  const parseFilename = (fileName, relPath) => {
    // Expected like: Piano_C4.wav or Bass_A#2.mp3
    // Extract instrument and note token
    const base = fileName.replace(/\.[^.]+$/, '');
    // Try split by underscore first
    let instrument = 'unknown';
    let token = '';
    // Try infer instrument from folder path
    if (relPath) {
      const pathParts = relPath.split(/[/\\]+/).map(p => p.trim().toLowerCase()).filter(Boolean);
      // pick the first segment that matches known folders
      const cand = pathParts.find(p => KNOWN_FOLDERS.has(p));
      if (cand) instrument = cand;
    }
    const parts = base.split(/[_\s-]+/);
    if (parts.length >= 2) {
      if (instrument === 'unknown') instrument = parts[0].toLowerCase();
      token = parts[1];
    } else {
      // Fallback: find trailing note like C#4 or Eb3
      const m = base.match(/([A-Ga-g][#b]?)(-?\d)/);
      if (m) {
        if (instrument === 'unknown') instrument = base.slice(0, m.index).replace(/[_\s-]+$/, '').toLowerCase() || 'unknown';
        token = `${m[1]}${m[2]}`;
      }
    }
    // Token to MIDI
    // token example: C4, A#2, Eb3
    const m2 = token.match(/^([A-Ga-g][#b]?)(-?\d)$/);
    let midi = null;
    if (m2) {
      const note = normalizeNoteName(m2[1]);
      const octave = parseInt(m2[2], 10);
      if (NOTE_NAMES.includes(note)) {
        midi = (octave + 1) * 12 + NOTE_NAMES.indexOf(note);
      }
    }
    return { instrument, midi };
  };

  const decodeFileToAudioBuffer = async (file) => {
    const arrayBuf = await file.arrayBuffer();
    return await audioContextRef.current.decodeAudioData(arrayBuf.slice(0));
  };

  // ============================================
  // INSTRUMENT CLASSIFICATION (Heuristic, CPU-light)
  // ============================================
  const downmixMono = (buffer, maxSeconds = 3) => {
    const sr = buffer.sampleRate;
    const n = Math.min(buffer.length, Math.floor(sr * maxSeconds));
    const tmp = new Float32Array(n);
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < n; i++) tmp[i] += data[i];
    }
    const gain = 1 / Math.max(1, buffer.numberOfChannels);
    for (let i = 0; i < n; i++) tmp[i] *= gain;
    return { data: tmp, sampleRate: sr };
  };

  const computeZCR = (data) => {
    let z = 0; let prev = data[0] >= 0 ? 1 : -1;
    for (let i = 1; i < data.length; i++) { const s = data[i] >= 0 ? 1 : -1; if (s !== prev) z++; prev = s; }
    return z / data.length;
  };

  const frameRMS = (data, frame = 1024, hop = 512) => {
    const out = [];
    for (let i = 0; i + frame <= data.length; i += hop) {
      let sum = 0; for (let j = 0; j < frame; j++) { const v = data[i + j]; sum += v * v; }
      out.push(Math.sqrt(sum / frame));
    }
    return out;
  };

  const onsetDensity = (rms) => {
    let c = 0;
    for (let i = 1; i < rms.length; i++) { if (rms[i] > rms[i - 1] * 1.8 && rms[i] > 0.02) c++; }
    return c / Math.max(1, rms.length);
  };

  // Goertzel for selected freqs to approximate band energies
  const goertzelBandEnergy = (data, sr, freqs) => {
    const N = data.length;
    let energy = 0;
    for (const f of freqs) {
      const w = 2 * Math.PI * f / sr;
      const cw = Math.cos(w);
      let s0 = 0, s1 = 0, s2 = 0;
      for (let n = 0; n < N; n++) { s0 = data[n] + 2 * cw * s1 - s2; s2 = s1; s1 = s0; }
      const re = s1 - s2 * cw;
      const im = s2 * Math.sin(w);
      energy += re * re + im * im;
    }
    return energy;
  };

  const autocorrPitchiness = (data, sr) => {
    // crude: check lags 40..300 Hz
    const minLag = Math.floor(sr / 300);
    const maxLag = Math.floor(sr / 40);
    let best = 0;
    for (let lag = minLag; lag <= maxLag; lag += 2) {
      let sum = 0; let norm = 0;
      for (let i = 0; i + lag < data.length; i++) { const a = data[i], b = data[i + lag]; sum += a * b; norm += a * a; }
      const r = norm > 1e-6 ? sum / Math.sqrt(norm * norm) : 0;
      if (r > best) best = r;
    }
    return best;
  };

  const guessInstrument = (buffer) => {
    const { data, sampleRate: sr } = downmixMono(buffer, 3);
    const zcr = computeZCR(data);
    let rms = frameRMS(data);
    // normalize RMS frames to 0..1
    const maxR = Math.max(...rms, 1e-9);
    rms = rms.map(v => v / maxR);
    const onset = onsetDensity(rms);
    const low = goertzelBandEnergy(data, sr, [50,70,90,110,130,150,180]);
    const mid = goertzelBandEnergy(data, sr, [250,400,600,800,1200,1800]);
    const high = goertzelBandEnergy(data, sr, [2500,3500,5000,7000]);
    const total = low + mid + high + 1e-9;
    const lowF = low / total, midF = mid / total, highF = high / total;
    const midHighRatio = (mid + 1e-9) / (high + 1e-9);
    const pitchiness = autocorrPitchiness(data, sr);

    // Heuristic mapping
    let inst = 'realtrack';
    if (highF > 0.45 && onset > 0.08 && pitchiness < 0.15) inst = 'drums';
    else if (lowF > 0.55 && pitchiness > 0.2 && zcr < 0.12) inst = 'bass';
  else if (midF > 0.45 && onset > 0.05 && pitchiness > 0.2) inst = 'guitar';
  // prefer piano when mid energy dominates high energy moderately and onset indicates percussive hits
  else if (midF > 0.35 && highF > 0.2 && onset > 0.06 && midHighRatio > 0.8) inst = 'piano';
    else if (lowF > 0.3 && onset < 0.03 && pitchiness > 0.25) inst = 'strings';
    else if (onset < 0.02 && pitchiness < 0.2 && (midF > 0.3 || highF > 0.3)) inst = 'synth';

    // Confidence heuristic: peak fraction + pitchiness influence
    const conf = Math.min(0.99, Math.max(0.05, Math.max(lowF, midF, highF) * 1.2 + pitchiness * 0.3 - onset * 0.2));
    return { instrument: inst, confidence: Math.round(conf * 100) };
  };

  const handleFileUpload = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    if (!audioContextRef.current) return;
    setDbStatus('⏳ Importing files...');
    const nextSamples = { ...samples };
    const nextMeta = [...sampleMetadata];

    let imported = 0;
    let defaultMidiUsed = 0;
    const instrumentCounts = {};
    let errors = 0;
    for (const file of fileList) {
      try {
        const audioBuffer = await decodeFileToAudioBuffer(file);
        const rel = file.webkitRelativePath || '';
        let { instrument, midi } = parseFilename(file.name, rel);
        // If no MIDI parsed, default to C4 (60)
        if (midi == null) {
          midi = 60; // C4 default
          defaultMidiUsed++;
        }
        // If instrument unknown or generic realtracks, guess from audio
        if (!instrument || instrument === 'unknown' || instrument === 'playable realtracks') {
          try { const g = guessInstrument(audioBuffer); instrument = g.instrument; var conf = g.confidence; } catch { var conf = 0; }
        }
        // Persist
        const id = `${file.name}-${Date.now()}`;
        await saveSampleToDB(id, midi, audioBuffer, file.name, instrument);
        // Update state maps
        if (nextSamples[midi] == null) {
          nextSamples[midi] = audioBuffer;
        }
        sampleBuffersByIdRef.current[id] = audioBuffer;
  nextMeta.push({ id, midi, fileName: file.name, instrument, confidence: conf || 0 });
        imported++;
        if (instrument) instrumentCounts[instrument] = (instrumentCounts[instrument] || 0) + 1;
      } catch (e) {
        console.error('Import failed for', file.name, e);
        errors++;
      }
    }

    setSamples(nextSamples);
    setSampleMetadata(nextMeta);
    setDbStatus(`✅ Imported ${imported} files (total ${nextMeta.length})`);
    setImportSummary({ imported, total: fileList.length, defaultMidiUsed, errors, instrumentCounts });
    setShowImportSummary(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    handleFileUpload(files);
  };

  // Trigger hidden inputs for import
  const triggerFilePicker = (acceptFolder = false) => {
    const inp = acceptFolder ? folderInputRef.current : fileInputRef.current;
    if (inp) inp.click();
  };

  const onFilePickerChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) handleFileUpload(files);
    // allow re-importing same selection
    try { e.target.value = ''; } catch {}
  };

  const reclassifyInstruments = async () => {
    if (isReclassifying) return;
    setIsReclassifying(true);
    try {
      for (const meta of sampleMetadata) {
        const buf = sampleBuffersByIdRef.current[meta.id];
        if (!buf) continue;
        const newInst = guessInstrument(buf);
        if (newInst && newInst !== meta.instrument) {
          await updateSampleInstrumentInDB(meta.id, newInst);
          setSampleMetadata(prev => prev.map(m => m.id === meta.id ? { ...m, instrument: newInst } : m));
        }
      }
      setDbStatus('✅ Reclassified instruments');
    } catch (e) {
      console.error('Reclassify failed', e);
      setDbStatus('❌ Reclassify failed');
    } finally {
      setIsReclassifying(false);
    }
  };

  const auditionSample = (id, focus=false) => {
    const ctx = audioContextRef.current;
    const buf = sampleBuffersByIdRef.current[id];
    if (!ctx || !buf) return;
    try {
      const src = ctx.createBufferSource();
      src.buffer = buf;
      let nodeOut = src;
      const gain = ctx.createGain();
      gain.gain.value = 0.9;
      if (focus) {
        // Bandpass focus suitable for pedal steel / sustained guitars
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 1200;
        bp.Q.value = 0.8;
        // gentle shelf to emphasize sustain
        nodeOut.connect(bp);
        bp.connect(gain);
      } else {
        nodeOut.connect(gain);
      }
      // Route through mixer channel if available
      let channel = 'melody';
      try {
        const meta = sampleMetadata.find(m => m.id === id);
        if (meta && meta.instrument && mixerNodesRef.current[meta.instrument]) channel = meta.instrument;
      } catch {}
      const dest = (mixerNodesRef.current[channel] || masterGainRef.current || ctx.destination);
      gain.connect(dest);
      src.start();
      scheduledNotesRef.current.push(src);
      src.onended = () => { try { src.disconnect(); gain.disconnect(); } catch {} };
    } catch (e) {
      console.error('Audition failed', e);
    }
  };

  const focusSample = (id) => auditionSample(id, true);

  // ============================================
  // MUSIC THEORY FOUNDATION
  // ============================================

  const SCALE_INTERVALS = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    mixolydian: [0, 2, 4, 5, 7, 9, 10]
  };

  const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const noteToMidi = (note, octave) => {
    const noteIndex = NOTE_NAMES.indexOf(note);
    return (octave + 1) * 12 + noteIndex;
  };

  const midiToFrequency = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

  const getScaleNotes = (rootNote, mode) => {
    const rootIndex = NOTE_NAMES.indexOf(rootNote);
    return SCALE_INTERVALS[mode].map(interval => 
      NOTE_NAMES[(rootIndex + interval) % 12]
    );
  };

  // ============================================
  // ADVANCED RHYTHM PATTERNS
  // ============================================

  const RHYTHM_PATTERNS = {
    'country-ballad': {
      melody: [
        [0.5, 0.5, 1.0, 0.5, 0.5],           // Basic
        [0.25, 0.25, 0.5, 0.5, 1.0, 0.5],    // Syncopated
        [1.0, 0.5, 0.5, 0.5, 0.5],           // Long-short
      ],
      bass: [
        [1.0, 1.0],                           // Whole notes
        [0.5, 0.5, 0.5, 0.5],                // Quarter notes
      ],
      drums: {
        kick: [1, 0, 0, 1, 0, 0, 1, 0],      // 1 and 4
        snare: [0, 0, 1, 0, 0, 0, 1, 0],     // 2 and 4
        hihat: [1, 1, 1, 1, 1, 1, 1, 1],     // Eighths
      }
    },
    'bluegrass': {
      melody: [
        [0.25, 0.25, 0.25, 0.25, 0.5, 0.5],  // Fast picking
        [0.5, 0.25, 0.25, 0.5, 0.5],         // Mixed
      ],
      bass: [
        [0.25, 0.25, 0.25, 0.25],            // Walking
      ],
      drums: {
        kick: [1, 0, 1, 0, 1, 0, 1, 0],
        snare: [0, 1, 0, 1, 0, 1, 0, 1],
        hihat: [1, 1, 1, 1, 1, 1, 1, 1],
      }
    },
    'folk-pop': {
      melody: [
        [0.5, 0.5, 0.5, 0.5, 1.0],
        [1.0, 0.5, 0.5, 0.5, 0.5],
      ],
      bass: [
        [0.5, 0.5, 0.5, 0.5],
      ],
      drums: {
        kick: [1, 0, 0, 1, 0, 1, 0, 0],
        snare: [0, 0, 1, 0, 0, 0, 1, 0],
        hihat: [1, 1, 1, 1, 1, 1, 1, 1],
      }
    }
  };

  // ============================================
  // VOICE LEADING OPTIMIZATION
  // ============================================

  const optimizeVoiceLeading = (chord1, chord2) => {
    // Calculate voice leading distance between two chords
    // Prefer smooth voice leading (minimal movement)
    
    const voices1 = chord1.voicing || chord1.notes.map((n, i) => 
      noteToMidi(n, 3 + i)
    );
    
    let bestVoicing = [];
    let minDistance = Infinity;
    
    // Try different inversions of chord2
    const inversions = getChordInversions(chord2.notes);
    
    inversions.forEach(inversion => {
      const voicing = inversion.map((n, i) => {
        // Find closest octave to previous voice
        let bestOctave = 3;
        let minDiff = Infinity;
        
        for (let oct = 2; oct <= 5; oct++) {
          const midi = noteToMidi(n, oct);
          const diff = Math.abs(midi - voices1[i]);
          if (diff < minDiff) {
            minDiff = diff;
            bestOctave = oct;
          }
        }
        
        return noteToMidi(n, bestOctave);
      });
      
      // Calculate total voice leading distance
      const distance = voicing.reduce((sum, v, i) => 
        sum + Math.abs(v - voices1[i]), 0
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        bestVoicing = voicing;
      }
    });
    
    return bestVoicing;
  };

  const getChordInversions = (notes) => {
    const inversions = [notes];
    for (let i = 1; i < notes.length; i++) {
      inversions.push([...notes.slice(i), ...notes.slice(0, i)]);
    }
    return inversions;
  };

  // ============================================
  // LYRIC ANALYSIS (Rhyme Scheme & Syllables)
  // ============================================

  const analyzeLyrics = (lyrics) => {
    const lines = lyrics.split('\n').filter(l => l.trim().length > 0);
    
    const analyzed = lines.map(line => {
      const words = line.trim().split(/\s+/);
      const syllables = words.map(word => countSyllables(word));
      const totalSyllables = syllables.reduce((a, b) => a + b, 0);
      
      // Get last word for rhyme detection
      const lastWord = words[words.length - 1]?.toLowerCase().replace(/[^a-z]/g, '');
      const rhymeSound = lastWord ? getPhoneticEnding(lastWord) : '';
      
      return {
        text: line,
        words,
        syllables,
        totalSyllables,
        rhymeSound
      };
    });
    
    // Detect rhyme scheme
    const rhymeScheme = detectRhymeScheme(analyzed);
    
    return { lines: analyzed, rhymeScheme };
  };

  const countSyllables = (word) => {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 3) return 1;
    
    // Simplified syllable counting
    const vowels = word.match(/[aeiouy]+/g);
    let count = vowels ? vowels.length : 1;
    
    // Adjust for silent e
    if (word.endsWith('e')) count--;
    if (word.endsWith('le') && word.length > 2) count++;
    
    return Math.max(1, count);
  };

  const getPhoneticEnding = (word) => {
    // Simplified phonetic ending (last 2-3 characters)
    return word.slice(-3);
  };

  const detectRhymeScheme = (lines) => {
    const scheme = [];
    const rhymeMap = {};
    let currentLabel = 'A';
    
    lines.forEach(line => {
      const sound = line.rhymeSound;
      
      if (!sound) {
        scheme.push('X'); // No rhyme
        return;
      }
      
      // Check if this rhyme sound exists
      let foundRhyme = false;
      for (const [label, existingSound] of Object.entries(rhymeMap)) {
        if (soundsRhyme(sound, existingSound)) {
          scheme.push(label);
          foundRhyme = true;
          break;
        }
      }
      
      if (!foundRhyme) {
        rhymeMap[currentLabel] = sound;
        scheme.push(currentLabel);
        currentLabel = String.fromCharCode(currentLabel.charCodeAt(0) + 1);
      }
    });
    
    return scheme;
  };

  const soundsRhyme = (sound1, sound2) => {
    // Simplified rhyme detection
    return sound1.slice(-2) === sound2.slice(-2);
  };

  // ============================================
  // HARMONIC RHYTHM VARIATION
  // ============================================

  const generateHarmonicRhythm = (section, chordProgression) => {
    // Vary how often chords change based on section type
    const rhythmStrategies = {
      'intro': [2, 2, 2, 2],      // Slow, even changes
      'verse': [1, 1, 2, 1, 1, 2], // Varied rhythm
      'chorus': [1, 1, 1, 1],      // Consistent energy
      'bridge': [2, 1, 1, 2],      // Contrast
      'outro': [2, 2, 4]           // Slow down
    };
    
    const strategy = rhythmStrategies[section.type] || [1, 1, 1, 1];
    const harmonicRhythm = [];
    
    let chordIdx = 0;
    let barPosition = 0;
    
    while (barPosition < section.bars) {
      const duration = strategy[harmonicRhythm.length % strategy.length];
      harmonicRhythm.push({
        chord: chordProgression[chordIdx % chordProgression.length],
        duration,
        barPosition
      });
      
      barPosition += duration;
      chordIdx++;
    }
    
    return harmonicRhythm;
  };

  // ============================================
  // FULL INSTRUMENTATION
  // ============================================

  const generateGuitarPart = (chordProgression, genre) => {
    const guitar = [];
    
    chordProgression.forEach(chord => {
      if (genre === 'bluegrass') {
        // Arpeggiated picking
        chord.notes.forEach((note, idx) => {
          guitar.push({
            note,
            octave: 3 + Math.floor(idx / 2),
            duration: 0.25,
            technique: 'picked'
          });
        });
      } else if (genre === 'country-ballad') {
        // Strummed chords
        guitar.push({
          notes: chord.notes,
          octave: 3,
          duration: 1.0,
          technique: 'strummed'
        });
      } else {
        // Fingerpicked pattern
        const pattern = [0, 2, 1, 2]; // Root, fifth, third, fifth
        pattern.forEach(idx => {
          guitar.push({
            note: chord.notes[idx % chord.notes.length],
            octave: 3,
            duration: 0.25,
            technique: 'fingerpicked'
          });
        });
      }
    });
    
    return guitar;
  };

  const generateDrumPart = (genre, bars) => {
    const pattern = RHYTHM_PATTERNS[genre].drums;
    const drums = { kick: [], snare: [], hihat: [] };
    
    for (let bar = 0; bar < bars; bar++) {
      pattern.kick.forEach((hit, idx) => {
        if (hit) drums.kick.push({ time: bar + idx * 0.125, velocity: 0.8 });
      });
      pattern.snare.forEach((hit, idx) => {
        if (hit) drums.snare.push({ time: bar + idx * 0.125, velocity: 0.7 });
      });
      pattern.hihat.forEach((hit, idx) => {
        if (hit) drums.hihat.push({ time: bar + idx * 0.125, velocity: 0.4 });
      });
    }
    
    return drums;
  };

  const generatePianoPart = (melody, chordProgression) => {
    const piano = [];
    
    // Left hand: chord voicings
    chordProgression.forEach((chord, idx) => {
      piano.push({
        hand: 'left',
        notes: chord.voicing || chord.notes.map(n => noteToMidi(n, 3)),
        duration: 1.0,
        time: idx
      });
    });
    
    // Right hand: melody doubling with harmony
    melody.forEach((note, idx) => {
      piano.push({
        hand: 'right',
        note: note.note,
        octave: note.octave,
        duration: note.duration,
        time: idx * 0.5
      });
    });
    
    return piano;
  };

  // ============================================
  // GENRE-SPECIFIC COMPOSITION RULES
  // ============================================

  const GENRE_RULES = {
    'country-ballad': {
      chordProgressions: [
        ['I', 'V', 'vi', 'IV'],
        ['I', 'IV', 'V', 'I'],
        ['I', 'V', 'vi', 'iii', 'IV', 'I', 'IV', 'V'],
        ['vi', 'IV', 'I', 'V']
      ],
      structure: ['intro', 'verse', 'verse', 'chorus', 'verse', 'chorus', 'bridge', 'chorus', 'outro'],
      tempoRange: [60, 90],
      melodicContour: 'smooth',
      rhythmicDensity: 'moderate',
      chordRhythm: 'slow',
      preferredMode: 'major',
      characteristicIntervals: [2, 3, 5],
    },
    'bluegrass': {
      chordProgressions: [
        ['I', 'IV', 'I', 'V'],
        ['I', 'V', 'I', 'IV', 'I', 'V', 'I'],
        ['I', 'IV', 'I', 'V', 'I']
      ],
      structure: ['intro', 'verse', 'chorus', 'instrumental', 'verse', 'chorus', 'outro'],
      tempoRange: [120, 180],
      melodicContour: 'active',
      rhythmicDensity: 'high',
      chordRhythm: 'fast',
      preferredMode: 'major',
      characteristicIntervals: [2, 4, 5, 7],
    },
    'folk-pop': {
      chordProgressions: [
        ['I', 'V', 'vi', 'IV'],
        ['vi', 'IV', 'I', 'V'],
        ['I', 'IV', 'vi', 'V']
      ],
      structure: ['intro', 'verse', 'chorus', 'verse', 'chorus', 'bridge', 'chorus', 'outro'],
      tempoRange: [90, 120],
      melodicContour: 'balanced',
      rhythmicDensity: 'moderate',
      chordRhythm: 'moderate',
      preferredMode: 'major',
      characteristicIntervals: [2, 3, 5],
    }
  };

  // ============================================
  // CHORD PROGRESSION WITH VOICE LEADING
  // ============================================

  const romanToChordDegree = (roman, key, mode) => {
    const degreeMap = {
      'I': 0, 'ii': 1, 'iii': 2, 'IV': 3, 'V': 4, 'vi': 5, 'vii': 6
    };
    
    const degree = degreeMap[roman];
    const scaleNotes = getScaleNotes(key, mode);
    const root = scaleNotes[degree];
    
    const isMinor = roman === roman.toLowerCase();
    const third = isMinor ? 3 : 4;
    
    const rootMidi = NOTE_NAMES.indexOf(root);
    return {
      root,
      notes: [
        NOTE_NAMES[rootMidi],
        NOTE_NAMES[(rootMidi + third) % 12],
        NOTE_NAMES[(rootMidi + 7) % 12]
      ],
      roman,
      isMinor,
      voicing: null
    };
  };

  const generateChordProgression = (genre, key, mode, numBars) => {
    const rules = GENRE_RULES[genre];
    const progressionTemplate = rules.chordProgressions[
      Math.floor(Math.random() * rules.chordProgressions.length)
    ];
    
    const progression = [];
    let idx = 0;
    
    for (let bar = 0; bar < numBars; bar++) {
      const romanNumeral = progressionTemplate[idx % progressionTemplate.length];
      const chord = romanToChordDegree(romanNumeral, key, mode);
      
      // Apply voice leading optimization
      if (progression.length > 0) {
        chord.voicing = optimizeVoiceLeading(progression[progression.length - 1], chord);
      } else {
        chord.voicing = chord.notes.map((n, i) => noteToMidi(n, 3 + i));
      }
      
      progression.push(chord);
      idx++;
    }
    
    return progression;
  };

  // ============================================
  // MELODY WITH RHYTHM PATTERNS
  // ============================================

  const generateMelody = (chordProgression, lyricsAnalysis, genre, key, mode) => {
    const rules = GENRE_RULES[genre];
    const scaleNotes = getScaleNotes(key, mode);
    const rhythmPatterns = RHYTHM_PATTERNS[genre].melody;
    const melody = [];
    
    if (!lyricsAnalysis || lyricsAnalysis.lines.length === 0) return melody;
    
    let currentOctave = 4;
    let previousNote = scaleNotes[0];
    let lineIdx = 0;
    
    chordProgression.forEach((chord, chordIdx) => {
      if (lineIdx >= lyricsAnalysis.lines.length) return;
      
      const line = lyricsAnalysis.lines[lineIdx];
      const rhythmPattern = rhythmPatterns[chordIdx % rhythmPatterns.length];
      const chordTones = chord.notes;
      
      let syllableIdx = 0;
      
      rhythmPattern.forEach((duration, beatIdx) => {
        if (syllableIdx >= line.totalSyllables) return;
        
        let targetNote;
        
        // Melodic contour based on phrase position
        const phraseProgress = syllableIdx / line.totalSyllables;
        
        if (rules.melodicContour === 'smooth') {
          const prevIndex = scaleNotes.indexOf(previousNote);
          const candidates = [
            scaleNotes[prevIndex],
            scaleNotes[(prevIndex + 1) % scaleNotes.length],
            scaleNotes[(prevIndex - 1 + scaleNotes.length) % scaleNotes.length]
          ];
          
          if (beatIdx % 4 === 0) {
            targetNote = chordTones[Math.floor(Math.random() * chordTones.length)];
          } else {
            targetNote = candidates[Math.floor(Math.random() * candidates.length)];
          }
        } else {
          targetNote = scaleNotes[Math.floor(Math.random() * scaleNotes.length)];
        }
        
        // Phrase arc: rise to middle, fall at end
        if (phraseProgress < 0.3) {
          currentOctave = 4;
        } else if (phraseProgress < 0.7) {
          currentOctave = Math.random() > 0.4 ? 5 : 4;
        } else {
          currentOctave = 4;
        }
        
        melody.push({
          note: targetNote,
          octave: currentOctave,
          duration,
          syllable: line.words[Math.floor(syllableIdx / line.syllables[0])],
          chordContext: chord.roman,
          stress: beatIdx % 4 === 0
        });
        
        previousNote = targetNote;
        syllableIdx++;
      });
      
      if (syllableIdx >= line.totalSyllables) lineIdx++;
    });
    
    return melody;
  };

  // ============================================
  // BASS WITH VOICE LEADING
  // ============================================

  const generateBassLine = (chordProgression, genre) => {
    const rules = GENRE_RULES[genre];
    const rhythmPattern = RHYTHM_PATTERNS[genre].bass[0];
    const bassLine = [];
    
    chordProgression.forEach((chord, idx) => {
      const root = NOTE_NAMES.indexOf(chord.root);
      const fifth = NOTE_NAMES[(root + 7) % 12];
      const third = chord.notes[1];
      
      // Voice leading: connect to next chord smoothly
      const nextChord = chordProgression[(idx + 1) % chordProgression.length];
      const nextRoot = NOTE_NAMES.indexOf(nextChord.root);
      
      rhythmPattern.forEach((duration, beatIdx) => {
        let note;
        
        if (beatIdx === 0) {
          note = chord.root;
        } else if (beatIdx === rhythmPattern.length - 1) {
          // Leading tone to next chord
          const interval = (nextRoot - root + 12) % 12;
          if (interval === 1 || interval === 11) {
            note = NOTE_NAMES[(root + (interval === 1 ? 11 : 1)) % 12];
          } else {
            note = fifth;
          }
        } else {
          note = [chord.root, third, fifth][beatIdx % 3];
        }
        
        bassLine.push({ note, octave: 2, duration });
      });
    });
    
    return bassLine;
  };

  // ============================================
  // SONG STRUCTURE GENERATOR
  // ============================================

  const generateSongStructure = (genre, lyricsAnalysis) => {
    const rules = GENRE_RULES[genre];
    const structure = [];
    
    const verses = lyricsAnalysis ? 
      lyricsAnalysis.lines.filter((_, i) => i % 4 < 2) : [];
    
    rules.structure.forEach(section => {
      if (section === 'verse' && verses.length > 0) {
        const verseIdx = structure.filter(s => s.type === 'verse').length;
        structure.push({
          type: 'verse',
          lyrics: verses.slice(verseIdx * 2, (verseIdx + 1) * 2),
          bars: 8
        });
      } else if (section === 'chorus') {
        structure.push({
          type: 'chorus',
          lyrics: lyricsAnalysis ? lyricsAnalysis.lines.slice(2, 4) : [],
          bars: 8
        });
      } else {
        structure.push({
          type: section,
          lyrics: [],
          bars: section === 'bridge' ? 4 : 4
        });
      }
    });
    
    return structure;
  };

  // ============================================
  // MAIN COMPOSITION GENERATOR
  // ============================================

  const generateComposition = () => {
    setIsGenerating(true);
    setGenerationLog([]);
    
    const log = (message) => {
      setGenerationLog(prev => [...prev, message]);
    };
    
    setTimeout(() => {
      log(`🎵 Starting composition: "${songParams.title}"`);
      log(`📊 Genre: ${songParams.genre} | Key: ${songParams.key} ${songParams.mode} | Tempo: ${songParams.tempo} BPM`);
      
      // Analyze lyrics
      const lyricsAnalysis = songParams.lyrics ? analyzeLyrics(songParams.lyrics) : null;
      if (lyricsAnalysis) {
        log(`📝 Rhyme scheme detected: ${lyricsAnalysis.rhymeScheme.join('-')}`);
        log(`📝 Total syllables: ${lyricsAnalysis.lines.reduce((sum, l) => sum + l.totalSyllables, 0)}`);
      }
      
      // Generate structure
      const structure = generateSongStructure(songParams.genre, lyricsAnalysis);
      log(`🎼 Structure: ${structure.map(s => s.type).join(' → ')}`);
      
      // Generate sections with full instrumentation
      const sections = structure.map(section => {
        const chords = generateChordProgression(
          songParams.genre,
          songParams.key,
          songParams.mode,
          section.bars
        );
        
        log(`${section.type}: ${chords.map(c => c.roman).join(' - ')}`);
        
        const harmonicRhythm = generateHarmonicRhythm(section, chords);
        log(`  ↳ Harmonic rhythm: ${harmonicRhythm.map(h => h.duration).join('-')} bars`);
        
        const melody = section.lyrics && section.lyrics.length > 0
          ? generateMelody(chords, { lines: section.lyrics }, songParams.genre, songParams.key, songParams.mode)
          : [];
        
        const bass = generateBassLine(chords, songParams.genre);
        const guitar = generateGuitarPart(chords, songParams.genre);
        const piano = melody.length > 0 ? generatePianoPart(melody, chords) : [];
        const drums = generateDrumPart(songParams.genre, section.bars);
        
        return {
          ...section,
          chords,
          harmonicRhythm,
          melody,
          bass,
          guitar,
          piano,
          drums
        };
      });
      
      log('✅ Composition complete!');
      log(`📊 Total sections: ${sections.length}`);
      log(`🎹 Melody notes: ${sections.reduce((sum, s) => sum + s.melody.length, 0)}`);
      log(`🎸 Guitar notes: ${sections.reduce((sum, s) => sum + s.guitar.length, 0)}`);
      log(`🥁 Drum hits: ${sections.reduce((sum, s) => sum + s.drums.kick.length + s.drums.snare.length, 0)}`);
      
      setComposition({ structure, sections, params: songParams, lyricsAnalysis });
      setIsGenerating(false);
    }, 100);
  };

  // ============================================
  // PLAYBACK (Simplified)
  // ============================================

  const stopPlayback = () => {
    stopRequestedRef.current = true;
    const nodes = scheduledNotesRef.current.splice(0);
    nodes.forEach(node => {
      try { if (node.stop) node.stop(); } catch {}
      try { node.disconnect?.(); } catch {}
    });
    setIsPlaying(false);
  };

  const scheduleTick = (time, strong = false) => {
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = strong ? 1400 : 900;
    osc.type = 'square';
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(strong ? 0.3 : 0.15, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.06);
    osc.connect(gain);
    gain.connect(masterGainRef.current || ctx.destination);
    osc.start(time);
    osc.stop(time + 0.08);
    scheduledNotesRef.current.push(osc);
    osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch {} };
  };
  // ============================================
  // UI RENDERING

  const exportComposition = () => {
    if (!composition) return;
    
    const json = JSON.stringify(composition, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${songParams.title.replace(/\s+/g, '_')}_composition.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Minimal MIDI export (melody only, Type 0)
  const exportMelodyMIDI = () => {
    if (!composition) return;
    const PPQ = 480;
    // Build events
    const events = [];
    const pushVarLen = (arr, value) => {
      let buffer = value & 0x7F;
      const bytes = [];
      while ((value >>= 7)) { buffer <<= 8; buffer |= ((value & 0x7F) | 0x80); }
      while (true) { bytes.push(buffer & 0xFF); if (buffer & 0x80) buffer >>= 8; else break; }
      arr.push(...bytes);
    };
    const track = [];
    let ticks = 0;
    const noteOn = (dt, note, vel=80) => { pushVarLen(track, dt); track.push(0x90, note, vel); };
    const noteOff = (dt, note) => { pushVarLen(track, dt); track.push(0x80, note, 0x40); };
    const secondsPerBeat = 60 / songParams.tempo;
    const beatsToTicks = (beats) => Math.max(1, Math.round(beats * PPQ));
    // Simple: linearize melody
    composition.sections.forEach(section => {
      section.melody.forEach(note => {
        const midi = noteToMidi(note.note, note.octave);
        const durBeats = note.duration;
        noteOn(0, midi);
        noteOff(beatsToTicks(durBeats), midi);
      });
    });
    // End of track
    track.push(0x00, 0xFF, 0x2F, 0x00);
    // Track chunk
    const trackLen = track.length;
    const header = [
      0x4D,0x54,0x68,0x64, // MThd
      0x00,0x00,0x00,0x06, // header length
      0x00,0x00,           // format 0
      0x00,0x01,           // ntrks = 1
      (PPQ >> 8) & 0xFF, PPQ & 0xFF // division
    ];
    const trkHeader = [
      0x4D,0x54,0x72,0x6B, // MTrk
      (trackLen >> 24)&0xFF, (trackLen >> 16)&0xFF, (trackLen >> 8)&0xFF, trackLen & 0xFF
    ];
    const bytes = new Uint8Array([...header, ...trkHeader, ...track]);
    const blob = new Blob([bytes], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${songParams.title.replace(/\s+/g, '_') || 'composition'}_melody.mid`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportMultiMIDI = (parts = ['bass','drums']) => {
    if (!composition) return;
    // Very small, naive multi-track MIDI builder
    const PPQ = 480;
    const pushVarLen = (arr, value) => {
      let buffer = value & 0x7F;
      const bytes = [];
      while ((value >>= 7)) { buffer <<= 8; buffer |= ((value & 0x7F) | 0x80); }
      while (true) { bytes.push(buffer & 0xFF); if (buffer & 0x80) buffer >>= 8; else break; }
      arr.push(...bytes);
    };

    const buildTrack = (seq) => {
      const track = [];
      const secondsPerBeat = 60 / songParams.tempo;
      const beatsToTicks = (beats) => Math.max(1, Math.round(beats * PPQ));
      seq.forEach(note => {
        const midi = noteToMidi(note.note, note.octave);
        pushVarLen(track, 0); track.push(0x90, midi, 0x60);
        pushVarLen(track, beatsToTicks(note.duration)); track.push(0x80, midi, 0x40);
      });
      track.push(0x00, 0xFF, 0x2F, 0x00);
      return track;
    };

    // Collect sequences
    const tracks = [];
    for (const part of parts) {
      const seq = [];
      composition.sections.forEach(section => {
        const partSeq = section[part] || [];
        // normalize part sequences if they have note names
        partSeq.forEach(p => { if (p.note) seq.push(p); });
      });
      tracks.push(buildTrack(seq));
    }

    // Header
    const header = [0x4D,0x54,0x68,0x64, 0x00,0x00,0x00,0x06, 0x00,0x01, (tracks.length>>8)&0xFF, tracks.length&0xFF, (PPQ>>8)&0xFF, PPQ&0xFF];
    const body = [];
    for (const tr of tracks) {
      const len = tr.length;
      body.push(0x4D,0x54,0x72,0x6B, (len>>24)&0xFF, (len>>16)&0xFF, (len>>8)&0xFF, len&0xFF, ...tr);
    }
    const bytes = new Uint8Array([...header, ...body]);
    const blob = new Blob([bytes], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${songParams.title.replace(/\s+/g,'_') || 'comp'}_parts.mid`; a.click(); URL.revokeObjectURL(url);
  };

  // Expose exportMultiMIDI on window for host pages that call the helper
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && exportMultiMIDI) {
        window.exportMultiMIDI = exportMultiMIDI;
      }
    } catch (e) {}
    return () => {
      try { if (typeof window !== 'undefined') delete window.exportMultiMIDI; } catch {}
    };
  }, []);

  // Timeline & scheduling helpers
  const computeTotalBeats = useCallback(() => {
    if (!composition) return 0;
    return composition.sections.reduce((sum, s) => sum + ((s.bars || 0) * 4), 0);
  }, [composition]);

  const handleTimelineClick = (e) => {
    try {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, x / rect.width));
      const total = computeTotalBeats() || 0;
      const beat = Math.floor(pct * total);
      setPlaybackStartBeat(beat);
      // start playback from that beat for quick audition
      playComposition(beat);
    } catch (err) { console.warn('Timeline click failed', err); }
  };

  const flattenPart = useCallback((partName) => {
    const events = [];
    if (!composition) return events;
    let sectionStart = 0;
    composition.sections.forEach(section => {
      const bars = section.bars || 0;
      if (partName === 'drums') {
        const drums = section.drums || { kick: [], snare: [], hihat: [] };
        ['kick','snare','hihat'].forEach(k => {
          const list = drums[k] || [];
          list.forEach(ev => {
            // ev.time is in bars units inside section; convert to beats
            const beat = sectionStart + (ev.time || 0) * 4;
            events.push({ startBeat: beat, duration: 0.125, type: k, velocity: ev.velocity || 0.6 });
          });
        });
      } else {
        const seq = section[partName] || [];
        let offset = 0;
        seq.forEach(n => {
          if (!n) return;
          if (n.note) {
            events.push({ startBeat: sectionStart + offset, duration: n.duration || 1, note: n.note, octave: n.octave });
            offset += n.duration || 0;
          } else if (n.notes && n.notes.length) {
            events.push({ startBeat: sectionStart + offset, duration: n.duration || 1, note: n.notes[0], octave: n.octave || 3 });
            offset += n.duration || 0;
          }
        });
      }
      sectionStart += bars * 4;
    });
    return events;
  }, [composition]);

  // ============================================
  const playComposition = (startBeat = 0) => {
    if (!composition || !audioContextRef.current) return;

    // If already playing, stop first
    if (isPlaying) stopPlayback();

    setIsPlaying(true);
    stopRequestedRef.current = false;
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    const leadIn = 0.05;
    const beatDuration = 60 / songParams.tempo;

    const totalBeats = computeTotalBeats();
    const loopEnd = loopEndBeat != null ? loopEndBeat : totalBeats;
    const playEndBeat = Math.min(totalBeats, loopEnd);

    setPlaybackStartBeat(startBeat);

    // Flatten events for the preview part
    const events = flattenPart(previewPart || 'melody');

    // Schedule events starting at or after startBeat and before playEndBeat
    events.forEach(ev => {
      if (ev.startBeat + (ev.duration || 0) <= startBeat) return; // before start
      if (ev.startBeat >= playEndBeat) return; // after end
      const when = now + leadIn + Math.max(0, (ev.startBeat - startBeat)) * beatDuration;
      if (previewPart === 'drums') {
        // Simple percussive click
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = ev.type === 'kick' ? 'sine' : 'square';
        o.frequency.value = ev.type === 'kick' ? 80 : (ev.type === 'snare' ? 180 : 7000);
        g.gain.setValueAtTime(0.001, when);
        g.gain.exponentialRampToValueAtTime(ev.velocity || 0.3, when + 0.001);
        g.gain.exponentialRampToValueAtTime(0.0001, when + 0.1);
        o.connect(g);
        const out = mixerNodesRef.current['drums'] || masterGainRef.current || ctx.destination;
        g.connect(out);
        o.start(when);
        o.stop(when + 0.12);
        scheduledNotesRef.current.push(o);
      } else {
        const midi = noteToMidi(ev.note, ev.octave || 4);
        const freq = midiToFrequency(midi);
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = previewPart === 'bass' ? 'triangle' : 'sine';
        o.frequency.value = freq;
        const dur = (ev.duration || 1) * beatDuration;
        g.gain.setValueAtTime(0.0001, when);
        g.gain.exponentialRampToValueAtTime(previewPart === 'bass' ? 0.2 : 0.18, when + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
        o.connect(g);
        const out = mixerNodesRef.current[previewPart] || masterGainRef.current || ctx.destination;
        g.connect(out);
        o.start(when);
        o.stop(when + dur + 0.01);
        scheduledNotesRef.current.push(o);
      }
    });

    // Schedule metronome if enabled (for the specified playback window)
    if (metronomeOn) {
      for (let b = Math.floor(startBeat); b < Math.ceil(playEndBeat); b++) {
        const t = now + leadIn + (b - startBeat) * beatDuration;
        scheduleTick(t, b % 4 === 0);
      }
    }

    // Progress watchdog
    const durationMs = Math.max(0, (playEndBeat - startBeat) * beatDuration * 1000 + 100);
    const startedAt = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setPlaybackProgress(Math.min(1, elapsed / durationMs));
      if (elapsed >= durationMs || stopRequestedRef.current) {
        clearInterval(timer);
      }
    }, 100);

    setTimeout(() => {
      if (!stopRequestedRef.current) {
        if (loopEndBeat != null && !stopRequestedRef.current) {
          // loop: restart at loopStart
          playComposition(loopStartBeat || 0);
        } else {
          setIsPlaying(false);
        }
      }
      setPlaybackProgress(0);
      clearInterval(timer);
    }, durationMs);
  };

  const totalBeats = computeTotalBeats() || 0;

  return (
    <div className="advanced-composer-root p-4">
      <div className="grid gap-4" onDragOver={handleDragOver} onDrop={handleDrop}>
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4">
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><Music className="w-5 h-5"/> Song Parameters</h3>
          <div className="grid grid-cols-2 gap-2">
            <input type="text" value={songParams.title} onChange={(e)=>setSongParams(s=>({...s,title:e.target.value}))} placeholder="Title" className="bg-gray-800 p-2 rounded" />
            <select value={songParams.genre} onChange={(e)=>setSongParams(s=>({...s,genre:e.target.value}))} className="bg-gray-800 p-2 rounded">
              <option value="country-ballad">Country Ballad</option>
              <option value="bluegrass">Bluegrass</option>
              <option value="folk-pop">Folk Pop</option>
            </select>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={generateComposition} className="bg-cyan-600 p-2 rounded font-bold">{isGenerating ? 'Generating...' : 'Generate'}</button>
            <button onClick={exportComposition} className="bg-blue-600 p-2 rounded">Export JSON</button>
          </div>
        </div>

        {/* Import Toolbar */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 flex flex-wrap gap-2 items-center">
          <div className="font-bold mr-2">Sample Library</div>
          <button onClick={()=>triggerFilePicker(false)} className="bg-emerald-600 p-2 rounded">Import Files</button>
          <button onClick={()=>triggerFilePicker(true)} className="bg-emerald-700 p-2 rounded">Import Folder (Recursive)</button>
          <button onClick={clearAllSamples} className="bg-red-700 p-2 rounded">Clear All</button>
          <button onClick={loadSamplesFromDB} className="bg-gray-700 p-2 rounded">Reload Stored</button>
          <button onClick={reclassifyInstruments} disabled={isReclassifying} className="bg-indigo-700 p-2 rounded">{isReclassifying ? 'Reclassifying…' : 'Reclassify'}</button>
          <div className="ml-auto text-sm text-gray-300">{dbStatus}</div>

          {/* Hidden inputs */}
          <input ref={fileInputRef} type="file" multiple accept="audio/*" onChange={onFilePickerChange} style={{ display: 'none' }} />
          <input ref={folderInputRef} type="file" multiple webkitdirectory="" directory="" onChange={onFilePickerChange} style={{ display: 'none' }} />
        </div>

        {/* Import Summary */}
        {showImportSummary && importSummary && (
          <div className="bg-black/30 rounded p-3 text-sm text-gray-200">
            <div className="font-bold mb-1">Import Summary</div>
            <div>Imported: {importSummary.imported} / {importSummary.total}</div>
            <div>Default MIDI used: {importSummary.defaultMidiUsed}</div>
            <div>Errors: {importSummary.errors}</div>
          </div>
        )}

        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 flex gap-2 items-center">
          <button onClick={()=>playComposition(0)} className="bg-green-600 p-2 rounded">Play Preview</button>
          <button onClick={stopPlayback} className="bg-gray-700 p-2 rounded">Stop</button>
          <button onClick={exportMelodyMIDI} className="bg-indigo-600 p-2 rounded">Export Melody MIDI</button>
          <button onClick={()=>exportMultiMIDI(['bass','drums','melody'])} className="bg-purple-600 p-2 rounded">Export Parts MIDI</button>

          <div className="ml-4 flex items-center gap-2">
            <label className="text-sm text-gray-300">Start Beat</label>
            <input type="number" min="0" value={playbackStartBeat} onChange={(e)=> setPlaybackStartBeat(parseFloat(e.target.value) || 0)} className="w-20 bg-gray-800 p-1 rounded" />
            <button onClick={()=> playComposition(playbackStartBeat)} className="bg-cyan-500 p-1 rounded">Play from Beat</button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <label className="text-sm text-gray-300">Loop</label>
            <input type="number" min="0" placeholder="start" value={loopStartBeat ?? ''} onChange={(e)=> setLoopStartBeat(e.target.value === '' ? null : parseFloat(e.target.value))} className="w-20 bg-gray-800 p-1 rounded" />
            <input type="number" min="0" placeholder="end" value={loopEndBeat ?? ''} onChange={(e)=> setLoopEndBeat(e.target.value === '' ? null : parseFloat(e.target.value))} className="w-20 bg-gray-800 p-1 rounded" />
            <button onClick={()=> { if (loopEndBeat != null) playComposition(loopStartBeat || 0); }} className="bg-yellow-500 p-1 rounded">Play Loop</button>
            <label className="text-sm text-gray-300">Preview</label>
            <select value={previewPart} onChange={(e)=>setPreviewPart(e.target.value)} className="bg-gray-800 p-1 rounded">
              <option value="melody">Melody</option>
              <option value="bass">Bass</option>
              <option value="drums">Drums</option>
            </select>
          </div>
        </div>

        <div className="bg-gray-900 rounded p-3">
          <h4 className="font-bold mb-2">Mini Mixer</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(mixer).map(([name,ch]) => (
              <div key={name} className="flex items-center gap-2">
                <div className="w-24 text-sm capitalize">{name}</div>
                <input type="range" min="0" max="1" step="0.01" value={ch.vol} onChange={(e)=> setMixer(m=>({...m,[name]:{...m[name],vol:parseFloat(e.target.value)}}))} />
                <button onClick={()=> setMixer(m=>({...m,[name]:{...m[name],mute:!m[name].mute}}))} className={`px-2 py-1 rounded ${ch.mute?'bg-red-600':'bg-gray-700'}`}>{ch.mute?'M':''}</button>
              </div>
            ))}
          </div>
        </div>
  {/* Timeline - clickable scrub + loop markers */}
        <div className="mt-3">
          <div
            ref={timelineRef}
            onClick={handleTimelineClick}
            className="w-full h-8 bg-gray-800 rounded relative cursor-pointer"
            title="Click to play from this beat"
          >
            <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-500 to-purple-500" style={{ width: `${Math.round((playbackProgress || 0) * 100)}%` }} />
            {/* Loop markers */}
            {typeof loopStartBeat === 'number' && totalBeats > 0 && (
              <div className="absolute top-0 h-full w-0.5 bg-yellow-400" style={{ left: `${(loopStartBeat/Math.max(1,totalBeats))*100}%` }} />
            )}
            {typeof loopEndBeat === 'number' && totalBeats > 0 && (
              <div className="absolute top-0 h-full w-0.5 bg-yellow-400" style={{ left: `${(loopEndBeat/Math.max(1,totalBeats))*100}%` }} />
            )}
            {/* beat labels */}
            <div className="absolute left-1 top-1 text-xs text-gray-300">0</div>
            <div className="absolute right-1 top-1 text-xs text-gray-300">{totalBeats}</div>
          </div>
        </div>

        {/* Generation Log (compact) */}
        <div className="mt-3">
          <div className="bg-black/30 rounded p-2 h-40 overflow-y-auto font-mono text-sm text-gray-200">
            {generationLog.length === 0 ? (
              <div className="text-gray-400">No generation activity yet.</div>
            ) : (
              generationLog.map((line, i) => (
                <div key={i} className="mb-1">{line}</div>
              ))
            )}
          </div>
        </div>

        {/* Library Browser (compact) */}
        <div className="mt-3 bg-gray-900 rounded p-3">
          <div className="font-bold mb-2">Samples ({sampleMetadata.length})</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
            {sampleMetadata.slice(0, 200).map((m) => (
              <div key={m.id} className="bg-black/30 rounded p-2 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-gray-200 text-xs">{m.fileName}</div>
                  <div className="text-[10px] text-gray-400">{m.instrument || 'unknown'} • MIDI {m.midi}</div>
                </div>
                <div className="flex gap-1">
                  <button onClick={()=>auditionSample(m.id)} className="bg-green-700 px-2 py-1 rounded text-xs">Play</button>
                  <button onClick={()=>focusSample(m.id)} className="bg-cyan-700 px-2 py-1 rounded text-xs">Focus</button>
                </div>
              </div>
            ))}
            {sampleMetadata.length > 200 && (
              <div className="text-xs text-gray-400">Showing first 200…</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

try { if (typeof window !== 'undefined') window.AdvancedComposer = AdvancedComposer; } catch {}