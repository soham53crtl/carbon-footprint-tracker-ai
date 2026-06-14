import {
  calculateFootprint,
  getTreeEquivalent,
  BENCHMARKS,
  EMISSION_FACTORS,
  HABITS_DATABASE,
  BADGES_DATABASE,
} from '../lib/calculations';

// ── calculateFootprint ───────────────────────────────────────────────────────

describe('calculateFootprint()', () => {
  const BASE_INPUTS = {
    electricity: 300,       // kWh/month
    gas: 40,                // m3/month
    water: 3000,            // litres/month
    vehicleType: 'petrol',
    vehicleDistance: 100,   // km/week
    transitDistance: 0,
    flightsShort: 0,
    flightsLong: 0,
    dietType: 'average-meat',
    recycling: [] as string[],
  };

  it('returns a FootprintResult with all four categories', () => {
    const result = calculateFootprint(BASE_INPUTS);
    expect(result).toHaveProperty('energy');
    expect(result).toHaveProperty('transport');
    expect(result).toHaveProperty('food');
    expect(result).toHaveProperty('shopping');
    expect(result).toHaveProperty('total');
  });

  it('computes electricity contribution correctly', () => {
    const inputs = { ...BASE_INPUTS, gas: 0, water: 0, vehicleType: 'none', vehicleDistance: 0, dietType: 'vegan', recycling: [] };
    const result = calculateFootprint(inputs);
    // electricity: 300 * 12 * 0.4 / 1000 = 1.44 T
    expect(result.energy).toBeCloseTo(1.44, 1);
  });

  it('computes petrol vehicle contribution correctly', () => {
    const inputs = { ...BASE_INPUTS, electricity: 0, gas: 0, water: 0, vehicleType: 'petrol', vehicleDistance: 100, transitDistance: 0, flightsShort: 0, flightsLong: 0, dietType: 'vegan', recycling: [] };
    const result = calculateFootprint(inputs);
    // vehicle: 100 * 52 * 0.22 / 1000 = 1.144 T
    expect(result.transport).toBeCloseTo(1.144, 2);
  });

  it('EV vehicle emits far less than petrol', () => {
    const petrol = calculateFootprint({ ...BASE_INPUTS, vehicleType: 'petrol', vehicleDistance: 100 });
    const ev = calculateFootprint({ ...BASE_INPUTS, vehicleType: 'ev', vehicleDistance: 100 });
    expect(ev.transport).toBeLessThan(petrol.transport);
  });

  it('vegan diet results in lower food footprint than heavy-meat', () => {
    const vegan = calculateFootprint({ ...BASE_INPUTS, dietType: 'vegan', recycling: [] });
    const meat = calculateFootprint({ ...BASE_INPUTS, dietType: 'heavy-meat', recycling: [] });
    expect(vegan.food).toBeLessThan(meat.food);
  });

  it('recycling all materials reduces food/waste footprint vs no recycling', () => {
    const noRecycle = calculateFootprint({ ...BASE_INPUTS, recycling: [] });
    const allRecycle = calculateFootprint({ ...BASE_INPUTS, recycling: ['paper', 'plastic', 'glass', 'compost'] });
    expect(allRecycle.food).toBeLessThanOrEqual(noRecycle.food);
  });

  it('total equals sum of all four categories', () => {
    const r = calculateFootprint(BASE_INPUTS);
    const expected = parseFloat((r.energy + r.transport + r.food + r.shopping).toFixed(2));
    expect(r.total).toBeCloseTo(expected, 1);
  });

  it('long-haul flights add significant emissions', () => {
    const noFlight = calculateFootprint({ ...BASE_INPUTS, flightsLong: 0 });
    const twoFlights = calculateFootprint({ ...BASE_INPUTS, flightsLong: 2 });
    // 2 long-haul flights = 1000 kg = 1T extra
    expect(twoFlights.transport - noFlight.transport).toBeCloseTo(1.0, 1);
  });

  it('shopping baseline is always 0.8 T', () => {
    const r = calculateFootprint(BASE_INPUTS);
    expect(r.shopping).toBe(0.8);
  });

  it('diet footprint does not fall below realistic minimum (0.5T)', () => {
    const r = calculateFootprint({ ...BASE_INPUTS, dietType: 'vegan', recycling: ['paper', 'plastic', 'glass', 'compost'] });
    expect(r.food).toBeGreaterThanOrEqual(0.5);
  });
});

