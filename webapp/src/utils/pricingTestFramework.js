/**
 * SwedPrime Pricing Test Framework
 * Comprehensive testing system for pricing calculations and validation
 */

import { PricingEngine, PRICING_MODELS } from './pricingEngine';
import { ValidationEngine } from './validationEngine';
import { PricingRulesEngine, RULE_TYPES, ACTION_TYPES } from './pricingRulesEngine';

// Test Types
export const TEST_TYPES = {
  UNIT: 'unit',
  INTEGRATION: 'integration',
  PERFORMANCE: 'performance',
  EDGE_CASE: 'edge_case',
  REGRESSION: 'regression',
  VALIDATION: 'validation'
};

// Test Status
export const TEST_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  PASSED: 'passed',
  FAILED: 'failed',
  SKIPPED: 'skipped'
};

/**
 * Pricing Test Framework Class
 */
export class PricingTestFramework {
  constructor(config = {}) {
    this.config = config;
    this.testSuites = new Map();
    this.testResults = new Map();
    this.engines = {
      pricing: null,
      validation: null,
      rules: null
    };
    this.debug = config.debug || false;
  }

  /**
   * Initialize test engines
   */
  initializeEngines(engineConfigs = {}) {
    this.engines.pricing = new PricingEngine(engineConfigs.pricing || {});
    this.engines.validation = new ValidationEngine(engineConfigs.validation || {});
    this.engines.rules = new PricingRulesEngine(engineConfigs.rules || {});
    
    this.log('Test engines initialized');
  }

  /**
   * Register a test suite
   */
  registerTestSuite(name, testSuite) {
    this.testSuites.set(name, testSuite);
    this.log(`Test suite registered: ${name}`);
  }

  /**
   * Create a test case
   */
  createTestCase(name, type, testFunction, options = {}) {
    return {
      name,
      type,
      testFunction,
      timeout: options.timeout || 5000,
      expectedResult: options.expectedResult,
      tolerance: options.tolerance || 0.01,
      skip: options.skip || false,
      only: options.only || false,
      metadata: options.metadata || {}
    };
  }

  /**
   * Run all test suites
   */
  async runAllTests() {
    const results = {
      totalSuites: this.testSuites.size,
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      suiteResults: {}
    };

    const startTime = Date.now();

    for (const [suiteName, testSuite] of this.testSuites) {
      this.log(`Running test suite: ${suiteName}`);
      const suiteResult = await this.runTestSuite(suiteName, testSuite);
      
      results.suiteResults[suiteName] = suiteResult;
      results.totalTests += suiteResult.totalTests;
      results.passed += suiteResult.passed;
      results.failed += suiteResult.failed;
      results.skipped += suiteResult.skipped;
    }

    results.duration = Date.now() - startTime;
    
    this.log('All tests completed:', results);
    return results;
  }

  /**
   * Run a specific test suite
   */
  async runTestSuite(suiteName, testSuite) {
    const result = {
      name: suiteName,
      totalTests: testSuite.tests.length,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      testResults: []
    };

    const startTime = Date.now();

    // Run setup if provided
    if (testSuite.setup) {
      await testSuite.setup(this.engines);
    }

    // Filter tests (handle 'only' and 'skip')
    const testsToRun = this.filterTests(testSuite.tests);

    for (const testCase of testsToRun) {
      const testResult = await this.runTestCase(testCase);
      result.testResults.push(testResult);
      
      switch (testResult.status) {
        case TEST_STATUS.PASSED:
          result.passed++;
          break;
        case TEST_STATUS.FAILED:
          result.failed++;
          break;
        case TEST_STATUS.SKIPPED:
          result.skipped++;
          break;
      }
    }

    // Run teardown if provided
    if (testSuite.teardown) {
      await testSuite.teardown(this.engines);
    }

    result.duration = Date.now() - startTime;
    this.testResults.set(suiteName, result);
    
    return result;
  }

  /**
   * Run a single test case
   */
  async runTestCase(testCase) {
    const result = {
      name: testCase.name,
      type: testCase.type,
      status: TEST_STATUS.PENDING,
      duration: 0,
      error: null,
      actualResult: null,
      expectedResult: testCase.expectedResult,
      metadata: testCase.metadata
    };

    if (testCase.skip) {
      result.status = TEST_STATUS.SKIPPED;
      return result;
    }

    const startTime = Date.now();
    result.status = TEST_STATUS.RUNNING;

    try {
      // Run test with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Test timeout')), testCase.timeout);
      });

