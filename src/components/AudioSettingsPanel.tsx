import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAudio } from '@/context/AudioContext';
import { Music, Pause, Play, Volume2, VolumeX, Waves } from 'lucide-react';

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

export const AudioSettingsPanel = () => {
  const {
    tracks,
    currentTrack,
    isMusicEnabled,
    isSfxEnabled,
    isPlaying,
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
  } = useAudio();

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

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-card-foreground">Master Volume</h4>
            <p className="text-xs text-muted-foreground">
              Adjusts the overall loudness of music and sound effects.
            </p>
          </div>
          <span className="text-sm font-medium text-primary">{formatPercent(masterVolume)}</span>
        </div>
        <Slider
          value={[Math.round(masterVolume * 100)]}
          onValueChange={createVolumeHandler(setMasterVolume)}
          step={1}
          max={100}
        />
      </section>

      <section className="space-y-4 rounded-lg border border-primary/20 bg-card/40 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" aria-hidden />
            <div>
              <h4 className="text-base font-semibold text-card-foreground">Background Music</h4>
              <p className="text-xs text-muted-foreground">
                Choose and control the ambience from the muzak vault.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="music-enabled" className="text-xs uppercase tracking-wide text-muted-foreground">
              {isMusicEnabled ? 'On' : 'Off'}
            </Label>
            <Switch id="music-enabled" checked={isMusicEnabled} onCheckedChange={setMusicEnabled} />
          </div>
        </div>

        {hasTracks ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="music-track" className="text-sm font-medium text-card-foreground">
                Soundtrack Selection
              </Label>
              <Select
                value={currentTrack?.id ?? tracks[0]?.id ?? ''}
                onValueChange={(value) => setCurrentTrackId(value)}
                disabled={!isMusicEnabled}
              >
                <SelectTrigger id="music-track">
                  <SelectValue placeholder="Choose a track" />
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

            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" onClick={handlePlayPause} disabled={!isMusicEnabled}>
                {isPlaying ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" aria-hidden /> Pause Music
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" aria-hidden /> Play Music
                  </>
                )}
              </Button>
              <Button type="button" variant="ghost" onClick={pause} disabled={!isPlaying}>
                <VolumeX className="mr-2 h-4 w-4" aria-hidden /> Stop
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <Label htmlFor="music-volume" className="font-medium text-card-foreground">
                  Music Volume
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
              />
            </div>
          </div>
        ) : (
          <p className="rounded-md border border-dashed border-primary/30 bg-background/60 p-4 text-sm text-muted-foreground">
            Drop MP3 files into <code>src/assets/muzak</code> and they will appear here for selection.
          </p>
        )}
      </section>

      <section className="space-y-4 rounded-lg border border-primary/20 bg-card/40 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Waves className="h-5 w-5 text-primary" aria-hidden />
            <div>
              <h4 className="text-base font-semibold text-card-foreground">Ambient Effects</h4>
              <p className="text-xs text-muted-foreground">
                Enable bubbles, splashes and interface sounds.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="sfx-enabled" className="text-xs uppercase tracking-wide text-muted-foreground">
              {isSfxEnabled ? 'On' : 'Off'}
            </Label>
            <Switch id="sfx-enabled" checked={isSfxEnabled} onCheckedChange={setSfxEnabled} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <Label htmlFor="sfx-volume" className="font-medium text-card-foreground">
              Effects Volume
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
          />
        </div>

        <Button
          type="button"
          variant="outline"
          className="flex items-center gap-2"
          disabled={!isSfxEnabled}
          onClick={playBubbleSfx}
        >
          <Volume2 className="h-4 w-4" aria-hidden /> Test Bubble Burst
        </Button>
      </section>
    </div>
  );
};
