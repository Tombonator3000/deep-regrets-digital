import logoImage from '@/assets/deep-regrets-logo.jpg';

type IntroScreenProps = {
  onContinue: () => void;
};

export const IntroScreen = ({ onContinue }: IntroScreenProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-slate-950 to-background">
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
    </div>
  );
};
