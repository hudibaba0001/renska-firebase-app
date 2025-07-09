// --- BEGIN REFACTOR: SwedPrime Advanced ServiceConfigForm ---
import React, { useState } from 'react';
import { Card, Button, TextInput, Select, Label, Checkbox, Accordion, Table, Alert, Badge } from 'flowbite-react';
import { PlusIcon, TrashIcon, CogIcon } from '@heroicons/react/24/outline';

// =========================
// PRICING MODEL CONSTANTS
// =========================
// These constants define the available pricing models for SwedPrime services.
// Each model will have its own configuration UI and logic.
const PRICING_MODELS = {
  FIXED_TIER: 'fixed_tier',           // Flat fee per area range
  TIERED_MULTIPLIER: 'tiered_multiplier', // Per-sqm rate per area range
  UNIVERSAL_MULTIPLIER: 'universal_multiplier', // Single per-sqm rate for all areas
  WINDOW: 'window',                   // Per-window type pricing
  HOURLY: 'hourly',                   // Hourly rate, area mapped to hours
  PER_ROOM: 'per_room',               // Per-room type pricing
};

// =========================
// NEW SERVICE TEMPLATE
// =========================
// This function returns a new service object with all fields needed for advanced pricing.
// Used when adding a new service in the admin UI.
const newServiceTemplate = () => ({
  id: Date.now().toString(),
  name: '',
  description: '',
  pricingModel: PRICING_MODELS.FIXED_TIER,
  rutEligible: true,           // RUT/ROT eligibility toggle
  vatRate: 0.25,               // VAT percentage (0-1)
  laborPercentage: 70,         // Labor cost percentage (0-100)
  materialPercentage: 30,      // Material cost percentage (0-100)
  minimumPrice: 700,           // Minimum price for this service
  addOns: [],                  // List of add-ons (name, price, RUT eligible)
  frequencyMultipliers: [      // Frequency options (label, multiplier, enabled)
    { label: 'Weekly', value: 1, enabled: true },
    { label: 'Bi-weekly', value: 1.15, enabled: true },
    { label: 'Monthly', value: 1.4, enabled: false },
  ],
  customFees: [],              // List of custom fees (label, amount, RUT eligible)
  // Pricing model specifics:
  fixedTiers: [{ min: 1, max: 50, price: 3000 }], // For Fixed Tier
  tieredMultipliers: [{ min: 1, max: 50, rate: 30 }], // For Tiered Multiplier
  universalMultiplier: { rate: 50 }, // For Universal Multiplier
  windowTypes: [{ name: 'Typ 1', price: 60 }], // For Window Cleaning
  hourlyTiers: [{ min: 1, max: 50, hours: 3 }], // For Hourly Model
  hourlyRate: 400,             // For Hourly Model
  roomTypes: [{ name: 'Room', price: 300 }], // For Per-Room Model
});