// ── getTreeEquivalent ────────────────────────────────────────────────────────

describe('getTreeEquivalent()', () => {
  it('calculates trees correctly for 220kg saved', () => {
    // 220 / 22 = 10 trees
    expect(getTreeEquivalent(220)).toBe(10);
  });

  it('returns 0 trees for 0 kg', () => {
    expect(getTreeEquivalent(0)).toBe(0);
  });

  it('rounds to 1 decimal place', () => {
    const result = getTreeEquivalent(33); // 33/22 = 1.5
    expect(result).toBe(1.5);
  });
});

// ── BENCHMARKS ───────────────────────────────────────────────────────────────

describe('BENCHMARKS constants', () => {
  it('Paris target is 2.0 T', () => {
    expect(BENCHMARKS.parisTarget).toBe(2.0);
  });

  it('global average is 4.8 T', () => {
    expect(BENCHMARKS.globalAverage).toBe(4.8);
  });

  it('US average is higher than global average', () => {
    expect(BENCHMARKS.usAverage).toBeGreaterThan(BENCHMARKS.globalAverage);
  });
});

// ── EMISSION_FACTORS ─────────────────────────────────────────────────────────

describe('EMISSION_FACTORS', () => {
  it('EV factor is lower than petrol', () => {
    expect(EMISSION_FACTORS.vehicle['ev']).toBeLessThan(EMISSION_FACTORS.vehicle['petrol']);
  });

  it('heavy-meat diet factor is highest', () => {
    const factors = Object.values(EMISSION_FACTORS.diet);
    expect(EMISSION_FACTORS.diet['heavy-meat']).toBe(Math.max(...factors));
  });

  it('vegan diet factor is lowest', () => {
    const factors = Object.values(EMISSION_FACTORS.diet);
    expect(EMISSION_FACTORS.diet['vegan']).toBe(Math.min(...factors));
  });

  it('all recycling offsets are negative (reductions)', () => {
    Object.values(EMISSION_FACTORS.recyclingOffsets).forEach((v) => {
      expect(v).toBeLessThan(0);
    });
  });
});

// ── HABITS_DATABASE ──────────────────────────────────────────────────────────

describe('HABITS_DATABASE', () => {
  it('has at least 10 habits', () => {
    expect(HABITS_DATABASE.length).toBeGreaterThanOrEqual(10);
  });

  it('every habit has required fields', () => {
    HABITS_DATABASE.forEach((h) => {
      expect(h.id).toBeTruthy();
      expect(h.title).toBeTruthy();
      expect(h.co2Saved).toBeGreaterThan(0);
      expect(h.xpGained).toBeGreaterThan(0);
      expect(['transport', 'energy', 'food', 'waste']).toContain(h.category);
      expect(['High', 'Medium', 'Low']).toContain(h.impact);
    });
  });

  it('has no duplicate IDs', () => {
    const ids = HABITS_DATABASE.map((h) => h.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('high-impact habits save more than low-impact on average', () => {
    const highAvg = HABITS_DATABASE.filter((h) => h.impact === 'High').reduce((s, h) => s + h.co2Saved, 0) / HABITS_DATABASE.filter((h) => h.impact === 'High').length;
    const lowAvg = HABITS_DATABASE.filter((h) => h.impact === 'Low').reduce((s, h) => s + h.co2Saved, 0) / HABITS_DATABASE.filter((h) => h.impact === 'Low').length;
    expect(highAvg).toBeGreaterThan(lowAvg);
  });
});

// ── BADGES_DATABASE ──────────────────────────────────────────────────────────

describe('BADGES_DATABASE', () => {
  it('has at least 6 badges', () => {
    expect(BADGES_DATABASE.length).toBeGreaterThanOrEqual(6);
  });

  it('every badge has an id, title, and icon', () => {
    BADGES_DATABASE.forEach((b) => {
      expect(b.id).toBeTruthy();
      expect(b.title).toBeTruthy();
      expect(b.icon).toBeTruthy();
    });
  });

  it('has no duplicate badge IDs', () => {
    const ids = BADGES_DATABASE.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
