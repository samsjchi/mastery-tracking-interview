import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusChip } from './StatusChip';

describe('StatusChip', () => {
  it('renders the secure label with an aria-label', () => {
    render(<StatusChip status="secure" />);
    const chip = screen.getByLabelText(/mastery status: secure/i);
    expect(chip).toHaveTextContent('Secure');
  });

  it('renders the developing label', () => {
    render(<StatusChip status="developing" />);
    const chip = screen.getByLabelText(/mastery status: developing/i);
    expect(chip).toHaveTextContent('Developing');
  });

  it('renders "Not yet probed" for not_assessed', () => {
    render(<StatusChip status="not_assessed" />);
    const chip = screen.getByLabelText(/mastery status: not yet probed/i);
    expect(chip).toHaveTextContent(/not yet probed/i);
  });
});
