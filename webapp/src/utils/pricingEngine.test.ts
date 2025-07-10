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