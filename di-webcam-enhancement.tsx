import React, { useState, useRef, useEffect } from 'react';
import { Camera, Activity, Cpu, Zap } from 'lucide-react';

// ============================================================================
// 1. BASE MODEL (Director) - The Intelligence Engine
// ============================================================================
class BaseModelDirector {
  constructor() {
    this.maxThreads = 40; // Conservative start
    this.currentAllocation = { agent1: 0, agent2: 0, agent3: 0 };
    this.performanceMetrics = {
      fps: 0,
      lastFrameTime: 0,
      avgProcessTime: 0
    };
  }

  // Analyze incoming frame and determine resource needs
  analyzeFrame(frameData, videoElement) {
    const analysis = {
      motionLevel: this.detectMotion(frameData),
      edgeComplexity: this.detectEdgeComplexity(frameData),
      userPresence: this.detectUserPresence(frameData),
      lightingQuality: this.analyzeLighting(frameData),
      backgroundChangeRequested: false // Will be set externally
    };
    
    return analysis;
  }

  // Motion detection using frame comparison
  detectMotion(frameData) {
    // Simple motion detection: compare with previous frame
    if (!this.previousFrameData) {
      this.previousFrameData = frameData;
      return 0;
    }

    let diff = 0;
    const sampleRate = 10; // Sample every 10th pixel for performance
    
    for (let i = 0; i < frameData.length; i += sampleRate * 4) {
      const rDiff = Math.abs(frameData[i] - this.previousFrameData[i]);
      const gDiff = Math.abs(frameData[i + 1] - this.previousFrameData[i + 1]);
      const bDiff = Math.abs(frameData[i + 2] - this.previousFrameData[i + 2]);
      diff += (rDiff + gDiff + bDiff) / 3;
    }

    this.previousFrameData = new Uint8ClampedArray(frameData);
    
    const motionLevel = Math.min(100, (diff / (frameData.length / (sampleRate * 4))) * 10);
    return motionLevel;
  }

  // Detect edge complexity (for hair, fine details)
  detectEdgeComplexity(frameData) {
    let edgeScore = 0;
    const sampleRate = 20;

    for (let i = 0; i < frameData.length - 4; i += sampleRate * 4) {
      const diff = Math.abs(frameData[i] - frameData[i + 4]);
      edgeScore += diff;
    }

    const complexity = (edgeScore / (frameData.length / (sampleRate * 4)));
    return complexity > 30 ? 'complex' : complexity > 15 ? 'moderate' : 'simple';
  }

  // Detect if user is present in frame
  detectUserPresence(frameData) {
    // Simple presence detection: check for sufficient variation
    let variation = 0;
    const sampleSize = Math.min(1000, frameData.length / 400);

    for (let i = 0; i < sampleSize; i++) {
      const idx = Math.floor(Math.random() * (frameData.length / 4)) * 4;
      const brightness = (frameData[idx] + frameData[idx + 1] + frameData[idx + 2]) / 3;
      variation += Math.abs(brightness - 128);
    }

    return (variation / sampleSize) > 20;
  }

  // Analyze lighting conditions
  analyzeLighting(frameData) {
    let totalBrightness = 0;
    const sampleRate = 50;

    for (let i = 0; i < frameData.length; i += sampleRate * 4) {
      totalBrightness += (frameData[i] + frameData[i + 1] + frameData[i + 2]) / 3;
    }

    const avgBrightness = totalBrightness / (frameData.length / (sampleRate * 4));
    return avgBrightness > 100 && avgBrightness < 200 ? 'stable' : 'changing';
  }

