// components/StepIndicator.tsx
import React from "react";

interface StepIndicatorProps {
  isDone: boolean;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ isDone, isAvailable }) => (
  <div className="step-indicator" style={{border: `${isAvailable ? "2px solid var(--color-primary)"  : "2px solid #CCCCCC"}`}}>
    {isDone && (
      <svg
        className="checkmark"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {isAvailable && <path d="M5 13l4 4L19 7" />}
      </svg>
    )}
  </div>
);

export default StepIndicator;