(function(){
  if (typeof window === 'undefined') return;

  function interleaveAndToInt16(buffer, targetRate){
    targetRate = targetRate || 44100;
    const chs = Math.min(2, buffer.numberOfChannels || 1);
    const inRate = buffer.sampleRate || 44100;
    const data = [];
    for (let ch=0; ch<chs; ch++) data[ch] = buffer.getChannelData(ch);
    function resampleFloat(floatData){
      if (inRate === targetRate) return floatData;
      const rateRatio = inRate / targetRate;
      const outLen = Math.max(1, Math.floor(floatData.length / rateRatio));
      const out = new Float32Array(outLen);
      for (let i=0; i<outLen; i++){
        const idx = i * rateRatio;
        const i0 = Math.floor(idx);
        const i1 = Math.min(floatData.length - 1, i0 + 1);
        const t = idx - i0;
        out[i] = floatData[i0] * (1 - t) + floatData[i1] * t;
      }
      return out;
    }
    const resampled = data.map(resampleFloat);
    if (chs === 1){
      resampled[1] = resampled[0];
    }
    function floatTo16(farr){
      const i16 = new Int16Array(farr.length);
      for (let i=0; i<farr.length; i++){
        let s = farr[i] || 0;
        if (s > 1) s = 1; else if (s < -1) s = -1;
        i16[i] = s < 0 ? (s * 0x8000) : (s * 0x7FFF);
      }
      return i16;
    }
    return { left: floatTo16(resampled[0]), right: floatTo16(resampled[1]), sampleRate: targetRate, channels: 2 };
  }

  async function encodeMp3WithLame(buffer, options){
    const lame = window.lamejs;
    if (!lame) throw new Error('lamejs not present');
    const bitrate = (options && (options.bitrate || options.quality)) || 192; // kbps
    const { left, right, sampleRate, channels } = interleaveAndToInt16(buffer, 44100);
    const encoder = new lame.Mp3Encoder(channels, sampleRate, bitrate);
    const blockSize = 1152;
    const mp3Chunks = [];
    for (let i=0; i<left.length; i+=blockSize){
      const leftChunk = left.subarray(i, i+blockSize);
      const rightChunk = right.subarray(i, i+blockSize);
      const mp3buf = encoder.encodeBuffer(leftChunk, rightChunk);
      if (mp3buf && mp3buf.length) mp3Chunks.push(mp3buf);
    }
    const end = encoder.flush();
    if (end && end.length) mp3Chunks.push(end);
    return new Blob(mp3Chunks, { type: 'audio/mpeg' });
  }

  function register(){
    const api = window.SmartSynthAPI;
    if (!api || typeof api.registerEncoderProvider !== 'function') return;
    const provider = { encodeMp3: encodeMp3WithLame };
    api.registerEncoderProvider(provider);
    try { if (window.SOTA_toast) window.SOTA_toast('MP3 encoder ready', { type:'success', duration:1500 }); } catch {}
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive'){
    setTimeout(register, 0);
  } else {
    document.addEventListener('DOMContentLoaded', register);
  }
})();
