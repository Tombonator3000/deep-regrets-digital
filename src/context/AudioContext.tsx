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
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  play: () => Promise<void>;
  pause: () => void;
  toggle: () => Promise<void>;
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

const musicModules = import.meta.glob<{ default: string }>('../assets/muzak/*.mp3', {
  eager: true,
});

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
      .map(([path, module], index) => ({
        id: `track-${index}`,
        name: normaliseTrackName(path, index),
        url: module.default,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const [currentTrackId, setCurrentTrackId] = useState<string | null>(() => tracks[0]?.id ?? null);
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [isSfxEnabled, setIsSfxEnabled] = useState(true);
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [musicVolume, setMusicVolume] = useState(0.7);
  const [sfxVolume, setSfxVolume] = useState(0.8);
  const [isPlaying, setIsPlaying] = useState(false);

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

  useEffect(() => {
    const element = ensureMusicElement();
    if (!element) {
      return;
    }

    element.volume = Math.min(1, Math.max(0, masterVolume * musicVolume));
  }, [masterVolume, musicVolume]);

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
        playPromise.catch(() => {
          setIsPlaying(false);
        });
      }
    }
  }, [isMusicEnabled, isPlaying, currentTrack]);

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
        playPromise.catch(() => {
          setIsPlaying(false);
        });
      }
    }
  }, [currentTrack, isMusicEnabled, isPlaying]);

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
    } catch (error) {
      console.warn('[audio] Unable to start playback', error);
      setIsPlaying(false);
    }
  }, [currentTrack, ensureMusicElement, isMusicEnabled, tracks]);

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
      masterVolume,
      musicVolume,
      sfxVolume,
      play,
      pause,
      toggle,
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
      masterVolume,
      musicVolume,
      sfxVolume,
      pause,
      play,
      toggle,
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
