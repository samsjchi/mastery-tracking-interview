import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SubSkillCard } from './SubSkillCard';

describe('SubSkillCard', () => {
  it('shows the sub-skill name, status chip, and both evidence quotes inline', () => {
    render(
      <SubSkillCard
        snapshot={{
          id: '2.NBT.ADD.3',
          name: 'Add within 100 using place value strategies',
          status: 'developing',
          evidence_count: 2,
        }}
        evidence={[
          { id: 'e1', selected_text: '713.', note: 'misconception' },
          { id: 'e2', selected_text: '59', note: 'recovered' },
        ]}
      />,
    );

    expect(screen.getByRole('heading', { level: 4, name: /add within 100/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/mastery status: developing/i)).toBeInTheDocument();
    // Both evidence items are rendered — the count line is gone because
    // the quotes themselves are visible and countable.
    expect(screen.getByText(/misconception/i)).toBeInTheDocument();
    expect(screen.getByText(/recovered/i)).toBeInTheDocument();
  });

  it('always renders the evidence inline when evidence is present', () => {
    render(
      <SubSkillCard
        snapshot={{
          id: '2.NBT.ADD.3',
          name: 'Add within 100',
          status: 'developing',
          evidence_count: 1,
        }}
        evidence={[{ id: 'e1', selected_text: '713.', note: 'Place value misconception.' }]}
      />,
    );

    // No show/hide toggle — evidence is visible immediately.
    expect(screen.queryByRole('button', { name: /show evidence/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /hide evidence/i })).toBeNull();
    expect(screen.getByText(/place value misconception/i)).toBeInTheDocument();
    expect(screen.getByText(/713\./)).toBeInTheDocument();
  });

it('renders cleanly with just a header when evidence is absent', () => {
    render(
      <SubSkillCard
        snapshot={{
          id: '2.NBT.ADD.1',
          name: 'Understand hundreds, tens, and ones',
          status: 'not_assessed',
          evidence_count: 0,
        }}
        evidence={[]}
      />,
    );

    // Heading + chip render; no evidence panel, no count line, no
    // placeholder "no quotes" copy now that the count line is gone.
    expect(screen.getByRole('heading', { level: 4, name: /hundreds/i })).toBeInTheDocument();
    expect(screen.queryByText(/quotes/i)).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('shows a low-confidence chip next to the status chip when confidence is below the threshold', () => {
    render(
      <SubSkillCard
        snapshot={{
          id: '2.NBT.ADD.3',
          name: 'Add within 100',
          status: 'developing',
          evidence_count: 2,
          confidence: 0.55,
        }}
        evidence={[{ id: 'e1', selected_text: 'x', note: 'y' }]}
      />,
    );

    // Visible text is the short "Double-check" label; the full
    // "isn't sure here" hint lives in the aria-label + title.
    expect(screen.getByText(/double-check/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/isn't sure here/i)).toBeInTheDocument();
  });

  it('shows a quiet high-confidence glyph when confidence is at or above the high threshold', () => {
    render(
      <SubSkillCard
        snapshot={{
          id: '2.NBT.ADD.7',
          name: 'Explain strategies using place value language',
          status: 'developing',
          evidence_count: 1,
          confidence: 0.9,
        }}
        evidence={[{ id: 'e1', selected_text: 'x', note: 'y' }]}
      />,
    );

    // Visible text pill (mirrors the low-confidence "Double-check" pill);
    // full sentence lives in aria-label + title for screen readers and hover.
    expect(screen.getByText(/ai confident/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confident in this read/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/isn't sure here/i)).toBeNull();
  });

  it('shows neither confidence signal for scores in the middle band', () => {
    render(
      <SubSkillCard
        snapshot={{
          id: '2.NBT.ADD.3',
          name: 'Add within 100',
          status: 'developing',
          evidence_count: 2,
          confidence: 0.75,
        }}
        evidence={[{ id: 'e1', selected_text: 'x', note: 'y' }]}
      />,
    );

    expect(screen.queryByLabelText(/isn't sure here/i)).toBeNull();
    expect(screen.queryByLabelText(/confident in this read/i)).toBeNull();
  });

  it('does not show any confidence signal when the analyzer omitted the score', () => {
    render(
      <SubSkillCard
        snapshot={{
          id: '2.NBT.ADD.1',
          name: 'Hundreds, tens, ones',
          status: 'not_assessed',
          evidence_count: 0,
        }}
        evidence={[]}
      />,
    );

    expect(screen.queryByLabelText(/isn't sure here/i)).toBeNull();
    expect(screen.queryByLabelText(/confident in this read/i)).toBeNull();
  });
});
