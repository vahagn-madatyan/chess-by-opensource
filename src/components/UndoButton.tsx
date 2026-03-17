import { useCallback } from 'react';

interface UndoButtonProps {
  /** Called when button is clicked */
  onClick: () => void;
  /** Whether the button is disabled (no moves to undo or AI thinking) */
  disabled?: boolean;
  /** Optional CSS class */
  className?: string;
}

/**
 * Undo button with undo icon and disabled state handling.
 * Disabled when there are no moves to undo or when AI is thinking.
 */
export function UndoButton({ 
  onClick, 
  disabled = false,
  className = '' 
}: UndoButtonProps) {
  const handleClick = useCallback(() => {
    if (!disabled) {
      onClick();
    }
  }, [onClick, disabled]);

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 px-4 py-2 
        bg-amber-700 text-white font-medium rounded-lg
        transition-all duration-200
        hover:bg-amber-600
        focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-900
        disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed
        ${className}
      `}
      aria-label="Undo last move"
      data-testid="undo-button"
    >
      {/* Undo icon - curved arrow left */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 7v6h6" />
        <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
      </svg>
      <span>Undo</span>
    </button>
  );
}

export default UndoButton;
