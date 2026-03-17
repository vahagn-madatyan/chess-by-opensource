import { useState, useCallback, useEffect, useRef } from 'react';

interface DifficultySelectorProps {
  /** Current skill level 0-20 */
  value: number;
  /** Called when value changes (debounced) */
  onChange: (level: number) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Optional CSS class */
  className?: string;
}

const DIFFICULTY_LABELS: Record<number, string> = {
  0: 'Beginner',
  5: 'Casual',
  10: 'Intermediate',
  15: 'Advanced',
  20: 'Master',
};

/**
 * Maps a skill level (0-20) to a human-readable label
 */
function getDifficultyLabel(level: number): string {
  const levels = Object.keys(DIFFICULTY_LABELS).map(Number).sort((a, b) => a - b);
  
  for (let i = levels.length - 1; i >= 0; i--) {
    if (level >= levels[i]) {
      return DIFFICULTY_LABELS[levels[i]];
    }
  }
  return DIFFICULTY_LABELS[0];
}

/**
 * Difficulty selector with range slider from 0-20.
 * Debounces onChange calls to avoid excessive engine updates.
 */
export function DifficultySelector({ 
  value, 
  onChange, 
  disabled = false,
  className = '' 
}: DifficultySelectorProps) {
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local value with prop value when it changes externally
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    setLocalValue(newValue);
    
    // Debounce the onChange callback
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      onChange(newValue);
    }, 300);
  }, [onChange]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={`space-y-2 ${className}`} data-testid="difficulty-selector">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">
          AI Difficulty
        </label>
        <span className="text-sm font-semibold text-amber-400" data-testid="difficulty-label">
          {getDifficultyLabel(localValue)}
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">0</span>
        <input
          type="range"
          min="0"
          max="20"
          step="1"
          value={localValue}
          onChange={handleChange}
          disabled={disabled}
          className={`
            flex-1 h-2 rounded-lg appearance-none cursor-pointer
            bg-gray-700 accent-amber-600
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-amber-600
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-colors
            [&::-webkit-slider-thumb]:hover:bg-amber-500
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-amber-600
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:cursor-pointer
          `}
          aria-label="AI difficulty level"
          data-testid="difficulty-slider"
        />
        <span className="text-xs text-gray-500">20</span>
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        Level {localValue}
      </div>
    </div>
  );
}

export default DifficultySelector;
