// Backend base URL for API calls.
// Use '' to hit same-origin (with Netlify proxy handling /api/*) or set to a full absolute URL.
// Example (Netlify proxy): window.SOTA_BACKEND_URL = ''
// Example (direct backend): window.SOTA_BACKEND_URL = 'https://api.redemptionrd.shop'

(function(){
	// Respect an explicitly-set value
	if (typeof window.SOTA_BACKEND_URL === 'string' && window.SOTA_BACKEND_URL.trim() !== '') return;
	try{
		const isFile = (location.protocol === 'file:');
		const host = (location.hostname||'').toLowerCase();
		if (isFile || host === 'localhost' || host === '127.0.0.1') {
			window.SOTA_BACKEND_URL = 'http://127.0.0.1:8000';
		} else {
			// Same-origin (Netlify proxy handles /api/*)
			window.SOTA_BACKEND_URL = '';
		}
	}catch(e){
		window.SOTA_BACKEND_URL = '';
	}
})();
