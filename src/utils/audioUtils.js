export async function playPCM(base64Data, preCreatedContext = null) {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      console.warn("AudioContext not supported");
      return;
    }
    const audioCtx = preCreatedContext || new AudioContextClass({ sampleRate: 24000 });
    console.log("[DEBUG] AudioContext used. Current state:", audioCtx.state);
    if (audioCtx.state === "suspended") {
      console.log("[DEBUG] AudioContext is suspended. Attempting to resume...");
      await audioCtx.resume();
      console.log("[DEBUG] AudioContext resumed. New state:", audioCtx.state);
    }
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const buffer = new Int16Array(bytes.buffer);
    const audioBuffer = audioCtx.createBuffer(1, buffer.length, 24000);
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) {
      channelData[i] = buffer[i] / 32768.0;
    }
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    console.log("[DEBUG] Audio Source Node started playing.");
    source.start();
    
    return new Promise(resolve => {
      source.onended = () => {
        console.log("[DEBUG] Audio Source Node playback ended.");
        audioCtx.close();
        resolve();
      };
    });
  } catch (error) {
    console.error("[DEBUG] Error playing audio:", error);
  }
}
