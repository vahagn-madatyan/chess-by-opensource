import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UndoButton } from '../UndoButton';

describe('UndoButton', () => {
  it('renders with undo icon and text', () => {
    render(<UndoButton onClick={() => {}} />);
    
    const button = screen.getByTestId('undo-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Undo');
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<UndoButton onClick={onClick} />);
    
    fireEvent.click(screen.getByTestId('undo-button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    const onClick = vi.fn();
    render(<UndoButton onClick={onClick} disabled />);
    
    const button = screen.getByTestId('undo-button');
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<UndoButton onClick={() => {}} className="custom-class" />);
    
    expect(screen.getByTestId('undo-button')).toHaveClass('custom-class');
  });

  it('has correct aria label', () => {
    render(<UndoButton onClick={() => {}} />);
    
    expect(screen.getByLabelText('Undo last move')).toBeInTheDocument();
  });

  it('has amber styling classes', () => {
    render(<UndoButton onClick={() => {}} />);
    
    const button = screen.getByTestId('undo-button');
    expect(button).toHaveClass('bg-amber-700');
  });

  it('has disabled styling when disabled', () => {
    render(<UndoButton onClick={() => {}} disabled />);
    
    const button = screen.getByTestId('undo-button');
    expect(button).toHaveClass('disabled:bg-gray-700');
  });
});
