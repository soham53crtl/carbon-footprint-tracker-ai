import { Input } from '../ui/input';
import { Select } from '../ui/select';

interface TransportationStepProps {
  vehicleType: string;
  vehicleDistance: number;
  transitDistance: number;
  flightsShort: number;
  flightsLong: number;
  onVehicleTypeChange: (value: string) => void;
  onVehicleDistanceChange: (value: number) => void;
  onTransitDistanceChange: (value: number) => void;
  onFlightsShortChange: (value: number) => void;
  onFlightsLongChange: (value: number) => void;
}

const VEHICLE_OPTIONS = [
  { value: 'petrol', label: 'Gasoline / Petrol Car' },
  { value: 'diesel', label: 'Diesel Vehicle' },
  { value: 'hybrid', label: 'Hybrid Car' },
  { value: 'ev', label: 'Electric Vehicle (EV)' },
  { value: 'none', label: 'No Personal Vehicle' },
];

/**
 * Third step of the calculator wizard: collects vehicle type, weekly
 * commute distances, and annual flight counts used to compute the
 * "transport" footprint category.
 */
export function TransportationStep({
  vehicleType,
  vehicleDistance,
  transitDistance,
  flightsShort,
  flightsLong,
  onVehicleTypeChange,
  onVehicleDistanceChange,
  onTransitDistanceChange,
  onFlightsShortChange,
  onFlightsLongChange,
}: TransportationStepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
        🚗 Transportation & Commutes
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        Provide your commute distances (transit/driving per week) and average flights per year.
      </p>
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Select
          label="Primary Vehicle Type"
          value={vehicleType}
          onChange={(e) => onVehicleTypeChange(e.target.value)}
          options={VEHICLE_OPTIONS}
        />
        <Input
          label="Weekly Distance (km)"
          type="number"
          value={vehicleDistance}
          onChange={(e) => onVehicleDistanceChange(Number(e.target.value))}
          min={0}
          disabled={vehicleType === 'none'}
        />
      </div>
      <div>
        <Input
          label="Weekly Public Transit Distance (km - Train, Metro, Bus)"
          type="number"
          value={transitDistance}
          onChange={(e) => onTransitDistanceChange(Number(e.target.value))}
          min={0}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Short Flights / yr (<3 hrs)"
          type="number"
          value={flightsShort}
          onChange={(e) => onFlightsShortChange(Number(e.target.value))}
          min={0}
        />
        <Input
          label="Long Flights / yr (>3 hrs)"
          type="number"
          value={flightsLong}
          onChange={(e) => onFlightsLongChange(Number(e.target.value))}
          min={0}
        />
      </div>
    </div>
  );
}
