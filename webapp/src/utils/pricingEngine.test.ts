import { describe, it, expect } from 'vitest';
import PricingEngine from './pricingEngine';

// Helper: minimal config for fixed tier
const fixedTierConfig = {
  services: [
    {
      id: 'flyttstadning',
      name: 'Flyttstädning',
      pricingModel: 'fixedTier',
      pricingConfig: {
        ranges: [
          { minArea: 1, maxArea: 50, price: 3000 },
          { minArea: 51, maxArea: 60, price: 4000 },
          { minArea: 61, maxArea: 70, price: 5000 }
        ]
      }
    }
  ]
};

describe('PricingEngine - Fixed Tier Pricing', () => {
  it('charges 3000 SEK for 45 sqm', async () => {
    const engine = new PricingEngine({});
    const service = fixedTierConfig.services[0];
    // Simulate the inputData structure expected by calculateFlatRange
    const inputData = {
      service,
      area: 45
    };
    const price = engine.calculateFlatRange(inputData);
    expect(price).toBe(3000);
  });

  it('charges 4000 SEK for 55 sqm', async () => {
    const engine = new PricingEngine({});
    const service = fixedTierConfig.services[0];
    const inputData = {
      service,
      area: 55
    };
    const price = engine.calculateFlatRange(inputData);
    expect(price).toBe(4000);
  });

  it('throws for area outside all ranges', async () => {
    const engine = new PricingEngine({});
    const service = fixedTierConfig.services[0];
    const inputData = {
      service,
      area: 100
    };
    expect(() => engine.calculateFlatRange(inputData)).toThrow();
  });
});

// Tiered Multiplier
const tieredMultiplierConfig = {
  pricingConfig: {
    tiers: [
      { minArea: 1, maxArea: 50, rate: 30, type: 'per_sqm', pricePerSqm: 30 },
      { minArea: 51, maxArea: 60, rate: 28, type: 'per_sqm', pricePerSqm: 28 },
      { minArea: 61, maxArea: 70, rate: 25, type: 'per_sqm', pricePerSqm: 25 }
    ]
  }
};
describe('PricingEngine - Tiered Multiplier', () => {
  it('charges 30 SEK/sqm for 10 sqm', () => {
    const engine = new PricingEngine({});
    const service = { ...tieredMultiplierConfig, pricingModel: 'per_sqm_tiered' };
    const inputData = { service, area: 10 };
    const price = engine.calculateTieredPricing(inputData);
    expect(price).toBe(300);
  });
  it('charges 28 SEK/sqm for 55 sqm', () => {
    const engine = new PricingEngine({});
    const service = { ...tieredMultiplierConfig, pricingModel: 'per_sqm_tiered' };
    const inputData = { service, area: 55 };
    const price = engine.calculateTieredPricing(inputData);
    expect(price).toBe(1540);
  });
});

// Universal Multiplier
const universalMultiplierConfig = {
  pricingConfig: { pricePerSqm: 50 },
  pricePerSqm: 50
};
describe('PricingEngine - Universal Multiplier', () => {
  it('charges minimum for small area', () => {
    const engine = new PricingEngine({});
    const service = { ...universalMultiplierConfig, pricingModel: 'flat_rate' };
    const inputData = { service, area: 10 };
    const price = engine.calculateFlatRate(inputData);
    expect(price).toBe(500);
  });
  it('charges correct for 20 sqm', () => {
    const engine = new PricingEngine({});
    const service = { ...universalMultiplierConfig, pricingModel: 'flat_rate' };
    const inputData = { service, area: 20 };
    const price = engine.calculateFlatRate(inputData);
    expect(price).toBe(1000);
  });
});

// Window Cleaning
const windowCleaningConfig = {
  pricingConfig: {
    windowPrices: { typ1: 60, typ2: 70, typ3: 80 },
    minimumCharge: 700
  }
};
describe('PricingEngine - Window Cleaning', () => {
  it('applies minimum charge if below threshold', () => {
    const engine = new PricingEngine({});
    const service = { ...windowCleaningConfig, pricingModel: 'window_based' };
    const inputData = { service, windowCleaning: { typ1: 3 } };
    const price = engine.calculateWindowBased(inputData);
    expect(price).toBe(700);
  });
  it('calculates correct price for 10x typ3', () => {
    const engine = new PricingEngine({});
    const service = { ...windowCleaningConfig, pricingModel: 'window_based' };
    const inputData = { service, windowCleaning: { typ3: 10 } };
    const price = engine.calculateWindowBased(inputData);
    expect(price).toBe(800);
  });
});

// Hourly Model
const hourlyModelConfig = {
  pricingConfig: {
    hourRates: [
      { minArea: 1, maxArea: 50, hours: 3, pricePerHour: 400 },
      { minArea: 51, maxArea: 60, hours: 4, pricePerHour: 400 },
      { minArea: 61, maxArea: 70, hours: 5, pricePerHour: 400 }
    ]
  }
};
describe('PricingEngine - Hourly Model', () => {
  it('calculates 3 hours for 45 sqm', () => {
    const engine = new PricingEngine({});
    const service = { ...hourlyModelConfig, pricingModel: 'hourly_by_size' };
    const inputData = { service, area: 45 };
    const price = engine.calculateHourlyBySize(inputData);
    expect(price).toBe(1200);
  });
  it('calculates 4 hours for 56 sqm', () => {
    const engine = new PricingEngine({});
    const service = { ...hourlyModelConfig, pricingModel: 'hourly_by_size' };
    const inputData = { service, area: 56 };
    const price = engine.calculateHourlyBySize(inputData);
    expect(price).toBe(1600);
  });
});

// Per-Room Model
const perRoomModelConfig = {
  pricingConfig: { pricePerRoom: 300 },
  pricePerRoom: 300
};
describe('PricingEngine - Per-Room Model', () => {
  it('charges minimum for 1 room', () => {
    const engine = new PricingEngine({});
    const service = { ...perRoomModelConfig, pricingModel: 'per_room' };
    const inputData = { service, rooms: 1, area: 20 };
    const price = engine.calculatePerRoom(inputData);
    expect(price).toBe(300);
  });
  it('charges correct for 3 rooms', () => {
    const engine = new PricingEngine({});
    const service = { ...perRoomModelConfig, pricingModel: 'per_room' };
    const inputData = { service, rooms: 3, area: 60 };
    const price = engine.calculatePerRoom(inputData);
    expect(price).toBe(900);
  });
}); 