// Lightweight shim to expose a host-export helper on any page.
(function(){
  try {
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
