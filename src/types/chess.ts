/**
 * Chess piece types
 */
export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';

/**
 * Chess piece colors
 */
export type PieceColor = 'white' | 'black';

/**
 * Chess piece object
 */
export interface Piece {
  type: PieceType;
  color: PieceColor;
}

/**
 * Square notation (e.g., 'a1', 'e4', 'h8')
 */
export type SquareNotation = string;

/**
 * Board position mapping from square notation to piece (or null for empty)
 */
export type BoardPosition = Record<SquareNotation, Piece | null>;
