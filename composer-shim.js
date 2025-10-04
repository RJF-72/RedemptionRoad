// Lightweight shim to expose a host-export helper on any page.
(function(){
  try {
    // Small helper: run when document.body is ready
    const onReady = (cb) => {
      try {
        if (document.body) return cb();
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => { try { cb(); } catch(_){} }, { once: true });
        } else {
          // In rare cases body may still be missing; poll briefly
          const t = setInterval(() => {
            if (document.body) { clearInterval(t); try { cb(); } catch(_){} }
          }, 16);
          setTimeout(() => clearInterval(t), 1500);
        }
      } catch(_) {}
    };
    // Global 50% page scale by default (overridable via ?scale= and localStorage SOTA_GLOBAL_SCALE)
    (function globalScale(){
      try {
        const params = new URLSearchParams(location.search);
        let scale = null;
        if (params.has('scale')) {
          const fromUrl = parseFloat(params.get('scale'));
          if (!isNaN(fromUrl)) {
            scale = fromUrl;
            localStorage.setItem('SOTA_GLOBAL_SCALE', String(scale));
          }
        }
        if (scale === null) {
          const saved = parseFloat(localStorage.getItem('SOTA_GLOBAL_SCALE')||'');
          if (!isNaN(saved)) scale = saved;
        }
        if (scale === null) scale = 0.5; // default 50%

        if (scale && scale !== 1) {
          const html = document.documentElement;
          const body = document.body;
          const applyZoom = () => {
            try {
              // Prefer zoom (Windows browsers support it well); fallback to transform
              body.style.transformOrigin = '0 0';
              body.style.zoom = scale;
              if (!body.style.zoom) {
                body.style.transform = `scale(${scale})`;
                body.style.width = `${100/scale}%`;
              }
            } catch(_) {}
          };
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', applyZoom, { once: true });
          } else {
            applyZoom();
          }
        }

        // Expose toggle function
        window.SOTA_setGlobalScale = function(next){
          const v = parseFloat(next);
          if (isNaN(v)) return;
          localStorage.setItem('SOTA_GLOBAL_SCALE', String(v));
          location.reload();
        };
      } catch (e) { /* ignore */ }
    })();
    // Simple global toast notifications (non-blocking status)
    (function installToasts(){
      try{
        if (window.SOTA_toast) return;
        const style = document.createElement('style');
        style.textContent = `
          #sota-toast-wrap{position:fixed;right:14px;bottom:14px;z-index:99999;display:flex;flex-direction:column;gap:8px;max-width:48ch}
          .sota-toast{background:rgba(10,10,10,0.9);color:#fff;border:1px solid rgba(255,215,0,0.35);border-left-width:4px;border-radius:10px;padding:10px 12px;box-shadow:0 10px 24px rgba(0,0,0,0.4);font-size:12px;line-height:1.35}
          .sota-toast.info{border-left-color:#38bdf8}
          .sota-toast.success{border-left-color:#22c55e}
          .sota-toast.warn{border-left-color:#facc15}
          .sota-toast.error{border-left-color:#ef4444}
        `;
        document.head.appendChild(style);
        onReady(() => {
          if (document.getElementById('sota-toast-wrap')) return;
          const wrap = document.createElement('div');
          wrap.id = 'sota-toast-wrap';
          document.body.appendChild(wrap);
          window.SOTA_toast = function(msg, opts){
            try{
              const o = opts||{}; const type = (o.type||'info'); const dur = Math.max(1200, Math.min(12000, o.duration||4000));
              const div = document.createElement('div'); div.className = `sota-toast ${type}`; div.textContent = String(msg||'');
              wrap.appendChild(div);
              let to = setTimeout(()=>{ div.style.opacity='0'; div.style.transform='translateY(6px)'; setTimeout(()=>div.remove(), 300); }, dur);
              div.addEventListener('click', ()=>{ clearTimeout(to); div.remove(); });
              return div;
            }catch(e){ console.warn('toast failed', e); }
          };
        });
      }catch(e){ /* ignore */ }
    })();
    // Inject global Dark-Neon theme (opt-out with <body data-no-theme>)
    (function injectDarkNeon(){
      try {
        const styleId = 'sota-dark-neon-theme';
        const inject = () => {
          const body = document.body;
          if (!body || body.hasAttribute('data-no-theme')) return;
          if (document.getElementById(styleId)) return;
          const style = document.createElement('style');
          style.id = styleId;
          style.textContent = `
            :root {
              --sota-bg-0: #0a0a0f;
              --sota-bg-1: #1a1a2e;
              --sota-bg-2: #0f3460;
              --sota-neon-1: #FFD700; /* gold */
              --sota-neon-2: #FF8C00; /* orange */
              --sota-text: #ffffff;
              --sota-muted: rgba(255,255,255,0.75);
              --sota-border: rgba(255,215,0,0.25);
            }
            body {
              font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
              background: linear-gradient(145deg, var(--sota-bg-0) 0%, var(--sota-bg-1) 20%, #16213e 40%, var(--sota-bg-2) 60%, var(--sota-bg-1) 80%, var(--sota-bg-0) 100%);
              color: var(--sota-text);
            }
            a, button {
              transition: all 0.2s ease;
            }
            .sota-btn, .license-btn, .composition-btn, .transport-btn, .nav-hub-btn, .btn-gold {
              background: linear-gradient(135deg, var(--sota-neon-1) 0%, var(--sota-neon-2) 100%);
              color: #000; border: none; border-radius: 10px;
            }
            .sota-card, .keyboard-panel, .effects-panel, .voice-ai-panel, .composition-panel, .mixer-panel, .control-panel {
              background: linear-gradient(135deg, rgba(255,215,0,0.05) 0%, rgba(255,140,0,0.05) 100%);
              border: 3px solid var(--sota-border);
              backdrop-filter: blur(16px);
              border-radius: 20px;
            }
            input, select, textarea {
              background: rgba(0,0,0,0.4);
              color: var(--sota-text);
              border: 2px solid rgba(255,215,0,0.2);
              border-radius: 10px;
              padding: 8px 10px;
            }
          `;
          document.head.appendChild(style);
          // Load Inter font once
          if (!document.querySelector('link[data-sota-font]')){
            const l1 = document.createElement('link'); l1.rel='preconnect'; l1.href='https://fonts.googleapis.com'; l1.setAttribute('data-sota-font','1');
            const l2 = document.createElement('link'); l2.rel='preconnect'; l2.href='https://fonts.gstatic.com'; l2.crossOrigin=''; l2.setAttribute('data-sota-font','1');
            const l3 = document.createElement('link'); l3.href='https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap'; l3.rel='stylesheet'; l3.setAttribute('data-sota-font','1');
            document.head.appendChild(l1); document.head.appendChild(l2); document.head.appendChild(l3);
          }
        };
        onReady(inject);
      } catch(e) { /* ignore */ }
    })();

    window.exportPartsMIDI = function(parts = ['bass','drums','melody']){
      try {
        if (window.exportMultiMIDI) return window.exportMultiMIDI(parts);
      } catch(e) {
        console.warn('exportPartsMIDI: exportMultiMIDI call failed', e);
      }
      // Friendly fallback when composer isn't loaded as a module on this page
      alert('Composer not loaded on this page. Open Advanced Composer (advanced-composer.html) to export parts as MIDI.');
    };
  } catch (err) {
    console.warn('composer-shim init failed', err);
  }
})();

