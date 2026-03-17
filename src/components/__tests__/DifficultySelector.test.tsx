import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DifficultySelector } from '../DifficultySelector';

describe('DifficultySelector', () => {
  it('renders with initial value', () => {
    render(<DifficultySelector value={10} onChange={() => {}} />);
    
    expect(screen.getByTestId('difficulty-selector')).toBeInTheDocument();
    expect(screen.getByTestId('difficulty-slider')).toHaveValue('10');
    expect(screen.getByTestId('difficulty-label')).toHaveTextContent('Intermediate');
  });

  it('displays correct difficulty labels', () => {
    const { rerender } = render(<DifficultySelector value={0} onChange={() => {}} />);
    expect(screen.getByTestId('difficulty-label')).toHaveTextContent('Beginner');

    rerender(<DifficultySelector value={5} onChange={() => {}} />);
    expect(screen.getByTestId('difficulty-label')).toHaveTextContent('Casual');

    rerender(<DifficultySelector value={10} onChange={() => {}} />);
    expect(screen.getByTestId('difficulty-label')).toHaveTextContent('Intermediate');

    rerender(<DifficultySelector value={15} onChange={() => {}} />);
    expect(screen.getByTestId('difficulty-label')).toHaveTextContent('Advanced');

    rerender(<DifficultySelector value={20} onChange={() => {}} />);
    expect(screen.getByTestId('difficulty-label')).toHaveTextContent('Master');
  });

  it('calls onChange when slider value changes (debounced)', async () => {
    const onChange = vi.fn();
    render(<DifficultySelector value={10} onChange={onChange} />);
    
    const slider = screen.getByTestId('difficulty-slider');
    fireEvent.change(slider, { target: { value: '15' } });
    
    // Should not call immediately due to debounce
    expect(onChange).not.toHaveBeenCalled();
    
    // Wait for debounce
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(15);
    }, { timeout: 500 });
  });

  it('debounces rapid changes', async () => {
    const onChange = vi.fn();
    render(<DifficultySelector value={10} onChange={onChange} />);
    
    const slider = screen.getByTestId('difficulty-slider');
    
    // Rapid changes
    fireEvent.change(slider, { target: { value: '12' } });
    fireEvent.change(slider, { target: { value: '14' } });
    fireEvent.change(slider, { target: { value: '16' } });
    
    // Wait for debounce
    await waitFor(() => {
      // Should only be called once with the final value
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(16);
    }, { timeout: 500 });
  });

  it('disables slider when disabled prop is true', () => {
    render(<DifficultySelector value={10} onChange={() => {}} disabled />);
    
    expect(screen.getByTestId('difficulty-slider')).toBeDisabled();
  });

  it('updates when value prop changes externally', () => {
    const { rerender } = render(<DifficultySelector value={5} onChange={() => {}} />);
    expect(screen.getByTestId('difficulty-slider')).toHaveValue('5');
    
    rerender(<DifficultySelector value={15} onChange={() => {}} />);
    expect(screen.getByTestId('difficulty-slider')).toHaveValue('15');
  });

  it('shows level number', () => {
    render(<DifficultySelector value={12} onChange={() => {}} />);
    
    expect(screen.getByText('Level 12')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<DifficultySelector value={10} onChange={() => {}} className="custom-class" />);
    
    expect(screen.getByTestId('difficulty-selector')).toHaveClass('custom-class');
  });
});
