import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export interface AudioTrack {
  id: string;
  name: string;
  url: string;
}

interface AudioContextValue {
  tracks: AudioTrack[];
  currentTrack: AudioTrack | null;
  currentTrackId: string | null;
  isMusicEnabled: boolean;
  isSfxEnabled: boolean;
  isPlaying: boolean;
  requiresUserActivation: boolean;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  play: () => Promise<void>;
  pause: () => void;
  toggle: () => Promise<void>;
  retryPlayback: () => Promise<void>;
  setCurrentTrackId: (trackId: string | null) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setSfxEnabled: (enabled: boolean) => void;
  setMasterVolume: (value: number) => void;
  setMusicVolume: (value: number) => void;
  setSfxVolume: (value: number) => void;
  playSfx: (src: string) => void;
  playBubbleSfx: () => void;
}

const AudioManagerContext = createContext<AudioContextValue | undefined>(undefined);

const musicModules = import.meta.glob<string | { default: string }>(
  '../assets/muzak/*.mp3',
  {
    eager: true,
    import: 'default',
  },
);

const normaliseTrackName = (path: string, index: number) => {
  const fileName = path.split('/').pop() ?? `track-${index + 1}`;
  const withoutExtension = fileName.replace(/\.mp3$/i, '');
  const words = withoutExtension
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const capitalised = words
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return capitalised || `Track ${index + 1}`;
};

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const tracks = useMemo<AudioTrack[]>(() => {
    return Object.entries(musicModules)
      .map(([path, module], index) => {
        const url = typeof module === 'string' ? module : module?.default;

        if (!url) {
          console.warn(`[audio] Unable to resolve track URL for "${path}"`);
          return null;
        }

        return {
          id: `track-${index}`,
          name: normaliseTrackName(path, index),
          url,
        } satisfies AudioTrack;
      })
      .filter((track): track is AudioTrack => track !== null)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // localStorage keys for persisting audio settings
  const STORAGE_KEYS = {
    masterVolume: 'deep-regrets-master-volume',
    musicVolume: 'deep-regrets-music-volume',
    sfxVolume: 'deep-regrets-sfx-volume',
    isMusicEnabled: 'deep-regrets-music-enabled',
    isSfxEnabled: 'deep-regrets-sfx-enabled',
  } as const;

  // Helper to safely read from localStorage
  const getStoredNumber = (key: string, defaultValue: number): number => {
    if (typeof window === 'undefined') return defaultValue;
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    const parsed = parseFloat(stored);
    return Number.isNaN(parsed) ? defaultValue : Math.min(1, Math.max(0, parsed));
  };

  const getStoredBoolean = (key: string, defaultValue: boolean): boolean => {
    if (typeof window === 'undefined') return defaultValue;
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    return stored === 'true';
  };

  const [currentTrackId, setCurrentTrackId] = useState<string | null>(() => tracks[0]?.id ?? null);
  const [isMusicEnabled, setIsMusicEnabled] = useState(() => getStoredBoolean(STORAGE_KEYS.isMusicEnabled, true));
  const [isSfxEnabled, setIsSfxEnabled] = useState(() => getStoredBoolean(STORAGE_KEYS.isSfxEnabled, true));
  const [masterVolume, setMasterVolume] = useState(() => getStoredNumber(STORAGE_KEYS.masterVolume, 0.8));
  const [musicVolume, setMusicVolume] = useState(() => getStoredNumber(STORAGE_KEYS.musicVolume, 0.15));
  const [sfxVolume, setSfxVolume] = useState(() => getStoredNumber(STORAGE_KEYS.sfxVolume, 0.8));
  const [isPlaying, setIsPlaying] = useState(false);
  const [requiresUserActivation, setRequiresUserActivation] = useState(false);

  // Persist settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.masterVolume, masterVolume.toString());
  }, [masterVolume]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.musicVolume, musicVolume.toString());
  }, [musicVolume]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.sfxVolume, sfxVolume.toString());
  }, [sfxVolume]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.isMusicEnabled, isMusicEnabled.toString());
  }, [isMusicEnabled]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.isSfxEnabled, isSfxEnabled.toString());
  }, [isSfxEnabled]);

  const musicRef = useRef<HTMLAudioElement | null>(null);
  const musicSourceRef = useRef<string | null>(null);
  const sfxContextRef = useRef<globalThis.AudioContext | null>(null);

  const currentTrack = useMemo(() => {
    return tracks.find((track) => track.id === currentTrackId) ?? null;
  }, [tracks, currentTrackId]);

  const ensureMusicElement = useCallback(() => {
    if (typeof Audio === 'undefined') {
      return null;
    }

    if (!musicRef.current) {
      musicRef.current = new Audio();
      musicRef.current.loop = true;
    }

    return musicRef.current;
  }, []);

  useEffect(() => {
    if (!tracks.length) {
      setCurrentTrackId(null);
      setIsPlaying(false);
      musicSourceRef.current = null;
    } else {
      setCurrentTrackId((previous) => {
        if (!previous || !tracks.some((track) => track.id === previous)) {
          return tracks[0].id;
        }

        return previous;
      });
    }
  }, [tracks]);

  const isNotAllowedError = useCallback((error: unknown) => {
    if (error instanceof DOMException) {
      return error.name === 'NotAllowedError';
    }

    if (typeof error === 'object' && error && 'name' in error) {
      return (error as { name?: string }).name === 'NotAllowedError';
    }

    return false;
  }, []);

  const handlePlaybackRejection = useCallback(
    (error: unknown) => {
      console.warn('[audio] Unable to start playback', error);
      setIsPlaying(false);

      if (isNotAllowedError(error)) {
        setRequiresUserActivation(true);
      }
    },
    [isNotAllowedError],
  );

  useEffect(() => {
    const element = ensureMusicElement();
    if (!element) {
      return;
    }

    element.volume = Math.min(1, Math.max(0, masterVolume * musicVolume));
  }, [ensureMusicElement, masterVolume, musicVolume]);

  useEffect(() => {
    const element = ensureMusicElement();
    if (!element) {
      return;
    }

    if (!isMusicEnabled) {
      element.pause();
      setIsPlaying(false);
      return;
    }

    if (isPlaying && currentTrack) {
      const playPromise = element.play();
      if (playPromise) {
        playPromise.catch(handlePlaybackRejection);
      }
    }
  }, [currentTrack, ensureMusicElement, handlePlaybackRejection, isMusicEnabled, isPlaying]);

  useEffect(() => {
    const element = ensureMusicElement();
    if (!element) {
      return;
    }

    if (!currentTrack) {
      element.pause();
      musicSourceRef.current = null;
      setIsPlaying(false);
      return;
    }

    if (musicSourceRef.current !== currentTrack.url) {
      element.src = currentTrack.url;
      musicSourceRef.current = currentTrack.url;
    }

    if (isPlaying && isMusicEnabled) {
      const playPromise = element.play();
      if (playPromise) {
        playPromise.catch(handlePlaybackRejection);
      }
    }
  }, [currentTrack, ensureMusicElement, handlePlaybackRejection, isMusicEnabled, isPlaying]);

  useEffect(() => {
    return () => {
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current.src = '';
        musicRef.current.load();
      }

      if (sfxContextRef.current) {
        void sfxContextRef.current.close();
        sfxContextRef.current = null;
      }
    };
  }, []);

  const play = useCallback(async () => {
    if (!isMusicEnabled) {
      return;
    }

    const element = ensureMusicElement();
    if (!element) {
      return;
    }

    const trackToPlay = currentTrack ?? tracks[0];
    if (!trackToPlay) {
      return;
    }

    if (!currentTrack) {
      setCurrentTrackId(trackToPlay.id);
    }

    if (musicSourceRef.current !== trackToPlay.url) {
      element.src = trackToPlay.url;
      musicSourceRef.current = trackToPlay.url;
    }

    try {
      const promise = element.play();
      if (promise) {
        await promise;
      }
      setIsPlaying(true);
      setRequiresUserActivation(false);
    } catch (error) {
      handlePlaybackRejection(error);
    }
  }, [
    currentTrack,
    ensureMusicElement,
    handlePlaybackRejection,
    isMusicEnabled,
    tracks,
  ]);

  const pause = useCallback(() => {
    if (!musicRef.current) {
      return;
    }

    musicRef.current.pause();
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(async () => {
    if (isPlaying) {
      pause();
      return;
    }

    await play();
  }, [isPlaying, pause, play]);

  const retryPlayback = useCallback(async () => {
    setRequiresUserActivation(false);
    await play();
  }, [play]);

  useEffect(() => {
    if (!requiresUserActivation || typeof window === 'undefined') {
      return;
    }

    let disposed = false;

    const removeListeners = () => {
      if (disposed) {
        return;
      }

      disposed = true;
      window.removeEventListener('pointerdown', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };

    const attemptResume = async () => {
      if (disposed) {
        return;
      }

      try {
        await retryPlayback();
      } finally {
        const element = musicRef.current;
        if (element && !element.paused) {
          setRequiresUserActivation(false);
          removeListeners();
        }
      }
    };

    const handleInteraction = () => {
      void attemptResume();
    };

    window.addEventListener('pointerdown', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return removeListeners;
  }, [requiresUserActivation, retryPlayback]);

  const setMusicEnabled = useCallback((enabled: boolean) => {
    setIsMusicEnabled(enabled);
  }, []);

  const setSfxEnabled = useCallback((enabled: boolean) => {
    setIsSfxEnabled(enabled);
  }, []);

  const setMaster = useCallback((value: number) => {
    setMasterVolume(Math.min(1, Math.max(0, value)));
  }, []);

  const setMusic = useCallback((value: number) => {
    setMusicVolume(Math.min(1, Math.max(0, value)));
  }, []);

  const setSfx = useCallback((value: number) => {
    setSfxVolume(Math.min(1, Math.max(0, value)));
  }, []);

  const setTrack = useCallback((trackId: string | null) => {
    setCurrentTrackId(trackId);
    if (trackId === null) {
      pause();
    }
  }, [pause]);

  const playSfx = useCallback(
    (src: string) => {
      if (!isSfxEnabled || typeof Audio === 'undefined' || !src) {
        return;
      }

      const audio = new Audio(src);
      audio.volume = Math.min(1, Math.max(0, masterVolume * sfxVolume));
      void audio.play().catch(() => {
        // Ignore playback errors for quick sound effects.
      });
    },
    [isSfxEnabled, masterVolume, sfxVolume],
  );

  const playBubbleSfx = useCallback(() => {
    if (!isSfxEnabled || typeof window === 'undefined') {
      return;
    }

    const audioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext;

    if (!audioContextClass) {
      return;
    }

    if (!sfxContextRef.current) {
      sfxContextRef.current = new audioContextClass();
    }

    const context = sfxContextRef.current;
    const now = context.currentTime;

    const gain = context.createGain();
    gain.gain.setValueAtTime(masterVolume * sfxVolume * 0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

    const oscillator = context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(180, now);
    oscillator.frequency.exponentialRampToValueAtTime(40, now + 0.6);

    oscillator.connect(gain);
    gain.connect(context.destination);

    context.resume().catch(() => {
      // Swallow resume errors silently.
    });

    oscillator.start(now);
    oscillator.stop(now + 0.6);
  }, [isSfxEnabled, masterVolume, sfxVolume]);

  const value = useMemo<AudioContextValue>(
    () => ({
      tracks,
      currentTrack,
      currentTrackId,
      isMusicEnabled,
      isSfxEnabled,
      isPlaying,
      requiresUserActivation,
      masterVolume,
      musicVolume,
      sfxVolume,
      play,
      pause,
      toggle,
      retryPlayback,
      setCurrentTrackId: setTrack,
      setMusicEnabled,
      setSfxEnabled,
      setMasterVolume: setMaster,
      setMusicVolume: setMusic,
      setSfxVolume: setSfx,
      playSfx,
      playBubbleSfx,
    }),
    [
      currentTrack,
      currentTrackId,
      isMusicEnabled,
      isSfxEnabled,
      isPlaying,
      requiresUserActivation,
      masterVolume,
      musicVolume,
      sfxVolume,
      pause,
      play,
      toggle,
      retryPlayback,
      setMusicEnabled,
      setSfxEnabled,
      setMaster,
      setMusic,
      setSfx,
      setTrack,
      tracks,
      playSfx,
      playBubbleSfx,
    ],
  );

  return <AudioManagerContext.Provider value={value}>{children}</AudioManagerContext.Provider>;
};

export const useAudio = () => {
  const context = useContext(AudioManagerContext);

  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }

  return context;
};
