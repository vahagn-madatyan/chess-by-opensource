import { useState, useCallback } from 'react';
import type { Piece } from '../types/chess';
import { parseFen, parseSquareNotation } from '../utils/fen';

interface UseBoardStateOptions {
  initialFen?: string;
  onSquareClick?: (square: string) => void;
}

interface UseBoardStateReturn {
  /** 2D array of pieces representing the board state */
  board: (Piece | null)[][];
  /** Currently selected square notation (e.g., "e2") or null */
  selectedSquare: string | null;
  /** Handle a square being clicked */
  handleSquareClick: (square: string) => void;
  /** Get the piece at a specific square */
  getPieceAt: (square: string) => Piece | null;
  /** Check if a square is currently selected */
  isSquareSelected: (square: string) => boolean;
}

/**
 * Hook for managing chess board state
 * Handles piece positions, square selection, and click-to-move interactions
 */
export function useBoardState(options: UseBoardStateOptions = {}): UseBoardStateReturn {
  const { initialFen, onSquareClick } = options;
  
  // Initialize board from FEN or empty board
  const [board, setBoard] = useState<(Piece | null)[][]>(() => {
    if (initialFen) {
      return parseFen(initialFen);
    }
    // Return empty 8x8 board
    return Array(8).fill(null).map(() => Array(8).fill(null));
  });
  
  // Track selected square for click-to-move
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  
  /**
   * Get piece at a specific square
   */
  const getPieceAt = useCallback((square: string): Piece | null => {
    const { row, col } = parseSquareNotation(square);
    if (row < 0 || row > 7 || col < 0 || col > 7) {
      return null;
    }
    return board[row]?.[col] ?? null;
  }, [board]);
  
  /**
   * Check if a square is currently selected
   */
  const isSquareSelected = useCallback((square: string): boolean => {
    return selectedSquare === square;
  }, [selectedSquare]);
  
  /**
   * Handle square click - implements click-to-move logic
   * First click selects a square, second click moves the piece
   */
  const handleSquareClick = useCallback((square: string) => {
    // Always notify parent of the click
    onSquareClick?.(square);
    
    if (selectedSquare === null) {
      // No square selected yet - select this one if it has a piece
      const piece = getPieceAt(square);
      if (piece) {
        setSelectedSquare(square);
      }
    } else if (selectedSquare === square) {
      // Clicked the same square - deselect it
      setSelectedSquare(null);
    } else {
      // Move piece from selected square to this square
      const { row: fromRow, col: fromCol } = parseSquareNotation(selectedSquare);
      const { row: toRow, col: toCol } = parseSquareNotation(square);
      
      setBoard(prevBoard => {
        const newBoard = prevBoard.map(rank => [...rank]);
        const piece = newBoard[fromRow][fromCol];
        
        if (piece) {
          newBoard[toRow][toCol] = piece;
          newBoard[fromRow][fromCol] = null;
        }
        
        return newBoard;
      });
      
      setSelectedSquare(null);
    }
  }, [selectedSquare, getPieceAt, onSquareClick]);
  
  return {
    board,
    selectedSquare,
    handleSquareClick,
    getPieceAt,
    isSquareSelected,
  };
}

export default useBoardState;
