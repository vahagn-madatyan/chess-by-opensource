import { useReducer, useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { ChessService } from '../services/ChessService';
import type { ChessEngine } from '../engine/ChessEngine';
import type { GameState, Move, MoveHistory } from '../types/game';

// ============================================================================
// Action Types
// ============================================================================

export type GameAction =
  | { type: 'MOVE'; payload: { from: string; to: string; promotion?: 'q' | 'r' | 'b' | 'n' } }
  | { type: 'RESET' }
  | { type: 'SET_SELECTED_SQUARE'; payload: string | null }
  | { type: 'UNDO' }
  | { type: 'LOAD_FEN'; payload: string }
  | { type: 'SET_THINKING'; payload: boolean }
  | { type: 'CLEAR_ERROR' };

// ============================================================================
// State
// ============================================================================

export interface ChessGameState {
  gameState: GameState;
  selectedSquare: string | null;
  error: string | null;
  isThinking: boolean;
}

export interface UseChessGameReturn {
  // Game state
  gameState: GameState;
  selectedSquare: string | null;
  error: string | null;
  isThinking: boolean;
  
  // Actions
  makeMove: (from: string, to: string, promotion?: 'q' | 'r' | 'b' | 'n') => boolean;
  resetGame: () => void;
  undoMove: () => boolean;
  loadFen: (fen: string) => boolean;
  setEngineSkill: (level: number) => void;
  
  // Selection
  selectSquare: (square: string) => void;
  clearSelection: () => void;
  
  // Derived state helpers
  isLegalMove: (from: string, to: string) => boolean;
  getLegalMovesFrom: (square: string) => string[];
  getPieceAt: (square: string) => { type: string; color: 'w' | 'b' } | null;
  
  // Promotion
  pendingPromotion: { from: string; to: string } | null;
  cancelPromotion: () => void;
  completePromotion: (piece: 'q' | 'r' | 'b' | 'n') => boolean;
}

// ============================================================================
// Reducer
// ============================================================================

function createInitialState(fen?: string): ChessGameState {
  const service = new ChessService(fen);
  return {
    gameState: service.getGameState(),
    selectedSquare: null,
    error: null,
    isThinking: false,
  };
}

function gameReducer(state: ChessGameState, action: GameAction, service: ChessService): ChessGameState {
  switch (action.type) {
    case 'MOVE': {
      const { from, to, promotion } = action.payload;
      
      // Attempt the move
      const moveResult = service.makeMove(from, to, promotion);
      
      if (moveResult === null) {
        // Illegal move - clear selection and set error
        console.log(`[useChessGame] Illegal move rejected: ${from}-${to}`);
        return {
          ...state,
          selectedSquare: null,
          error: `Illegal move: ${from}-${to}`,
        };
      }
      
      // Legal move - update state
      const newGameState = service.getGameState();
      const lastMove = newGameState.moveHistory[newGameState.moveHistory.length - 1];
      
      console.log(`[useChessGame] Move executed: ${lastMove?.notation || `${from}-${to}`}`);
      
      if (newGameState.isCheckmate) {
        console.log(`[useChessGame] Checkmate! ${state.gameState.turn === 'w' ? 'Black' : 'White'} wins`);
      } else if (newGameState.isStalemate) {
        console.log(`[useChessGame] Stalemate - Draw`);
      } else if (newGameState.isDraw) {
        console.log(`[useChessGame] Draw`);
      } else if (newGameState.isCheck) {
        console.log(`[useChessGame] Check!`);
      }
      
      return {
        gameState: newGameState,
        selectedSquare: null,
        error: null,
      };
    }
    
    case 'RESET': {
      service.reset();
      console.log('[useChessGame] Game reset');
      return {
        gameState: service.getGameState(),
        selectedSquare: null,
        error: null,
      };
    }
    
    case 'SET_SELECTED_SQUARE': {
      return {
        ...state,
        selectedSquare: action.payload,
        error: null,
      };
    }
    
    case 'UNDO': {
      const undone = service.undo();
      if (undone === null) {
        console.log('[useChessGame] No move to undo');
        return {
          ...state,
          error: 'No move to undo',
        };
      }
      
      console.log(`[useChessGame] Move undone: ${undone.from}-${undone.to}`);
      return {
        gameState: service.getGameState(),
        selectedSquare: null,
        error: null,
      };
    }
    
    case 'LOAD_FEN': {
      const success = service.load(action.payload);
      if (!success) {
        console.log(`[useChessGame] Failed to load FEN: ${action.payload}`);
        return {
          ...state,
          error: `Invalid FEN: ${action.payload}`,
        };
      }
      
      console.log('[useChessGame] FEN loaded');
      return {
        gameState: service.getGameState(),
        selectedSquare: null,
        error: null,
        isThinking: false,
      };
    }
    
    case 'SET_THINKING': {
      return {
        ...state,
        isThinking: action.payload,
      };
    }
    
    case 'CLEAR_ERROR': {
      return {
        ...state,
        error: null,
      };
    }
    
    default:
      return state;
  }
}

// ============================================================================
// Hook
// ============================================================================

export interface UseChessGameOptions {
  initialFen?: string;
  engine?: ChessEngine | null;
  playerColor?: 'w' | 'b';
  engineSkill?: number;
  engineTimeoutMs?: number;
}

// Engine skill level state for updates
let currentEngineSkill = 10;

export function useChessGame(options: UseChessGameOptions = {}): UseChessGameReturn {
  const { initialFen, engine, playerColor = 'w', engineSkill = 10, engineTimeoutMs = 2000 } = options;
  
  // Create a single ChessService instance that persists across renders
  const serviceRef = useMemo(() => new ChessService(initialFen), []);
  
  // Use reducer for state management
  const [state, dispatch] = useReducer(
    (state: ChessGameState, action: GameAction) => gameReducer(state, action, serviceRef),
    initialFen,
    createInitialState
  );
  
  // Track pending promotion (when pawn reaches last rank)
  const [pendingPromotion, setPendingPromotion] = useState<{ from: string; to: string } | null>(null);
  
  // Track if AI is enabled (has engine)
  const aiEnabled = engine != null;
  
  // ============================================================================
  // AI Turn Logic
  // ============================================================================
  
  useEffect(() => {
    // Only trigger AI if:
    // 1. Engine is provided and ready
    // 2. It's not the player's turn
    // 3. Game is not over
    // 4. Not currently thinking
    if (!engine || !engine.isReady()) return;
    if (state.gameState.turn === playerColor) return;
    if (state.gameState.isGameOver) return;
    if (state.isThinking) return;
    
    const makeAiMove = async () => {
      dispatch({ type: 'SET_THINKING', payload: true });
      console.log('[useChessGame] AI thinking...');
      
      try {
        const bestMove = await engine.getBestMove(
          state.gameState.fen,
          engineSkill,
          engineTimeoutMs
        );
        
        if (bestMove) {
          // Parse UCI move notation (e.g., "e2e4" or "e7e8q")
          const from = bestMove.slice(0, 2);
          const to = bestMove.slice(2, 4);
          const promotion = bestMove.length > 4 ? bestMove[4] as 'q' | 'r' | 'b' | 'n' : undefined;
          
          console.log(`[useChessGame] AI move: ${from}-${to}${promotion ? `=${promotion}` : ''}`);
          dispatch({ type: 'MOVE', payload: { from, to, promotion } });
        }
      } catch (error) {
        console.error('[useChessGame] AI move failed:', error);
      } finally {
        dispatch({ type: 'SET_THINKING', payload: false });
      }
    };
    
    makeAiMove();
  }, [engine, state.gameState.fen, state.gameState.turn, state.gameState.isGameOver, state.isThinking, playerColor, engineSkill, engineTimeoutMs]);
  
  // ============================================================================
  // Action Wrappers
  // ============================================================================
  
  const checkIsPromotion = useCallback((from: string, to: string): boolean => {
    const piece = serviceRef.getGameState().legalMoves.get(from);
    if (!piece) return false;
    
    // Check if any legal move from->to has a promotion
    const legalMoves = serviceRef.getLegalMoves();
    return legalMoves.some(move => 
      move.from === from && move.to === to && move.promotion != null
    );
  }, [serviceRef]);
  
  const makeMove = useCallback((from: string, to: string, promotion?: 'q' | 'r' | 'b' | 'n'): boolean => {
    // Check if this is a promotion move
    if (!promotion && checkIsPromotion(from, to)) {
      setPendingPromotion({ from, to });
      return true; // Move is legal, just waiting for promotion choice
    }
    
    dispatch({ type: 'MOVE', payload: { from, to, promotion } });
    return serviceRef.isLegalMove(from, to);
  }, [dispatch, serviceRef, checkIsPromotion]);
  
  const cancelPromotion = useCallback(() => {
    setPendingPromotion(null);
    dispatch({ type: 'SET_SELECTED_SQUARE', payload: null });
  }, [dispatch]);
  
  const completePromotion = useCallback((piece: 'q' | 'r' | 'b' | 'n'): boolean => {
    if (!pendingPromotion) return false;
    
    const { from, to } = pendingPromotion;
    setPendingPromotion(null);
    dispatch({ type: 'MOVE', payload: { from, to, promotion: piece } });
    return serviceRef.isLegalMove(from, to);
  }, [pendingPromotion, dispatch, serviceRef]);
  
  const resetGame = useCallback(() => {
    setPendingPromotion(null);
    dispatch({ type: 'RESET' });
    if (engine) {
      engine.newGame();
    }
  }, [dispatch, engine]);
  
  const undoMove = useCallback((): boolean => {
    const historyLength = state.gameState.moveHistory.length;
    dispatch({ type: 'UNDO' });
    // Return true if a move was undone
    return serviceRef.getMoveHistory().length < historyLength;
  }, [dispatch, serviceRef, state.gameState.moveHistory.length]);
  
  const loadFen = useCallback((fen: string): boolean => {
    dispatch({ type: 'LOAD_FEN', payload: fen });
    return serviceRef.getFen() === fen || serviceRef.load(fen);
  }, [dispatch, serviceRef]);
  
  const setEngineSkill = useCallback((level: number): void => {
    const clampedLevel = Math.max(0, Math.min(20, level));
    currentEngineSkill = clampedLevel;
    engine?.setOptions({ skillLevel: clampedLevel });
    console.log(`[useChessGame] Engine skill set to ${clampedLevel}`);
  }, [engine]);
  
  // ============================================================================
  // Selection Logic (Click-to-Move)
  // ============================================================================
  
  const selectSquare = useCallback((square: string) => {
    dispatch({ type: 'SET_SELECTED_SQUARE', payload: square });
  }, [dispatch]);
  
  const clearSelection = useCallback(() => {
    dispatch({ type: 'SET_SELECTED_SQUARE', payload: null });
  }, [dispatch]);
  
  // ============================================================================
  // Derived State Helpers
  // ============================================================================
  
  const isLegalMove = useCallback((from: string, to: string): boolean => {
    return serviceRef.isLegalMove(from, to);
  }, [serviceRef]);
  
  const getLegalMovesFrom = useCallback((square: string): string[] => {
    return serviceRef.getLegalMovesFrom(square);
  }, [serviceRef]);
  
  const getPieceAt = useCallback((square: string): { type: string; color: 'w' | 'b' } | null => {
    // Parse FEN to get piece at square
    const fen = state.gameState.fen;
    const fenParts = fen.split(' ');
    const piecePlacement = fenParts[0];
    
    // Parse square notation to array indices
    const file = square.charCodeAt(0) - 'a'.charCodeAt(0); // 0-7
    const rank = 8 - parseInt(square[1], 10); // 0-7 (rank 8 is index 0)
    
    if (file < 0 || file > 7 || rank < 0 || rank > 7) {
      return null;
    }
    
    // Parse piece placement
    const ranks = piecePlacement.split('/');
    const rankStr = ranks[rank];
    
    let currentFile = 0;
    for (const char of rankStr) {
      if (char >= '1' && char <= '8') {
        // Empty squares
        const emptyCount = parseInt(char, 10);
        if (currentFile <= file && file < currentFile + emptyCount) {
          return null; // Empty square
        }
        currentFile += emptyCount;
      } else {
        // Piece
        if (currentFile === file) {
          const pieceTypes: Record<string, string> = {
            'p': 'pawn', 'n': 'knight', 'b': 'bishop', 'r': 'rook', 'q': 'queen', 'k': 'king',
            'P': 'pawn', 'N': 'knight', 'B': 'bishop', 'R': 'rook', 'Q': 'queen', 'K': 'king',
          };
          return {
            type: pieceTypes[char] || 'unknown',
            color: char === char.toLowerCase() ? 'b' : 'w',
          };
        }
        currentFile++;
      }
      
      if (currentFile > file) {
        break;
      }
    }
    
    return null;
  }, [state.gameState.fen]);
  
  return {
    // State
    gameState: state.gameState,
    selectedSquare: state.selectedSquare,
    error: state.error,
    isThinking: state.isThinking,
    
    // Actions
    makeMove,
    resetGame,
    undoMove,
    loadFen,
    setEngineSkill,
    
    // Selection
    selectSquare,
    clearSelection,
    
    // Helpers
    isLegalMove,
    getLegalMovesFrom,
    getPieceAt,
    
    // Promotion
    pendingPromotion,
    cancelPromotion,
    completePromotion,
  };
}

export default useChessGame;