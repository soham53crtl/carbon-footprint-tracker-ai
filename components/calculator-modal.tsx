'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Card } from './ui/card';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedUser: any) => void;
  initialInputs?: any;
  currentName?: string;
}

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

  // Form states
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

  // Result score states
  const [calculatedTotal, setCalculatedTotal] = useState(0);

  // Load initial inputs if present
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

  const handleNext = () => {
    setError('');
    // Step validation checks
    if (step === 2) {
      if (electricity < 0 || gas < 0 || water < 0) {
        setError('Utility values must be greater than or equal to 0');
        return;
      }
    }
    if (step === 3) {
      if (vehicleDistance < 0 || transitDistance < 0 || flightsShort < 0 || flightsLong < 0) {
        setError('Transportation values must be greater than or equal to 0');
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setError('');
    setStep((prev) => prev - 1);
  };

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'recalculate',
          inputs,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit calculation baseline');
      }

      setCalculatedTotal(data.user.baselineFootprint || 0);
      onSuccess(data.user);
      setStep(5); // Go to results screen
    } catch (e: any) {
      setError(e.message || 'An error occurred during calculations');
    } finally {
      setLoading(false);
    }
  };

  // Resolve verdict strings
  const getVerdict = (score: number) => {
    if (score < 4.0) {
      return {
        text: '🌱 Excellent! Your footprint is low and close to sustainable target levels.',
        class: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      };
    } else if (score <= 8.5) {
      return {
        text: '🔔 Moderate footprint. You can cut down easily with simple daily habit shifts.',
        class: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      };
    } else {
      return {
        text: '⚠️ Higher than average footprint. Focus on transportation and utility actions.',
        class: 'text-red-500 bg-red-500/10 border-red-500/20',
      };
    }
  };

  const verdict = getVerdict(calculatedTotal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">Carbon Baseline Calculator</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Establish your monthly carbon baseline</p>
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

        {/* Progress Bar */}
        {step < 5 && (
          <div className="px-6 pt-4">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${step * 25}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-2 uppercase tracking-wider">
              <span className={step >= 1 ? 'text-emerald-500 font-bold' : ''}>Welcome</span>
              <span className={step >= 2 ? 'text-emerald-500 font-bold' : ''}>Home Energy</span>
              <span className={step >= 3 ? 'text-emerald-500 font-bold' : ''}>Transportation</span>
              <span className={step >= 4 ? 'text-emerald-500 font-bold' : ''}>Diet & Waste</span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-semibold">
            {error}
          </div>
        )}

        {/* Scrollable Container Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          
          {/* STEP 1: WELCOME */}
          {step === 1 && (
            <div className="space-y-4 text-center">
              <div className="text-5xl py-2">🌍</div>
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">Calculate Your Environmental Footprint</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Welcome! We will guide you through a quick, 4-step assessment of your average monthly resource consumption. This creates your baseline carbon footprint.
              </p>
              <div className="pt-2">
                <Input
                  label="What should we call you?"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name (e.g. Alex)"
                />
              </div>
            </div>
          )}

          {/* STEP 2: UTILITIES */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">🏠 Home Utility & Energy Use</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Enter your average monthly household consumption. If you share a home, enter your approximate portion or share of the utility bills.
              </p>
              <div className="space-y-3 pt-2">
                <div>
                  <Input
                    label="Monthly Electricity Usage (kWh)"
                    type="number"
                    value={electricity}
                    onChange={(e) => setElectricity(Number(e.target.value))}
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
                    onChange={(e) => setGas(Number(e.target.value))}
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
                    onChange={(e) => setWater(Number(e.target.value))}
                    min={0}
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    * Average usage is ~3000-5000 liters per person
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: TRANSPORTATION */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">🚗 Transportation & Commutes</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Provide your commute distances (transit/driving per week) and average flights per year.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Select
                  label="Primary Vehicle Type"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  options={[
                    { value: 'petrol', label: 'Gasoline / Petrol Car' },
                    { value: 'diesel', label: 'Diesel Vehicle' },
                    { value: 'hybrid', label: 'Hybrid Car' },
                    { value: 'ev', label: 'Electric Vehicle (EV)' },
                    { value: 'none', label: 'No Personal Vehicle' },
                  ]}
                />
                <Input
                  label="Weekly Distance (km)"
                  type="number"
                  value={vehicleDistance}
                  onChange={(e) => setVehicleDistance(Number(e.target.value))}
                  min={0}
                  disabled={vehicleType === 'none'}
                />
              </div>
              <div>
                <Input
                  label="Weekly Public Transit Distance (km - Train, Metro, Bus)"
                  type="number"
                  value={transitDistance}
                  onChange={(e) => setTransitDistance(Number(e.target.value))}
                  min={0}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Short Flights / yr (<3 hrs)"
                  type="number"
                  value={flightsShort}
                  onChange={(e) => setFlightsShort(Number(e.target.value))}
                  min={0}
                />
                <Input
                  label="Long Flights / yr (>3 hrs)"
                  type="number"
                  value={flightsLong}
                  onChange={(e) => setFlightsLong(Number(e.target.value))}
                  min={0}
                />
              </div>
            </div>
          )}

          {/* STEP 4: DIET & WASTE */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">🥗 Diet, Consumption & Waste</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Dietary choices and recycling offsets represent an important percentage of personal emissions.
              </p>
              <div className="pt-2">
                <Select
                  label="Diet Description"
                  value={dietType}
                  onChange={(e) => setDietType(e.target.value)}
                  options={[
                    { value: 'heavy-meat', label: 'Heavy Meat Eater (Frequent beef/lamb)' },
                    { value: 'average-meat', label: 'Average Meat Eater (Moderate poultry/beef)' },
                    { value: 'veggie', label: 'Vegetarian (Eggs/dairy, no meat)' },
                    { value: 'vegan', label: 'Vegan (100% plant-based)' },
                  ]}
                />
              </div>
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Do you actively recycle?
                </label>
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 select-none">
                    <input
                      type="checkbox"
                      checked={recyclePaper}
                      onChange={(e) => setRecyclePaper(e.target.checked)}
                      className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                    />
                    <span>Paper / Cardboard</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 select-none">
                    <input
                      type="checkbox"
                      checked={recyclePlastic}
                      onChange={(e) => setRecyclePlastic(e.target.checked)}
                      className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                    />
                    <span>Plastics / Bottles</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 select-none">
                    <input
                      type="checkbox"
                      checked={recycleGlass}
                      onChange={(e) => setRecycleGlass(e.target.checked)}
                      className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                    />
                    <span>Glass / Cans</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 select-none">
                    <input
                      type="checkbox"
                      checked={recycleCompost}
                      onChange={(e) => setRecycleCompost(e.target.checked)}
                      className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                    />
                    <span>Compost / Food Scrap</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: RESULTS */}
          {step === 5 && (
            <div className="space-y-5 text-center">
              <div className="text-5xl animate-bounce">🎉</div>
              <div>
                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">Your Carbon Profile is Ready!</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">We computed your annual baseline rate</p>
              </div>

              <div className="py-6 px-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/50 dark:border-slate-850 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Baseline Annual Emissions</span>
                <span className="text-4xl font-extrabold font-display text-emerald-500 mt-2">
                  {calculatedTotal.toFixed(1)} <span className="text-lg font-medium text-slate-400 dark:text-slate-500">t CO₂e/yr</span>
                </span>
                <div className={`mt-4 p-3 border rounded-xl text-xs font-medium ${verdict.class}`}>
                  {verdict.text}
                </div>
              </div>

              <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed px-4">
                Your score is saved. Use your dashboard to log daily actions, earn experience points, and monitor your sustainability trajectory.
              </p>
            </div>
          )}

        </div>

        {/* Footer Navigation Buttons */}
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
