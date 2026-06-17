'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { WelcomeStep } from './calculator-steps/welcome-step';
import { UtilitiesStep } from './calculator-steps/utilities-step';
import { TransportationStep } from './calculator-steps/transportation-step';
import { DietWasteStep } from './calculator-steps/diet-waste-step';
import { ResultsStep, getVerdict } from './calculator-steps/results-step';

const STEP_LABELS = ['Welcome', 'Home Energy', 'Transportation', 'Diet & Waste'];

interface CalculatorInputsShape {
  electricity: number;
  gas: number;
  water: number;
  vehicleType: string;
  vehicleDistance: number;
  transitDistance: number;
  flightsShort: number;
  flightsLong: number;
  dietType: string;
  recycling: string[];
}

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedUser: { userName: string; xp: number; level: number }) => void;
  initialInputs?: Partial<CalculatorInputsShape>;
  currentName?: string;
}

/**
 * Multi-step modal wizard that walks a user through establishing their
 * carbon footprint baseline (home energy, transportation, diet & waste),
 * then submits the inputs to /api/user for calculation and persistence.
 *
 * Each step's UI lives in its own component under `calculator-steps/`;
 * this component owns the shared form state, step navigation, and the
 * submission request.
 */
export function CalculatorModal({
  isOpen,
  onClose,
  onSuccess,
  initialInputs,
  currentName,
}: CalculatorModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [userName, setUserName] = useState('Eco Tracker');
  const [electricity, setElectricity] = useState(300);
  const [gas, setGas] = useState(50);
  const [water, setWater] = useState(4000);
  const [vehicleType, setVehicleType] = useState('petrol');
  const [vehicleDistance, setVehicleDistance] = useState(120);
  const [transitDistance, setTransitDistance] = useState(50);
  const [flightsShort, setFlightsShort] = useState(2);
  const [flightsLong, setFlightsLong] = useState(1);
  const [dietType, setDietType] = useState('average-meat');
  const [recyclePaper, setRecyclePaper] = useState(true);
  const [recyclePlastic, setRecyclePlastic] = useState(true);
  const [recycleGlass, setRecycleGlass] = useState(true);
  const [recycleCompost, setRecycleCompost] = useState(false);

  const [calculatedTotal, setCalculatedTotal] = useState(0);

  useEffect(() => {
    if (initialInputs) {
      setElectricity(initialInputs.electricity ?? 300);
      setGas(initialInputs.gas ?? 50);
      setWater(initialInputs.water ?? 4000);
      setVehicleType(initialInputs.vehicleType ?? 'petrol');
      setVehicleDistance(initialInputs.vehicleDistance ?? 120);
      setTransitDistance(initialInputs.transitDistance ?? 50);
      setFlightsShort(initialInputs.flightsShort ?? 2);
      setFlightsLong(initialInputs.flightsLong ?? 1);
      setDietType(initialInputs.dietType ?? 'average-meat');
      setRecyclePaper(initialInputs.recycling?.includes('paper') ?? true);
      setRecyclePlastic(initialInputs.recycling?.includes('plastic') ?? true);
      setRecycleGlass(initialInputs.recycling?.includes('glass') ?? true);
      setRecycleCompost(initialInputs.recycling?.includes('compost') ?? false);
    }
    if (currentName) {
      setUserName(currentName);
    }
  }, [initialInputs, currentName, isOpen]);

  if (!isOpen) return null;

  /**
   * Advances to the next step, running per-step validation first.
   * Sets a user-facing error message and blocks navigation if invalid.
   */
  const handleNext = () => {
    setError('');
    if (step === 2 && (electricity < 0 || gas < 0 || water < 0)) {
      setError('Utility values must be greater than or equal to 0');
      return;
    }
    if (
      step === 3 &&
      (vehicleDistance < 0 || transitDistance < 0 || flightsShort < 0 || flightsLong < 0)
    ) {
      setError('Transportation values must be greater than or equal to 0');
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setError('');
    setStep((prev) => prev - 1);
  };

  /**
   * Submits the collected calculator inputs to the API for footprint
   * calculation and persistence, then advances to the results step.
   */
  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    const recycling: string[] = [];
    if (recyclePaper) recycling.push('paper');
    if (recyclePlastic) recycling.push('plastic');
    if (recycleGlass) recycling.push('glass');
    if (recycleCompost) recycling.push('compost');

    const inputs = {
      electricity: Number(electricity),
      gas: Number(gas),
      water: Number(water),
      vehicleType,
      vehicleDistance: Number(vehicleDistance),
      transitDistance: Number(transitDistance),
      flightsShort: Number(flightsShort),
      flightsLong: Number(flightsLong),
      dietType,
      recycling,
    };

    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'recalculate', inputs }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit calculation baseline');
      }

      setCalculatedTotal(data.user.baselineFootprint || 0);
      onSuccess(data.user);
      setStep(5);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'An error occurred during calculations';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const verdict = getVerdict(calculatedTotal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              Carbon Baseline Calculator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Establish your monthly carbon baseline
            </p>
          </div>
          {step < 5 && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {step < 5 && (
          <div className="px-6 pt-4">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${step * 25}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-2 uppercase tracking-wider">
              {STEP_LABELS.map((label, idx) => (
                <span key={label} className={step >= idx + 1 ? 'text-emerald-500 font-bold' : ''}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-semibold">
            {error}
          </div>
        )}

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {step === 1 && <WelcomeStep userName={userName} onUserNameChange={setUserName} />}

          {step === 2 && (
            <UtilitiesStep
              electricity={electricity}
              gas={gas}
              water={water}
              onElectricityChange={setElectricity}
              onGasChange={setGas}
              onWaterChange={setWater}
            />
          )}

          {step === 3 && (
            <TransportationStep
              vehicleType={vehicleType}
              vehicleDistance={vehicleDistance}
              transitDistance={transitDistance}
              flightsShort={flightsShort}
              flightsLong={flightsLong}
              onVehicleTypeChange={setVehicleType}
              onVehicleDistanceChange={setVehicleDistance}
              onTransitDistanceChange={setTransitDistance}
              onFlightsShortChange={setFlightsShort}
              onFlightsLongChange={setFlightsLong}
            />
          )}

          {step === 4 && (
            <DietWasteStep
              dietType={dietType}
              recyclePaper={recyclePaper}
              recyclePlastic={recyclePlastic}
              recycleGlass={recycleGlass}
              recycleCompost={recycleCompost}
              onDietTypeChange={setDietType}
              onRecyclePaperChange={setRecyclePaper}
              onRecyclePlasticChange={setRecyclePlastic}
              onRecycleGlassChange={setRecycleGlass}
              onRecycleCompostChange={setRecycleCompost}
            />
          )}

          {step === 5 && <ResultsStep calculatedTotal={calculatedTotal} verdict={verdict} />}
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between">
          {step < 5 ? (
            <>
              {step > 1 ? (
                <Button variant="outline" onClick={handlePrev}>
                  <ChevronLeft className="h-4 w-4 mr-2" /> Back
                </Button>
              ) : (
                <div />
              )}
              {step < 4 ? (
                <Button onClick={handleNext}>
                  Next <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} isLoading={loading}>
                  Calculate Baseline <Check className="h-4 w-4 ml-2" />
                </Button>
              )}
            </>
          ) : (
            <Button className="w-full" onClick={onClose}>
              Go to Dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
