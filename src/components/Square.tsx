import type { Piece as PieceType } from '../types/chess';
import { Piece } from './Piece';

interface SquareProps {
  square: string;
  piece: PieceType | null;
  isLight: boolean;
  isSelected: boolean;
  onClick: (square: string) => void;
}

/**
 * Chess board square component
 * Renders a single square with optional piece and selection state
 */
export function Square({ square, piece, isLight, isSelected, onClick }: SquareProps) {
  const handleClick = () => {
    onClick(square);
  };

  const baseClasses = 'w-full h-full flex items-center justify-center p-1';
  const colorClasses = isLight ? 'bg-amber-200' : 'bg-amber-700';
  const selectionClasses = isSelected ? 'ring-4 ring-blue-400 ring-inset' : '';

  return (
    <button
      className={`${baseClasses} ${colorClasses} ${selectionClasses}`}
      onClick={handleClick}
      aria-label={`Square ${square}${piece ? ` with ${piece.color} ${piece.type}` : ''}${isSelected ? ' selected' : ''}`}
      data-square={square}
      data-selected={isSelected}
    >
      {piece && <Piece type={piece.type} color={piece.color} />}
    </button>
  );
}

export default Square;
