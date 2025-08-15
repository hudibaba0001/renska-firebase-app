import React from 'react';
import { render, screen } from '@testing-library/react';
import FormBuilderPage from '../pages/FormBuilderPage.jsx';

describe('FormBuilderPage', () => {
  it('renders Create Calculator step by default', () => {
    render(<FormBuilderPage />);
    expect(screen.getByText(/Create Calculator/i)).toBeInTheDocument();
  });
  // Add more tests for step navigation and validation
}); 