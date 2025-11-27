import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAudio } from '@/context/AudioContext';
import { useLanguage, type Language } from '@/context/LanguageContext';
import {
  Globe,
  Monitor,
  Music,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Waves,
} from 'lucide-react';

const STORAGE_KEYS = {
  animationsEnabled: 'deep-regrets-animations-enabled',
  particlesEnabled: 'deep-regrets-particles-enabled',
  bubblesEnabled: 'deep-regrets-bubbles-enabled',
} as const;

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

const getStoredBoolean = (key: string, defaultValue: boolean): boolean => {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(key);
  if (stored === null) return defaultValue;
  return stored === 'true';
};

export interface DisplaySettings {
  animationsEnabled: boolean;
  particlesEnabled: boolean;
  bubblesEnabled: boolean;
}

interface OptionsMenuProps {
  onDisplaySettingsChange?: (settings: DisplaySettings) => void;
}

export const OptionsMenu = ({ onDisplaySettingsChange }: OptionsMenuProps) => {
  const {
    tracks,
    currentTrack,
    isMusicEnabled,
    isSfxEnabled,
    isPlaying,
    requiresUserActivation,
    masterVolume,
    musicVolume,
    sfxVolume,
    play,
    pause,
    setMusicEnabled,
    setSfxEnabled,
    setMasterVolume,
    setMusicVolume,
    setSfxVolume,
    setCurrentTrackId,
    playBubbleSfx,
    retryPlayback,
  } = useAudio();

  const { language, setLanguage, t } = useLanguage();

  // Display settings state
  const [animationsEnabled, setAnimationsEnabled] = useState(() =>
    getStoredBoolean(STORAGE_KEYS.animationsEnabled, true)
  );
  const [particlesEnabled, setParticlesEnabled] = useState(() =>
    getStoredBoolean(STORAGE_KEYS.particlesEnabled, true)
  );
  const [bubblesEnabled, setBubblesEnabled] = useState(() =>
    getStoredBoolean(STORAGE_KEYS.bubblesEnabled, true)
  );

  // Persist display settings
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.animationsEnabled, animationsEnabled.toString());
    localStorage.setItem(STORAGE_KEYS.particlesEnabled, particlesEnabled.toString());
    localStorage.setItem(STORAGE_KEYS.bubblesEnabled, bubblesEnabled.toString());

    onDisplaySettingsChange?.({
      animationsEnabled,
      particlesEnabled,
      bubblesEnabled,
    });
  }, [animationsEnabled, particlesEnabled, bubblesEnabled, onDisplaySettingsChange]);

  const hasTracks = tracks.length > 0;

  const createVolumeHandler = useCallback(
    (setter: (value: number) => void) => (values: number[]) => {
      const [value] = values;
      setter(Math.min(1, Math.max(0, (value ?? 0) / 100)));
    },
    [],
  );

  const handlePlayPause = () => {
    if (!hasTracks || !isMusicEnabled) {
      return;
    }

    if (isPlaying) {
      pause();
    } else {
      void play();
    }
  };

  const handleResetAudio = () => {
    setMasterVolume(0.8);
    setMusicVolume(0.15);
    setSfxVolume(0.8);
    setMusicEnabled(true);
    setSfxEnabled(true);
  };

  const handleResetDisplay = () => {
    setAnimationsEnabled(true);
    setParticlesEnabled(true);
    setBubblesEnabled(true);
  };

  return (
    <Tabs defaultValue="audio" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-background/50">
        <TabsTrigger value="audio" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
          <Volume2 className="h-4 w-4" />
          {t('options.audio')}
        </TabsTrigger>
        <TabsTrigger value="display" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
          <Monitor className="h-4 w-4" />
          {t('options.display')}
        </TabsTrigger>
        <TabsTrigger value="language" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
          <Globe className="h-4 w-4" />
          {t('options.language')}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="audio" className="mt-6 space-y-6">
        {/* Master Volume */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Volume2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-card-foreground">{t('options.masterVolume')}</h4>
                <p className="text-xs text-muted-foreground">
                  {t('options.masterVolumeDesc')}
                </p>
              </div>
            </div>
            <span className="min-w-[3.5rem] text-right text-lg font-bold text-primary">
              {formatPercent(masterVolume)}
            </span>
          </div>
          <Slider
            value={[Math.round(masterVolume * 100)]}
            onValueChange={createVolumeHandler(setMasterVolume)}
            step={1}
            max={100}
            className="cursor-pointer"
          />
        </section>

        <Separator className="bg-white/10" />

        {/* Background Music */}
        <section className="space-y-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Music className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-card-foreground">{t('options.backgroundMusic')}</h4>
                <p className="text-xs text-muted-foreground">
                  {t('options.backgroundMusicDesc')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="music-enabled" className="text-xs uppercase tracking-wide text-muted-foreground">
                {isMusicEnabled ? t('common.on') : t('common.off')}
              </Label>
              <Switch id="music-enabled" checked={isMusicEnabled} onCheckedChange={setMusicEnabled} />
            </div>
          </div>

          {requiresUserActivation && isMusicEnabled && (
            <div className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
              <p className="mb-2 font-medium">{t('options.browserBlocked')}</p>
              <Button type="button" size="sm" variant="secondary" onClick={() => void retryPlayback()}>
                <Volume2 className="mr-2 h-4 w-4" /> {t('options.enableSound')}
              </Button>
            </div>
          )}

          {hasTracks ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="music-track" className="text-sm font-medium text-card-foreground">
                  {t('options.selectTrack')}
                </Label>
                <Select
                  value={currentTrack?.id ?? tracks[0]?.id ?? ''}
                  onValueChange={(value) => setCurrentTrackId(value)}
                  disabled={!isMusicEnabled}
                >
                  <SelectTrigger id="music-track" className="bg-background/50">
                    <SelectValue placeholder={t('options.chooseTrack')} />
                  </SelectTrigger>
                  <SelectContent>
                    {tracks.map((track) => (
                      <SelectItem key={track.id} value={track.id}>
                        {track.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handlePlayPause}
                  disabled={!isMusicEnabled}
                  className={isPlaying ? 'bg-primary/80 hover:bg-primary/70' : 'btn-ocean'}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" /> {t('options.pause')}
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" /> {t('options.play')}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={pause}
                  disabled={!isPlaying}
                >
                  <VolumeX className="mr-2 h-4 w-4" /> {t('options.stop')}
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <Label htmlFor="music-volume" className="font-medium text-card-foreground">
                    {t('options.musicVolume')}
                  </Label>
                  <span className="text-muted-foreground">{formatPercent(musicVolume)}</span>
                </div>
                <Slider
                  id="music-volume"
                  value={[Math.round(musicVolume * 100)]}
                  onValueChange={createVolumeHandler(setMusicVolume)}
                  step={1}
                  max={100}
                  disabled={!isMusicEnabled}
                  className="cursor-pointer"
                />
              </div>
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-primary/30 bg-background/60 p-4 text-sm text-muted-foreground">
              {t('options.noMusicTracks')} <code className="rounded bg-background px-1">src/assets/muzak</code>
            </p>
          )}
        </section>

        {/* Sound Effects */}
        <section className="space-y-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Waves className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-card-foreground">{t('options.soundEffects')}</h4>
                <p className="text-xs text-muted-foreground">
                  {t('options.soundEffectsDesc')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="sfx-enabled" className="text-xs uppercase tracking-wide text-muted-foreground">
                {isSfxEnabled ? t('common.on') : t('common.off')}
              </Label>
              <Switch id="sfx-enabled" checked={isSfxEnabled} onCheckedChange={setSfxEnabled} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <Label htmlFor="sfx-volume" className="font-medium text-card-foreground">
                {t('options.effectsVolume')}
              </Label>
              <span className="text-muted-foreground">{formatPercent(sfxVolume)}</span>
            </div>
            <Slider
              id="sfx-volume"
              value={[Math.round(sfxVolume * 100)]}
              onValueChange={createVolumeHandler(setSfxVolume)}
              step={1}
              max={100}
              disabled={!isSfxEnabled}
              className="cursor-pointer"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-primary/30 hover:border-primary"
            disabled={!isSfxEnabled}
            onClick={playBubbleSfx}
          >
            <Waves className="mr-2 h-4 w-4" /> {t('options.testSound')}
          </Button>
        </section>

        {/* Reset Audio Button */}
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={handleResetAudio}
          >
            <RotateCcw className="mr-2 h-4 w-4" /> {t('common.resetToDefaults')}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="display" className="mt-6 space-y-6">
        {/* Visual Effects */}
        <section className="space-y-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-card-foreground">{t('options.visualEffects')}</h4>
              <p className="text-xs text-muted-foreground">
                {t('options.visualEffectsDesc')}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-background/30 p-3">
              <div>
                <Label htmlFor="animations-toggle" className="text-sm font-medium text-card-foreground">
                  {t('options.uiAnimations')}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t('options.uiAnimationsDesc')}
                </p>
              </div>
              <Switch
                id="animations-toggle"
                checked={animationsEnabled}
                onCheckedChange={setAnimationsEnabled}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg bg-background/30 p-3">
              <div>
                <Label htmlFor="particles-toggle" className="text-sm font-medium text-card-foreground">
                  {t('options.oceanParticles')}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t('options.oceanParticlesDesc')}
                </p>
              </div>
              <Switch
                id="particles-toggle"
                checked={particlesEnabled}
                onCheckedChange={setParticlesEnabled}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg bg-background/30 p-3">
              <div>
                <Label htmlFor="bubbles-toggle" className="text-sm font-medium text-card-foreground">
                  {t('options.risingBubbles')}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t('options.risingBubblesDesc')}
                </p>
              </div>
              <Switch
                id="bubbles-toggle"
                checked={bubblesEnabled}
                onCheckedChange={setBubblesEnabled}
              />
            </div>
          </div>
        </section>

        {/* Performance Tips */}
        <section className="rounded-lg border border-dashed border-primary/30 bg-background/30 p-4">
          <h4 className="mb-2 text-sm font-semibold text-card-foreground">{t('options.performanceTips')}</h4>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• {t('options.performanceTip1')}</li>
            <li>• {t('options.performanceTip2')}</li>
            <li>• {t('options.performanceTip3')}</li>
          </ul>
        </section>

        {/* Reset Display Button */}
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={handleResetDisplay}
          >
            <RotateCcw className="mr-2 h-4 w-4" /> {t('common.resetToDefaults')}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="language" className="mt-6 space-y-6">
        {/* Language Selection */}
        <section className="space-y-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-card-foreground">{t('options.languageSelection')}</h4>
              <p className="text-xs text-muted-foreground">
                {t('options.languageSelectionDesc')}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language-select" className="text-sm font-medium text-card-foreground">
                {t('options.selectLanguage')}
              </Label>
              <Select
                value={language}
                onValueChange={(value) => setLanguage(value as Language)}
              >
                <SelectTrigger id="language-select" className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">
                    <span className="flex items-center gap-2">
                      <span>🇳🇴</span>
                      <span>{t('options.norwegian')}</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="en">
                    <span className="flex items-center gap-2">
                      <span>🇬🇧</span>
                      <span>{t('options.english')}</span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Language Note */}
        <section className="rounded-lg border border-dashed border-primary/30 bg-background/30 p-4">
          <p className="text-xs text-muted-foreground">
            {t('options.languageNote')}
          </p>
        </section>
      </TabsContent>
    </Tabs>
  );
};

// Export a hook to use display settings anywhere
export const useDisplaySettings = (): DisplaySettings => {
  const [settings, setSettings] = useState<DisplaySettings>(() => ({
    animationsEnabled: getStoredBoolean(STORAGE_KEYS.animationsEnabled, true),
    particlesEnabled: getStoredBoolean(STORAGE_KEYS.particlesEnabled, true),
    bubblesEnabled: getStoredBoolean(STORAGE_KEYS.bubblesEnabled, true),
  }));

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (Object.values(STORAGE_KEYS).includes(e.key as typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS])) {
        setSettings({
          animationsEnabled: getStoredBoolean(STORAGE_KEYS.animationsEnabled, true),
          particlesEnabled: getStoredBoolean(STORAGE_KEYS.particlesEnabled, true),
          bubblesEnabled: getStoredBoolean(STORAGE_KEYS.bubblesEnabled, true),
        });
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return settings;
};
