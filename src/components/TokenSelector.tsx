import React from "react";
import StepIndicator from "./StepIndicator";
import { TOKENS, TOKENS_DENOMS, TOKENS_DENOMS_OSMOSIS, TOKEN_ICONS } from "../config";

interface TokenSelectorProps {
  selectedNetwork: string;
  publicKey: any;
  selectedToken?: "SOL" | "USDC" | "USDT" | "SIN" | "WEIRD";
  onTokenSelect: (token: "SOL" | "USDC" | "USDT" | "SIN" | "WEIRD") => void;
  tokenBalances: Record<string, number>;
  nftExists: boolean;
  selectedPeriod: 1 | 6 | 12;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({
  selectedNetwork,
  publicKey,
  selectedToken,
  onTokenSelect,
  tokenBalances,
  selectedPeriod
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const tokens = selectedNetwork == "osmosis" ? TOKENS_DENOMS_OSMOSIS : TOKENS_DENOMS;

  const getPriceDisplay = (tokenValue: string) => {
      return `${TOKENS.AMOUNTS_SITE[tokenValue]} ${tokenValue}`;
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2 relative">
        <StepIndicator isDone={!!selectedToken} />
        <label className="custom-select-label">Select token to pay</label>
      </div>

      <button
        className="custom-select-trigger"
        onClick={() => setIsModalOpen(true)}
      >
        {selectedToken || "Select a token"}
      </button>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Select Token</h2>
            {tokens.map((token) => (
              <button
                key={token.value}
                className="modal-option"
                onClick={() => {
                  onTokenSelect(token.value as "SOL" | "USDC" | "USDT" | "SIN" | "WEIRD");
                  setIsModalOpen(false);
                }}
              >
                <div className="flex justify-between w-full">
                  <div className="flex items-center">
                    <img 
                      src={TOKEN_ICONS[token.label]} 
                      className="w-5 h-5 rounded-lg mr-2" 
                      alt={`${token.label} icon`} 
                    />
                    <span>{token.label}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-500">
                      price: {getPriceDisplay(token.value)}
                    </div>
                    {/* <div className="text-xs text-gray-400">
                      Balance: {tokenBalances?.[token.value] || 0}
                    </div> */}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenSelector;