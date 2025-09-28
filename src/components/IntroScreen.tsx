import { useAudio } from '@/context/AudioContext';
import logoImage from '@/assets/deep-regrets-logo.jpg';

type IntroScreenProps = {
  onContinue: () => void;
};

export const IntroScreen = ({ onContinue }: IntroScreenProps) => {
  const { requiresUserActivation, retryPlayback } = useAudio();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-slate-950 to-background">
      <div className="flex flex-col items-center gap-6">
        <button
          type="button"
          onClick={onContinue}
          className="group relative flex flex-col items-center gap-6 focus:outline-none"
          aria-label="Enter Deep Regrets"
        >
          <div className="relative">
            <span className="absolute inset-0 rounded-3xl bg-primary/40 blur-3xl opacity-70 group-hover:opacity-90 transition-opacity" />
            <img
              src={logoImage}
              alt="Deep Regrets - An Unfortunate Fishing Game"
              className="relative w-[min(90vw,32rem)] max-w-xl rounded-3xl shadow-2xl ring-2 ring-primary/40 transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <p className="text-muted-foreground text-lg tracking-widest uppercase">
            Click to descend
          </p>
        </button>

        {requiresUserActivation && (
          <div className="rounded-3xl border border-amber-500/40 bg-amber-500/10 px-6 py-4 text-center text-amber-100 shadow-lg">
            <p className="text-sm font-medium uppercase tracking-wide">Sound muted by browser</p>
            <p className="mt-1 text-xs text-amber-100/90">Tap the button below to start the soundtrack.</p>
            <button
              type="button"
              onClick={() => void retryPlayback()}
              className="mt-3 inline-flex items-center rounded-full bg-amber-400 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-amber-300"
            >
              Enable sound
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
