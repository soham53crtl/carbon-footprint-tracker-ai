interface Verdict {
  text: string;
  class: string;
}

interface ResultsStepProps {
  calculatedTotal: number;
  verdict: Verdict;
}

/**
 * Final step of the calculator wizard: displays the user's computed
 * annual baseline footprint along with a qualitative verdict.
 */
export function ResultsStep({ calculatedTotal, verdict }: ResultsStepProps) {
  return (
    <div className="space-y-5 text-center">
      <div className="text-5xl animate-bounce">🎉</div>
      <div>
        <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
          Your Carbon Profile is Ready!
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          We computed your annual baseline rate
        </p>
      </div>

      <div className="py-6 px-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/50 dark:border-slate-850 flex flex-col items-center justify-center">
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Baseline Annual Emissions
        </span>
        <span className="text-4xl font-extrabold font-display text-emerald-500 mt-2">
          {calculatedTotal.toFixed(1)}{' '}
          <span className="text-lg font-medium text-slate-400 dark:text-slate-500">t CO₂e/yr</span>
        </span>
        <div className={`mt-4 p-3 border rounded-xl text-xs font-medium ${verdict.class}`}>
          {verdict.text}
        </div>
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed px-4">
        Your score is saved. Use your dashboard to log daily actions, earn experience
        points, and monitor your sustainability trajectory.
      </p>
    </div>
  );
}

/**
 * Resolves a qualitative verdict and associated styling for a given
 * baseline footprint score (in tonnes CO2e/year).
 *
 * @param score - Calculated annual footprint in tonnes CO2e
 * @returns Verdict text and Tailwind class string for the styled badge
 */
export function getVerdict(score: number): Verdict {
  if (score < 4.0) {
    return {
      text: '🌱 Excellent! Your footprint is low and close to sustainable target levels.',
      class: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    };
  }
  if (score <= 8.5) {
    return {
      text: '🔔 Moderate footprint. You can cut down easily with simple daily habit shifts.',
      class: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    };
  }
  return {
    text: '⚠️ Higher than average footprint. Focus on transportation and utility actions.',
    class: 'text-red-500 bg-red-500/10 border-red-500/20',
  };
}
