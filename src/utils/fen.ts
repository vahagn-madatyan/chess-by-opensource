import type { Piece, PieceType, PieceColor } from '../types/chess';

/**
 * Parse FEN notation into a 2D array representing the board
 * Board is oriented with rank 8 at index 0 and rank 1 at index 7
 * Each rank is an array of 8 squares from file a (index 0) to file h (index 7)
 * 
 * FEN format: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
 * Only the piece placement part (before the first space) is used here
 */
export function parseFen(fen: string): (Piece | null)[][] {
  const piecePlacement = fen.split(' ')[0];
  const ranks = piecePlacement.split('/');
  
  // FEN has 8 ranks, rank 8 first (index 0 in our array)
  const board: (Piece | null)[][] = [];
  
  for (const rank of ranks) {
    const rankPieces: (Piece | null)[] = [];
    
    for (const char of rank) {
      const emptyCount = parseInt(char, 10);
      
      if (!isNaN(emptyCount)) {
        // Number indicates empty squares
        for (let i = 0; i < emptyCount; i++) {
          rankPieces.push(null);
        }
      } else {
        // Letter indicates a piece
        const piece = parsePiece(char);
        rankPieces.push(piece);
      }
    }
    
    board.push(rankPieces);
  }
  
  return board;
}

/**
 * Convert a FEN piece character to a Piece object
 * Uppercase = white, lowercase = black
 */
function parsePiece(char: string): Piece {
  const color: PieceColor = char === char.toUpperCase() ? 'white' : 'black';
  const pieceChar = char.toLowerCase();
  
  const pieceMap: Record<string, PieceType> = {
    k: 'king',
    q: 'queen',
    r: 'rook',
    b: 'bishop',
    n: 'knight',
    p: 'pawn',
  };
  
  const type = pieceMap[pieceChar];
  if (!type) {
    throw new Error(`Invalid piece character: ${char}`);
  }
  
  return { type, color };
}

/**
 * Get square notation (e.g., "a1", "e4") from board indices
 * rowIndex: 0-7 (0 = rank 8, 7 = rank 1)
 * colIndex: 0-7 (0 = file a, 7 = file h)
 */
export function getSquareNotation(rowIndex: number, colIndex: number): string {
  const file = String.fromCharCode('a'.charCodeAt(0) + colIndex);
  const rank = 8 - rowIndex;
  return `${file}${rank}`;
}

/**
 * Parse square notation to board indices
 * Returns { row, col } where row 0 = rank 8, col 0 = file a
 */
export function parseSquareNotation(square: string): { row: number; col: number } {
  const file = square.charAt(0).toLowerCase();
  const rank = parseInt(square.charAt(1), 10);
  
  const col = file.charCodeAt(0) - 'a'.charCodeAt(0);
  const row = 8 - rank;
  
  return { row, col };
}

/**
 * Standard starting position FEN
 */
export const STARTING_POSITION_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