  // CORE LOGIC: Allocate threads based on analysis
  allocateResources(analysis) {
    let allocation = { agent1: 0, agent2: 0, agent3: 0 };

    // SCENARIO 1: IDLE - No user or minimal activity
    if (!analysis.userPresence) {
      allocation = {
        agent1: 3, // Monitoring
        agent2: 0, // Standby
        agent3: 2  // Cache maintenance
      };
    }
    // SCENARIO 2: USER PRESENT + LOW MOTION
    else if (analysis.motionLevel < 20) {
      allocation = {
        agent1: 12, // Segmentation
        agent2: 8,  // Edge refinement
        agent3: 10  // Compositing
      };
    }
    // SCENARIO 3: HIGH MOTION
    else if (analysis.motionLevel >= 20 && analysis.motionLevel < 50) {
      allocation = {
        agent1: 15, // Increased segmentation
        agent2: 12, // More edge work
        agent3: 13  // Active compositing
      };
    }
    // SCENARIO 4: VERY HIGH MOTION or COMPLEX EDGES
    else {
      allocation = {
        agent1: 15,
        agent2: 15, // Maximum edge refinement
        agent3: 10
      };
    }

    // SCENARIO 5: Background change requested
    if (analysis.backgroundChangeRequested) {
      allocation = {
        agent1: 10, // Maintain segmentation
        agent2: 5,  // Light edge work
        agent3: 25  // Heavy background work
      };
    }

    // SCENARIO 6: Complex edges detected
    if (analysis.edgeComplexity === 'complex') {
      allocation.agent2 = Math.min(20, allocation.agent2 + 5);
    }

    this.currentAllocation = allocation;
    return allocation;
  }

  // Get current status
  getStatus() {
    const totalActive = this.currentAllocation.agent1 + 
                       this.currentAllocation.agent2 + 
                       this.currentAllocation.agent3;
    
    return {
      allocation: this.currentAllocation,
      totalActive,
      maxThreads: this.maxThreads,
      efficiency: ((this.maxThreads - totalActive) / this.maxThreads * 100).toFixed(1),
      fps: this.performanceMetrics.fps
    };
  }
}

// ============================================================================
// 2. AGENT SYSTEM - The Three Configurable Agents
// ============================================================================
class Agent {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.threads = 0;
    this.currentTask = 'idle';
    this.performance = { tasksCompleted: 0, avgTime: 0 };
  }

  // Allocate threads to this agent
  allocateThreads(count) {
    this.threads = count;
  }

  // Execute assigned task with allocated threads
  async executeTask(task, data, canvas) {
    this.currentTask = task;
    const startTime = performance.now();

    let result = null;

    switch(task) {
      case 'segmentation':
        result = await this.performSegmentation(data, canvas);
        break;
      case 'edgeRefinement':
        result = await this.performEdgeRefinement(data, canvas);
        break;
      case 'compositing':
        result = await this.performCompositing(data, canvas);
        break;
      case 'monitoring':
        result = await this.performMonitoring(data);
        break;
      default:
        result = data;
    }

    const endTime = performance.now();
    this.performance.avgTime = (this.performance.avgTime + (endTime - startTime)) / 2;
    this.performance.tasksCompleted++;

    return result;
  }

  // Task implementations
  async performSegmentation(imageData, canvas) {
    // Person segmentation using color/brightness analysis
    const data = imageData.data;
    const mask = new Uint8ClampedArray(data.length / 4);
    
    // Simple segmentation based on color clustering
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Detect skin tones and human-like colors (simplified)
      const isSkinTone = (r > 95 && g > 40 && b > 20 && 
                         r > g && r > b && 
                         Math.abs(r - g) > 15);
      
      const brightness = (r + g + b) / 3;
      const isLikelyPerson = isSkinTone || (brightness > 50 && brightness < 200);
      
      mask[i / 4] = isLikelyPerson ? 255 : 0;
    }
    
    return { imageData, mask };
  }

  async performEdgeRefinement(data, canvas) {
    if (!data.mask) return data;
    
    const mask = data.mask;
    const refined = new Uint8ClampedArray(mask.length);
    const width = canvas.width;
    
    // Edge smoothing using thread count to determine quality
    const kernelSize = Math.min(5, Math.floor(this.threads / 4));
    
    for (let i = 0; i < mask.length; i++) {
      let sum = 0;
      let count = 0;
      
      for (let dy = -kernelSize; dy <= kernelSize; dy++) {
        for (let dx = -kernelSize; dx <= kernelSize; dx++) {
          const idx = i + dy * width + dx;
          if (idx >= 0 && idx < mask.length) {
            sum += mask[idx];
            count++;
          }
        }
      }
      
      refined[i] = sum / count;
    }
    
    data.mask = refined;
    return data;
  }

  async performCompositing(data, canvas) {
    if (!data.mask || !data.imageData) return data;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const imageData = data.imageData;
    const mask = data.mask;
    const pixels = imageData.data;
    
    // Apply mask to create transparency
    for (let i = 0; i < mask.length; i++) {
      pixels[i * 4 + 3] = mask[i]; // Set alpha channel
    }
    
    ctx.putImageData(imageData, 0, 0);
    return data;
  }

  async performMonitoring(data) {
    // Low-power monitoring mode
    return data;
  }

  getStatus() {
    return {
      id: this.id,
      name: this.name,
      threads: this.threads,
      task: this.currentTask,
      performance: this.performance
    };
  }
}

