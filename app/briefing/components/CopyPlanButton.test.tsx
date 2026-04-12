import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CopyPlanButton } from './CopyPlanButton';

describe('CopyPlanButton', () => {
  const writeTextMock = vi.fn();
  const originalClipboard = Object.getOwnPropertyDescriptor(window.navigator, 'clipboard');

  beforeEach(() => {
    writeTextMock.mockReset();
    writeTextMock.mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    if (originalClipboard) {
      Object.defineProperty(window.navigator, 'clipboard', originalClipboard);
    }
  });

  it('writes the plan text to the clipboard when clicked', async () => {
    render(<CopyPlanButton planText="Today's plan body" />);

    fireEvent.click(screen.getByRole('button', { name: /copy plan/i }));

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith("Today's plan body");
    });
  });

  it('shows a confirmation that is announced to assistive tech', async () => {
    render(<CopyPlanButton planText="plan" />);

    fireEvent.click(screen.getByRole('button', { name: /copy plan/i }));

    const confirmation = await screen.findByRole('status');
    expect(confirmation).toHaveTextContent(/copied to clipboard/i);
  });

  it('shows an error affordance when the clipboard API rejects', async () => {
    writeTextMock.mockRejectedValueOnce(new Error('denied'));
    render(<CopyPlanButton planText="plan" />);

    fireEvent.click(screen.getByRole('button', { name: /copy plan/i }));

    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent(/couldn't copy/i);
  });
});
