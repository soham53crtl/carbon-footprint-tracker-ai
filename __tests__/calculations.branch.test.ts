// __tests__/calculations.branch.test.ts
// Targets branch coverage for edge cases in calculateFootprint (lines 60-70)

import {
  calculateFootprint,
  getTreeEquivalent,
  EMISSION_FACTORS,
} from '../lib/calculations';

describe('calculateFootprint() - branch coverage', () => {
  const BASE = {
    electricity: 0,
    gas: 0,
    water: 0,
    vehicleType: 'none',
    vehicleDistance: 0,
    transitDistance: 0,
    flightsShort: 0,
    flightsLong: 0,
    dietType: 'average-meat',
    recycling: [] as string[],
  };

  // Branch: unknown vehicleType falls back to 0 via ?? operator
  it('unknown vehicleType defaults to 0 emissions', () => {
    const result = calculateFootprint({ ...BASE, vehicleType: 'jetpack', vehicleDistance: 100 });
    expect(result.transport).toBeCloseTo(0, 2);
  });

  // Branch: unknown dietType falls back to 1700
  it('unknown dietType defaults to 1700 kg/yr', () => {
    const known = calculateFootprint({ ...BASE, dietType: 'average-meat' });
    const unknown = calculateFootprint({ ...BASE, dietType: 'unknown-diet' });
    expect(unknown.food).toBeCloseTo(known.food, 1);
  });

  // Branch: recycling array empty vs populated
  // Branch: unknown recycling material hits ?? 0 fallback
  it('unknown recycling material defaults to 0 offset', () => {
    const noRecycle = calculateFootprint({ ...BASE, recycling: [] });
    const unknownRecycle = calculateFootprint({ ...BASE, recycling: ['cardboard', 'ewaste'] });
    expect(unknownRecycle.food).toBe(noRecycle.food);
  });

  // Branch: recycling offset pushes below 500kg floor
  it('enforces 500kg minimum diet footprint even with max recycling', () => {
    const result = calculateFootprint({
      ...BASE,
      dietType: 'vegan',
      recycling: ['paper', 'plastic', 'glass', 'compost'],
    });
    expect(result.food).toBeGreaterThanOrEqual(0.5);
  });

  // Branch: vegan + all recycling still hits floor
  it('triggers 500kg floor when recycling offsets push diet below minimum', () => {
    // vegan=900, recycling doubled: -580, so 900-580=320 < 500, floor kicks in
    const result = calculateFootprint({
      ...BASE,
      dietType: 'vegan',
      recycling: ['paper', 'plastic', 'glass', 'compost', 'paper', 'plastic', 'glass', 'compost'],
    });
    expect(result.food).toBe(0.5);
  });

  // Branch: transit distance > 0
  it('transit distance adds to transport emissions', () => {
    const noTransit = calculateFootprint({ ...BASE });
    const withTransit = calculateFootprint({ ...BASE, transitDistance: 100 });
    expect(withTransit.transport).toBeGreaterThan(noTransit.transport);
  });

  // Branch: short flights > 0
  it('short flights add to transport emissions', () => {
    const noFlight = calculateFootprint({ ...BASE });
    const withFlight = calculateFootprint({ ...BASE, flightsShort: 3 });
    expect(withFlight.transport).toBeGreaterThan(noFlight.transport);
    // 3 * 150 = 450 kg = 0.45T
    expect(withFlight.transport - noFlight.transport).toBeCloseTo(0.45, 2);
  });

  // Branch: long flights > 0
  it('long flights add to transport emissions', () => {
    const noFlight = calculateFootprint({ ...BASE });
    const withFlight = calculateFootprint({ ...BASE, flightsLong: 2 });
    expect(withFlight.transport - noFlight.transport).toBeCloseTo(1.0, 1);
  });

  // Branch: diesel vehicle
  it('diesel vehicle emits differently from petrol', () => {
    const petrol = calculateFootprint({ ...BASE, vehicleType: 'petrol', vehicleDistance: 100 });
    const diesel = calculateFootprint({ ...BASE, vehicleType: 'diesel', vehicleDistance: 100 });
    expect(diesel.transport).not.toBe(petrol.transport);
  });

  // Branch: hybrid vehicle
  it('hybrid vehicle emits less than petrol but more than EV', () => {
    const petrol = calculateFootprint({ ...BASE, vehicleType: 'petrol', vehicleDistance: 100 });
    const hybrid = calculateFootprint({ ...BASE, vehicleType: 'hybrid', vehicleDistance: 100 });
    const ev = calculateFootprint({ ...BASE, vehicleType: 'ev', vehicleDistance: 100 });
    expect(hybrid.transport).toBeLessThan(petrol.transport);
    expect(hybrid.transport).toBeGreaterThan(ev.transport);
  });

  // Branch: all zeros input
  it('all-zero inputs produce minimal footprint', () => {
    const result = calculateFootprint({ ...BASE, dietType: 'vegan', recycling: ['paper', 'plastic', 'glass', 'compost'] });
    expect(result.energy).toBe(0);
    expect(result.transport).toBe(0);
    expect(result.food).toBeGreaterThan(0);
    expect(result.shopping).toBe(0.8);
  });

  // Branch: gas contributes to energy
  it('gas contributes to energy footprint', () => {
    const noGas = calculateFootprint({ ...BASE });
    const withGas = calculateFootprint({ ...BASE, gas: 50 });
    expect(withGas.energy).toBeGreaterThan(noGas.energy);
    // 50 * 12 * 2.0 / 1000 = 1.2T
    expect(withGas.energy - noGas.energy).toBeCloseTo(1.2, 1);
  });

  // Branch: water contributes to energy
  it('water contributes to energy footprint', () => {
    const noWater = calculateFootprint({ ...BASE });
    const withWater = calculateFootprint({ ...BASE, water: 4000 });
    expect(withWater.energy).toBeGreaterThan(noWater.energy);
  });

  // Branch: shopping is always 0.8
  it('shopping footprint is always 0.8 regardless of inputs', () => {
    const r1 = calculateFootprint(BASE);
    const r2 = calculateFootprint({ ...BASE, electricity: 1000, vehicleDistance: 500 });
    expect(r1.shopping).toBe(0.8);
    expect(r2.shopping).toBe(0.8);
  });

  // Branch: total is rounded correctly
  it('total is sum of all four categories rounded to 2dp', () => {
    const result = calculateFootprint({ ...BASE, electricity: 300, vehicleDistance: 100 });
    const sum = parseFloat((result.energy + result.transport + result.food + result.shopping).toFixed(2));
    expect(result.total).toBeCloseTo(sum, 1);
  });

  // Branch: heavy-meat diet
  it('heavy-meat diet has highest food footprint', () => {
    const heavyMeat = calculateFootprint({ ...BASE, dietType: 'heavy-meat', recycling: [] });
    const avgMeat = calculateFootprint({ ...BASE, dietType: 'average-meat', recycling: [] });
    const veggie = calculateFootprint({ ...BASE, dietType: 'veggie', recycling: [] });
    const vegan = calculateFootprint({ ...BASE, dietType: 'vegan', recycling: [] });
    expect(heavyMeat.food).toBeGreaterThan(avgMeat.food);
    expect(avgMeat.food).toBeGreaterThan(veggie.food);
    expect(veggie.food).toBeGreaterThan(vegan.food);
  });
});