// Helper: Render pricing model-specific fields
function PricingModelFields({ service, updateService }) {
  switch (service.pricingModel) {
    case PRICING_MODELS.FIXED_TIER:
      return (
        <div className="mb-2">
          <Label value="Fixed Tiers (min, max, price)" />
          <Table>
            <Table.Head>
              <Table.HeadCell>Min sqm</Table.HeadCell>
              <Table.HeadCell>Max sqm</Table.HeadCell>
              <Table.HeadCell>Flat Price (SEK)</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {(service.fixedTiers || []).filter(Boolean).map((tier, idx) => (
                <Table.Row key={idx}>
                  <Table.Cell>
                    <TextInput
                      type="number"
                      value={tier.min}
                      onChange={e => {
                        const tiers = [...service.fixedTiers];
                        tiers[idx].min = parseInt(e.target.value) || 0;
                        updateService(service.id, { fixedTiers: tiers });
                      }}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <TextInput
                      type="number"
                      value={tier.max}
                      onChange={e => {
                        const tiers = [...service.fixedTiers];
                        tiers[idx].max = parseInt(e.target.value) || 0;
                        updateService(service.id, { fixedTiers: tiers });
                      }}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <TextInput
                      type="number"
                      value={tier.price}
                      onChange={e => {
                        const tiers = [...service.fixedTiers];
                        tiers[idx].price = parseInt(e.target.value) || 0;
                        updateService(service.id, { fixedTiers: tiers });
                      }}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Button size="xs" color="failure" onClick={() => {
                      const tiers = service.fixedTiers.filter((_, i) => i !== idx);
                      updateService(service.id, { fixedTiers: tiers });
                    }}>
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          <Button size="xs" color="primary" className="mt-2" onClick={() => {
            const tiers = [...service.fixedTiers, { min: 0, max: 0, price: 0 }];
            updateService(service.id, { fixedTiers: tiers });
          }}>
            <PlusIcon className="h-4 w-4" /> Add Tier
          </Button>
        </div>
      );
    case PRICING_MODELS.TIERED_MULTIPLIER:
      return (
        <div className="mb-2">
          <Label value="Tiered Multipliers (min, max, rate per sqm)" />
          <Table>
            <Table.Head>
              <Table.HeadCell>Min sqm</Table.HeadCell>
              <Table.HeadCell>Max sqm</Table.HeadCell>
              <Table.HeadCell>Rate (SEK/sqm)</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {(service.tieredMultipliers || []).filter(Boolean).map((tier, idx) => (
                <Table.Row key={idx}>
                  <Table.Cell>
                    <TextInput
                      type="number"
                      value={tier.min}
                      onChange={e => {
                        const tiers = [...service.tieredMultipliers];
                        tiers[idx].min = parseInt(e.target.value) || 0;
                        updateService(service.id, { tieredMultipliers: tiers });
                      }}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <TextInput
                      type="number"
                      value={tier.max}
                      onChange={e => {
                        const tiers = [...service.tieredMultipliers];
                        tiers[idx].max = parseInt(e.target.value) || 0;
                        updateService(service.id, { tieredMultipliers: tiers });
                      }}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <TextInput
                      type="number"
                      value={tier.rate}
                      onChange={e => {
                        const tiers = [...service.tieredMultipliers];
                        tiers[idx].rate = parseInt(e.target.value) || 0;
                        updateService(service.id, { tieredMultipliers: tiers });
                      }}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Button size="xs" color="failure" onClick={() => {
                      const tiers = service.tieredMultipliers.filter((_, i) => i !== idx);
                      updateService(service.id, { tieredMultipliers: tiers });
                    }}>
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          <Button size="xs" color="primary" className="mt-2" onClick={() => {
            const tiers = [...service.tieredMultipliers, { min: 0, max: 0, rate: 0 }];
            updateService(service.id, { tieredMultipliers: tiers });
          }}>
            <PlusIcon className="h-4 w-4" /> Add Tier
          </Button>
        </div>
      );
    case PRICING_MODELS.UNIVERSAL_MULTIPLIER:
      return (
        <div className="mb-2">
          <Label value="Universal Multiplier (rate per sqm)" />
          <TextInput
            type="number"
            value={service.universalMultiplier?.rate || 0}
            onChange={e => updateService(service.id, { universalMultiplier: { rate: parseInt(e.target.value) || 0 } })}
            placeholder="e.g. 50"
          />
        </div>
      );
    case PRICING_MODELS.WINDOW:
      return (
        <div className="mb-2">
          <Label value="Window Types & Prices" />
          <Table>
            <Table.Head>
              <Table.HeadCell>Type Name</Table.HeadCell>
              <Table.HeadCell>Price (SEK)</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {(service.windowTypes || []).filter(Boolean).map((type, idx) => (
                <Table.Row key={idx}>
                  <Table.Cell>
                    <TextInput
                      value={type.name}
                      onChange={e => {
                        const types = [...service.windowTypes];
                        types[idx].name = e.target.value;
                        updateService(service.id, { windowTypes: types });
                      }}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <TextInput
                      type="number"
                      value={type.price}
                      onChange={e => {
                        const types = [...service.windowTypes];
                        types[idx].price = parseInt(e.target.value) || 0;
                        updateService(service.id, { windowTypes: types });
                      }}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Button size="xs" color="failure" onClick={() => {
                      const types = service.windowTypes.filter((_, i) => i !== idx);
                      updateService(service.id, { windowTypes: types });
                    }}>
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          <Button size="xs" color="primary" className="mt-2" onClick={() => {
            const types = [...service.windowTypes, { name: '', price: 0 }];
            updateService(service.id, { windowTypes: types });
          }}>
            <PlusIcon className="h-4 w-4" /> Add Window Type
          </Button>
        </div>
      );
    case PRICING_MODELS.HOURLY:
      return (
        <div className="mb-2">
          <Label value="Hourly Tiers (min, max, hours)" />
          <Table>
            <Table.Head>
              <Table.HeadCell>Min sqm</Table.HeadCell>
              <Table.HeadCell>Max sqm</Table.HeadCell>
              <Table.HeadCell>Hours</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {(service.hourlyTiers || []).filter(Boolean).map((tier, idx) => (
                <Table.Row key={idx}>
                  <Table.Cell>
                    <TextInput
                      type="number"
                      value={tier.min}
                      onChange={e => {
                        const tiers = [...service.hourlyTiers];
                        tiers[idx].min = parseInt(e.target.value) || 0;
                        updateService(service.id, { hourlyTiers: tiers });
                      }}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <TextInput
                      type="number"
                      value={tier.max}
                      onChange={e => {
                        const tiers = [...service.hourlyTiers];
                        tiers[idx].max = parseInt(e.target.value) || 0;
                        updateService(service.id, { hourlyTiers: tiers });
                      }}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <TextInput
                      type="number"
                      value={tier.hours}
                      onChange={e => {
                        const tiers = [...service.hourlyTiers];
                        tiers[idx].hours = parseInt(e.target.value) || 0;
                        updateService(service.id, { hourlyTiers: tiers });
                      }}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Button size="xs" color="failure" onClick={() => {
                      const tiers = service.hourlyTiers.filter((_, i) => i !== idx);
                      updateService(service.id, { hourlyTiers: tiers });
                    }}>
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          <Button size="xs" color="primary" className="mt-2" onClick={() => {
            const tiers = [...service.hourlyTiers, { min: 0, max: 0, hours: 0 }];
            updateService(service.id, { hourlyTiers: tiers });
          }}>
            <PlusIcon className="h-4 w-4" /> Add Tier
          </Button>
          <div className="mt-2">
            <Label value="Hourly Rate (SEK/hour)" />
            <TextInput
              type="number"
              value={service.hourlyRate || 0}
              onChange={e => updateService(service.id, { hourlyRate: parseInt(e.target.value) || 0 })}
              placeholder="e.g. 400"
            />
          </div>
        </div>
      );
    case PRICING_MODELS.PER_ROOM:
      return (
        <div className="mb-2">
          <Label value="Room Types & Prices" />
          <Table>
            <Table.Head>
              <Table.HeadCell>Room Type</Table.HeadCell>
              <Table.HeadCell>Price (SEK)</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {(service.roomTypes || []).filter(Boolean).map((type, idx) => (
                <Table.Row key={idx}>
                  <Table.Cell>
                    <TextInput
                      value={type.name}
                      onChange={e => {
                        const types = [...service.roomTypes];
                        types[idx].name = e.target.value;
                        updateService(service.id, { roomTypes: types });
                      }}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <TextInput
                      type="number"
                      value={type.price}
                      onChange={e => {
                        const types = [...service.roomTypes];
                        types[idx].price = parseInt(e.target.value) || 0;
                        updateService(service.id, { roomTypes: types });
                      }}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Button size="xs" color="failure" onClick={() => {
                      const types = service.roomTypes.filter((_, i) => i !== idx);
                      updateService(service.id, { roomTypes: types });
                    }}>
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          <Button size="xs" color="primary" className="mt-2" onClick={() => {
            const types = [...service.roomTypes, { name: '', price: 0 }];
            updateService(service.id, { roomTypes: types });
          }}>
            <PlusIcon className="h-4 w-4" /> Add Room Type
          </Button>
        </div>
      );
    default:
      return <></>;
  }
}

// Helper: Render add-ons, custom fees, frequency, and global fields for a service
function ServiceAdvancedFields({ service, updateService }) {
  // Add-ons
  const addAddOn = () => {
    const addOns = [...(service.addOns || []), { name: '', price: 0, rutEligible: false }];
    updateService(service.id, { addOns });
  };
  const updateAddOn = (idx, updates) => {
    const addOns = [...service.addOns];
    addOns[idx] = { ...addOns[idx], ...updates };
    updateService(service.id, { addOns });
  };
  const deleteAddOn = (idx) => {
    const addOns = service.addOns.filter((_, i) => i !== idx);
    updateService(service.id, { addOns });
  };
  // Custom Fees
  const addCustomFee = () => {
    const customFees = [...(service.customFees || []), { label: '', amount: 0, rutEligible: false }];
    updateService(service.id, { customFees });
  };
  const updateCustomFee = (idx, updates) => {
    const customFees = [...service.customFees];
    customFees[idx] = { ...customFees[idx], ...updates };
    updateService(service.id, { customFees });
  };
  const deleteCustomFee = (idx) => {
    const customFees = service.customFees.filter((_, i) => i !== idx);
    updateService(service.id, { customFees });
  };
  // Frequency Multipliers
  const addFrequency = () => {
    const frequencyMultipliers = [...(service.frequencyMultipliers || []), { label: '', value: 1, enabled: true }];
    updateService(service.id, { frequencyMultipliers });
  };
  const updateFrequency = (idx, updates) => {
    const frequencyMultipliers = [...service.frequencyMultipliers];
    frequencyMultipliers[idx] = { ...frequencyMultipliers[idx], ...updates };
    updateService(service.id, { frequencyMultipliers });
  };
  const deleteFrequency = (idx) => {
    const frequencyMultipliers = service.frequencyMultipliers.filter((_, i) => i !== idx);
    updateService(service.id, { frequencyMultipliers });
  };
  return (
    <>
      {/* Minimum Price, RUT, VAT, Labor/Material */}
      <div className="grid grid-cols-2 gap-4 mb-2">
        <div>
          <Label value="Minimum Price (SEK)" />
          <TextInput
            type="number"
            value={service.minimumPrice || 0}
            onChange={e => updateService(service.id, { minimumPrice: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label value="VAT Rate (%)" />
          <TextInput
            type="number"
            value={service.vatRate * 100}
            onChange={e => updateService(service.id, { vatRate: (parseFloat(e.target.value) || 0) / 100 })}
          />
        </div>
        <div>
          <Label value="Labor %" />
          <TextInput
            type="number"
            value={service.laborPercentage}
            min={0}
            max={100}
            onChange={e => updateService(service.id, { laborPercentage: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label value="Material %" />
          <TextInput
            type="number"
            value={service.materialPercentage}
            min={0}
            max={100}
            onChange={e => updateService(service.id, { materialPercentage: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Checkbox
            checked={service.rutEligible}
            onChange={e => updateService(service.id, { rutEligible: e.target.checked })}
          />
          <Label value="RUT Eligible" />
        </div>
      </div>
      {/* Add-Ons */}
      <div className="mb-2">
        <Label value="Add-Ons" />
        <Table>
          <Table.Head>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>Price (SEK)</Table.HeadCell>
            <Table.HeadCell>RUT Eligible</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {(service.addOns || []).filter(Boolean).map((addOn, idx) => (
              <Table.Row key={idx}>
                <Table.Cell>
                  <TextInput
                    value={addOn.name}
                    onChange={e => updateAddOn(idx, { name: e.target.value })}
                  />
                </Table.Cell>
                <Table.Cell>
                  <TextInput
                    type="number"
                    value={addOn.price}
                    onChange={e => updateAddOn(idx, { price: parseInt(e.target.value) || 0 })}
                  />
                </Table.Cell>
                <Table.Cell>
                  <Checkbox
                    checked={addOn.rutEligible}
                    onChange={e => updateAddOn(idx, { rutEligible: e.target.checked })}
                  />
                </Table.Cell>
                <Table.Cell>
                  <Button size="xs" color="failure" onClick={() => deleteAddOn(idx)}>
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        <Button size="xs" color="primary" className="mt-2" onClick={addAddOn}>
          <PlusIcon className="h-4 w-4" /> Add Add-On
        </Button>
      </div>
      {/* Custom Fees */}
      <div className="mb-2">
        <Label value="Custom Fees" />
        <Table>
          <Table.Head>
            <Table.HeadCell>Label</Table.HeadCell>
            <Table.HeadCell>Amount (SEK)</Table.HeadCell>
            <Table.HeadCell>RUT Eligible</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {(service.customFees || []).filter(Boolean).map((fee, idx) => (
              <Table.Row key={idx}>
                <Table.Cell>
                  <TextInput
                    value={fee.label}
                    onChange={e => updateCustomFee(idx, { label: e.target.value })}
                  />
                </Table.Cell>
                <Table.Cell>
                  <TextInput
                    type="number"
                    value={fee.amount}
                    onChange={e => updateCustomFee(idx, { amount: parseInt(e.target.value) || 0 })}
                  />
                </Table.Cell>
                <Table.Cell>
                  <Checkbox
                    checked={fee.rutEligible}
                    onChange={e => updateCustomFee(idx, { rutEligible: e.target.checked })}
                  />
                </Table.Cell>
                <Table.Cell>
                  <Button size="xs" color="failure" onClick={() => deleteCustomFee(idx)}>
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        <Button size="xs" color="primary" className="mt-2" onClick={addCustomFee}>
          <PlusIcon className="h-4 w-4" /> Add Custom Fee
        </Button>
      </div>
      {/* Frequency Multipliers */}
      <div className="mb-2">
        <Label value="Frequency Multipliers" />
        <Table>
          <Table.Head>
            <Table.HeadCell>Label</Table.HeadCell>
            <Table.HeadCell>Multiplier</Table.HeadCell>
            <Table.HeadCell>Enabled</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {(service.frequencyMultipliers || []).filter(Boolean).map((freq, idx) => (
              <Table.Row key={idx}>
                <Table.Cell>
                  <TextInput
                    value={freq.label}
                    onChange={e => updateFrequency(idx, { label: e.target.value })}
                  />
                </Table.Cell>
                <Table.Cell>
                  <TextInput
                    type="number"
                    value={freq.value}
                    onChange={e => updateFrequency(idx, { value: parseFloat(e.target.value) || 1 })}
                  />
                </Table.Cell>
                <Table.Cell>
                  <Checkbox
                    checked={freq.enabled}
                    onChange={e => updateFrequency(idx, { enabled: e.target.checked })}
                  />
                </Table.Cell>
                <Table.Cell>
                  <Button size="xs" color="failure" onClick={() => deleteFrequency(idx)}>
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        <Button size="xs" color="primary" className="mt-2" onClick={addFrequency}>
          <PlusIcon className="h-4 w-4" /> Add Frequency
        </Button>
      </div>
    </>
  );
}

// Helper: Validate a service configuration
function validateService(service) {
  const errors = [];
  if (!service.name) errors.push('Service name is required.');
  if (!service.pricingModel) errors.push('Pricing model is required.');
  if (service.minimumPrice < 0) errors.push('Minimum price cannot be negative.');
  if (service.laborPercentage < 0 || service.laborPercentage > 100) errors.push('Labor % must be 0-100.');
  if (service.materialPercentage < 0 || service.materialPercentage > 100) errors.push('Material % must be 0-100.');
  // Pricing model-specific validation
  switch (service.pricingModel) {
    case PRICING_MODELS.FIXED_TIER:
      if (!service.fixedTiers.length) errors.push('At least one fixed tier is required.');
      break;
    case PRICING_MODELS.TIERED_MULTIPLIER:
      if (!service.tieredMultipliers.length) errors.push('At least one tiered multiplier is required.');
      break;
    case PRICING_MODELS.UNIVERSAL_MULTIPLIER:
      if (!service.universalMultiplier || service.universalMultiplier.rate <= 0) errors.push('Universal multiplier rate must be positive.');
      break;
    case PRICING_MODELS.WINDOW:
      if (!service.windowTypes.length) errors.push('At least one window type is required.');
      break;
    case PRICING_MODELS.HOURLY:
      if (!service.hourlyTiers.length) errors.push('At least one hourly tier is required.');
      if (!service.hourlyRate || service.hourlyRate <= 0) errors.push('Hourly rate must be positive.');
      break;
    case PRICING_MODELS.PER_ROOM:
      if (!service.roomTypes.length) errors.push('At least one room type is required.');
      break;
    default:
      break;
  }
  return errors;
}

// Helper: Live preview (scaffold)
function ServiceLivePreview({ service }) {
  // This is a placeholder. In production, use the real pricing engine.
  return (
    <div className="bg-gray-50 border border-gray-200 rounded p-4 mt-4">
      <div className="font-semibold mb-2">Live Price Preview (Sample)</div>
      <div className="text-xs text-gray-500 mb-2">(Calculation logic can be refined)</div>
      <pre className="text-xs bg-white p-2 rounded overflow-x-auto">{JSON.stringify(service, null, 2)}</pre>
    </div>
  );
}

// Helper: Hydrate a service with all required fields
function hydrateService(service) {
  const defaults = newServiceTemplate();
  return {
    ...defaults,
    ...service,
    // Deep merge arrays/objects for pricing model specifics
    fixedTiers: service.fixedTiers ?? defaults.fixedTiers,
    tieredMultipliers: service.tieredMultipliers ?? defaults.tieredMultipliers,
    universalMultiplier: service.universalMultiplier ?? defaults.universalMultiplier,
    windowTypes: service.windowTypes ?? defaults.windowTypes,
    hourlyTiers: service.hourlyTiers ?? defaults.hourlyTiers,
    hourlyRate: service.hourlyRate ?? defaults.hourlyRate,
    roomTypes: service.roomTypes ?? defaults.roomTypes,
    addOns: service.addOns ?? defaults.addOns,
    frequencyMultipliers: service.frequencyMultipliers ?? defaults.frequencyMultipliers,
    customFees: service.customFees ?? defaults.customFees,
  };
}

// =========================
// MAIN COMPONENT
// =========================
// ServiceConfigForm is the global configuration UI for all company services.
// It supports all advanced pricing models, RUT/ROT, VAT, labor/material, add-ons, frequency, and custom fees.
// The form builder will only select from these services; all pricing logic is defined here.
export default function ServiceConfigForm({ initialConfig, onChange, onSave }) {
  // -------------------------
  // STATE
  // -------------------------
  // config: the full company configuration (all services)
  const [config, setConfig] = useState({
    services: (initialConfig?.services || []).map(hydrateService),
    universalVAT: initialConfig?.universalVAT || 0.25, // Default 25% VAT
    ...initialConfig,
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [expandedServices, setExpandedServices] = useState(new Set());
  const [savingServices, setSavingServices] = useState(new Set());

  // Toggle service expansion
  const toggleService = (serviceId) => {
    const newExpanded = new Set(expandedServices);
    if (newExpanded.has(serviceId)) {
      newExpanded.delete(serviceId);
    } else {
      newExpanded.add(serviceId);
    }
    setExpandedServices(newExpanded);
  };

  // --- Service Management Handlers ---
  // Add a new service
  const addService = () => {
    const newService = newServiceTemplate();
    const updated = { ...config, services: [...config.services, newService] };
    setConfig(updated);
    if (onChange) onChange(updated);
    // Auto-expand the new service
    setExpandedServices(new Set([...expandedServices, newService.id]));
  };

  // Delete a service
  const deleteService = (serviceId) => {
    const updated = { ...config, services: config.services.filter(s => s.id !== serviceId) };
    setConfig(updated);
    if (onChange) onChange(updated);
    // Remove from expanded set
    const newExpanded = new Set(expandedServices);
    newExpanded.delete(serviceId);
    setExpandedServices(newExpanded);
  };

  // Update a service in the list
  const updateService = (serviceId, updates) => {
    const updated = {
      ...config,
      services: config.services.map(s => s.id === serviceId ? { ...s, ...updates } : s)
    };
    setConfig(updated);
    if (onChange) onChange(updated);
  };

  // Update universal VAT
  const updateUniversalVAT = (vat) => {
    const updated = { ...config, universalVAT: vat };
    setConfig(updated);
    if (onChange) onChange(updated);
  };

  // Save individual service
  const handleSaveService = async (serviceId) => {
    if (onSave) {
      const newSavingServices = new Set(savingServices);
      newSavingServices.add(serviceId);
      setSavingServices(newSavingServices);
      
      try {
        await onSave(config);
        // Remove from saving set after success
        const updatedSavingServices = new Set(savingServices);
        updatedSavingServices.delete(serviceId);
        setSavingServices(updatedSavingServices);
      } catch (error) {
        console.error('Error saving service:', error);
        // Remove from saving set even on error
        const updatedSavingServices = new Set(savingServices);
        updatedSavingServices.delete(serviceId);
        setSavingServices(updatedSavingServices);
      }
    }
  };

  // Save handler
  const handleSave = async () => {
    if (onSave) {
      setSaving(true);
      setSaveMessage('');
      try {
        await onSave(config);
        setSaveMessage('Services saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000); // Clear message after 3 seconds
      } catch (error) {
        console.error('Error saving services:', error);
        setSaveMessage('Error saving services. Please try again.');
        setTimeout(() => setSaveMessage(''), 5000); // Clear error message after 5 seconds
      } finally {
        setSaving(false);
      }
    }
  };

  // -------------------------
  // EFFECTS & HANDLERS (to be implemented)
  // -------------------------
  // Here we will add logic for adding/removing/editing services, tiers, add-ons, etc.
  // Also, live preview and validation will be implemented in next steps.

  // -------------------------
  // PLACEHOLDER UI (for scaffolding)
  // -------------------------
  // This section will be replaced with the full modular UI as we build out each feature.
  // --- UI for Service List ---
  // Hydrate services before rendering (in case config changes after mount)
  const hydratedServices = config.services.map(hydrateService).filter(s => s && s.id);
  // Compute validation errors for each service
  const serviceErrors = {};
  hydratedServices.forEach(service => {
    serviceErrors[service.id] = validateService(service);
  });
  
  // Debug logging
  console.log('ServiceConfigForm rendering with services:', hydratedServices);
  
  return (
    <div className="space-y-6">
      {/* Universal VAT Setting */}
      <Card>
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-4">Global Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label value="Universal VAT Rate (%)" />
              <TextInput
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={(config.universalVAT * 100).toFixed(2)}
                onChange={e => updateUniversalVAT(parseFloat(e.target.value) / 100)}
                placeholder="25"
              />
              <p className="text-sm text-gray-500 mt-1">
                Applied to service charges, add-ons, and extra charges
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Services</h2>
          <div className="flex gap-2">
            <Button color="success" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : '💾 Save All Services'}
            </Button>
            <Button color="primary" onClick={addService}>
              <PlusIcon className="h-4 w-4 mr-1" /> Add Service
            </Button>
          </div>
        </div>
        {saveMessage && (
          <Alert color={saveMessage.includes('Error') ? 'failure' : 'success'} className="mb-4">
            {saveMessage}
          </Alert>
        )}
        {/* Services with collapsible panels */}
        <div className="space-y-4">
          {hydratedServices.filter(s => s && typeof s === 'object' && s.id).length === 0 && (
            <div className="text-gray-500 text-center py-8">No services configured yet.</div>
          )}
          {hydratedServices
            .filter(s => s && typeof s === 'object' && s.id)
            .map((service, idx) => {
              console.log('Rendering service panel for service:', service.id, service);
              console.log('Service name:', service.name || 'Unnamed Service');
              const isExpanded = expandedServices.has(service.id);
              const isSaving = savingServices.has(service.id);
              return (
                <div key={service.id} className="border border-gray-200 rounded-lg bg-white">
                  {/* Service Header - Always Visible */}
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleService(service.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-lg">{service.name || `Service #${idx + 1}`}</h3>
                      <Badge color={service.pricingModel ? 'success' : 'warning'}>
                        {service.pricingModel || 'No pricing model'}
                      </Badge>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        size="xs" 
                        color="success" 
                        onClick={() => handleSaveService(service.id)}
                        disabled={isSaving}
                      >
                        {isSaving ? 'Saving...' : '💾 Save'}
                      </Button>
                      <Button size="xs" color="failure" onClick={() => deleteService(service.id)}>
                        <TrashIcon className="h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>

                  {/* Service Content - Collapsible */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 p-4 space-y-4">
                      {/* Basic Service Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label value="Service Name" />
                          <TextInput
                            value={service.name || ''}
                            onChange={e => updateService(service.id, { name: e.target.value })}
                            placeholder="e.g. Standard Cleaning"
                          />
                        </div>
                        <div>
                          <Label value="Pricing Model" />
                          <Select
                            value={service.pricingModel || PRICING_MODELS.FIXED_TIER}
                            onChange={e => updateService(service.id, { pricingModel: e.target.value })}
                          >
                            <option value={PRICING_MODELS.FIXED_TIER}>Fixed Tier</option>
                            <option value={PRICING_MODELS.TIERED_MULTIPLIER}>Tiered Multiplier</option>
                            <option value={PRICING_MODELS.UNIVERSAL_MULTIPLIER}>Universal Multiplier</option>
                            <option value={PRICING_MODELS.WINDOW}>Window Cleaning</option>
                            <option value={PRICING_MODELS.HOURLY}>Hourly</option>
                            <option value={PRICING_MODELS.PER_ROOM}>Per Room</option>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label value="Description" />
                        <TextInput
                          value={service.description || ''}
                          onChange={e => updateService(service.id, { description: e.target.value })}
                          placeholder="Service description..."
                        />
                      </div>
                      
                      {/* Pricing model-specific fields */}
                      {service.pricingModel && <PricingModelFields service={service} updateService={updateService} />}
                      {service && <ServiceAdvancedFields service={service} updateService={updateService} />}
                      {serviceErrors[service.id] && Array.isArray(serviceErrors[service.id]) && serviceErrors[service.id].length > 0 && (
                        <Alert color="failure" className="mb-2">
                          <ul className="list-disc pl-5">
                            {serviceErrors[service.id].filter(Boolean).map((err, i) => <li key={i}>{err || ''}</li>)}
                          </ul>
                        </Alert>
                      )}
                      {service && <ServiceLivePreview service={service} />}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </Card>
    </div>
  );
}
// --- END REFACTOR --- 