// Connectivity badge (real online/offline + backend health)
(function(){
  try{
    // Small helper
    const onReady = (cb) => {
      try {
        if (document.body) return cb();
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => { try { cb(); } catch(_){} }, { once: true });
        } else {
          const t = setInterval(() => { if (document.body) { clearInterval(t); try { cb(); } catch(_){} } }, 16);
          setTimeout(() => clearInterval(t), 1500);
        }
      } catch(_) {}
    };
    // Ensure auth is available on every page
    const ensureAuth = () => new Promise(resolve => {
      if (window.SOTAAuth) return resolve(window.SOTAAuth);
      const s = document.createElement('script');
      s.src = 'auth.js';
      s.async = true;
      s.onload = () => resolve(window.SOTAAuth || {});
      s.onerror = () => resolve({});
      document.head.appendChild(s);
    });

    // Simple sign-in modal (owner/subscriber)
    const installSignInUI = async () => {
      if (document.getElementById('sota-signin-modal')) return;
      const style = document.createElement('style');
      style.textContent = `
        #sota-signin-modal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);z-index:99999}
        #sota-signin-box{background:rgba(10,10,10,0.92);border:2px solid rgba(255,215,0,0.35);border-radius:14px;padding:14px;max-width:420px;width:calc(100% - 40px);color:#fff;box-shadow:0 20px 60px rgba(0,0,0,0.45)}
        #sota-signin-box h3{margin:0 0 10px;color:#FFD700}
        #sota-signin-box .row{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        #sota-signin-box label{font-size:12px;color:rgba(255,255,255,0.85)}
        #sota-signin-box input, #sota-signin-box select{width:100%;background:rgba(0,0,0,0.45);border:1px solid rgba(255,215,0,0.28);border-radius:10px;color:#fff;padding:8px}
        #sota-signin-box .buttons{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
        #sota-signin-box .btn{background:linear-gradient(135deg,#FFD700,#FF8C00);color:#000;border:none;border-radius:10px;padding:8px 12px;font-weight:800;cursor:pointer}
        #sota-signin-box .btn.secondary{background:transparent;color:#fff;border:1px solid rgba(255,215,0,0.35)}
      `;
      document.head.appendChild(style);
      const modal = document.createElement('div');
      modal.id = 'sota-signin-modal';
      modal.innerHTML = `
        <div id="sota-signin-box">
          <h3>Sign in to SOTA</h3>
          <div class="row">
            <div>
              <label>Name</label>
              <input id="sota-si-name" placeholder="Your name"/>
            </div>
            <div>
              <label>Email (optional)</label>
              <input id="sota-si-email" placeholder="you@example.com"/>
            </div>
          </div>
          <div style="margin-top:8px">
            <label>Owner code (owners only)</label>
            <input id="sota-si-code" placeholder="Enter owner code"/>
          </div>
          <div class="buttons">
            <button class="btn" id="sota-si-owner">Sign in as Owner</button>
            <button class="btn secondary" id="sota-si-subscriber">Sign in as Subscriber</button>
            <button class="btn secondary" id="sota-si-cancel">Cancel</button>
          </div>
        </div>`;
      document.body.appendChild(modal);
      modal.addEventListener('click', (e)=>{ if(e.target === modal) modal.style.display='none'; });

      const byId = id => document.getElementById(id);
      byId('sota-si-cancel').onclick = () => { modal.style.display='none'; };
      byId('sota-si-owner').onclick = async () => {
        await ensureAuth();
        const user = { name: byId('sota-si-name').value||'Owner', email: byId('sota-si-email').value||'', code: byId('sota-si-code').value||'' };
        try{ window.SOTAAuth && SOTAAuth.signInOwner && SOTAAuth.signInOwner(user); }catch(_){}
        modal.style.display='none';
        update();
      };
      byId('sota-si-subscriber').onclick = async () => {
        await ensureAuth();
        const user = { name: byId('sota-si-name').value||'Subscriber', email: byId('sota-si-email').value||'' };
        try{ window.SOTAAuth && SOTAAuth.signInSubscriber && SOTAAuth.signInSubscriber(user); }catch(_){}
        modal.style.display='none';
        update();
      };
      // Expose opener
      window.SOTA_openSignIn = () => { modal.style.display='flex'; };
    };

    // URL-based auto sign-in support (?owner=1 or ?role=owner, name/email/code optional)
    const autoSignInFromURL = async () => {
      const params = new URLSearchParams(location.search||'');
      if (![...params.keys()].some(k=> ['owner','role','subscriber'].includes(k))) return;
      await ensureAuth();
      const name = params.get('name') || '';
      const email = params.get('email') || '';
      const code = params.get('code') || params.get('owner') || '';
      const role = (params.get('role')||'').toLowerCase();
      try{
        if (params.has('owner') || role === 'owner') {
          SOTAAuth && SOTAAuth.signInOwner && SOTAAuth.signInOwner({ name: name||'Owner', email, code });
        } else if (params.has('subscriber') || role === 'subscriber') {
          SOTAAuth && SOTAAuth.signInSubscriber && SOTAAuth.signInSubscriber({ name: name||'Subscriber', email });
        }
      }catch(_){ }
    };

  // initialize auth UI and potential auto sign-in after DOM is ready
  onReady(() => { ensureAuth().then(installSignInUI).then(autoSignInFromURL); });

    // Resolve and persist API base from ?api= query or localStorage
    const resolveApiBase = () => {
      try {
        const params = new URLSearchParams(location.search||'');
        let base = '';
        if (params.has('api')) {
          base = params.get('api')||'';
          // Allow special tokens
          if (base === 'local') base = 'http://127.0.0.1:8000';
          localStorage.setItem('SOTA_API_BASE', base);
        } else {
          base = localStorage.getItem('SOTA_API_BASE')||'';
        }
        // Expose globally for pages that rely on it
        if (base) window.SOTA_BACKEND_URL = base;
        return base;
      } catch(_) { return ''; }
    };

    const makeEl=()=>{ const el=document.createElement('div'); el.id='sota-online-badge'; el.style.position='fixed'; el.style.right='12px'; el.style.top='12px'; el.style.zIndex='9999'; el.style.fontSize='12px'; el.style.padding='6px 10px'; el.style.borderRadius='999px'; el.style.border='1px solid rgba(255,215,0,0.35)'; el.style.background='rgba(0,0,0,0.45)'; el.style.color='#fff'; el.style.backdropFilter='blur(8px)'; el.title='Connectivity and role status'; return el; };

    // Small inline modal to set API base (dark-neon)
    const ensureApiModal = () => {
      if (document.getElementById('sota-api-modal')) return;
      const style = document.createElement('style');
      style.textContent = `
        #sota-api-modal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);z-index:99999}
        #sota-api-box{background:rgba(10,10,10,0.95);border:2px solid rgba(255,215,0,0.35);border-radius:14px;padding:14px;max-width:520px;width:calc(100% - 40px);color:#fff;box-shadow:0 20px 60px rgba(0,0,0,0.45)}
        #sota-api-box h3{margin:0 0 10px;color:#FFD700}
        #sota-api-box input{width:100%;background:rgba(0,0,0,0.45);border:1px solid rgba(255,215,0,0.28);border-radius:10px;color:#fff;padding:10px}
        #sota-api-box .row{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
        #sota-api-box .btn{background:linear-gradient(135deg,#FFD700,#FF8C00);color:#000;border:none;border-radius:10px;padding:8px 12px;font-weight:800;cursor:pointer}
        #sota-api-box .btn.secondary{background:transparent;color:#fff;border:1px solid rgba(255,215,0,0.35)}
        #sota-api-close{position:absolute;right:10px;top:10px;background:transparent;border:1px solid rgba(255,215,0,0.35);color:#FFD700;border-radius:8px;padding:4px 8px;cursor:pointer}
      `;
      document.head.appendChild(style);
      const modal = document.createElement('div'); modal.id='sota-api-modal';
      modal.innerHTML = `
        <div id="sota-api-box" style="position:relative">
          <button id="sota-api-close">✕</button>
          <h3>Set Backend API Base</h3>
          <div style="font-size:12px;color:#ddd;margin-bottom:8px">Enter your API root. Examples: http://127.0.0.1:8000, https://api.yourdomain.com</div>
          <input id="sota-api-input" placeholder="http://127.0.0.1:8000" />
          <div class="row">
            <button class="btn" id="sota-api-save">Save</button>
            <button class="btn secondary" id="sota-api-local">Use Local (127.0.0.1:8000)</button>
            <button class="btn secondary" id="sota-api-clear">Clear</button>
          </div>
        </div>`;
      document.body.appendChild(modal);
      const byId = id => document.getElementById(id);
      const close = ()=>{ modal.style.display='none'; };
      const open = (prefill) => { byId('sota-api-input').value = prefill || (localStorage.getItem('SOTA_API_BASE')||''); modal.style.display='flex'; byId('sota-api-input').focus(); };
      byId('sota-api-close').onclick = close; modal.addEventListener('click', (e)=>{ if(e.target===modal) close(); });
      byId('sota-api-save').onclick = ()=>{
        const v = byId('sota-api-input').value.trim();
        if (v) { try { localStorage.setItem('SOTA_API_BASE', v); window.SOTA_BACKEND_URL = v; } catch(_){} if (window.SOTA_toast) SOTA_toast('API base saved', {type:'success'}); }
        close(); setTimeout(update, 30);
      };
      byId('sota-api-local').onclick = ()=>{ try { localStorage.setItem('SOTA_API_BASE','http://127.0.0.1:8000'); window.SOTA_BACKEND_URL='http://127.0.0.1:8000'; } catch(_){} if (window.SOTA_toast) SOTA_toast('Using local API', {type:'info'}); close(); setTimeout(update, 30); };
      byId('sota-api-clear').onclick = ()=>{ try { localStorage.removeItem('SOTA_API_BASE'); delete window.SOTA_BACKEND_URL; } catch(_){} if (window.SOTA_toast) SOTA_toast('API base cleared', {type:'warn'}); close(); setTimeout(update, 30); };
      window.SOTA_openApiModal = open;
    };
    // Connectivity badge and periodic health check after DOM is ready
    onReady(() => {
      const badge = document.getElementById('sota-online-badge') || (document.body && document.body.appendChild(makeEl()));
      if(!badge) return;
      let lastStatus = { backend:false, apiBase:"", role:"guest", online:null };
      const update = async()=>{
        const online = navigator.onLine;
        const apiBase = resolveApiBase();
        let backend = false;
        if (apiBase) {
          try{
            const ctrl = new AbortController();
            const to = setTimeout(()=>ctrl.abort(), 3500);
            const r = await fetch(apiBase.replace(/\/$/, '') + '/api/health', { cache:'no-store', method:'GET', signal: ctrl.signal });
            clearTimeout(to);
            backend = r.ok;
          }catch(_) { backend = false; }
        } else {
          backend = null; // Unset
        }
        let role = 'guest'; let name = '';
        try{ if(window.SOTAAuth && SOTAAuth.getRole){ role = SOTAAuth.getRole() || 'guest'; const s=SOTAAuth.getSession&&SOTAAuth.getSession(); name = (s&&s.user&&s.user.name)||''; } }catch(_){ }
        const color = !online ? '#ef4444' : (backend===true ? '#22c55e' : (backend===null ? '#94a3b8' : '#facc15'));
        badge.style.borderColor = color;
        const parts = [];
        parts.push(online ? 'Online' : 'Offline');
        if (backend === null) parts.push('API Unset'); else parts.push(`API ${backend?'OK':'Down'}`);
        parts.push(name ? `${role} (${name})` : role);

        // Ensure API modal is available
        ensureApiModal();
        // Click behaviors
        badge.style.cursor='default';
        badge.onclick = null;
        // If guest, allow click to sign in
        if (role === 'guest') {
          parts.push('click to sign in');
          badge.style.cursor='pointer';
          badge.onclick = ()=>{ if(window.SOTA_openSignIn) window.SOTA_openSignIn(); };
        }
        // If API unset, allow click to set
        if (backend === null) {
          parts.push('click to set API');
          badge.style.cursor='pointer';
          const prevOnClick = badge.onclick;
          badge.onclick = ()=>{ if (window.SOTA_openApiModal) window.SOTA_openApiModal(); else if (prevOnClick) prevOnClick(); };
        }
        badge.textContent = parts.join(' • ');
        lastStatus = { backend: backend===true, apiBase, role, online };
      };
      update();
      window.addEventListener('online', update); window.addEventListener('offline', update);
      // Poll every 20s when API is set, otherwise much slower
      setInterval(()=>{ const base = resolveApiBase(); if (base) update(); }, 20000);
    });
    // Keyboard shortcut to open API modal quickly (doesn't require DOM)
    window.addEventListener('keydown', (e)=>{ if (e.shiftKey && (e.key==='A' || e.key==='a')){ if (window.SOTA_openApiModal) window.SOTA_openApiModal(); } });
  }catch(e){ /* ignore */ }
})();

