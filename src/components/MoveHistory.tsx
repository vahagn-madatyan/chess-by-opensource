import { useRef, useEffect } from 'react';
import type { MoveHistory as MoveHistoryType } from '../types/game';

interface MoveHistoryProps {
  /** Array of moves to display */
  moves: MoveHistoryType[];
  /** Optional CSS class */
  className?: string;
}

/**
 * Formats move notation for display.
 * Converts standard algebraic notation to a cleaner display format.
 */
function formatMoveNotation(notation: string): string {
  // Remove any leading/trailing whitespace
  return notation.trim();
}

/**
 * Scrollable move history panel showing moves in "N. white black" format.
 * Auto-scrolls to show the most recent moves.
 */
export function MoveHistory({ moves, className = '' }: MoveHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when moves change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves]);

  // Group moves into pairs (white and black)
  const movePairs: Array<{ moveNumber: number; white: MoveHistoryType | null; black: MoveHistoryType | null }> = [];
  
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: moves[i] || null,
      black: moves[i + 1] || null,
    });
  }

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`} data-testid="move-history">
      <h3 className="text-gray-300 text-sm font-medium mb-3">Move History</h3>
      
      <div 
        ref={scrollRef}
        className="h-32 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700"
        data-testid="move-history-scroll"
      >
        {moves.length === 0 ? (
          <span className="text-gray-500 text-sm italic">No moves yet</span>
        ) : (
          <div className="space-y-1">
            {movePairs.map((pair) => (
              <div 
                key={pair.moveNumber}
                className="flex items-center gap-2 font-mono text-sm"
                data-testid={`move-pair-${pair.moveNumber}`}
              >
                {/* Move number */}
                <span className="text-gray-500 w-8 text-right select-none">
                  {pair.moveNumber}.
                </span>
                
                {/* White's move */}
                <span 
                  className="text-gray-200 min-w-[60px]"
                  data-testid={`move-white-${pair.moveNumber}`}
                >
                  {pair.white ? formatMoveNotation(pair.white.notation) : '...'}
                </span>
                
                {/* Black's move */}
                <span 
                  className="text-gray-400 min-w-[60px]"
                  data-testid={`move-black-${pair.moveNumber}`}
                >
                  {pair.black ? formatMoveNotation(pair.black.notation) : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MoveHistory;