      const testPromise = testCase.testFunction(this.engines);
      result.actualResult = await Promise.race([testPromise, timeoutPromise]);

      // Validate result if expected result is provided
      if (testCase.expectedResult !== undefined) {
        const isValid = this.validateTestResult(
          result.actualResult,
          testCase.expectedResult,
          testCase.tolerance
        );
        
        if (!isValid) {
          throw new Error(
            `Expected ${testCase.expectedResult}, got ${result.actualResult}`
          );
        }
      }

      result.status = TEST_STATUS.PASSED;
    } catch (error) {
      result.status = TEST_STATUS.FAILED;
      result.error = error.message;
      this.log(`Test failed: ${testCase.name} - ${error.message}`);
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Filter tests based on 'only' and 'skip' flags
   */
  filterTests(tests) {
    // If any test has 'only', run only those tests
    const onlyTests = tests.filter(test => test.only);
    if (onlyTests.length > 0) {
      return onlyTests;
    }

    // Otherwise, run all tests except skipped ones
    return tests.filter(test => !test.skip);
  }

  /**
   * Validate test result
   */
  validateTestResult(actual, expected, tolerance = 0.01) {
    if (typeof expected === 'number' && typeof actual === 'number') {
      return Math.abs(actual - expected) <= tolerance;
    }
    
    if (Array.isArray(expected) && Array.isArray(actual)) {
      if (expected.length !== actual.length) return false;
      return expected.every((exp, index) => 
        this.validateTestResult(actual[index], exp, tolerance)
      );
    }
    
    if (typeof expected === 'object' && typeof actual === 'object') {
      const expectedKeys = Object.keys(expected);
      const actualKeys = Object.keys(actual);
      
      if (expectedKeys.length !== actualKeys.length) return false;
      
      return expectedKeys.every(key => 
        this.validateTestResult(actual[key], expected[key], tolerance)
      );
    }
    
    return actual === expected;
  }

  /**
   * Generate test report
   */
  generateReport(format = 'console') {
    const allResults = Array.from(this.testResults.values());
    
    switch (format) {
      case 'console':
        return this.generateConsoleReport(allResults);
      case 'html':
        return this.generateHtmlReport(allResults);
      case 'json':
        return this.generateJsonReport(allResults);
      default:
        return this.generateConsoleReport(allResults);
    }
  }

  /**
   * Generate console report
   */
  generateConsoleReport(results) {
    let report = '\n' + '='.repeat(60) + '\n';
    report += '  PRICING ENGINE TEST RESULTS\n';
    report += '='.repeat(60) + '\n\n';

    const totals = results.reduce((acc, result) => ({
      tests: acc.tests + result.totalTests,
      passed: acc.passed + result.passed,
      failed: acc.failed + result.failed,
      skipped: acc.skipped + result.skipped,
      duration: acc.duration + result.duration
    }), { tests: 0, passed: 0, failed: 0, skipped: 0, duration: 0 });

    // Summary
    report += `Total Tests: ${totals.tests}\n`;
    report += `Passed: ${totals.passed} (${((totals.passed / totals.tests) * 100).toFixed(1)}%)\n`;
    report += `Failed: ${totals.failed} (${((totals.failed / totals.tests) * 100).toFixed(1)}%)\n`;
    report += `Skipped: ${totals.skipped} (${((totals.skipped / totals.tests) * 100).toFixed(1)}%)\n`;
    report += `Duration: ${totals.duration}ms\n\n`;

    // Suite details
    for (const result of results) {
      report += `${result.name}:\n`;
      report += `  Tests: ${result.totalTests}, Passed: ${result.passed}, Failed: ${result.failed}, Skipped: ${result.skipped}\n`;
      report += `  Duration: ${result.duration}ms\n`;
      
      // Failed tests details
      const failedTests = result.testResults.filter(t => t.status === TEST_STATUS.FAILED);
      if (failedTests.length > 0) {
        report += '  Failed Tests:\n';
        for (const test of failedTests) {
          report += `    - ${test.name}: ${test.error}\n`;
        }
      }
      report += '\n';
    }

    return report;
  }

  /**
   * Generate JSON report
   */
  generateJsonReport(results) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: results.reduce((acc, result) => ({
        totalSuites: acc.totalSuites + 1,
        totalTests: acc.totalTests + result.totalTests,
        passed: acc.passed + result.passed,
        failed: acc.failed + result.failed,
        skipped: acc.skipped + result.skipped,
        duration: acc.duration + result.duration
      }), { totalSuites: 0, totalTests: 0, passed: 0, failed: 0, skipped: 0, duration: 0 }),
      suites: results
    }, null, 2);
  }

  /**
   * Log debug information
   */
  log(...args) {
    if (this.debug) {
      console.log('[PricingTestFramework]', ...args);
    }
  }
}