// Global "Directions" help modal with per-page content
(function(){
  try{
    const getPage = ()=>{
      const p = (location.pathname.split('/').pop()||'').toLowerCase();
      return p;
    };
    const DIRECTIONS = {
      'sota_professional_synthesizer.html': `Create a song in the Professional Synth\n\n1) Keyboard: Click keys or use your computer keys (A,W,S,E,D,F,T,G,Y,H,U,J). Octave +/- adjusts range.\n2) Effects: Reverb/Delay/Chorus/Distortion/Filter are real-time — tweak while playing.\n3) Voice-to-MIDI: Click Start Voice Input, hum a melody, and notes will trigger live.\n4) Compose: Use Generate Melody/Chords/Rhythm or Auto Compose for a quick sketch.\n5) Record: Press the red record button to capture output (WebM/Opus); stop to download.\n6) Export MIDI: Open Advanced Composer for multi-part MIDI if needed.`,
      'sota_mastering_tool.html': `How to use SOTA Mastering Tool\n\n1) Load audio: Drag-and-drop or use the file input.\n2) Analyze: Ensure LUFS meters and spectrum are moving.\n3) One-Touch Master: Click Auto Master; review EQ, multiband, width, de-esser, and limiter.\n4) Gain Match: Toggle to compare processed vs original at matched loudness.\n5) Export: Use true-peak safe export and verify target LUFS (short-term/integrated).`,
      'sota_music_video_generator.html': `How to use Music Video Generator\n\n1) Upload your audio (left panel).\n2) Pick mode/style/palette.\n3) Click Generate to start the backend job; watch status/progress.\n4) When done, preview plays inline; click Download to save.\nTip: Use the smoke test if the backend is offline.`,
      'sota_script_to_video_engine.html': `How to use Script-to-Video Engine\n\n1) Paste or write your script with clear time spans per scene.\n2) Click Build & Preview to visualize scenes on canvas.\n3) Optionally add audio for timing; import lyrics (LRC/SRT/TXT).\n4) Use transport controls to scrub/loop; then Export WebM.`,
      'sivideogenerator.html': `How to use SI Swarm Video\n\n1) Choose an audio file.\n2) Configure swarm size, iterations, palette, and mode (Music/Marketing).\n3) Click Generate; preview auto-plays.\n4) Click Export WebM to record with audio.`,
      'sota_marketing_video_creator.html': `How to use Marketing Video Creator\n\n1) Pick duration and category; select a template.\n2) Upload brand assets; set company/message/CTA.\n3) Click Generate to run backend; preview and Download when done.\n4) Use Quick Actions to save/share.`,
      'sota_songwriter.html': `How to use Songwriter\n\n1) Fill in the song prompt details.\n2) Generate via backend; diagnostics show API status.\n3) Use the accompaniment/preview tools; export as needed.`,
      'default': `General Tips\n\n• Look for the status bar at the top for progress/errors.\n• The neon badge shows online/API status and your role; click to sign in.\n• Use voice commands where available (See Voice icon if present).\n• Global scale is 50%. Use SOTA_setGlobalScale(0.75) in console to adjust.`
    };
    const ensureUI = ()=>{
      if (document.getElementById('sota-help-modal')) return;
      const style = document.createElement('style');
      style.textContent = `
        #sota-help-modal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);z-index:99998}
        #sota-help-box{background:rgba(10,10,10,0.95);border:2px solid rgba(255,215,0,0.35);border-radius:14px;padding:16px;max-width:720px;width:calc(100% - 40px);color:#fff;box-shadow:0 20px 60px rgba(0,0,0,0.45)}
        #sota-help-box h3{margin:0 0 10px;color:#FFD700}
        #sota-help-content{white-space:pre-line;line-height:1.6;font-size:14px}
        #sota-help-close{float:right;background:transparent;border:1px solid rgba(255,215,0,0.35);color:#FFD700;border-radius:8px;padding:6px 10px;cursor:pointer}
        #sota-help-btn{position:fixed;bottom:14px;right:14px;z-index:99997;background:linear-gradient(135deg,#FFD700,#FF8C00);color:#000;border:none;border-radius:999px;padding:10px 12px;font-weight:800;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,0.35)}
      `;
      document.head.appendChild(style);
      const modal = document.createElement('div'); modal.id='sota-help-modal';
      modal.innerHTML = `
        <div id="sota-help-box">
          <button id="sota-help-close">✕</button>
          <h3>Directions</h3>
          <div id="sota-help-content"></div>
        </div>`;
      document.body.appendChild(modal);
      const btn = document.createElement('button'); btn.id='sota-help-btn'; btn.title='Directions (Shift+?)'; btn.textContent='❓ Help';
      document.body.appendChild(btn);
      const open = ()=>{
        const page = getPage();
        const key = Object.keys(DIRECTIONS).find(k=>k===page) || 'default';
        document.getElementById('sota-help-content').textContent = DIRECTIONS[key];
        modal.style.display='flex';
      };
      const close = ()=>{ modal.style.display='none'; };
      btn.onclick = open; modal.addEventListener('click', (e)=>{ if(e.target===modal) close(); });
      document.getElementById('sota-help-close').onclick = close;
      window.addEventListener('keydown', (e)=>{ if((e.shiftKey && (e.key==='?' || e.key==='/'))){ e.preventDefault(); open(); } });
      // Expose programmatic open
      window.SOTA_openHelp = open;
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensureUI, {once:true}); else ensureUI();
  }catch(e){ /* ignore */ }
})();

