/**
 * UCI (Universal Chess Interface) notation utilities
 * Used for communicating with chess engines like Stockfish
 * 
 * UCI move format: e2e4 (from square to square)
 * For promotions: e7e8q, e7e8r, e7e8b, e7e8n
 */

/**
 * Convert a Move object to UCI notation
 * @param from - Source square (e.g., 'e2')
 * @param to - Target square (e.g., 'e4')
 * @param promotion - Optional promotion piece ('q', 'r', 'b', 'n')
 * @returns UCI notation string (e.g., 'e2e4', 'e7e8q')
 */
export function toUCI(from: string, to: string, promotion?: 'q' | 'r' | 'b' | 'n'): string {
  let uci = `${from}${to}`;
  if (promotion) {
    uci += promotion;
  }
  return uci;
}

/**
 * Parse a UCI notation string into its components
 * @param uci - UCI notation string (e.g., 'e2e4', 'e7e8q')
 * @returns Object with from, to, and optional promotion, or null if invalid
 */
export function parseUCI(uci: string): { from: string; to: string; promotion?: 'q' | 'r' | 'b' | 'n' } | null {
  // UCI format: [a-h][1-8][a-h][1-8][qrbn]?
  const uciRegex = /^([a-h][1-8])([a-h][1-8])([qrbn])?$/i;
  const match = uci.match(uciRegex);
  
  if (!match) {
    return null;
  }
  
  const from = match[1];
  const to = match[2];
  const promotion = match[3] as 'q' | 'r' | 'b' | 'n' | undefined;
  
  return {
    from,
    to,
    promotion,
  };
}

/**
 * Validate if a string is valid UCI notation
 * @param uci - String to validate
 * @returns true if valid UCI notation
 */
export function isValidUCI(uci: string): boolean {
  return parseUCI(uci) !== null;
}

/**
 * Convert a list of moves to UCI format for engine communication
 * @param moves - Array of move objects
 * @returns Space-separated UCI move string
 */
export function movesToUCIString(moves: Array<{ from: string; to: string; promotion?: 'q' | 'r' | 'b' | 'n' }>): string {
  return moves.map(m => toUCI(m.from, m.to, m.promotion)).join(' ');
}

/**
 * Parse a space-separated UCI move string into individual moves
 * @param uciString - Space-separated UCI moves (e.g., "e2e4 e7e5 g1f3")
 * @returns Array of move objects
 */
export function parseUCIString(uciString: string): Array<{ from: string; to: string; promotion?: 'q' | 'r' | 'b' | 'n' }> {
  if (!uciString.trim()) {
    return [];
  }
  
  const moves: Array<{ from: string; to: string; promotion?: 'q' | 'r' | 'b' | 'n' }> = [];
  const tokens = uciString.trim().split(/\s+/);
  
  for (const token of tokens) {
    const parsed = parseUCI(token);
    if (parsed) {
      moves.push(parsed);
    }
  }
  
  return moves;
}

/**
 * Convert a square notation to 0x88 board index
 * Used internally by some chess engines
 * @param square - Square notation (e.g., 'e4')
 * @returns 0x88 board index (0-119 with gaps), or -1 if invalid
 */
export function squareTo0x88(square: string): number {
  if (!/^[a-h][1-8]$/.test(square)) {
    return -1;
  }
  
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0); // 0-7
  const rank = parseInt(square[1], 10) - 1; // 0-7
  
  // 0x88 formula: rank * 16 + file
  return rank * 16 + file;
}

/**
 * Convert a 0x88 board index to square notation
 * @param index - 0x88 board index
 * @returns Square notation (e.g., 'e4'), or null if invalid
 */
export function squareFrom0x88(index: number): string | null {
  if (index < 0 || index > 119 || (index & 0x88) !== 0) {
    return null;
  }
  
  const file = index & 7; // 0-7
  const rank = index >> 4; // 0-7
  
  const fileChar = String.fromCharCode('a'.charCodeAt(0) + file);
  const rankChar = String.fromCharCode('1'.charCodeAt(0) + rank);
  
  return `${fileChar}${rankChar}`;
}

/**
 * Check if a move is a pawn promotion based on UCI notation
 * @param uci - UCI notation string
 * @returns true if the move includes a promotion
 */
export function isPromotion(uci: string): boolean {
  return uci.length === 5 && /[qrbn]$/i.test(uci);
}

/**
 * Get the promotion piece from UCI notation
 * @param uci - UCI notation string
 * @returns Promotion piece ('q', 'r', 'b', 'n') or null if not a promotion
 */
export function getPromotionPiece(uci: string): 'q' | 'r' | 'b' | 'n' | null {
  if (isPromotion(uci)) {
    return uci[4].toLowerCase() as 'q' | 'r' | 'b' | 'n';
  }
  return null;
}