/**
 * Default test suites
 */
export const DefaultTestSuites = {
  /**
   * Basic pricing model tests
   */
  basicPricingTests: {
    name: 'Basic Pricing Tests',
    setup: async (engines) => {
      // Setup test data
    },
    tests: [
      {
        name: 'Flat rate pricing calculation',
        type: TEST_TYPES.UNIT,
        expectedResult: 1000,
        testFunction: async (engines) => {
          const inputData = {
            service: {
              id: 'test-service',
              pricingModel: PRICING_MODELS.FLAT_RATE,
              pricingConfig: { pricePerSqm: 10 }
            },
            area: 100,
            frequency: 'monthly'
          };
          
          const result = await engines.pricing.calculatePrice(inputData);
          return result.totalPrice;
        }
      },
      
      {
        name: 'Tiered pricing calculation',
        type: TEST_TYPES.UNIT,
        expectedResult: 2000,
        testFunction: async (engines) => {
          const inputData = {
            service: {
              id: 'test-service',
              pricingModel: PRICING_MODELS.PER_SQM_TIERED,
              pricingConfig: {
                tiers: [
                  { minArea: 0, maxArea: 50, pricePerSqm: 15 },
                  { minArea: 51, maxArea: 100, pricePerSqm: 20 }
                ]
              }
            },
            area: 100,
            frequency: 'monthly'
          };
          
          const result = await engines.pricing.calculatePrice(inputData);
          return result.totalPrice;
        }
      }
    ]
  },

  /**
   * Validation tests
   */
  validationTests: {
    name: 'Validation Tests',
    tests: [
      {
        name: 'Valid pricing input validation',
        type: TEST_TYPES.VALIDATION,
        expectedResult: true,
        testFunction: async (engines) => {
          const inputData = {
            service: { id: 'test', pricingModel: 'flat_rate' },
            area: 100,
            frequency: 'monthly'
          };
          
          const result = engines.validation.validatePricingInput(inputData);
          return result.isValid;
        }
      },
      
      {
        name: 'Invalid area validation',
        type: TEST_TYPES.VALIDATION,
        expectedResult: false,
        testFunction: async (engines) => {
          const inputData = {
            service: { id: 'test', pricingModel: 'flat_rate' },
            area: -10, // Invalid negative area
            frequency: 'monthly'
          };
          
          const result = engines.validation.validatePricingInput(inputData);
          return result.isValid;
        }
      }
    ]
  },

  /**
   * Rules engine tests
   */
  rulesEngineTests: {
    name: 'Rules Engine Tests',
    setup: async (engines) => {
      // Add test rules
      engines.rules.addRule({
        id: 'test-discount',
        name: 'Test Discount',
        type: RULE_TYPES.DISCOUNT,
        conditions: [
          { field: 'inputData.area', operator: 'greater_than', value: 100 }
        ],
        action: { type: ACTION_TYPES.PERCENTAGE_DISCOUNT, value: 10 }
      });
    },
    tests: [
      {
        name: 'Discount rule application',
        type: TEST_TYPES.INTEGRATION,
        expectedResult: 900, // 1000 - 10% discount
        tolerance: 1,
        testFunction: async (engines) => {
          const context = {
            currentPrice: 1000,
            inputData: { area: 150 }
          };
          
          const result = await engines.rules.applyRules(context);
          return result.finalPrice;
        }
      }
    ]
  },

  /**
   * Performance tests
   */
  performanceTests: {
    name: 'Performance Tests',
    tests: [
      {
        name: 'Pricing calculation performance',
        type: TEST_TYPES.PERFORMANCE,
        timeout: 1000, // Should complete within 1 second
        testFunction: async (engines) => {
          const inputData = {
            service: {
              id: 'test-service',
              pricingModel: PRICING_MODELS.FLAT_RATE,
              pricingConfig: { pricePerSqm: 10 }
            },
            area: 100,
            frequency: 'monthly'
          };
          
          const startTime = Date.now();
          
          // Run 100 calculations
          for (let i = 0; i < 100; i++) {
            await engines.pricing.calculatePrice(inputData);
          }
          
          const duration = Date.now() - startTime;
          
          // Should complete 100 calculations in less than 500ms
          if (duration > 500) {
            throw new Error(`Performance test failed: ${duration}ms > 500ms`);
          }
          
          return duration;
        }
      }
    ]
  },

  /**
   * Edge case tests
   */
  edgeCaseTests: {
    name: 'Edge Case Tests',
    tests: [
      {
        name: 'Zero area handling',
        type: TEST_TYPES.EDGE_CASE,
        testFunction: async (engines) => {
          const inputData = {
            service: {
              id: 'test-service',
              pricingModel: PRICING_MODELS.FLAT_RATE,
              pricingConfig: { pricePerSqm: 10 }
            },
            area: 0,
            frequency: 'monthly'
          };
          
          try {
            await engines.pricing.calculatePrice(inputData);
            throw new Error('Should have thrown validation error');
          } catch (error) {
            if (error.message.includes('validation') || error.message.includes('area')) {
              return true; // Expected validation error
            }
            throw error;
          }
        }
      },
      
      {
        name: 'Extremely large area handling',
        type: TEST_TYPES.EDGE_CASE,
        testFunction: async (engines) => {
          const inputData = {
            service: {
              id: 'test-service',
              pricingModel: PRICING_MODELS.FLAT_RATE,
              pricingConfig: { pricePerSqm: 10 }
            },
            area: 1000000, // Very large area
            frequency: 'monthly'
          };
          
          try {
            await engines.pricing.calculatePrice(inputData);
            throw new Error('Should have thrown validation error');
          } catch (error) {
            if (error.message.includes('validation') || error.message.includes('range')) {
              return true; // Expected validation error
            }
            throw error;
          }
        }
      }
    ]
  }
};

