import { useCallback, useRef } from 'react';
import { useAudio } from '@/context/AudioContext';

/**
 * Hook for playing game sound effects using Web Audio API
 * Provides procedurally generated sounds for various game events
 */
export const useGameSfx = () => {
  const { isSfxEnabled, masterVolume, sfxVolume } = useAudio();
  const audioContextRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    }
    return audioContextRef.current;
  }, []);

  const getVolume = useCallback(() => {
    return masterVolume * sfxVolume;
  }, [masterVolume, sfxVolume]);

  // Dice roll sound - rattling dice effect
  const playDiceRoll = useCallback(() => {
    if (!isSfxEnabled) return;
    const ctx = getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const volume = getVolume();

    // Create multiple short clicks for dice rattle
    for (let i = 0; i < 8; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(200 + Math.random() * 400, now + i * 0.05);

      gain.gain.setValueAtTime(volume * 0.3, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.05);
    }

    // Final landing sound
    const finalOsc = ctx.createOscillator();
    const finalGain = ctx.createGain();

    finalOsc.type = 'sine';
    finalOsc.frequency.setValueAtTime(150, now + 0.4);
    finalOsc.frequency.exponentialRampToValueAtTime(80, now + 0.6);

    finalGain.gain.setValueAtTime(volume * 0.5, now + 0.4);
    finalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    finalOsc.connect(finalGain);
    finalGain.connect(ctx.destination);

    finalOsc.start(now + 0.4);
    finalOsc.stop(now + 0.6);

    ctx.resume().catch(() => {});
  }, [isSfxEnabled, getContext, getVolume]);

  // Success catch sound - ascending triumphant tone
  const playCatchSuccess = useCallback(() => {
    if (!isSfxEnabled) return;
    const ctx = getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const volume = getVolume();

    // Ascending arpeggio
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);

      gain.gain.setValueAtTime(volume * 0.4, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.3);
    });

    ctx.resume().catch(() => {});
  }, [isSfxEnabled, getContext, getVolume]);

  // Failure sound - descending disappointed tone
  const playCatchFail = useCallback(() => {
    if (!isSfxEnabled) return;
    const ctx = getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const volume = getVolume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.5);

    gain.gain.setValueAtTime(volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);

    ctx.resume().catch(() => {});
  }, [isSfxEnabled, getContext, getVolume]);

  // Coin/purchase sound - metallic clink
  const playCoinSound = useCallback(() => {
    if (!isSfxEnabled) return;
    const ctx = getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const volume = getVolume();

    // High metallic ping
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1200, now);
    osc1.frequency.exponentialRampToValueAtTime(800, now + 0.15);

    gain1.gain.setValueAtTime(volume * 0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.2);

    // Second harmonic
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2400, now);

    gain2.gain.setValueAtTime(volume * 0.2, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now);
    osc2.stop(now + 0.1);

    ctx.resume().catch(() => {});
  }, [isSfxEnabled, getContext, getVolume]);

  // Turn transition / phase change sound
  const playTurnSound = useCallback(() => {
    if (!isSfxEnabled) return;
    const ctx = getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const volume = getVolume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(550, now + 0.1);

    gain.gain.setValueAtTime(volume * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);

    ctx.resume().catch(() => {});
  }, [isSfxEnabled, getContext, getVolume]);

  // Regret/madness draw sound - eerie dissonant tone
  const playRegretSound = useCallback(() => {
    if (!isSfxEnabled) return;
    const ctx = getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const volume = getVolume();

    // Dissonant chord
    const frequencies = [220, 233, 277]; // A3, Bb3, C#4 - dissonant
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.8, now + 0.6);

      gain.gain.setValueAtTime(volume * 0.15, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.05);
      osc.stop(now + 0.6);
    });

    ctx.resume().catch(() => {});
  }, [isSfxEnabled, getContext, getVolume]);

  // Depth descent sound - deep whoosh
  const playDescendSound = useCallback(() => {
    if (!isSfxEnabled) return;
    const ctx = getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const volume = getVolume();

    // Low frequency sweep
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.8);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.8);

    gain.gain.setValueAtTime(volume * 0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.8);

    ctx.resume().catch(() => {});
  }, [isSfxEnabled, getContext, getVolume]);

  // Card flip/reveal sound
  const playCardFlip = useCallback(() => {
    if (!isSfxEnabled) return;
    const ctx = getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const volume = getVolume();

    // Quick whoosh
    const noise = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, now);
    filter.Q.setValueAtTime(1, now);

    noise.type = 'sawtooth';
    noise.frequency.setValueAtTime(100, now);

    gain.gain.setValueAtTime(volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.1);

    ctx.resume().catch(() => {});
  }, [isSfxEnabled, getContext, getVolume]);

  // Day end / morning bell sound
  const playDayEndSound = useCallback(() => {
    if (!isSfxEnabled) return;
    const ctx = getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const volume = getVolume();

    // Ship's bell - two strikes
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now + i * 0.3);

      gain.gain.setValueAtTime(volume * 0.4, now + i * 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.3 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.3);
      osc.stop(now + i * 0.3 + 0.5);
    }

    ctx.resume().catch(() => {});
  }, [isSfxEnabled, getContext, getVolume]);

  // Victory fanfare
  const playVictorySound = useCallback(() => {
    if (!isSfxEnabled) return;
    const ctx = getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const volume = getVolume();

    // Triumphant fanfare
    const melody = [
      { freq: 523.25, start: 0, dur: 0.15 },      // C5
      { freq: 659.25, start: 0.15, dur: 0.15 },   // E5
      { freq: 783.99, start: 0.3, dur: 0.15 },    // G5
      { freq: 1046.50, start: 0.45, dur: 0.4 },   // C6
    ];

    melody.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + start);

      gain.gain.setValueAtTime(volume * 0.3, now + start);
      gain.gain.setValueAtTime(volume * 0.3, now + start + dur * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + dur);
    });

    ctx.resume().catch(() => {});
  }, [isSfxEnabled, getContext, getVolume]);

  // Splash sound - entering water / catching fish
  const playSplash = useCallback(() => {
    if (!isSfxEnabled) return;
    const ctx = getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const volume = getVolume();

    // White noise burst for splash
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, now);
    filter.frequency.exponentialRampToValueAtTime(500, now + 0.3);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);

    ctx.resume().catch(() => {});
  }, [isSfxEnabled, getContext, getVolume]);

  // UI click sound
  const playClick = useCallback(() => {
    if (!isSfxEnabled) return;
    const ctx = getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const volume = getVolume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);

    gain.gain.setValueAtTime(volume * 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);

    ctx.resume().catch(() => {});
  }, [isSfxEnabled, getContext, getVolume]);

  return {
    playDiceRoll,
    playCatchSuccess,
    playCatchFail,
    playCoinSound,
    playTurnSound,
    playRegretSound,
    playDescendSound,
    playCardFlip,
    playDayEndSound,
    playVictorySound,
    playSplash,
    playClick,
  };
};
