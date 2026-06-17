import { Input } from '../ui/input';

interface WelcomeStepProps {
  userName: string;
  onUserNameChange: (name: string) => void;
}

/**
 * First step of the calculator wizard: greets the user and collects
 * their display name before starting the baseline assessment.
 */
export function WelcomeStep({ userName, onUserNameChange }: WelcomeStepProps) {
  return (
    <div className="space-y-4 text-center">
      <div className="text-5xl py-2">🌍</div>
      <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
        Calculate Your Environmental Footprint
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
        Welcome! We will guide you through a quick, 4-step assessment of your average
        monthly resource consumption. This creates your baseline carbon footprint.
      </p>
      <div className="pt-2">
        <Input
          label="What should we call you?"
          value={userName}
          onChange={(e) => onUserNameChange(e.target.value)}
          placeholder="Enter your name (e.g. Alex)"
        />
      </div>
    </div>
  );
}
