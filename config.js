// Backend base URL for API calls.
// Use '' to hit same-origin (with Netlify proxy handling /api/*) or set to a full absolute URL.
// Example (Netlify proxy): window.SOTA_BACKEND_URL = ''
// Example (direct backend): window.SOTA_BACKEND_URL = 'https://api.redemptionrd.shop'

(function(){
	try{
		const params = new URLSearchParams((typeof location!=='undefined' && location.search) || '');
		const LS_KEY = 'SOTA_API_URL';

		// Setter/getter exposed globally
		window.SOTA_setBackendURL = function(url){
			try{ if(typeof url==='string'){ localStorage.setItem(LS_KEY, url); window.SOTA_BACKEND_URL = url; console.info('[SOTA] Backend URL set to', url); } }catch(_){ }
		};
		window.SOTA_getBackendURL = function(){ try{ return window.SOTA_BACKEND_URL; }catch(_){ return ''; } };

		// 1) Highest priority: ?api=...
		const apiOverride = params.get('api');
		if (apiOverride && apiOverride.trim() !== '') {
			window.SOTA_setBackendURL(apiOverride.trim());
			return;
		}

		// 2) Next: localStorage override
		const saved = (function(){ try{ return localStorage.getItem(LS_KEY)||''; }catch(_){ return ''; } })();
		if (typeof saved === 'string' && saved.trim() !== '') {
			window.SOTA_BACKEND_URL = saved.trim();
			return;
		}

		// 3) Respect an explicitly-predefined global value
		if (typeof window.SOTA_BACKEND_URL === 'string' && window.SOTA_BACKEND_URL.trim() !== '') return;

		// 4) Default: local dev vs hosted
		const isFile = (typeof location!=='undefined' && location.protocol === 'file:');
		const host = (typeof location!=='undefined' && (location.hostname||'').toLowerCase()) || '';
		if (isFile || host === 'localhost' || host === '127.0.0.1') {
			window.SOTA_BACKEND_URL = 'http://127.0.0.1:8000';
		} else {
			// Same-origin (proxy should handle /api/*)
			window.SOTA_BACKEND_URL = '';
		}
	}catch(e){
		window.SOTA_BACKEND_URL = '';
	}
	// Small helpers
	window.SOTA_getBackend = function(){ try{ return window.SOTA_BACKEND_URL || ''; }catch(_){ return ''; } };
	window.SOTA_pingBackend = async function(){ try{ const base=window.SOTA_getBackend(); const r=await fetch((base||'') + '/api/health', {cache:'no-store'}); return r.ok; } catch(_){ return false; } };
})();
