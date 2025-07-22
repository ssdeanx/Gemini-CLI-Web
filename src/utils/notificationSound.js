let audioContext = null;

// Create a simple notification sound using Web Audio API
function createNotificationSound(context) {
  const duration = 0.3;
  const sampleRate = context.sampleRate;
  const numSamples = duration * sampleRate;
  
  // Create buffer
  const buffer = context.createBuffer(1, numSamples, sampleRate);
  const data = buffer.getChannelData(0);
  
  // Generate a pleasant notification sound (two-tone chime)
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;
    
    // First tone (higher pitch)
    if (t < 0.15) {
      const envelope = Math.sin(Math.PI * t / 0.15);
      sample += envelope * 0.3 * Math.sin(2 * Math.PI * 880 * t); // A5
    }
    
    // Second tone (lower pitch)
    if (t >= 0.15 && t < 0.3) {
      const envelope = Math.sin(Math.PI * (t - 0.15) / 0.15);
      sample += envelope * 0.3 * Math.sin(2 * Math.PI * 659.25 * t); // E5
    }
    
    data[i] = sample;
  }
  
  return buffer;
}

// Play the notification sound
export async function playNotificationSound() {
  try {
    // Check if sound is enabled
    const settings = JSON.parse(localStorage.getItem('gemini-tools-settings') || '{}');
    // console.log('Notification settings:', settings);
    // console.log('Sound enabled:', settings.enableNotificationSound);
    if (!settings.enableNotificationSound) {
      // console.log('Notification sound is disabled');
      return;
    }
    
    // console.log('Sound is enabled, initializing audio...');
    
    // Create or resume audio context
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      // console.log('Created audio context');
    }
    
    // Resume context if it's suspended (required for some browsers)
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
      // console.log('Resumed audio context');
    }
    
    // Create the notification sound
    const buffer = createNotificationSound(audioContext);
    // console.log('Created sound buffer');
    
    // Play the sound
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    
    // Create gain node for volume control
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.5; // 50% volume
    
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    source.start();
    // console.log('Sound playback started');
    
  } catch (error) {
    // console.error('Failed to play notification sound:', error);
  }
}