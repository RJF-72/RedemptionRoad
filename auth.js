// Simple persistent auth/session manager for SOTA pages (owner + subscriber)
(function(){
  const KEY = 'SOTA_SESSION_V1';
  function read(){
    try{ const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; }catch(_){ return null; }
  }
  function write(obj){
    try{ localStorage.setItem(KEY, JSON.stringify(obj)); }catch(_){ /* ignore */ }
  }
  function clear(){ try{ localStorage.removeItem(KEY); }catch(_){ }
  }
  function now(){ return Date.now(); }
  function publish(){
    const evt = new CustomEvent('sota:auth-changed', { detail: getSession() });
    try{ window.dispatchEvent(evt); }catch(_){ }
    try{ document.body && (document.body.dataset.sotaRole = getRole() || 'guest'); }catch(_){ }
  }
  function getSession(){
    const s = read();
    if(!s) return null;
    if(s.role === 'owner') return s; // Owners never expire
    if(s.expiresAt && now() > s.expiresAt){ clear(); return null; }
    return s;
  }
  function getRole(){ const s = getSession(); return s ? s.role : null; }
  function signInSubscriber(user, opts){
    const ttlMs = (opts && opts.ttlMs) || (7 * 24 * 3600 * 1000); // default 7 days
    const sess = { role:'subscriber', user: user||{}, createdAt: now(), expiresAt: now() + ttlMs };
    write(sess); publish(); return sess;
  }
  function signInOwner(meta){
    const sess = { role:'owner', user: meta||{}, createdAt: now() };
    write(sess); publish(); return sess;
  }
  function signOut(){
    const s = read();
    if(s && s.role === 'owner'){ // owners are never signed out
      return s;
    }
    clear(); publish(); return null;
  }
  function isOwner(){ return getRole() === 'owner'; }

  // Expose
  window.SOTAAuth = { getSession, getRole, isOwner, signInSubscriber, signInOwner, signOut };

  // Initialize body dataset on load
  try{ document.addEventListener('DOMContentLoaded', publish); }catch(_){ }
})();