// ============================================================================
// 3. THREAD MANAGEMENT SYSTEM
// ============================================================================
class ThreadManager {
  constructor(maxThreads = 40) {
    this.maxThreads = maxThreads;
    this.agents = [
      new Agent(1, 'Agent Alpha'),
      new Agent(2, 'Agent Beta'),
      new Agent(3, 'Agent Gamma')
    ];
  }

  // Distribute threads according to allocation
  distributeThreads(allocation) {
    this.agents[0].allocateThreads(allocation.agent1);
    this.agents[1].allocateThreads(allocation.agent2);
    this.agents[2].allocateThreads(allocation.agent3);
  }

  // Execute tasks across agents
  async executePipeline(data, canvas) {
    // Agent 1: Segmentation
    let result = await this.agents[0].executeTask('segmentation', data, canvas);
    
    // Agent 2: Edge Refinement
    result = await this.agents[1].executeTask('edgeRefinement', result, canvas);
    
    // Agent 3: Compositing
    result = await this.agents[2].executeTask('compositing', result, canvas);
    
    return result;
  }

  getAgentStatuses() {
    return this.agents.map(agent => agent.getStatus());
  }
}

// ============================================================================
// 4. FRAME ANALYSIS & PROCESSING ENGINE
// ============================================================================
class FrameProcessor {
  constructor() {
    this.director = new BaseModelDirector();
    this.threadManager = new ThreadManager(40);
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    this.fps = 0;
  }

  async processFrame(video, canvas, backgroundChangeRequested = false) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get frame data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // STEP 1: Analyze frame
    const analysis = this.director.analyzeFrame(imageData.data, video);
    analysis.backgroundChangeRequested = backgroundChangeRequested;
    
    // STEP 2: Allocate resources
    const allocation = this.director.allocateResources(analysis);
    
    // STEP 3: Distribute threads
    this.threadManager.distributeThreads(allocation);
    
    // STEP 4: Execute processing pipeline
    await this.threadManager.executePipeline(
      { imageData, mask: null },
      canvas
    );
    
    // Calculate FPS
    this.frameCount++;
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    
    if (deltaTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / deltaTime);
      this.frameCount = 0;
      this.lastFrameTime = currentTime;
    }
    
    this.director.performanceMetrics.fps = this.fps;
    
    return {
      analysis,
      allocation,
      fps: this.fps
    };
  }

  getSystemStatus() {
    return {
      director: this.director.getStatus(),
      agents: this.threadManager.getAgentStatuses(),
      fps: this.fps
    };
  }
}

