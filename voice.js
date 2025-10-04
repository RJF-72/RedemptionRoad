/*
 SOTA Voice Control Module
 - Provides global speech recognition with a simple command router
 - Pages can register commands via SOTAVoice.registerCommands()
 - Includes a floating mic button UI to start/stop listening
*/
(function(){
  const win = window;
  const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

  const state = {
    listening: false,
    tts: false,
    recognizer: null,
    commands: [], // { regex: RegExp, description: string, handler: Function }
    lastTranscript: '',
    helpVisible: false,
  };

  function log(...args){ try { console.debug('[SOTAVoice]', ...args); } catch(_){} }

  function say(text){
    if (!state.tts) return;
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      window.speechSynthesis.speak(u);
    } catch(_){}
  }

  function ensureUI(){
    if (document.getElementById('sota-voice-root')) return;
    const root = document.createElement('div');
    root.id = 'sota-voice-root';
    root.style.position = 'fixed';
    root.style.right = '18px';
    root.style.bottom = '18px';
    root.style.zIndex = 100000;

    root.innerHTML = `
      <style>
        .sota-mic-btn{background:linear-gradient(135deg, #06b6d4, #a21caf);color:#fff;border:1px solid rgba(56,189,248,0.5);width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,0.35);font-size:22px;}
        .sota-mic-btn.listening{animation: sotaPulse 1.2s ease-in-out infinite;}
        @keyframes sotaPulse{0%{box-shadow:0 0 0 0 rgba(103,232,249,0.5)}70%{box-shadow:0 0 0 16px rgba(103,232,249,0)}100%{box-shadow:0 0 0 0 rgba(103,232,249,0)}}
        .sota-voice-panel{position:absolute;right:66px;bottom:0;min-width:260px;background:rgba(0,0,0,0.75);backdrop-filter:blur(10px);border:1px solid rgba(103,232,249,0.35);border-radius:10px;color:#e5e7eb;padding:10px;box-shadow:0 10px 28px rgba(0,0,0,0.5)}
        .sota-voice-row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px}
        .sota-chip{font-size:11px;border:1px solid rgba(103,232,249,0.35);padding:3px 6px;border-radius:8px;color:#93c5fd}
        .sota-help{max-height:0;overflow:hidden;transition:max-height .25s ease;}
        .sota-help.visible{max-height:240px;}
        .sota-help-list{font-size:12px;line-height:1.45;color:#cbd5e1;margin:6px 0;max-height:220px;overflow:auto}
      </style>
      <div class="sota-voice-panel" id="sota-voice-panel" style="display:none">
        <div class="sota-voice-row">
          <div style="font-weight:700;color:#67e8f9">SOTA Voice</div>
          <div>
            <span class="sota-chip" id="sota-voice-status">idle</span>
            <button id="sota-voice-help-btn" title="Show commands" class="sota-chip" style="cursor:pointer;background:transparent">?</button>
          </div>
        </div>
        <div style="font-size:12px;color:#94a3b8">Say a command like “open DAW”, “play”, “load project”, “generate video”.</div>
        <div style="font-size:12px;color:#e2e8f0;margin-top:6px"><strong>Heard:</strong> <span id="sota-voice-heard" style="color:#f8fafc;opacity:.9">—</span></div>
        <div class="sota-help" id="sota-voice-help">
          <div class="sota-help-list" id="sota-voice-help-list"></div>
        </div>
      </div>
      <button id="sota-voice-toggle" class="sota-mic-btn" title="SOTA Voice: Start/Stop">🎙️</button>
    `;
    document.body.appendChild(root);

    const mic = document.getElementById('sota-voice-toggle');
    const panel = document.getElementById('sota-voice-panel');
    const statusChip = document.getElementById('sota-voice-status');
    const helpBtn = document.getElementById('sota-voice-help-btn');
    const help = document.getElementById('sota-voice-help');
    const helpList = document.getElementById('sota-voice-help-list');

    mic.addEventListener('click', () => {
      if (!state.listening) start(); else stop();
    });
    mic.addEventListener('contextmenu', (e)=>{ e.preventDefault(); panel.style.display = (panel.style.display==='none'?'block':'none'); });
    helpBtn.addEventListener('click', () => {
      state.helpVisible = !state.helpVisible;
      help.classList.toggle('visible', state.helpVisible);
      if (state.helpVisible) renderHelp(helpList);
    });

    // expose update handles
    state._ui = { mic, panel, statusChip, heardEl: document.getElementById('sota-voice-heard'), helpList };
  }

  function renderHelp(container){
    if (!container) return;
    const items = state.commands
      .filter(c => c.description)
      .map(c => `<div>• ${c.description}</div>`)
      .join('');
    container.innerHTML = items || '<div>No commands registered yet.</div>';
  }

  function updateUI(){
    if (!state._ui) return;
    const { mic, panel, statusChip, heardEl } = state._ui;
    if (mic) mic.classList.toggle('listening', state.listening);
    if (statusChip) statusChip.textContent = state.listening ? 'listening' : 'idle';
    if (panel && panel.style.display === '') panel.style.display = 'block';
    if (heardEl) heardEl.textContent = state.lastTranscript || '—';
  }

  function registerCommands(defs){
    if (!Array.isArray(defs)) return;
    defs.forEach(d => {
      if (!d) return;
      if (d.pattern && !(d.pattern instanceof RegExp)) {
        try { d.pattern = new RegExp(d.pattern, 'i'); } catch(_){ return; }
      }
      if (d.pattern && typeof d.handler === 'function') {
        state.commands.push({ regex: d.pattern, description: d.description || '', handler: d.handler });
      }
    });
    if (state._ui && state.helpVisible) renderHelp(state._ui.helpList);
  }

  function routeCommand(text){
    const phrase = (text||'').trim();
    for (const cmd of state.commands){
      const m = cmd.regex.exec(phrase);
      if (m){
        try { cmd.handler(m, phrase); } catch(err){ log('handler error', err); }
        return true;
      }
    }
    return false;
  }

  function start(){
    if (!SpeechRecognition){
      alert('Voice control not supported in this browser. Try Chrome.');
      return;
    }
    if (state.listening) return;
    if (!state.recognizer){
      const r = new SpeechRecognition();
      r.lang = 'en-US';
      r.continuous = true;
      r.interimResults = false;
      r.maxAlternatives = 1;
      r.onresult = (ev) => {
        const res = ev.results[ev.resultIndex];
        const transcript = res && res[0] && res[0].transcript ? String(res[0].transcript).trim() : '';
        state.lastTranscript = transcript;
        updateUI();
        if (!transcript) return;
        log('heard:', transcript);
        const handled = routeCommand(transcript);
        if (!handled) say('I did not catch a known command.');
      };
      r.onend = () => {
        state.listening = false; updateUI();
      };
      r.onerror = (e) => { log('recognizer error', e); };
      state.recognizer = r;
    }
    try {
      state.recognizer.start();
      state.listening = true;
      ensureUI(); updateUI(); say('Listening');
    } catch(err){ log('start error', err); }
  }

  function stop(){
    if (state.recognizer){ try { state.recognizer.stop(); } catch(_){} }
    state.listening = false; updateUI(); say('Stopped');
  }

  function init(opts){
    opts = opts || {};
    state.tts = !!opts.tts;
    ensureUI();
    document.getElementById('sota-voice-panel').style.display = 'block';

    // Global navigation commands
    const navMap = {
      'home|hub|sota': 'index.html',
      'daw|studio|workstation|titan': 'daw.html',
      'synth|synthesizer': 'synthesizer.html',
      'songwriter|lyrics': 'SOTA_Songwriter.html',
      'video generator|music video|video': 'SOTA_Music_Video_Generator.html',
      'swarm|si generator|si video': 'SIVideoGenerator.html',
      'composer|advanced composer': 'advanced-composer.html',
      'authenticity|audio check': 'SOTA_Audio_Authenticity.html',
      'marketing|marketing video': 'SOTA_Marketing_Video_Creator.html',
      'script engine|script to video': 'SOTA_Script_To_Video_Engine.html',
      'market|marketplace': 'redemption_road_marketplace.html'
    };
    const patterns = Object.keys(navMap).map(k => k.split('|')).flat();
    registerCommands([
      {
        pattern: new RegExp(`^(?:open|launch|go to)\s+(${patterns.join('|')})$`, 'i'),
        description: 'Open component: e.g., “open DAW”, “open video generator”',
        handler: (m) => {
          const target = m[1].toLowerCase();
          const entry = Object.entries(navMap).find(([keys]) => keys.split('|').includes(target));
          if (entry){ location.href = entry[1]; }
        }
      },
      { pattern: /^(?:start|begin) listening$/i, description: 'Start voice listening', handler: () => start() },
      { pattern: /^(?:stop|end) listening$/i, description: 'Stop voice listening', handler: () => stop() },
      { pattern: /^show commands$/i, description: 'Show available voice commands', handler: () => {
          state.helpVisible = true; if (state._ui){ document.getElementById('sota-voice-help').classList.add('visible'); renderHelp(state._ui.helpList); }
        }
      }
    ]);

    if (opts.autoStart) start();
  }

  // Export
  win.SOTAVoice = {
    init,
    start,
    stop,
    say,
    isListening: () => !!state.listening,
    registerCommands,
  };
})();
