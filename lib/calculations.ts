/**
 * Emission factors used to convert raw lifestyle inputs into kg CO2e.
 * Values are sourced from standard environmental coefficients
 * (UK DEFRA / EPA averages) and documented in docs/calculations.md.
 */
export const EMISSION_FACTORS = {  electricity: 0.4,       // per kWh
  naturalGas: 2.0,        // per m3
  water: 0.001,           // per liter
  vehicle: {
    petrol: 0.22,       // per km
    diesel: 0.20,       // per km
    hybrid: 0.12,       // per km
    ev: 0.05,           // per km
    none: 0.0
  } as Record<string, number>,
  transit: 0.04,          // per km
  flightShort: 150,       // per flight
  flightLong: 500,        // per flight
  diet: {
    'heavy-meat': 2500, // per year
    'average-meat': 1700,
    'veggie': 1200,
    'vegan': 900
  } as Record<string, number>,
  recyclingOffsets: {
    paper: -50,         // per year
    plastic: -80,
    glass: -40,
    compost: -120
  } as Record<string, number>
};

export interface CalculatorInputs {
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

export interface FootprintResult {
  energy: number;
  transport: number;
  food: number;
  shopping: number;
  total: number;
}

/**
 * Calculates a user's estimated annual carbon footprint across four
 * categories: home energy, transportation, diet/waste, and shopping.
 *
 * @param inputs - User's lifestyle data (utilities, vehicle, diet, recycling habits)
 * @returns FootprintResult containing per-category and total emissions in tonnes CO2e/year
 */
export function calculateFootprint(inputs: CalculatorInputs): FootprintResult {  // 1. Home Energy (Electricity, Gas, Water)
  const annualElectricityCO2 = (inputs.electricity * 12 * EMISSION_FACTORS.electricity); // kg/yr
  const annualGasCO2 = (inputs.gas * 12 * EMISSION_FACTORS.naturalGas); // kg/yr
  const annualWaterCO2 = (inputs.water * 12 * EMISSION_FACTORS.water); // kg/yr
  const energyTotalTonnes = (annualElectricityCO2 + annualGasCO2 + annualWaterCO2) / 1000;
  
  // 2. Transportation (Vehicle, Transit, Flights)
  const vehicleFactor = EMISSION_FACTORS.vehicle[inputs.vehicleType] ?? 0;
  const annualVehicleCO2 = (inputs.vehicleDistance * 52 * vehicleFactor); // kg/yr
  const annualTransitCO2 = (inputs.transitDistance * 52 * EMISSION_FACTORS.transit); // kg/yr
  const annualFlightsCO2 = (inputs.flightsShort * EMISSION_FACTORS.flightShort) + (inputs.flightsLong * EMISSION_FACTORS.flightLong); // kg/yr
  const transportTotalTonnes = (annualVehicleCO2 + annualTransitCO2 + annualFlightsCO2) / 1000;

  // 3. Diet & Waste
  const baseDietCO2 = EMISSION_FACTORS.diet[inputs.dietType] ?? 1700; // kg/yr
  let recyclingOffset = 0;
  inputs.recycling.forEach(material => {
    recyclingOffset += (EMISSION_FACTORS.recyclingOffsets[material] ?? 0);
  });
  
  // Ensure the diet & waste footprint does not fall below a realistic 500kg of CO2 per year
  const dietTotalTonnes = Math.max(500, baseDietCO2 + recyclingOffset) / 1000;

  // 4. Shopping baseline
  const shoppingTotalTonnes = 0.8; // default static baseline

  const total = energyTotalTonnes + transportTotalTonnes + dietTotalTonnes + shoppingTotalTonnes;

  return {
    energy: parseFloat(energyTotalTonnes.toFixed(2)),
    transport: parseFloat(transportTotalTonnes.toFixed(2)),
    food: parseFloat(dietTotalTonnes.toFixed(2)),
    shopping: parseFloat(shoppingTotalTonnes.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
  };
}

// Global baseline averages in tonnes CO2e per year
export const BENCHMARKS = {
  parisTarget: 2.0,
  globalAverage: 4.8,
  ukEuAverage: 6.5,
  usAverage: 14.5
};

// Tree absorption equivalent (1 mature tree absorbs ~22kg of CO2 per year)
export function getTreeEquivalent(co2SavedKg: number): number {
  return parseFloat((co2SavedKg / 22).toFixed(1));
}

// Standard habits list (to keep in memory/db sync)
export interface Habit {
  id: string;
  title: string;
  description: string;
  category: 'transport' | 'energy' | 'food' | 'waste';
  impact: 'High' | 'Medium' | 'Low';
  co2Saved: number; // kg
  xpGained: number;
  icon: string;
}

export const HABITS_DATABASE: Habit[] = [
  {
    id: 'ride-bike',
    title: 'Pedal Instead of Petrol',
    description: 'Biked or walked for a short commute instead of driving a personal vehicle.',
    category: 'transport',
    impact: 'High',
    co2Saved: 3.5,
    xpGained: 20,
    icon: '🚲'
  },
  {
    id: 'public-transit',
    title: 'Ride the Green Rail/Bus',
    description: 'Used public transit (bus, train, metro) for your daily commute.',
    category: 'transport',
    impact: 'Medium',
    co2Saved: 2.0,
    xpGained: 15,
    icon: '🚌'
  },
  {
    id: 'carpool',
    title: 'Carpool Companions',
    description: 'Shared a ride with at least one other person to reduce vehicle emissions.',
    category: 'transport',
    impact: 'Medium',
    co2Saved: 1.8,
    xpGained: 12,
    icon: '🚗'
  },
  {
    id: 'cold-wash',
    title: 'Cold Water Cycle',
    description: 'Washed a load of laundry using cold water instead of hot water.',
    category: 'energy',
    impact: 'Low',
    co2Saved: 0.5,
    xpGained: 8,
    icon: '🧼'
  },
  {
    id: 'led-bulbs',
    title: 'Phantom Power Cut',
    description: 'Turned off lights, computers, and appliances when leaving a room.',
    category: 'energy',
    impact: 'Low',
    co2Saved: 0.3,
    xpGained: 5,
    icon: '💡'
  },
  {
    id: 'thermostat',
    title: 'Eco Thermostat Adjust',
    description: 'Adjusted heating down or cooling up by 2°C (4°F) for the day.',
    category: 'energy',
    impact: 'Medium',
    co2Saved: 1.5,
    xpGained: 10,
    icon: '🌡️'
  },
  {
    id: 'unplug',
    title: 'Kill Vampire Draws',
    description: 'Unplugged chargers and standby electronic appliances not in active use.',
    category: 'energy',
    impact: 'Low',
    co2Saved: 0.2,
    xpGained: 5,
    icon: '🔌'
  },
  {
    id: 'meatless-meal',
    title: 'Plant-Based Day',
    description: 'Substituted all meat and dairy with plant-based ingredients for your meals today.',
    category: 'food',
    impact: 'High',
    co2Saved: 4.0,
    xpGained: 25,
    icon: '🥗'
  },
  {
    id: 'no-waste',
    title: 'Empty Plates Club',
    description: 'Planned meals carefully and finished everything, leaving zero food waste.',
    category: 'food',
    impact: 'Low',
    co2Saved: 0.8,
    xpGained: 8,
    icon: '🍽️'
  },
  {
    id: 'local-produce',
    title: 'Eat Local & Fresh',
    description: 'Purchased and consumed foods sourced entirely from local farmers or within 100 miles.',
    category: 'food',
    impact: 'Low',
    co2Saved: 0.5,
    xpGained: 8,
    icon: '🍎'
  },
  {
    id: 'reusable-bag',
    title: 'Bags of Sustainability',
    description: 'Brought your own reusable tote bags for grocery or retail shopping trips.',
    category: 'waste',
    impact: 'Low',
    co2Saved: 0.2,
    xpGained: 5,
    icon: '🛍️'
  },
  {
    id: 'no-single-use',
    title: 'Reusable Hydration',
    description: 'Avoided buying or using single-use plastic water bottles and cups today.',
    category: 'waste',
    impact: 'Low',
    co2Saved: 0.3,
    xpGained: 8,
    icon: '🥤'
  },
  {
    id: 'thrift-buy',
    title: 'Second-hand Savior',
    description: 'Purchased pre-owned clothes or gear instead of buying newly manufactured goods.',
    category: 'waste',
    impact: 'Medium',
    co2Saved: 2.2,
    xpGained: 15,
    icon: '👕'
  }
];

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const BADGES_DATABASE: Badge[] = [
  {
    id: 'first-calc',
    title: 'Eco Scout',
    description: 'Completed your first carbon footprint baseline assessment.',
    icon: '⛺'
  },
  {
    id: 'low-carbon',
    title: 'Carbon Minimalist',
    description: 'Achieved a baseline footprint below 5.0 tonnes of CO2e.',
    icon: '🍃'
  },
  {
    id: 'eco-warrior',
    title: 'Eco Warrior',
    description: 'Leveled up your eco profile and reached Level 3.',
    icon: '⚔️'
  },
  {
    id: 'habit-starter',
    title: 'Habit Starter',
    description: 'Successfully committed and logged your first carbon-saving action.',
    icon: '🌱'
  },
  {
    id: 'habit-master',
    title: 'Green Hero',
    description: 'Consistently logged 10 or more carbon-saving actions.',
    icon: '🦸'
  },
  {
    id: 'streak-3',
    title: 'Eco Devotee',
    description: 'Logged actions on at least 3 consecutive days.',
    icon: '🔥'
  },
  {
    id: 'offset-100',
    title: 'Climate Neutralizer',
    description: 'Saved over 100 kg of cumulative carbon dioxide emissions.',
    icon: '🌍'
  },
  {
    id: 'zero-waste-hero',
    title: 'Zero-Waste Champ',
    description: 'Indicated recycling of all materials in your baseline calculator.',
    icon: '♻️'
  }
];