describe('getTreeEquivalent() - branch coverage', () => {
  it('handles large values correctly', () => {
    // 2200 / 22 = 100 trees
    expect(getTreeEquivalent(2200)).toBe(100);
  });

  it('handles non-round numbers', () => {
    // 11 / 22 = 0.5
    expect(getTreeEquivalent(11)).toBe(0.5);
  });

  it('handles negative input gracefully', () => {
    // -22 / 22 = -1 (edge case)
    expect(typeof getTreeEquivalent(-22)).toBe('number');
  });

it('22 kg saved = exactly 1 tree', () => {
    const result = getTreeEquivalent(22);
    expect(result).toBe(1);
  });
});

describe('EMISSION_FACTORS - branch coverage', () => {
  it('all vehicle types have defined factors', () => {
    ['petrol', 'diesel', 'hybrid', 'ev', 'none'].forEach(type => {
      expect(EMISSION_FACTORS.vehicle[type]).toBeDefined();
      expect(EMISSION_FACTORS.vehicle[type]).toBeGreaterThanOrEqual(0);
    });
  });

  it('none vehicle type has zero emissions', () => {
    expect(EMISSION_FACTORS.vehicle['none']).toBe(0);
  });

  it('all diet types have positive factors', () => {
    Object.entries(EMISSION_FACTORS.diet).forEach(([, factor]) => {
      expect(factor).toBeGreaterThan(0);
    });
  });

  it('electricity emission factor is positive', () => {
    expect(EMISSION_FACTORS.electricity).toBeGreaterThan(0);
  });

  it('natural gas emission factor is positive', () => {
    expect(EMISSION_FACTORS.naturalGas).toBeGreaterThan(0);
  });

  it('water emission factor is positive but very small', () => {
    expect(EMISSION_FACTORS.water).toBeGreaterThan(0);
    expect(EMISSION_FACTORS.water).toBeLessThan(0.01);
  });

  it('short flight emits less than long flight', () => {
    expect(EMISSION_FACTORS.flightShort).toBeLessThan(EMISSION_FACTORS.flightLong);
  });
});
