import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EvidencePanel } from './EvidencePanel';

describe('EvidencePanel', () => {
  it('renders the quote text and the AI note', () => {
    render(
      <EvidencePanel
        evidence={[
          {
            id: 'e1',
            selected_text: '713.',
            note: 'Place value misconception surfaced.',
            transcript_anchor: '#problem-p1',
          },
        ]}
      />,
    );

    expect(screen.getByText(/713\./)).toBeInTheDocument();
    expect(screen.getByText(/place value misconception/i)).toBeInTheDocument();
  });

  it('anchors the quote to the transcript via href="#problem-..."', () => {
    render(
      <EvidencePanel
        evidence={[
          {
            id: 'e1',
            selected_text: 'stuff',
            note: 'a note',
            transcript_anchor: '#problem-p2',
          },
        ]}
      />,
    );

    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toMatch(/^#problem-/);
    expect(link.getAttribute('href')).toBe('#problem-p2');
  });

  it('falls back to #problem-p1 when the quote has no explicit anchor', () => {
    render(
      <EvidencePanel
        evidence={[
          {
            id: 'e1',
            selected_text: 'stuff',
            note: 'a note',
          },
        ]}
      />,
    );

    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toMatch(/^#problem-/);
  });

  it('shows an empty state when no evidence is provided', () => {
    render(<EvidencePanel evidence={[]} />);
    expect(screen.getByText(/no quotes from last session yet/i)).toBeInTheDocument();
  });
});
