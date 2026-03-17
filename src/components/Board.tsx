import { Square } from './Square';
import { useBoardState } from '../hooks/useBoardState';
import { STARTING_POSITION_FEN, getSquareNotation } from '../utils/fen';


interface BoardProps {
  /** FEN string for initial position. Defaults to standard starting position */
  initialFen?: string;
  /** Callback fired when any square is clicked, receives square notation (e.g., "e4") */
  onSquareClick?: (square: string) => void;
  /** Optional CSS class for the board container */
  className?: string;
}

/**
 * Chess board component
 * Renders an 8x8 grid with click-to-move interaction
 * Board is oriented with white pieces at the bottom (ranks 1-2)
 */
export function Board({ 
  initialFen = STARTING_POSITION_FEN, 
  onSquareClick,
  className = '' 
}: BoardProps) {
  const { board, handleSquareClick, isSquareSelected } = useBoardState({
    initialFen,
    onSquareClick,
  });

  return (
    <div 
      className={`aspect-square w-full max-w-[600px] ${className}`}
      data-testid="chess-board"
    >
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full border-4 border-gray-800">
        {board.map((rank, rowIndex) =>
          rank.map((piece, colIndex) => {
            const square = getSquareNotation(rowIndex, colIndex);
            // Light squares are when (row + col) is even
            const isLight = (rowIndex + colIndex) % 2 === 0;
            const isSelected = isSquareSelected(square);

            return (
              <Square
                key={square}
                square={square}
                piece={piece}
                isLight={isLight}
                isSelected={isSelected}
                onClick={handleSquareClick}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

export default Board;
