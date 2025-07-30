import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CustomerForm from '../../crm/forms/CustomerForm';

// Mock the toast notifications
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('CustomerForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields correctly', () => {
    render(
      <CustomerForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        submitLabel="Create Customer"
      />
    );

    // Check for required fields
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/personnummer/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/primary address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/postal code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/customer tags/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/booking frequency/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/consent/i)).toBeInTheDocument();

    // Check for buttons
    expect(screen.getByRole('button', { name: /create customer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('populates form with initial data when provided', () => {
    const initialData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+46701234567',
      personnummer: '198001011234',
      primaryAddress: 'Test Street 123',
      city: 'Stockholm',
      postalCode: '12345',
      customerTags: ['VIP', 'Regular'],
      bookingFrequency: 'weekly',
      consent: true
    };

    render(
      <CustomerForm
        initialData={initialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        submitLabel="Update Customer"
      />
    );

    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('+46701234567')).toBeInTheDocument();
    expect(screen.getByDisplayValue('198001011234')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Street 123')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Stockholm')).toBeInTheDocument();
    expect(screen.getByDisplayValue('12345')).toBeInTheDocument();
    expect(screen.getByDisplayValue('weekly')).toBeInTheDocument();
  });

  it('validates required fields on submit', async () => {
    render(
      <CustomerForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        submitLabel="Create Customer"
      />
    );

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /create customer/i });
    fireEvent.click(submitButton);

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/phone is required/i)).toBeInTheDocument();
      expect(screen.getByText(/personnummer is required/i)).toBeInTheDocument();
      expect(screen.getByText(/primary address is required/i)).toBeInTheDocument();
      expect(screen.getByText(/city is required/i)).toBeInTheDocument();
      expect(screen.getByText(/postal code is required/i)).toBeInTheDocument();
    });

    // onSubmit should not be called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    render(
      <CustomerForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        submitLabel="Create Customer"
      />
    );

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const submitButton = screen.getByRole('button', { name: /create customer/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates phone number format', async () => {
    render(
      <CustomerForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        submitLabel="Create Customer"
      />
    );

    const phoneInput = screen.getByLabelText(/phone/i);
    fireEvent.change(phoneInput, { target: { value: '123' } });

    const submitButton = screen.getByRole('button', { name: /create customer/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/phone number must be at least 10 digits/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates personnummer format', async () => {
    render(
      <CustomerForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        submitLabel="Create Customer"
      />
    );

    const personnummerInput = screen.getByLabelText(/personnummer/i);
    fireEvent.change(personnummerInput, { target: { value: '123' } });

    const submitButton = screen.getByRole('button', { name: /create customer/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/personnummer must be 12 digits/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    render(
      <CustomerForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        submitLabel="Create Customer"
      />
    );

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '+46701234567' } });
    fireEvent.change(screen.getByLabelText(/personnummer/i), { target: { value: '198001011234' } });
    fireEvent.change(screen.getByLabelText(/primary address/i), { target: { value: 'Test Street 123' } });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Stockholm' } });
    fireEvent.change(screen.getByLabelText(/postal code/i), { target: { value: '12345' } });
    
    // Check consent checkbox
    const consentCheckbox = screen.getByLabelText(/consent/i);
    fireEvent.click(consentCheckbox);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create customer/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+46701234567',
          personnummer: '198001011234',
          primaryAddress: 'Test Street 123',
          city: 'Stockholm',
          postalCode: '12345',
          consent: true
        })
      );
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <CustomerForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        submitLabel="Create Customer"
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('handles customer tags input correctly', async () => {
    render(
      <CustomerForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        submitLabel="Create Customer"
      />
    );

    const tagsInput = screen.getByLabelText(/customer tags/i);
    fireEvent.change(tagsInput, { target: { value: 'VIP, Regular, Premium' } });

    // Fill other required fields
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '+46701234567' } });
    fireEvent.change(screen.getByLabelText(/personnummer/i), { target: { value: '198001011234' } });
    fireEvent.change(screen.getByLabelText(/primary address/i), { target: { value: 'Test Street 123' } });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Stockholm' } });
    fireEvent.change(screen.getByLabelText(/postal code/i), { target: { value: '12345' } });
    
    const consentCheckbox = screen.getByLabelText(/consent/i);
    fireEvent.click(consentCheckbox);

    const submitButton = screen.getByRole('button', { name: /create customer/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          customerTags: ['VIP', 'Regular', 'Premium']
        })
      );
    });
  });

  it('handles RUT/ROT eligibility toggle', async () => {
    render(
      <CustomerForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        submitLabel="Create Customer"
      />
    );

    const rutToggle = screen.getByLabelText(/rut\/rot eligible/i);
    fireEvent.click(rutToggle);

    // Fill other required fields
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '+46701234567' } });
    fireEvent.change(screen.getByLabelText(/personnummer/i), { target: { value: '198001011234' } });
    fireEvent.change(screen.getByLabelText(/primary address/i), { target: { value: 'Test Street 123' } });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Stockholm' } });
    fireEvent.change(screen.getByLabelText(/postal code/i), { target: { value: '12345' } });
    
    const consentCheckbox = screen.getByLabelText(/consent/i);
    fireEvent.click(consentCheckbox);

    const submitButton = screen.getByRole('button', { name: /create customer/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          rutRotEligible: true
        })
      );
    });
  });
}); 