// Новый компонент PeriodSelector.jsx
import React from "react";

const PeriodSelector = ({ selectedPeriod, onPeriodSelect, nftExists }) => {
  const periods = [
    { id: 1, label: "1 month", discount: "" },
    { id: 6, label: "6 months", discount: "-10%" },
    { id: 12, label: "12 months", discount: "-20%" },
  ];

  return (
    <div className="payment-field mb-6">
      <label className="payment-label">Subscription period</label>
      <div className="period-selector ">
        {periods.map((period) => (
          <button
            key={period.id}
            className={`period-option  ${selectedPeriod === period.id ? "active" : ""}`}
            onClick={() => onPeriodSelect(period.id)}
          >
            <span>{period.label}</span>
            {period.discount && (
              <span className="discount-badge bg-green-600 rounded-sm">{period.discount}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PeriodSelector;