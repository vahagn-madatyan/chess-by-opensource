import { describe, it, expect } from 'vitest';
import { parseFen, getSquareNotation, parseSquareNotation, STARTING_POSITION_FEN } from '../fen';

describe('parseFen', () => {
  it('parses starting position correctly', () => {
    const board = parseFen(STARTING_POSITION_FEN);
    
    // Should have 8 ranks
    expect(board).toHaveLength(8);
    
    // Each rank should have 8 files
    board.forEach(rank => {
      expect(rank).toHaveLength(8);
    });
  });

  it('parses black back rank (rank 8) correctly', () => {
    const board = parseFen(STARTING_POSITION_FEN);
    
    // Rank 8 (index 0): r n b q k b n r
    expect(board[0][0]).toEqual({ type: 'rook', color: 'black' });
    expect(board[0][1]).toEqual({ type: 'knight', color: 'black' });
    expect(board[0][2]).toEqual({ type: 'bishop', color: 'black' });
    expect(board[0][3]).toEqual({ type: 'queen', color: 'black' });
    expect(board[0][4]).toEqual({ type: 'king', color: 'black' });
    expect(board[0][5]).toEqual({ type: 'bishop', color: 'black' });
    expect(board[0][6]).toEqual({ type: 'knight', color: 'black' });
    expect(board[0][7]).toEqual({ type: 'rook', color: 'black' });
  });

  it('parses black pawn rank (rank 7) correctly', () => {
    const board = parseFen(STARTING_POSITION_FEN);
    
    // Rank 7 (index 1): all pawns
    board[1].forEach(piece => {
      expect(piece).toEqual({ type: 'pawn', color: 'black' });
    });
  });

  it('parses empty ranks (ranks 6-3) correctly', () => {
    const board = parseFen(STARTING_POSITION_FEN);
    
    // Ranks 6, 5, 4, 3 (indices 2, 3, 4, 5) should be empty
    for (let row = 2; row <= 5; row++) {
      board[row].forEach(piece => {
        expect(piece).toBeNull();
      });
    }
  });

  it('parses white pawn rank (rank 2) correctly', () => {
    const board = parseFen(STARTING_POSITION_FEN);
    
    // Rank 2 (index 6): all pawns
    board[6].forEach(piece => {
      expect(piece).toEqual({ type: 'pawn', color: 'white' });
    });
  });

  it('parses white back rank (rank 1) correctly', () => {
    const board = parseFen(STARTING_POSITION_FEN);
    
    // Rank 1 (index 7): R N B Q K B N R
    expect(board[7][0]).toEqual({ type: 'rook', color: 'white' });
    expect(board[7][1]).toEqual({ type: 'knight', color: 'white' });
    expect(board[7][2]).toEqual({ type: 'bishop', color: 'white' });
    expect(board[7][3]).toEqual({ type: 'queen', color: 'white' });
    expect(board[7][4]).toEqual({ type: 'king', color: 'white' });
    expect(board[7][5]).toEqual({ type: 'bishop', color: 'white' });
    expect(board[7][6]).toEqual({ type: 'knight', color: 'white' });
    expect(board[7][7]).toEqual({ type: 'rook', color: 'white' });
  });

  it('handles FEN with only piece placement data', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
    const board = parseFen(fen);
    
    expect(board).toHaveLength(8);
    expect(board[0][0]).toEqual({ type: 'rook', color: 'black' });
    expect(board[7][7]).toEqual({ type: 'rook', color: 'white' });
  });

  it('parses custom position correctly', () => {
    // Position with just kings and a few pawns
    const fen = '4k3/8/8/8/8/8/4P3/4K3 w - - 0 1';
    const board = parseFen(fen);
    
    expect(board[0][4]).toEqual({ type: 'king', color: 'black' }); // e8
    expect(board[6][4]).toEqual({ type: 'pawn', color: 'white' }); // e2
    expect(board[7][4]).toEqual({ type: 'king', color: 'white' }); // e1
  });

  it('throws error for invalid piece character', () => {
    const fen = 'xxxxkxxx/8/8/8/8/8/8/4K3 w - - 0 1';
    expect(() => parseFen(fen)).toThrow('Invalid piece character');
  });
});

describe('getSquareNotation', () => {
  it('returns correct notation for corners', () => {
    expect(getSquareNotation(0, 0)).toBe('a8'); // top-left
    expect(getSquareNotation(0, 7)).toBe('h8'); // top-right
    expect(getSquareNotation(7, 0)).toBe('a1'); // bottom-left
    expect(getSquareNotation(7, 7)).toBe('h1'); // bottom-right
  });

  it('returns correct notation for center squares', () => {
    expect(getSquareNotation(4, 4)).toBe('e4');
    expect(getSquareNotation(3, 2)).toBe('c5');
    expect(getSquareNotation(5, 6)).toBe('g3');
  });

  it('returns correct notation for all squares in a rank', () => {
    // Rank 1 (row 7)
    expect(getSquareNotation(7, 0)).toBe('a1');
    expect(getSquareNotation(7, 1)).toBe('b1');
    expect(getSquareNotation(7, 2)).toBe('c1');
    expect(getSquareNotation(7, 3)).toBe('d1');
    expect(getSquareNotation(7, 4)).toBe('e1');
    expect(getSquareNotation(7, 5)).toBe('f1');
    expect(getSquareNotation(7, 6)).toBe('g1');
    expect(getSquareNotation(7, 7)).toBe('h1');
  });
});

describe('parseSquareNotation', () => {
  it('parses corner squares correctly', () => {
    expect(parseSquareNotation('a8')).toEqual({ row: 0, col: 0 });
    expect(parseSquareNotation('h8')).toEqual({ row: 0, col: 7 });
    expect(parseSquareNotation('a1')).toEqual({ row: 7, col: 0 });
    expect(parseSquareNotation('h1')).toEqual({ row: 7, col: 7 });
  });

  it('parses center squares correctly', () => {
    expect(parseSquareNotation('e4')).toEqual({ row: 4, col: 4 });
    expect(parseSquareNotation('d5')).toEqual({ row: 3, col: 3 });
    expect(parseSquareNotation('f6')).toEqual({ row: 2, col: 5 });
  });

  it('handles lowercase input', () => {
    expect(parseSquareNotation('E4')).toEqual({ row: 4, col: 4 });
    expect(parseSquareNotation('D5')).toEqual({ row: 3, col: 3 });
  });
});

describe('STARTING_POSITION_FEN', () => {
  it('contains the standard starting position', () => {
    expect(STARTING_POSITION_FEN).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  });
});
