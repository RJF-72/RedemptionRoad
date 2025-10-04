import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Shield, FileText, Music, Hash, Key, Lock, Award, Users, Calendar, Database, Download, Upload, Check, AlertTriangle, Headphones, Mic, Guitar, Disc } from 'lucide-react';

const DigitalFingerprintMetadata = () => {
  const [currentTrack, setCurrentTrack] = useState({
    id: 'track_001',
    title: 'Untitled Track',
    duration: '00:00',
    fingerprint: null,
    metadata: {},
    license: null,
    trackNumber: 1
  });
  
  const [metadata, setMetadata] = useState({
    title: 'My SOTA Creation',
    artist: 'Artist Name',
    album: 'SOTA Sessions',
    genre: 'Country',
    year: new Date().getFullYear(),
    track: 1,
    totalTracks: 12,
    composer: '',
    publisher: '',
    copyright: '© 2025 Artist Name',
    isrc: '',
    iswc: '',
    bpm: 120,
    key: 'G Major',
    mood: 'Energetic',
    language: 'English',
    lyrics: '',
    description: 'Created with SOTA Synthesizer voice-to-MIDI technology',
    tags: ['country', 'voice-to-midi', 'ai-composition', 'sota-synth'],
    sotaOrigin: {
      voiceToMidi: true,
      aiComposer: true,
      genrePack: 'Country (FREE)',
      synthesizer: 'SOTA',
      daw: 'Titan7'
    }
  });

  const [fingerprint, setFingerprint] = useState({
    id: null,
    hash: null,
    spectralSignature: null,
    chromaVector: null,
    rythmPattern: null,
    voiceSignature: null,
    sotaFingerprint: null,
    generatedAt: null,
    confidence: 0,
    matchingDatabase: [],
    titan7Integration: true
  });

  const [licenseInfo, setLicenseInfo] = useState({
    type: 'custom',
    owner: 'Artist Name',
    publisher: '',
    recordLabel: '',
    distributionRights: {
      streaming: true,
      download: true,
      broadcast: true,
      sync: false,
      remix: false,
      commercial: false
    },
    territory: 'worldwide',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    royaltySplit: [
      { party: 'Artist', percentage: 70, role: 'Performer' },
      { party: 'Producer', percentage: 20, role: 'Producer' },
      { party: 'Label', percentage: 10, role: 'Publisher' }
    ],
    licenseFee: 0,
    currency: 'USD',
    customTerms: '',
    watermarkEnabled: true,
    drmProtection: false
  });

  const [fingerprintStatus, setFingerprintStatus] = useState('idle');
  const [metadataStatus, setMetadataStatus] = useState('idle');
  const [licenseStatus, setLicenseStatus] = useState('idle');
  const [exportFormat, setExportFormat] = useState('mp3');
  const [embeddingProgress, setEmbeddingProgress] = useState(0);

  const audioContext = useRef(null);
  const analyser = useRef(null);
  const processingBuffer = useRef(null);

  // Initialize audio context for fingerprinting
  useEffect(() => {
    initializeAudio();
    return cleanup;
  }, []);

  const initializeAudio = () => {
    try {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      analyser.current = audioContext.current.createAnalyser();
      analyser.current.fftSize = 2048;
    } catch (error) {
      console.error('Audio initialization failed:', error);
    }
  };

  const cleanup = () => {
    if (audioContext.current) {
      audioContext.current.close();
    }
  };

  // Digital Fingerprinting Algorithms
  const generateFingerprint = async () => {
    setFingerprintStatus('generating');
    setEmbeddingProgress(0);
    
    try {
      // Simulate audio analysis for fingerprinting
      const steps = [
        'Analyzing spectral content...',
        'Extracting chroma features...',
        'Computing rhythm patterns...',
        'Generating unique hash...',
        'Creating fingerprint signature...'
      ];
      
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setEmbeddingProgress(((i + 1) / steps.length) * 100);
      }
      
      // Generate mock fingerprint data
      const spectralSignature = Array.from({ length: 12 }, () => 
        Math.random().toString(36).substring(2, 8)
      ).join('');
      
      const chromaVector = Array.from({ length: 12 }, () => 
        Math.random()
      );
      
      const rhythmPattern = Array.from({ length: 8 }, () => 
        Math.floor(Math.random() * 16)
      );
      
      const hash = btoa(spectralSignature + Date.now()).substring(0, 32);
      
      const newFingerprint = {
        id: `fp_${Date.now()}`,
        hash,
        spectralSignature,
        chromaVector,
        rhythmPattern,
        generatedAt: new Date().toISOString(),
        confidence: 95 + Math.random() * 5,
        matchingDatabase: []
      };
      
      setFingerprint(newFingerprint);
      setFingerprintStatus('completed');
      
      // Simulate database matching
      setTimeout(checkDatabaseMatches, 2000);
      
    } catch (error) {
      console.error('Fingerprint generation failed:', error);
      setFingerprintStatus('error');
    }
  };

  const checkDatabaseMatches = () => {
    // Simulate checking against fingerprint database
    const mockMatches = [
      { 
        similarity: 23.5, 
        title: 'Similar Track A', 
        artist: 'Artist B',
        confidence: 'Low',
        database: 'AudioID'
      },
      { 
        similarity: 8.2, 
        title: 'Related Song', 
        artist: 'Another Artist',
        confidence: 'Very Low',
        database: 'Shazam'
      }
    ];
    
    setFingerprint(prev => ({
      ...prev,
      matchingDatabase: mockMatches
    }));
  };

  const embedMetadata = async () => {
    setMetadataStatus('embedding');
    setEmbeddingProgress(0);
    
    try {
      const steps = [
        'Preparing metadata tags...',
        'Encoding ID3 information...',
        'Adding cover art...',
        'Setting copyright info...',
        'Finalizing metadata...'
      ];
      
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setEmbeddingProgress(((i + 1) / steps.length) * 100);
      }
      
      // Generate ISRC if not provided
      if (!metadata.isrc) {
        const isrc = `US-${Math.random().toString(36).substring(2, 5).toUpperCase()}-${new Date().getFullYear().toString().substring(2)}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
        setMetadata(prev => ({ ...prev, isrc }));
      }
      
      setMetadataStatus('completed');
      
    } catch (error) {
      console.error('Metadata embedding failed:', error);
      setMetadataStatus('error');
    }
  };

  const generateLicense = async () => {
    setLicenseStatus('generating');
    setEmbeddingProgress(0);
    
    try {
      const steps = [
        'Validating license terms...',
        'Generating license ID...',
        'Creating smart contract...',
        'Setting up royalty splits...',
        'Finalizing license agreement...'
      ];
      
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setEmbeddingProgress(((i + 1) / steps.length) * 100);
      }
      
      // Generate license ID
      const licenseId = `LIC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      setLicenseInfo(prev => ({
        ...prev,
        licenseId,
        generatedAt: new Date().toISOString(),
        blockchainHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
      }));
      
      setLicenseStatus('completed');
      
    } catch (error) {
      console.error('License generation failed:', error);
      setLicenseStatus('error');
    }
  };

  const handleMetadataChange = (field, value) => {
    setMetadata(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLicenseChange = (field, value) => {
    setLicenseInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRoyaltySplitChange = (index, field, value) => {
    const newSplit = [...licenseInfo.royaltySplit];
    newSplit[index] = { ...newSplit[index], [field]: value };
    
    // Auto-adjust percentages to total 100%
    if (field === 'percentage') {
      const total = newSplit.reduce((sum, split, i) => sum + (i === index ? parseFloat(value) || 0 : split.percentage), 0);
      if (total > 100) {
        const excess = total - 100;
        newSplit.forEach((split, i) => {
          if (i !== index && split.percentage > 0) {
            split.percentage = Math.max(0, split.percentage - (excess / (newSplit.length - 1)));
          }
        });
      }
    }
    
    setLicenseInfo(prev => ({
      ...prev,
      royaltySplit: newSplit
    }));
  };

  const addRoyaltySplit = () => {
    setLicenseInfo(prev => ({
      ...prev,
      royaltySplit: [
        ...prev.royaltySplit,
        { party: 'New Party', percentage: 0, role: 'Contributor' }
      ]
    }));
  };

  const removeRoyaltySplit = (index) => {
    setLicenseInfo(prev => ({
      ...prev,
      royaltySplit: prev.royaltySplit.filter((_, i) => i !== index)
    }));
  };

  const exportWithEmbeddedData = () => {
    // Simulate export process
    const exportData = {
      metadata,
      fingerprint,
      license: licenseInfo,
      format: exportFormat,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${metadata.title.replace(/\s+/g, '_')}_metadata.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <Check className="w-5 h-5 text-green-400" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'generating':
      case 'embedding': return <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;
      default: return <div className="w-5 h-5 bg-gray-400 rounded-full" />;
    }
  };

  const licenseTypes = [
    { value: 'custom', label: 'Custom License' },
    { value: 'cc-by', label: 'Creative Commons Attribution' },
    { value: 'cc-by-sa', label: 'Creative Commons Attribution-ShareAlike' },
    { value: 'cc-by-nc', label: 'Creative Commons Attribution-NonCommercial' },
    { value: 'all-rights', label: 'All Rights Reserved' },
    { value: 'royalty-free', label: 'Royalty Free' },
    { value: 'sync-license', label: 'Synchronization License' }
  ];

  return (
    <div className="bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 text-white min-h-screen">
      <div className="bg-black/30 backdrop-blur-sm border-b border-amber-500/50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-amber-400" />
              <h1 className="text-3xl font-bold text-amber-200">🎛️ Titan7 Digital Fingerprint Suite</h1>
              <div className="bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
                <span className="text-amber-300 text-sm font-semibold">SOTA Integration</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={exportWithEmbeddedData}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-lg flex items-center space-x-2 transition-all font-semibold text-black"
              >
                <Download className="w-5 h-5" />
                <span>Export Protected Track</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* SOTA Integration Status Banner */}
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-600/20 border border-amber-500/30 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Mic className="w-5 h-5 text-amber-400" />
                <span className="text-amber-200">Voice-to-MIDI: {metadata.sotaOrigin?.voiceToMidi ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Music className="w-5 h-5 text-orange-400" />
                <span className="text-amber-200">AI Composer: {metadata.sotaOrigin?.aiComposer ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Disc className="w-5 h-5 text-red-400" />
                <span className="text-amber-200">Genre Pack: {metadata.sotaOrigin?.genrePack || 'None'}</span>
              </div>
            </div>
            <div className="text-amber-300 font-semibold">
              Track #{currentTrack.trackNumber} | {metadata.title}
            </div>
          </div>
        </div>

        {/* Enhanced Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-black/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center text-amber-200">
                <Hash className="w-5 h-5 mr-2 text-purple-400" />
                Digital Fingerprint
              </h2>
              {getStatusIcon(fingerprintStatus)}
            </div>
            <p className="text-sm text-gray-300 mb-4">
              🎤 Voice signature + audio analysis for unique identification
            </p>
            <div className="bg-purple-500/20 p-3 rounded-lg border border-purple-500/30 mb-4">
              <div className="text-xs text-purple-300 mb-1">SOTA FEATURES:</div>
              <div className="text-xs text-gray-300">
                • Voice pattern analysis<br/>
                • AI composition fingerprint<br/>
                • Instrument modeling signature
              </div>
            </div>
            <button
              onClick={generateFingerprint}
              disabled={fingerprintStatus === 'generating'}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:bg-gray-600 rounded-lg transition-all font-semibold"
            >
              {fingerprintStatus === 'generating' ? '🔍 Analyzing...' : '🎯 Generate Fingerprint'}
            </button>
          </div>

          <div className="bg-black/50 backdrop-blur-sm border border-blue-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center text-amber-200">
                <Database className="w-5 h-5 mr-2 text-blue-400" />
                SOTA Metadata
              </h2>
              {getStatusIcon(metadataStatus)}
            </div>
            <p className="text-sm text-gray-300 mb-4">
              🎵 Enhanced ID3 tags with SOTA creation details
            </p>
            <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30 mb-4">
              <div className="text-xs text-blue-300 mb-1">AUTO-GENERATED:</div>
              <div className="text-xs text-gray-300">
                • Voice-to-MIDI source info<br/>
                • AI composition style<br/>
                • Titan7 DAW signature
              </div>
            </div>
            <button
              onClick={embedMetadata}
              disabled={metadataStatus === 'embedding'}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:bg-gray-600 rounded-lg transition-all font-semibold"
            >
              {metadataStatus === 'embedding' ? '📝 Embedding...' : '📋 Embed Metadata'}
            </button>
          </div>

          <div className="bg-black/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center text-amber-200">
                <Award className="w-5 h-5 mr-2 text-green-400" />
                Smart License
              </h2>
              {getStatusIcon(licenseStatus)}
            </div>
            <p className="text-sm text-gray-300 mb-4">
              ⚖️ Blockchain-backed rights management with royalty splits
            </p>
            <div className="bg-green-500/20 p-3 rounded-lg border border-green-500/30 mb-4">
              <div className="text-xs text-green-300 mb-1">INCLUDES:</div>
              <div className="text-xs text-gray-300">
                • Voice rights protection<br/>
                • AI creation licensing<br/>
                • Genre pack compliance
              </div>
            </div>
            <button
              onClick={generateLicense}
              disabled={licenseStatus === 'generating'}
              className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:bg-gray-600 rounded-lg transition-all font-semibold"
            >
              {licenseStatus === 'generating' ? '⚖️ Creating...' : '🔒 Generate License'}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {(fingerprintStatus === 'generating' || metadataStatus === 'embedding' || licenseStatus === 'generating') && (
          <div className="bg-gray-800 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Processing...</span>
              <span className="text-sm">{Math.round(embeddingProgress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${embeddingProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Metadata Editor */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-2" />
                Track Metadata
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={metadata.title}
                    onChange={(e) => handleMetadataChange('title', e.target.value)}
                    className="w-full bg-gray-700 rounded p-3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Artist</label>
                  <input
                    type="text"
                    value={metadata.artist}
                    onChange={(e) => handleMetadataChange('artist', e.target.value)}
                    className="w-full bg-gray-700 rounded p-3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Album</label>
                  <input
                    type="text"
                    value={metadata.album}
                    onChange={(e) => handleMetadataChange('album', e.target.value)}
                    className="w-full bg-gray-700 rounded p-3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Genre</label>
                  <input
                    type="text"
                    value={metadata.genre}
                    onChange={(e) => handleMetadataChange('genre', e.target.value)}
                    className="w-full bg-gray-700 rounded p-3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Year</label>
                  <input
                    type="number"
                    value={metadata.year}
                    onChange={(e) => handleMetadataChange('year', parseInt(e.target.value))}
                    className="w-full bg-gray-700 rounded p-3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Track #</label>
                  <input
                    type="number"
                    value={metadata.track}
                    onChange={(e) => handleMetadataChange('track', parseInt(e.target.value))}
                    className="w-full bg-gray-700 rounded p-3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">BPM</label>
                  <input
                    type="number"
                    value={metadata.bpm}
                    onChange={(e) => handleMetadataChange('bpm', parseInt(e.target.value))}
                    className="w-full bg-gray-700 rounded p-3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Key</label>
                  <input
                    type="text"
                    value={metadata.key}
                    onChange={(e) => handleMetadataChange('key', e.target.value)}
                    className="w-full bg-gray-700 rounded p-3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">ISRC</label>
                  <input
                    type="text"
                    value={metadata.isrc}
                    onChange={(e) => handleMetadataChange('isrc', e.target.value)}
                    placeholder="US-XXX-XX-XXXXX"
                    className="w-full bg-gray-700 rounded p-3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">ISWC</label>
                  <input
                    type="text"
                    value={metadata.iswc}
                    onChange={(e) => handleMetadataChange('iswc', e.target.value)}
                    placeholder="T-XXX.XXX.XXX-X"
                    className="w-full bg-gray-700 rounded p-3"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Copyright</label>
                <input
                  type="text"
                  value={metadata.copyright}
                  onChange={(e) => handleMetadataChange('copyright', e.target.value)}
                  className="w-full bg-gray-700 rounded p-3"
                />
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={metadata.description}
                  onChange={(e) => handleMetadataChange('description', e.target.value)}
                  rows="3"
                  className="w-full bg-gray-700 rounded p-3"
                  placeholder="Track description, inspiration, or notes..."
                />
              </div>
            </div>

            {/* Digital Fingerprint Display */}
            {fingerprint.hash && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Key className="w-6 h-6 mr-2 text-purple-400" />
                  Digital Fingerprint
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Fingerprint Hash</label>
                    <div className="bg-gray-700 rounded p-3 font-mono text-sm break-all">
                      {fingerprint.hash}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Confidence</label>
                      <div className="text-2xl font-bold text-green-400">
                        {fingerprint.confidence.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Generated</label>
                      <div className="text-sm text-gray-400">
                        {new Date(fingerprint.generatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {fingerprint.matchingDatabase.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Database Matches</label>
                      <div className="space-y-2">
                        {fingerprint.matchingDatabase.map((match, index) => (
                          <div key={index} className="bg-gray-700 rounded p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{match.title}</div>
                                <div className="text-sm text-gray-400">{match.artist}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">{match.similarity}% similar</div>
                                <div className="text-xs text-gray-400">{match.confidence} confidence</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* License Manager */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <Lock className="w-6 h-6 mr-2" />
                Music License
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">License Type</label>
                  <select
                    value={licenseInfo.type}
                    onChange={(e) => handleLicenseChange('type', e.target.value)}
                    className="w-full bg-gray-700 rounded p-3"
                  >
                    {licenseTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Owner</label>
                    <input
                      type="text"
                      value={licenseInfo.owner}
                      onChange={(e) => handleLicenseChange('owner', e.target.value)}
                      className="w-full bg-gray-700 rounded p-3"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Publisher</label>
                    <input
                      type="text"
                      value={licenseInfo.publisher}
                      onChange={(e) => handleLicenseChange('publisher', e.target.value)}
                      className="w-full bg-gray-700 rounded p-3"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Territory</label>
                  <input
                    type="text"
                    value={licenseInfo.territory}
                    onChange={(e) => handleLicenseChange('territory', e.target.value)}
                    className="w-full bg-gray-700 rounded p-3"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Valid From</label>
                    <input
                      type="date"
                      value={licenseInfo.validFrom}
                      onChange={(e) => handleLicenseChange('validFrom', e.target.value)}
                      className="w-full bg-gray-700 rounded p-3"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Valid Until (Optional)</label>
                    <input
                      type="date"
                      value={licenseInfo.validUntil}
                      onChange={(e) => handleLicenseChange('validUntil', e.target.value)}
                      className="w-full bg-gray-700 rounded p-3"
                    />
                  </div>
                </div>
                
                {/* Distribution Rights */}
                <div>
                  <label className="block text-sm font-medium mb-3">Distribution Rights</label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(licenseInfo.distributionRights).map(([right, enabled]) => (
                      <label key={right} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(e) => handleLicenseChange('distributionRights', {
                            ...licenseInfo.distributionRights,
                            [right]: e.target.checked
                          })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm capitalize">{right}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Royalty Splits */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Royalty Splits
                </h2>
                <button
                  onClick={addRoyaltySplit}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
                >
                  Add Split
                </button>
              </div>
              
              <div className="space-y-3">
                {licenseInfo.royaltySplit.map((split, index) => (
                  <div key={index} className="bg-gray-700 rounded p-4">
                    <div className="grid grid-cols-3 gap-3 mb-2">
                      <input
                        type="text"
                        value={split.party}
                        onChange={(e) => handleRoyaltySplitChange(index, 'party', e.target.value)}
                        placeholder="Party Name"
                        className="bg-gray-600 rounded p-2 text-sm"
                      />
                      <input
                        type="number"
                        value={split.percentage}
                        onChange={(e) => handleRoyaltySplitChange(index, 'percentage', parseFloat(e.target.value) || 0)}
                        placeholder="%"
                        min="0"
                        max="100"
                        className="bg-gray-600 rounded p-2 text-sm"
                      />
                      <input
                        type="text"
                        value={split.role}
                        onChange={(e) => handleRoyaltySplitChange(index, 'role', e.target.value)}
                        placeholder="Role"
                        className="bg-gray-600 rounded p-2 text-sm"
                      />
                    </div>
                    {licenseInfo.royaltySplit.length > 1 && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => removeRoyaltySplit(index)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-gray-700 rounded">
                <div className="text-sm font-medium">
                  Total: {licenseInfo.royaltySplit.reduce((sum, split) => sum + split.percentage, 0).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Protection Settings */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Protection Settings
              </h2>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={licenseInfo.watermarkEnabled}
                    onChange={(e) => handleLicenseChange('watermarkEnabled', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>Enable Audio Watermark</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={licenseInfo.drmProtection}
                    onChange={(e) => handleLicenseChange('drmProtection', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>Enable DRM Protection</span>
                </label>
              </div>
              
              {licenseInfo.licenseId && (
                <div className="mt-6 p-4 bg-green-900/20 border border-green-700 rounded">
                  <div className="text-sm font-medium text-green-400 mb-2">License Generated</div>
                  <div className="text-xs font-mono text-gray-300 break-all">
                    ID: {licenseInfo.licenseId}
                  </div>
                  {licenseInfo.blockchainHash && (
                    <div className="text-xs font-mono text-gray-400 mt-1 break-all">
                      Blockchain: {licenseInfo.blockchainHash}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-gray-800 rounded-lg p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Export Options</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Export Format</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-full bg-gray-700 rounded p-3"
              >
                <option value="mp3">MP3 with ID3v2</option>
                <option value="wav">WAV with BWF metadata</option>
                <option value="flac">FLAC with Vorbis comments</option>
                <option value="m4a">M4A with iTunes metadata</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={exportWithEmbeddedData}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <Download className="w-5 h-5" />
                <span>Export Audio + Data</span>
              </button>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  const data = { metadata, fingerprint, license: licenseInfo };
                  navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                }}
                className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <FileText className="w-5 h-5" />
                <span>Copy Metadata</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalFingerprintMetadata;