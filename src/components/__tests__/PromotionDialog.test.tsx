import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PromotionDialog } from '../PromotionDialog';

describe('PromotionDialog', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <PromotionDialog 
        isOpen={false} 
        color="w" 
        onSelect={vi.fn()} 
        onCancel={vi.fn()} 
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('renders when open', () => {
    render(
      <PromotionDialog 
        isOpen={true} 
        color="w" 
        onSelect={vi.fn()} 
        onCancel={vi.fn()} 
      />
    );
    
    expect(screen.getByTestId('promotion-dialog')).toBeInTheDocument();
    expect(screen.getByText('Promote Pawn')).toBeInTheDocument();
  });

  it('displays all four piece options', () => {
    render(
      <PromotionDialog 
        isOpen={true} 
        color="w" 
        onSelect={vi.fn()} 
        onCancel={vi.fn()} 
      />
    );
    
    expect(screen.getByTestId('promotion-q')).toBeInTheDocument();
    expect(screen.getByTestId('promotion-r')).toBeInTheDocument();
    expect(screen.getByTestId('promotion-b')).toBeInTheDocument();
    expect(screen.getByTestId('promotion-n')).toBeInTheDocument();
    
    expect(screen.getByText('Queen')).toBeInTheDocument();
    expect(screen.getByText('Rook')).toBeInTheDocument();
    expect(screen.getByText('Bishop')).toBeInTheDocument();
    expect(screen.getByText('Knight')).toBeInTheDocument();
  });

  it('calls onSelect with piece type when piece clicked', () => {
    const onSelect = vi.fn();
    render(
      <PromotionDialog 
        isOpen={true} 
        color="w" 
        onSelect={onSelect} 
        onCancel={vi.fn()} 
      />
    );
    
    fireEvent.click(screen.getByTestId('promotion-q'));
    expect(onSelect).toHaveBeenCalledWith('q');
    
    fireEvent.click(screen.getByTestId('promotion-r'));
    expect(onSelect).toHaveBeenCalledWith('r');
    
    fireEvent.click(screen.getByTestId('promotion-b'));
    expect(onSelect).toHaveBeenCalledWith('b');
    
    fireEvent.click(screen.getByTestId('promotion-n'));
    expect(onSelect).toHaveBeenCalledWith('n');
  });

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = vi.fn();
    render(
      <PromotionDialog 
        isOpen={true} 
        color="w" 
        onSelect={vi.fn()} 
        onCancel={onCancel} 
      />
    );
    
    fireEvent.click(screen.getByTestId('promotion-cancel'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('has correct accessibility attributes', () => {
    render(
      <PromotionDialog 
        isOpen={true} 
        color="w" 
        onSelect={vi.fn()} 
        onCancel={vi.fn()} 
      />
    );
    
    const dialog = screen.getByTestId('promotion-dialog');
    expect(dialog).toHaveAttribute('role', 'dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    
    expect(screen.getByLabelText('Promote to Queen')).toBeInTheDocument();
    expect(screen.getByLabelText('Promote to Rook')).toBeInTheDocument();
    expect(screen.getByLabelText('Promote to Bishop')).toBeInTheDocument();
    expect(screen.getByLabelText('Promote to Knight')).toBeInTheDocument();
    expect(screen.getByLabelText('Cancel promotion')).toBeInTheDocument();
  });

  it('displays black pieces when color is black', () => {
    render(
      <PromotionDialog 
        isOpen={true} 
        color="b" 
        onSelect={vi.fn()} 
        onCancel={vi.fn()} 
      />
    );
    
    // Black pieces should be rendered (we can't easily test the exact symbols,
    // but we can verify the component renders correctly)
    expect(screen.getByTestId('promotion-q')).toBeInTheDocument();
    expect(screen.getByTestId('promotion-r')).toBeInTheDocument();
    expect(screen.getByTestId('promotion-b')).toBeInTheDocument();
    expect(screen.getByTestId('promotion-n')).toBeInTheDocument();
  });
});
