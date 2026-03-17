import { describe, it, expect } from 'vitest';
import {
  toUCI,
  parseUCI,
  isValidUCI,
  movesToUCIString,
  parseUCIString,
  squareTo0x88,
  squareFrom0x88,
  isPromotion,
  getPromotionPiece,
} from '../uci';

describe('UCI utilities', () => {
  // ============================================================================
  // toUCI tests
  // ============================================================================
  describe('toUCI', () => {
    it('should convert simple move to UCI', () => {
      expect(toUCI('e2', 'e4')).toBe('e2e4');
      expect(toUCI('g1', 'f3')).toBe('g1f3');
      expect(toUCI('a1', 'a8')).toBe('a1a8');
    });

    it('should include promotion piece when provided', () => {
      expect(toUCI('e7', 'e8', 'q')).toBe('e7e8q');
      expect(toUCI('a7', 'a8', 'r')).toBe('a7a8r');
      expect(toUCI('b7', 'b8', 'b')).toBe('b7b8b');
      expect(toUCI('g7', 'g8', 'n')).toBe('g7g8n');
    });

    it('should handle all squares', () => {
      const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
      
      for (const fromFile of files) {
        for (const fromRank of ranks) {
          for (const toFile of files) {
            for (const toRank of ranks) {
              const from = fromFile + fromRank;
              const to = toFile + toRank;
              expect(toUCI(from, to)).toBe(from + to);
            }
          }
        }
      }
    });
  });

  // ============================================================================
  // parseUCI tests
  // ============================================================================
  describe('parseUCI', () => {
    it('should parse simple UCI moves', () => {
      expect(parseUCI('e2e4')).toEqual({ from: 'e2', to: 'e4' });
      expect(parseUCI('g1f3')).toEqual({ from: 'g1', to: 'f3' });
      expect(parseUCI('a1h8')).toEqual({ from: 'a1', to: 'h8' });
    });

    it('should parse promotion moves', () => {
      expect(parseUCI('e7e8q')).toEqual({ from: 'e7', to: 'e8', promotion: 'q' });
      expect(parseUCI('a2a1r')).toEqual({ from: 'a2', to: 'a1', promotion: 'r' });
      expect(parseUCI('h7h8b')).toEqual({ from: 'h7', to: 'h8', promotion: 'b' });
      expect(parseUCI('d7d8n')).toEqual({ from: 'd7', to: 'd8', promotion: 'n' });
    });

    it('should return null for invalid UCI', () => {
      expect(parseUCI('')).toBeNull();
      expect(parseUCI('e2')).toBeNull();
      expect(parseUCI('e2e')).toBeNull();
      expect(parseUCI('e2e9')).toBeNull(); // Invalid rank
      expect(parseUCI('i2e4')).toBeNull(); // Invalid file
      expect(parseUCI('e2e4x')).toBeNull(); // Invalid promotion
      expect(parseUCI('invalid')).toBeNull();
    });

    it('should handle case insensitively', () => {
      expect(parseUCI('E2E4')).toEqual({ from: 'E2', to: 'E4' });
      expect(parseUCI('E7E8Q')).toEqual({ from: 'E7', to: 'E8', promotion: 'Q' });
    });
  });

  // ============================================================================
  // isValidUCI tests
  // ============================================================================
  describe('isValidUCI', () => {
    it('should return true for valid UCI', () => {
      expect(isValidUCI('e2e4')).toBe(true);
      expect(isValidUCI('g1f3')).toBe(true);
      expect(isValidUCI('e7e8q')).toBe(true);
    });

    it('should return false for invalid UCI', () => {
      expect(isValidUCI('')).toBe(false);
      expect(isValidUCI('e2')).toBe(false);
      expect(isValidUCI('invalid')).toBe(false);
    });
  });

  // ============================================================================
  // movesToUCIString tests
  // ============================================================================
  describe('movesToUCIString', () => {
    it('should convert single move to string', () => {
      const moves = [{ from: 'e2', to: 'e4' }];
      expect(movesToUCIString(moves)).toBe('e2e4');
    });

    it('should convert multiple moves to space-separated string', () => {
      const moves = [
        { from: 'e2', to: 'e4' },
        { from: 'e7', to: 'e5' },
        { from: 'g1', to: 'f3' },
      ];
      expect(movesToUCIString(moves)).toBe('e2e4 e7e5 g1f3');
    });

    it('should handle promotion moves', () => {
      const moves = [
        { from: 'e7', to: 'e8', promotion: 'q' as const },
        { from: 'a2', to: 'a1', promotion: 'r' as const },
      ];
      expect(movesToUCIString(moves)).toBe('e7e8q a2a1r');
    });

    it('should handle empty array', () => {
      expect(movesToUCIString([])).toBe('');
    });
  });

  // ============================================================================
  // parseUCIString tests
  // ============================================================================
  describe('parseUCIString', () => {
    it('should parse single move', () => {
      expect(parseUCIString('e2e4')).toEqual([{ from: 'e2', to: 'e4' }]);
    });

    it('should parse space-separated moves', () => {
      const result = parseUCIString('e2e4 e7e5 g1f3');
      expect(result).toEqual([
        { from: 'e2', to: 'e4' },
        { from: 'e7', to: 'e5' },
        { from: 'g1', to: 'f3' },
      ]);
    });

    it('should parse moves with promotions', () => {
      const result = parseUCIString('e7e8q a2a1r');
      expect(result).toEqual([
        { from: 'e7', to: 'e8', promotion: 'q' },
        { from: 'a2', to: 'a1', promotion: 'r' },
      ]);
    });

    it('should handle empty string', () => {
      expect(parseUCIString('')).toEqual([]);
      expect(parseUCIString('   ')).toEqual([]);
    });

    it('should skip invalid moves', () => {
      const result = parseUCIString('e2e4 invalid g1f3');
      expect(result).toEqual([
        { from: 'e2', to: 'e4' },
        { from: 'g1', to: 'f3' },
      ]);
    });

    it('should handle multiple spaces', () => {
      const result = parseUCIString('e2e4   e7e5     g1f3');
      expect(result).toEqual([
        { from: 'e2', to: 'e4' },
        { from: 'e7', to: 'e5' },
        { from: 'g1', to: 'f3' },
      ]);
    });
  });

  // ============================================================================
  // squareTo0x88 tests
  // ============================================================================
  describe('squareTo0x88', () => {
    it('should convert a1 to 0x88 index', () => {
      expect(squareTo0x88('a1')).toBe(0);
    });

    it('should convert h8 to 0x88 index', () => {
      expect(squareTo0x88('h8')).toBe(119);
    });

    it('should convert e4 to correct 0x88 index', () => {
      // e4: file=4, rank=3 (0-indexed), so 3*16 + 4 = 52
      expect(squareTo0x88('e4')).toBe(52);
    });

    it('should convert d5 to correct 0x88 index', () => {
      // d5: file=3, rank=4, so 4*16 + 3 = 67
      expect(squareTo0x88('d5')).toBe(67);
    });

    it('should return -1 for invalid squares', () => {
      expect(squareTo0x88('a9')).toBe(-1);
      expect(squareTo0x88('i1')).toBe(-1);
      expect(squareTo0x88('')).toBe(-1);
      expect(squareTo0x88('invalid')).toBe(-1);
    });

    it('should convert all valid squares', () => {
      const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
      
      for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
          const square = files[file] + ranks[rank];
          const expected = rank * 16 + file;
          expect(squareTo0x88(square)).toBe(expected);
        }
      }
    });
  });

  // ============================================================================
  // squareFrom0x88 tests
  // ============================================================================
  describe('squareFrom0x88', () => {
    it('should convert 0 to a1', () => {
      expect(squareFrom0x88(0)).toBe('a1');
    });

    it('should convert 119 to h8', () => {
      expect(squareFrom0x88(119)).toBe('h8');
    });

    it('should convert correct 0x88 index to e4', () => {
      expect(squareFrom0x88(52)).toBe('e4');
    });

    it('should convert correct 0x88 index to d5', () => {
      expect(squareFrom0x88(67)).toBe('d5');
    });

    it('should return null for invalid indices', () => {
      expect(squareFrom0x88(-1)).toBeNull();
      expect(squareFrom0x88(120)).toBeNull();
      expect(squareFrom0x88(8)).toBeNull(); // Off-board 0x88 index
    });

    it('should be inverse of squareTo0x88 for valid squares', () => {
      const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
      
      for (const file of files) {
        for (const rank of ranks) {
          const square = file + rank;
          const index = squareTo0x88(square);
          expect(squareFrom0x88(index)).toBe(square);
        }
      }
    });
  });

  // ============================================================================
  // isPromotion tests
  // ============================================================================
  describe('isPromotion', () => {
    it('should return true for promotion moves', () => {
      expect(isPromotion('e7e8q')).toBe(true);
      expect(isPromotion('a2a1r')).toBe(true);
      expect(isPromotion('h7h8b')).toBe(true);
      expect(isPromotion('d7d8n')).toBe(true);
    });

    it('should return false for non-promotion moves', () => {
      expect(isPromotion('e2e4')).toBe(false);
      expect(isPromotion('g1f3')).toBe(false);
    });

    it('should handle case insensitively', () => {
      expect(isPromotion('E7E8Q')).toBe(true);
      expect(isPromotion('e7e8Q')).toBe(true);
    });

    it('should return false for invalid moves', () => {
      expect(isPromotion('')).toBe(false);
    });
  });

  // ============================================================================
  // getPromotionPiece tests
  // ============================================================================
  describe('getPromotionPiece', () => {
    it('should return promotion piece for promotion moves', () => {
      expect(getPromotionPiece('e7e8q')).toBe('q');
      expect(getPromotionPiece('a2a1r')).toBe('r');
      expect(getPromotionPiece('h7h8b')).toBe('b');
      expect(getPromotionPiece('d7d8n')).toBe('n');
    });

    it('should return null for non-promotion moves', () => {
      expect(getPromotionPiece('e2e4')).toBeNull();
      expect(getPromotionPiece('g1f3')).toBeNull();
    });

    it('should handle case insensitively', () => {
      expect(getPromotionPiece('E7E8Q')).toBe('q');
      expect(getPromotionPiece('e7e8Q')).toBe('q');
    });

    it('should return null for invalid moves', () => {
      expect(getPromotionPiece('')).toBeNull();
      expect(getPromotionPiece('invalid')).toBeNull();
    });
  });

  // ============================================================================
  // Round-trip tests
  // ============================================================================
  describe('round-trip', () => {
    it('toUCI and parseUCI should be inverses', () => {
      const testCases = [
        { from: 'e2', to: 'e4' },
        { from: 'g1', to: 'f3' },
        { from: 'e7', to: 'e8', promotion: 'q' as const },
        { from: 'a7', to: 'a8', promotion: 'r' as const },
      ];

      for (const testCase of testCases) {
        const uci = toUCI(testCase.from, testCase.to, testCase.promotion);
        const parsed = parseUCI(uci);
        expect(parsed).toEqual(testCase);
      }
    });

    it('movesToUCIString and parseUCIString should be inverses', () => {
      const moves = [
        { from: 'e2', to: 'e4' },
        { from: 'e7', to: 'e5' },
        { from: 'g1', to: 'f3' },
        { from: 'b8', to: 'c6' },
      ];

      const uciString = movesToUCIString(moves);
      const parsed = parseUCIString(uciString);
      expect(parsed).toEqual(moves);
    });
  });
});