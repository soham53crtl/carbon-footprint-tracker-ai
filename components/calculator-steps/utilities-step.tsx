import { Input } from '../ui/input';

interface UtilitiesStepProps {
  electricity: number;
  gas: number;
  water: number;
  onElectricityChange: (value: number) => void;
  onGasChange: (value: number) => void;
  onWaterChange: (value: number) => void;
}

/**
 * Second step of the calculator wizard: collects monthly household
 * energy and water consumption used to compute the "energy" footprint category.
 */
export function UtilitiesStep({
  electricity,
  gas,
  water,
  onElectricityChange,
  onGasChange,
  onWaterChange,
}: UtilitiesStepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
        🏠 Home Utility & Energy Use
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        Enter your average monthly household consumption. If you share a home,
        enter your approximate portion or share of the utility bills.
      </p>
      <div className="space-y-3 pt-2">
        <div>
          <Input
            label="Monthly Electricity Usage (kWh)"
            type="number"
            value={electricity}
            onChange={(e) => onElectricityChange(Number(e.target.value))}
            min={0}
          />
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            * Average monthly usage is ~300-600 kWh/person
          </p>
        </div>
        <div>
          <Input
            label="Monthly Natural Gas / Heating (m³ or therms)"
            type="number"
            value={gas}
            onChange={(e) => onGasChange(Number(e.target.value))}
            min={0}
          />
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            * Average usage is ~30-80 m³ depending on season
          </p>
        </div>
        <div>
          <Input
            label="Monthly Water Usage (Liters)"
            type="number"
            value={water}
            onChange={(e) => onWaterChange(Number(e.target.value))}
            min={0}
          />
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            * Average usage is ~3000-5000 liters per person
          </p>
        </div>
      </div>
    </div>
  );
}
