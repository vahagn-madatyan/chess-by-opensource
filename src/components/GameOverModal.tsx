import { useCallback } from 'react';

interface GameOverModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Game result: win, loss, or draw */
  result: 'win' | 'loss' | 'draw' | null;
  /** Reason for game end */
  reason: string;
  /** Called when new game button is clicked */
  onNewGame: () => void;
  /** Optional CSS class */
  className?: string;
}

/**
 * Result display configuration
 */
const RESULT_CONFIG: Record<string, { title: string; emoji: string; colorClass: string }> = {
  win: { 
    title: 'Victory!', 
    emoji: '👑', 
    colorClass: 'text-green-600' 
  },
  loss: { 
    title: 'Defeat', 
    emoji: '💔', 
    colorClass: 'text-red-600' 
  },
  draw: { 
    title: 'Draw', 
    emoji: '🤝', 
    colorClass: 'text-amber-600' 
  },
};

/**
 * Game over modal dialog showing the result and reason.
 * Follows the same styling pattern as PromotionDialog.
 */
export function GameOverModal({ 
  isOpen, 
  result, 
  reason, 
  onNewGame,
  className = '' 
}: GameOverModalProps) {
  const handleNewGame = useCallback(() => {
    onNewGame();
  }, [onNewGame]);

  if (!isOpen || !result) return null;

  const config = RESULT_CONFIG[result];

  return (
    <div 
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${className}`}
      data-testid="game-over-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-over-title"
    >
      <div className="bg-amber-100 rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 border-4 border-amber-800">
        {/* Header with result */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-3" role="img" aria-label={config.title}>
            {config.emoji}
          </div>
          <h2 
            id="game-over-title" 
            className={`text-3xl font-bold ${config.colorClass}`}
          >
            {config.title}
          </h2>
        </div>
        
        {/* Reason */}
        <p className="text-amber-800 text-center mb-2 text-lg">
          {reason}
        </p>
        <p className="text-amber-700 text-center mb-8 text-sm">
          {getResultDescription(result, reason)}
        </p>
        
        {/* New Game button */}
        <button
          onClick={handleNewGame}
          className="w-full py-3 px-4 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold text-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-amber-100"
          aria-label="Start new game"
          data-testid="new-game-button"
        >
          New Game
        </button>
      </div>
    </div>
  );
}

/**
 * Get a descriptive message based on result and reason
 */
function getResultDescription(result: 'win' | 'loss' | 'draw', reason: string): string {
  if (result === 'win') {
    return 'Congratulations! You played a great game.';
  } else if (result === 'loss') {
    return 'Better luck next time. Keep practicing!';
  } else {
    if (reason.toLowerCase().includes('stalemate')) {
      return 'The game ended in a stalemate with no legal moves available.';
    }
    return 'The game ended in a draw.';
  }
}

export default GameOverModal;
