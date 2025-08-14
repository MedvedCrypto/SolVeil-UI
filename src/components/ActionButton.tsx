import React from "react";

interface ActionButtonProps {
  onClick: () => void;
  isLoading: boolean;
  loadingText: string;
  normalText: string;
  className?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  isLoading,
  loadingText,
  normalText,
  className = "",
}) => (
  <button
    onClick={onClick}
    disabled={isLoading}
    className={`action-button ${className}`}
  >
    {isLoading ? loadingText : normalText}
  </button>
);