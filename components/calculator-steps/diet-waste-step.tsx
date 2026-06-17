import { Select } from '../ui/select';

interface DietWasteStepProps {
  dietType: string;
  recyclePaper: boolean;
  recyclePlastic: boolean;
  recycleGlass: boolean;
  recycleCompost: boolean;
  onDietTypeChange: (value: string) => void;
  onRecyclePaperChange: (value: boolean) => void;
  onRecyclePlasticChange: (value: boolean) => void;
  onRecycleGlassChange: (value: boolean) => void;
  onRecycleCompostChange: (value: boolean) => void;
}

const DIET_OPTIONS = [
  { value: 'heavy-meat', label: 'Heavy Meat Eater (Frequent beef/lamb)' },
  { value: 'average-meat', label: 'Average Meat Eater (Moderate poultry/beef)' },
  { value: 'veggie', label: 'Vegetarian (Eggs/dairy, no meat)' },
  { value: 'vegan', label: 'Vegan (100% plant-based)' },
];

interface RecyclingCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function RecyclingCheckbox({ label, checked, onChange }: RecyclingCheckboxProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4"
      />
      <span>{label}</span>
    </label>
  );
}

/**
 * Fourth step of the calculator wizard: collects diet type and
 * recycling habits used to compute the "food/waste" footprint category.
 */
export function DietWasteStep({
  dietType,
  recyclePaper,
  recyclePlastic,
  recycleGlass,
  recycleCompost,
  onDietTypeChange,
  onRecyclePaperChange,
  onRecyclePlasticChange,
  onRecycleGlassChange,
  onRecycleCompostChange,
}: DietWasteStepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
        🥗 Diet, Consumption & Waste
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        Dietary choices and recycling offsets represent an important percentage of personal emissions.
      </p>
      <div className="pt-2">
        <Select
          label="Diet Description"
          value={dietType}
          onChange={(e) => onDietTypeChange(e.target.value)}
          options={DIET_OPTIONS}
        />
      </div>
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
          Do you actively recycle?
        </label>
        <div className="grid grid-cols-2 gap-2 text-sm text-slate-700 dark:text-slate-300">
          <RecyclingCheckbox label="Paper / Cardboard" checked={recyclePaper} onChange={onRecyclePaperChange} />
          <RecyclingCheckbox label="Plastics / Bottles" checked={recyclePlastic} onChange={onRecyclePlasticChange} />
          <RecyclingCheckbox label="Glass / Cans" checked={recycleGlass} onChange={onRecycleGlassChange} />
          <RecyclingCheckbox label="Compost / Food Scrap" checked={recycleCompost} onChange={onRecycleCompostChange} />
        </div>
      </div>
    </div>
  );
}
