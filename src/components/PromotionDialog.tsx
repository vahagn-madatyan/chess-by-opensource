import { useCallback } from 'react';

interface PromotionDialogProps {
  isOpen: boolean;
  color: 'w' | 'b';
  onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void;
  onCancel: () => void;
}

/**
 * Piece symbols for display
 */
const PIECE_SYMBOLS: Record<string, { symbol: string; name: string }> = {
  q: { symbol: '♛', name: 'Queen' },
  r: { symbol: '♜', name: 'Rook' },
  b: { symbol: '♝', name: 'Bishop' },
  n: { symbol: '♞', name: 'Knight' },
  Q: { symbol: '♕', name: 'Queen' },
  R: { symbol: '♖', name: 'Rook' },
  B: { symbol: '♗', name: 'Bishop' },
  N: { symbol: '♘', name: 'Knight' },
};

/**
 * Dialog for selecting promotion piece when a pawn reaches the last rank.
 * Displays queen, rook, bishop, and knight options.
 */
export function PromotionDialog({ isOpen, color, onSelect, onCancel }: PromotionDialogProps) {
  const handleSelect = useCallback((piece: 'q' | 'r' | 'b' | 'n') => {
    onSelect(piece);
  }, [onSelect]);

  if (!isOpen) return null;

  const pieces: Array<{ key: 'q' | 'r' | 'b' | 'n'; symbol: string; name: string }> = [
    { key: 'q', symbol: color === 'w' ? PIECE_SYMBOLS.Q.symbol : PIECE_SYMBOLS.q.symbol, name: 'Queen' },
    { key: 'r', symbol: color === 'w' ? PIECE_SYMBOLS.R.symbol : PIECE_SYMBOLS.r.symbol, name: 'Rook' },
    { key: 'b', symbol: color === 'w' ? PIECE_SYMBOLS.B.symbol : PIECE_SYMBOLS.b.symbol, name: 'Bishop' },
    { key: 'n', symbol: color === 'w' ? PIECE_SYMBOLS.N.symbol : PIECE_SYMBOLS.n.symbol, name: 'Knight' },
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      data-testid="promotion-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="promotion-title"
    >
      <div className="bg-amber-100 rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 border-4 border-amber-800">
        <h2 
          id="promotion-title" 
          className="text-xl font-bold text-amber-900 text-center mb-4"
        >
          Promote Pawn
        </h2>
        <p className="text-amber-800 text-center mb-6">
          Your pawn has reached the last rank! Choose a piece to promote to:
        </p>
        
        <div className="grid grid-cols-4 gap-3 mb-4">
          {pieces.map(({ key, symbol, name }) => (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className="aspect-square flex flex-col items-center justify-center p-3 bg-white rounded-lg border-2 border-amber-300 hover:border-amber-600 hover:bg-amber-50 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label={`Promote to ${name}`}
              data-testid={`promotion-${key}`}
            >
              <span className={`text-4xl ${color === 'w' ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]' : 'text-gray-900'}`}>
                {symbol}
              </span>
              <span className="text-xs text-amber-900 mt-1 font-medium">{name}</span>
            </button>
          ))}
        </div>
        
        <button
          onClick={onCancel}
          className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          aria-label="Cancel promotion"
          data-testid="promotion-cancel"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default PromotionDialog;
