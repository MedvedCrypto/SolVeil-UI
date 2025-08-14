// components/NetworkSelector.tsx
import React from "react";
import StepIndicator from "./StepIndicator";

interface NetworkSelectorProps {
  networks: { label: string; value: string }[];
  selectedNetwork: string;
  onSelect: (value: string) => void;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({ 
  networks, 
  selectedNetwork, 
  onSelect 
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-2 relative">
        <StepIndicator isDone={!!selectedNetwork} isAvailable={true}/>
        <label className="custom-select-label">Select Network</label>
      </div>

      <button
        className="custom-select-trigger"
        onClick={() => setIsModalOpen(true)}
      >
        {networks.find((n) => n.value === selectedNetwork)?.label || "Select Network"}
      </button>

      {isModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-title text-white">Select Network</h2>
            {networks.map((network) => (
              <button
                key={network.value}
                className="modal-option"
                onClick={() => {
                  onSelect(network.value);
                  setIsModalOpen(false);
                }}
              >
                {network.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkSelector;