import { useState, useEffect, useCallback, useRef } from 'react';
import { Board } from './Board';
import { PromotionDialog } from './PromotionDialog';
import { GameOverModal } from './GameOverModal';
import { DifficultySelector } from './DifficultySelector';
import { UndoButton } from './UndoButton';
import { MoveHistory } from './MoveHistory';
import { useChessGame } from '../hooks/useChessGame';
import { ChessEngine, getChessEngine } from '../engine/ChessEngine';

interface GameProps {
  /** Player color - white or black */
  playerColor?: 'w' | 'b';
  /** Engine skill level (0-20) */
  engineSkill?: number;
  /** Engine timeout in milliseconds */
  engineTimeoutMs?: number;
  /** Initial FEN position */
  initialFen?: string;
  /** Called when game ends */
  onGameOver?: (result: 'win' | 'loss' | 'draw', reason: string) => void;
  /** Optional CSS class */
  className?: string;
}

/**
 * Main game component that orchestrates the chess board, game logic, and AI engine.
 * Handles player moves, AI responses, promotion dialogs, and game state.
 */
export function Game({ 
  playerColor = 'w', 
  engineSkill = 10, 
  engineTimeoutMs = 2000,
  initialFen,
  onGameOver,
  className = ''
}: GameProps) {
  // Engine instance
  const [engine, setEngine] = useState<ChessEngine | null>(null);
  const [engineReady, setEngineReady] = useState(false);
  const engineInitRef = useRef(false);
  
  // Initialize engine on mount
  useEffect(() => {
    if (engineInitRef.current) return;
    engineInitRef.current = true;
    
    const initEngine = async () => {
      const chessEngine = getChessEngine();
      try {
        await chessEngine.init();
        setEngine(chessEngine);
        setEngineReady(true);
        console.log('[Game] Engine initialized successfully');
      } catch (error) {
        console.error('[Game] Failed to initialize engine:', error);
      }
    };
    
    initEngine();
    
    // Cleanup on unmount
    return () => {
      // Don't terminate on unmount - engine is singleton
    };
  }, []);
  
  // Game hook
  const {
    gameState,
    selectedSquare,
    error,
    isThinking,
    makeMove,
    resetGame,
    undoMove,
    selectSquare,
    clearSelection,
    isLegalMove,
    getLegalMovesFrom,
    getPieceAt,
    pendingPromotion,
    cancelPromotion,
    completePromotion,
    setEngineSkill: updateEngineSkill,
  } = useChessGame({
    initialFen,
    engine: engineReady ? engine : null,
    playerColor,
    engineSkill,
    engineTimeoutMs,
  });
  
  // Handle game over
  useEffect(() => {
    if (gameState.isGameOver && onGameOver) {
      let result: 'win' | 'loss' | 'draw';
      let reason: string;
      
      if (gameState.isCheckmate) {
        // If it's white's turn, black won, and vice versa
        const winner = gameState.turn === 'w' ? 'b' : 'w';
        result = winner === playerColor ? 'win' : 'loss';
        reason = 'Checkmate';
      } else if (gameState.isStalemate) {
        result = 'draw';
        reason = 'Stalemate';
      } else if (gameState.isDraw) {
        result = 'draw';
        reason = 'Draw';
      } else {
        return; // Unknown state, don't call onGameOver
      }
      
      onGameOver(result, reason);
    }
  }, [gameState.isGameOver, gameState.isCheckmate, gameState.isStalemate, gameState.isDraw, gameState.turn, playerColor, onGameOver]);
  
  // Handle square click
  const handleSquareClick = useCallback((square: string) => {
    // Disable interaction while AI is thinking
    if (isThinking) return;
    
    // Disable interaction if it's not player's turn
    if (gameState.turn !== playerColor) return;
    
    if (selectedSquare === null) {
      // First click - select square if it has a piece of player's color
      const piece = getPieceAt(square);
      if (piece && piece.color === playerColor) {
        selectSquare(square);
      }
    } else if (selectedSquare === square) {
      // Clicked same square - deselect
      clearSelection();
    } else {
      // Second click - attempt move
      if (isLegalMove(selectedSquare, square)) {
        const success = makeMove(selectedSquare, square);
        if (!success) {
          // Move failed, clear selection
          clearSelection();
        }
      } else {
        // Illegal move - try selecting new square if it has player's piece
        const piece = getPieceAt(square);
        if (piece && piece.color === playerColor) {
          selectSquare(square);
        } else {
          clearSelection();
        }
      }
    }
  }, [selectedSquare, gameState.turn, playerColor, isThinking, isLegalMove, makeMove, selectSquare, clearSelection, getPieceAt]);
  
  // Determine status message
  const getStatusMessage = (): string => {
    if (isThinking) return 'AI is thinking...';
    if (gameState.isCheckmate) return `Checkmate! ${gameState.turn === 'w' ? 'Black' : 'White'} wins!`;
    if (gameState.isStalemate) return 'Stalemate - Draw!';
    if (gameState.isDraw) return 'Draw!';
    if (gameState.isCheck) return 'Check!';
    if (gameState.turn === playerColor) return 'Your turn';
    return 'AI thinking...';
  };
  
  // Handle difficulty change with debouncing
  const handleDifficultyChange = useCallback((level: number) => {
    updateEngineSkill(level);
  }, [updateEngineSkill]);
  
  // Handle undo click
  const handleUndo = useCallback(() => {
    undoMove();
  }, [undoMove]);
  
  return (
    <div className={`flex flex-col lg:flex-row gap-6 ${className}`} data-testid="game-container">
      {/* Main Board Area */}
      <div className="flex-1 flex flex-col items-center">
        {/* Status bar */}
        <div className="w-full max-w-[600px] flex items-center justify-between px-4 py-2 bg-gray-800 rounded-lg mb-4">
          <div className="text-white font-medium">
            {gameState.turn === 'w' ? "White's turn" : "Black's turn"}
          </div>
          <div className={`text-sm ${isThinking ? 'text-yellow-400' : 'text-gray-300'}`}>
            {getStatusMessage()}
          </div>
          <button
            onClick={resetGame}
            className="px-3 py-1 bg-amber-600 text-white text-sm rounded hover:bg-amber-700 transition-colors"
            data-testid="reset-game-btn"
          >
            New Game
          </button>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="w-full max-w-[600px] px-4 py-2 bg-red-900/50 text-red-200 rounded-lg text-sm mb-4" data-testid="game-error">
            {error}
          </div>
        )}
        
        {/* Board with custom rendering for selection and legal moves */}
        <div className="relative">
          <BoardWithOverlay
            fen={gameState.fen}
            selectedSquare={selectedSquare}
            legalDestinations={selectedSquare ? getLegalMovesFrom(selectedSquare) : []}
            onSquareClick={handleSquareClick}
            disabled={isThinking || gameState.turn !== playerColor}
          />
          
          {/* Thinking overlay */}
          {isThinking && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded">
              <div className="bg-gray-800 px-6 py-4 rounded-lg shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-white font-medium">AI thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Promotion dialog */}
        <PromotionDialog
          isOpen={pendingPromotion !== null}
          color={playerColor}
          onSelect={completePromotion}
          onCancel={cancelPromotion}
        />
      </div>
      
      {/* Sidebar */}
      <div className="w-full lg:w-72 flex flex-col gap-4">
        {/* Game Status Card */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-gray-300 text-sm font-medium mb-2">Game Status</h3>
          <div className="text-white font-medium" data-testid="sidebar-status-message">
            {getStatusMessage()}
          </div>
        </div>
        
        {/* Difficulty Selector */}
        <DifficultySelector
          value={engineSkill}
          onChange={handleDifficultyChange}
          disabled={isThinking || gameState.isGameOver}
        />
        
        {/* Undo Button */}
        <UndoButton
          onClick={handleUndo}
          disabled={isThinking || gameState.moveHistory.length === 0 || gameState.isGameOver}
        />
        
        {/* Move History */}
        <MoveHistory
          moves={gameState.moveHistory}
        />
      </div>
      
      {/* Game Over Modal */}
      <GameOverModal
        isOpen={gameState.isGameOver}
        result={gameState.isCheckmate ? (gameState.turn === 'w' ? 'loss' : 'win') : 
                gameState.isStalemate || gameState.isDraw ? 'draw' : null}
        reason={gameState.isCheckmate ? 'Checkmate' : 
                gameState.isStalemate ? 'Stalemate' : 
                gameState.isDraw ? 'Draw' : ''}
        onNewGame={resetGame}
      />
    </div>
  );
}

/**
 * Board wrapper that adds visual indicators for selected squares and legal moves
 */
interface BoardWithOverlayProps {
  fen: string;
  selectedSquare: string | null;
  legalDestinations: string[];
  onSquareClick: (square: string) => void;
  disabled: boolean;
}

function BoardWithOverlay({ fen, selectedSquare, legalDestinations, onSquareClick, disabled }: BoardWithOverlayProps) {
  // Parse FEN to render board
  const piecePlacement = fen.split(' ')[0];
  const ranks = piecePlacement.split('/');
  
  const pieceTypes: Record<string, { type: string; color: 'w' | 'b' }> = {
    'p': { type: 'pawn', color: 'b' },
    'n': { type: 'knight', color: 'b' },
    'b': { type: 'bishop', color: 'b' },
    'r': { type: 'rook', color: 'b' },
    'q': { type: 'queen', color: 'b' },
    'k': { type: 'king', color: 'b' },
    'P': { type: 'pawn', color: 'w' },
    'N': { type: 'knight', color: 'w' },
    'B': { type: 'bishop', color: 'w' },
    'R': { type: 'rook', color: 'w' },
    'Q': { type: 'queen', color: 'w' },
    'K': { type: 'king', color: 'w' },
  };
  
  const getSquareNotation = (row: number, col: number): string => {
    const file = String.fromCharCode('a'.charCodeAt(0) + col);
    const rank = 8 - row;
    return `${file}${rank}`;
  };
  
  const parseFen = (): (Piece | null)[][] => {
    const board: (Piece | null)[][] = [];
    
    for (const rank of ranks) {
      const row: (Piece | null)[] = [];
      for (const char of rank) {
        if (char >= '1' && char <= '8') {
          const emptyCount = parseInt(char, 10);
          for (let i = 0; i < emptyCount; i++) {
            row.push(null);
          }
        } else {
          const piece = pieceTypes[char];
          if (piece) {
            row.push({ type: piece.type, color: piece.color });
          }
        }
      }
      board.push(row);
    }
    
    return board;
  };
  
  const board = parseFen();
  
  return (
    <div 
      className={`aspect-square w-full max-w-[600px] ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      data-testid="game-board"
    >
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full border-4 border-gray-800">
        {board.map((rank, rowIndex) =>
          rank.map((piece, colIndex) => {
            const square = getSquareNotation(rowIndex, colIndex);
            const isLight = (rowIndex + colIndex) % 2 === 0;
            const isSelected = selectedSquare === square;
            const isLegalMove = legalDestinations.includes(square);
            
            return (
              <button
                key={square}
                onClick={() => !disabled && onSquareClick(square)}
                disabled={disabled}
                className={`
                  w-full h-full flex items-center justify-center p-1 relative
                  ${isLight ? 'bg-amber-200' : 'bg-amber-700'}
                  ${isSelected ? 'ring-4 ring-blue-400 ring-inset' : ''}
                  ${disabled ? 'opacity-80' : ''}
                `}
                aria-label={`Square ${square}${piece ? ` with ${piece.color} ${piece.type}` : ''}${isSelected ? ' selected' : ''}`}
                data-square={square}
                data-selected={isSelected}
              >
                {/* Legal move indicator */}
                {isLegalMove && !piece && (
                  <div className="absolute w-3 h-3 rounded-full bg-blue-400/60" />
                )}
                {isLegalMove && piece && (
                  <div className="absolute inset-0 border-4 border-blue-400/60 rounded-sm" />
                )}
                
                {/* Piece */}
                {piece && <PieceSymbol type={piece.type} color={piece.color} />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

interface Piece {
  type: string;
  color: 'w' | 'b';
}

/**
 * Render piece using chess symbols
 */
function PieceSymbol({ type, color }: { type: string; color: 'w' | 'b' }) {
  const symbols: Record<string, { w: string; b: string }> = {
    king: { w: '♔', b: '♚' },
    queen: { w: '♕', b: '♛' },
    rook: { w: '♖', b: '♜' },
    bishop: { w: '♗', b: '♝' },
    knight: { w: '♘', b: '♞' },
    pawn: { w: '♙', b: '♟' },
  };
  
  const symbol = symbols[type]?.[color] || '?';
  
  return (
    <span 
      className={`text-4xl sm:text-5xl select-none ${
        color === 'w' 
          ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]' 
          : 'text-gray-900'
      }`}
    >
      {symbol}
    </span>
  );
}

export default Game;