/**
 * Test utilities
 */
export const TestUtils = {
  /**
   * Create a mock service configuration
   */
  createMockService(pricingModel, pricingConfig = {}) {
    return {
      id: `mock-service-${Date.now()}`,
      name: 'Mock Service',
      pricingModel,
      pricingConfig,
      enabled: true
    };
  },

  /**
   * Create mock input data
   */
  createMockInputData(overrides = {}) {
    return {
      service: this.createMockService(PRICING_MODELS.FLAT_RATE, { pricePerSqm: 10 }),
      area: 100,
      frequency: 'monthly',
      addOns: [],
      zipCode: '12345',
      useRut: false,
      ...overrides
    };
  },

  /**
   * Generate random test data
   */
  generateRandomTestData(count = 10) {
    const testData = [];
    
    for (let i = 0; i < count; i++) {
      testData.push({
        area: Math.floor(Math.random() * 500) + 10,
        frequency: ['weekly', 'biweekly', 'monthly'][Math.floor(Math.random() * 3)],
        zipCode: String(Math.floor(Math.random() * 90000) + 10000),
        useRut: Math.random() > 0.5
      });
    }
    
    return testData;
  },

  /**
   * Benchmark a function
   */
  async benchmark(fn, iterations = 100) {
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      times.push(end - start);
    }
    
    return {
      min: Math.min(...times),
      max: Math.max(...times),
      avg: times.reduce((a, b) => a + b, 0) / times.length,
      median: times.sort((a, b) => a - b)[Math.floor(times.length / 2)]
    };
  }
};

/**
 * Factory function to create test framework instance
 */
export function createPricingTestFramework(config) {
  return new PricingTestFramework(config);
}

export default PricingTestFramework; 