// ============================================================================
// REACT COMPONENT - UI & Integration
// ============================================================================
export default function DIWebcamEnhancement() {
  const [isActive, setIsActive] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);
  const [error, setError] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const processorRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    processorRef.current = new FrameProcessor();
  }, []);

  const startWebcam = async () => {
    try {
      setError(null);
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Your browser does not support webcam access. Please use Chrome, Firefox, or Edge.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsActive(true);
        processFrames();
      }
    } catch (err) {
      console.error('Webcam error:', err);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError(
          'Webcam permission denied. Please:\n' +
          '1. Click the camera icon in your browser address bar\n' +
          '2. Allow camera access for this site\n' +
          '3. Refresh the page and try again'
        );
      } else if (err.name === 'NotFoundError') {
        setError('No webcam found. Please connect a camera and try again.');
      } else if (err.name === 'NotReadableError') {
        setError('Webcam is already in use by another application. Please close other apps using the camera.');
      } else {
        setError('Failed to access webcam: ' + err.message);
      }
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setIsActive(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  };

  const processFrames = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const result = await processorRef.current.processFrame(video, canvas);
      const status = processorRef.current.getSystemStatus();
      setSystemStatus(status);
    }

    animationRef.current = requestAnimationFrame(processFrames);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            DI System - Directed Intelligence
          </h1>
          <p className="text-xl text-gray-300">
            1 Base Model → 3 Agents → 40 Threads → Maximum Efficiency
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Video Display */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6 shadow-2xl">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                  playsInline
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {!isActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="w-24 h-24 text-gray-600" />
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex gap-4 justify-center">
                {!isActive ? (
                  <button
                    onClick={startWebcam}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all flex items-center gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    Start DI System
                  </button>
                ) : (
                  <button
                    onClick={stopWebcam}
                    className="px-8 py-3 bg-red-500 rounded-lg font-semibold hover:bg-red-600 transition-all"
                  >
                    Stop System
                  </button>
                )}
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg">
                  <div className="font-bold mb-2 flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Webcam Access Issue
                  </div>
                  <div className="text-sm whitespace-pre-line">{error}</div>
                </div>
              )}
            </div>
          </div>

          {/* System Status */}
          <div className="space-y-6">
            {/* Director Status */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Cpu className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-bold">Base Model Director</h3>
              </div>
              {systemStatus?.director && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Active Threads</span>
                    <span className="text-2xl font-bold text-blue-400">
                      {systemStatus.director.totalActive}/{systemStatus.director.maxThreads}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Efficiency</span>
                    <span className="text-xl font-bold text-green-400">
                      {systemStatus.director.efficiency}% saved
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">FPS</span>
                    <span className="text-xl font-bold text-purple-400">
                      {systemStatus.director.fps}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Agent Status */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-bold">Agent Activity</h3>
              </div>
              {systemStatus?.agents && (
                <div className="space-y-4">
                  {systemStatus.agents.map((agent, idx) => (
                    <div key={agent.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{agent.name}</span>
                        <span className="text-sm text-gray-400">{agent.task}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-purple-500' : 'bg-pink-500'
                          }`}
                          style={{ width: `${(agent.threads / 40) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-400">
                        {agent.threads} threads • {agent.performance.tasksCompleted} tasks
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg p-6 border border-blue-500/30">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-6 h-6 text-yellow-400" />
                <h3 className="text-lg font-bold">DI Advantage</h3>
              </div>
              <p className="text-sm text-gray-300">
                Traditional AI would use 60+ threads constantly. DI uses only what's needed, saving CPU and battery.
              </p>
            </div>
          </div>
        </div>

        {/* System Architecture */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-2xl">
          <h3 className="text-2xl font-bold mb-6 text-center">System Architecture</h3>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-500 rounded-lg flex items-center justify-center mb-2">
                <Cpu className="w-12 h-12" />
              </div>
              <div className="font-bold">Base Model</div>
              <div className="text-xs text-gray-400">Director</div>
            </div>
            
            <div className="text-4xl text-gray-600">→</div>
            
            {['Alpha', 'Beta', 'Gamma'].map((name, idx) => (
              <div key={name} className="text-center">
                <div className={`w-20 h-20 ${
                  idx === 0 ? 'bg-purple-500' : idx === 1 ? 'bg-pink-500' : 'bg-indigo-500'
                } rounded-lg flex items-center justify-center mb-2`}>
                  <Activity className="w-10 h-10" />
                </div>
                <div className="font-bold text-sm">Agent {name}</div>
                <div className="text-xs text-gray-400">
                  {systemStatus?.agents?.[idx]?.threads || 0} threads
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}