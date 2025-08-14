import React from "react";
import { TOKENS } from "../config";

interface PayButtonProps {
  isEnabled: boolean;
  isLoading: boolean;
  selectedToken?: "SOL" | "USDC" | "USDT" | "SIN" | "WEIRD";
  onPay: () => void;
  selectedNetwork: string;
  nftExists: boolean;
  selectedPeriod: 1 | 6 | 12;
}

const PayButton: React.FC<PayButtonProps> = ({
  selectedNetwork,
  isEnabled,
  isLoading,
  selectedToken,
  nftExists,
  selectedPeriod,
  onPay,
}) => {
  const renderButtonText = () => {
    if (isLoading) {
      return (
        <span className="flex items-center justify-center">
          <svg
            className="spinner h-5 w-5 mr-2 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </span>
      );
    }

    if (!selectedToken) {
      return "Select a token";
    }

    const { amount, showDiscount } = getPaymentAmount(
      selectedToken, 
      selectedNetwork, 
      nftExists,
      selectedPeriod
    );
    
    return (
      <div className="flex flex-col items-center">
        <div>
          Pay {amount} {selectedToken}
        </div>
        {showDiscount && (
          <div className="text-xs text-green-400">
            Discount applied (-{selectedPeriod === 6 ? '10%' : '20%'})
          </div>
        )}
      </div>
    );
  };

  return (
    <button 
      onClick={onPay} 
      disabled={!isEnabled || isLoading} 
      className="pay-button"
    >
      {renderButtonText()}
    </button>
  );
};

const getPaymentAmount = (
  token: string, 
  network: string, 
  nftExists: boolean,
  period: 1 | 6 | 12
): { amount: string; showDiscount: boolean } => {
  if (!token || !network) return { amount: "0.00", showDiscount: false };

  if (network === "osmosis") {
    // Для Osmosis учитываем период и скидку
    const isDiscount = nftExists && period === 1;
    const price = isDiscount
      ? TOKENS.PRICES.DISPLAY.OSMOSIS_SKIDKA[token]
      : TOKENS.PRICES.DISPLAY.OSMOSIS[period][token];
    
    return {
      amount: price.toFixed(2),
      showDiscount: isDiscount || period !== 1
    };
  } else {
    // Для Solana оставляем старые цены (без периодов)
    return {
      amount: TOKENS.AMOUNTS_SITE[token].toFixed(2),
      showDiscount: false
    };
  }
};

export default PayButton;