// Compact "Directions" dropdown that can stay open while creating (per-page content)
(function(){
  try {
    const pageKey = (location.pathname.split('/').pop()||'').toLowerCase();
    const STORE_KEY = 'SOTA_DIR_DD_OPEN_'+pageKey;
    const DD = {
      'sota_professional_synthesizer.html': [
        { title:'1) Play', steps:[
          'Click keys or use: A W S E D F T G Y H U J',
          'Use Octave +/- to change range'
        ]},
        { title:'2) Effects', steps:[
          'Adjust Reverb/Delay/Chorus/Distortion/Filter',
          'Tweak live while playing'
        ]},
        { title:'3) Voice → MIDI', steps:[
          'Start Voice Input and hum a melody',
          'Notes will trigger automatically'
        ]},
        { title:'4) Compose', steps:[
          'Generate Melody / Chords / Rhythm',
          'Try Auto Compose for a quick sketch'
        ]},
        { title:'5) Record', steps:[
          'Press ⏺ to capture synth output',
          'Stop to download the recording'
        ]},
        { title:'6) Advanced', steps:[
          'Open Advanced Composer for multi-part MIDI export'
        ]}
      ],
      'sota_mastering_tool.html': [
        { title:'1) Load + Analyze', steps:[
          'Load your mix via drag/drop or file input',
          'Confirm meters and spectrum are active',
          'Target loudness: e.g., -14 LUFS (stream) or as needed'
        ]},
        { title:'2) One-Touch Master', steps:[
          'Click Auto Master to set EQ, multiband, de-esser, width, limiter',
          'Use Gain Match to compare fairly'
        ]},
        { title:'3) Fine Tune Modules', steps:[
          'EQ: Tame resonances / shape tone',
          'Multiband: Control low/mid/high dynamics',
          'De-Esser: Reduce harsh S sounds',
          'Stereo: Adjust M/S width safely',
          'Limiter: True-peak safe ceiling'
        ]},
        { title:'4) Export', steps:[
          'Check integrated LUFS and true-peak',
          'Export WAV/MP3 at desired headroom'
        ]}
      ],
      'sota_music_video_generator.html': [
        { title:'1) Audio + Options', steps:[
          'Upload your song (supports common formats)',
          'Choose mode, style, and palette'
        ]},
        { title:'2) Generate', steps:[
          'Click Generate to start backend job',
          'Watch status and progress bar'
        ]},
        { title:'3) Preview + Download', steps:[
          'Preview appears inline on completion',
          'Click Download to save the video'
        ]}
      ],
      'sota_script_to_video_engine.html': [
        { title:'1) Script', steps:[
          'Paste or write scenes with time ranges',
          'Pick FPS and a palette'
        ]},
        { title:'2) Build & Preview', steps:[
          'Click Build & Preview to render scenes',
          'Use transport controls to scrub/loop'
        ]},
        { title:'3) Audio/Lyrics (optional)', steps:[
          'Add audio file for timing',
          'Import lyrics (LRC/SRT/TXT) for overlay'
        ]},
        { title:'4) Export', steps:[
          'Export WebM; audio is muxed if provided'
        ]}
      ],
      'sivideogenerator.html': [
        { title:'1) Choose Audio', steps:[
          'Select an audio file to drive visuals'
        ]},
        { title:'2) Configure', steps:[
          'Swarm size, iterations, palette, and mode'
        ]},
        { title:'3) Generate + Export', steps:[
          'Click Generate to create frames',
          'Preview auto-plays; Export WebM when ready'
        ]}
      ],
      'sota_marketing_video_creator.html': [
        { title:'1) Template & Duration', steps:[
          'Pick duration and category',
          'Select a template'
        ]},
        { title:'2) Brand Inputs', steps:[
          'Upload images/logos (optional)',
          'Company, message, CTA, audience'
        ]},
        { title:'3) Generate', steps:[
          'Click Generate; watch progress',
          'Preview and Download on completion'
        ]}
      ],
      'sota_songwriter.html': [
        { title:'1) Prompt', steps:[
          'Describe theme, style, and mood'
        ]},
        { title:'2) Generate', steps:[
          'Send to backend; watch diagnostics'
        ]},
        { title:'3) Arrange', steps:[
          'Use accompaniment/preview tools',
          'Export when satisfied'
        ]}
      ],
      'default': [
        { title:'Quick Tips', steps:[
          'Check the status bar for progress/errors',
          'Badge (top-right) shows Online/API/Role',
          'Use voice commands where available'
        ]}
      ]
    };
    const build = ()=>{
      if (document.getElementById('sota-dir-dd')) return;
      const wrap = document.createElement('div');
      wrap.id = 'sota-dir-dd';
      const style = document.createElement('style');
      style.textContent = `
        #sota-dir-dd{position:fixed;left:12px;bottom:14px;z-index:99996;max-width:360px;font-size:12px}
        #sota-dir-dd .dd-btn{background:rgba(0,0,0,0.55);color:#fff;border:1px solid rgba(255,215,0,0.35);border-radius:999px;padding:8px 12px;font-weight:800;cursor:pointer;backdrop-filter:blur(8px)}
        #sota-dir-dd .dd-panel{margin-top:8px;background:rgba(10,10,10,0.9);border:1px solid rgba(255,215,0,0.28);border-radius:10px;padding:10px;display:none;max-height:40vh;overflow:auto;box-shadow:0 10px 24px rgba(0,0,0,0.4)}
        #sota-dir-dd .sec{margin:8px 0}
        #sota-dir-dd .ttl{color:#FFD700;font-weight:800;margin-bottom:4px}
        #sota-dir-dd ul{margin:4px 0 0 18px;padding:0}
        #sota-dir-dd li{margin:2px 0;color:#e6f1ff}
      `;
      document.head.appendChild(style);
      wrap.innerHTML = `
        <button class="dd-btn" id="sota-dir-dd-btn">❔ Directions</button>
        <div class="dd-panel" id="sota-dir-dd-panel"></div>`;
      document.body.appendChild(wrap);
      const panel = document.getElementById('sota-dir-dd-panel');
      const data = DD[pageKey] || DD['default'];
      panel.innerHTML = data.map(sec => `
        <div class="sec">
          <div class="ttl">${sec.title}</div>
          <ul>${(sec.steps||[]).map(s=>`<li>${s}</li>`).join('')}</ul>
        </div>`).join('');
      const btn = document.getElementById('sota-dir-dd-btn');
      const setOpen = (open)=>{ panel.style.display = open ? 'block' : 'none'; localStorage.setItem(STORE_KEY, open ? '1' : '0'); };
      btn.onclick = ()=>{ setOpen(panel.style.display==='none'); };
      const saved = localStorage.getItem(STORE_KEY);
      setOpen(saved === '1');
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build, {once:true}); else build();
  } catch(e){ /* ignore */ }
})();
