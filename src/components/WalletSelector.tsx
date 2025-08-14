import React, { useState } from "react";
import { CustomWalletSelector } from "../providers/CustomWalletSelector";
import { CustomWalletSelectorOsmosis } from "../providers/CustomWalletSelectorOsmosis";
import StepIndicator from "./StepIndicator";
import { TokenBalances } from "../types";
import { TOKEN_ICONS, TOKENS } from "../config";

interface WalletSelectorProps {
  selectedNetwork: string;
  publicKey: string | null;
  tokenBalances: TokenBalances;
  ownerAddr: string | null;
  disconnectWallet: () => void;
  btnConnect: (wallet: string) => void;
  nftExists: boolean;
  selectedPeriod: 1 | 6 | 12;
}

const WalletBalanceList: React.FC<{
  selectedNetwork: string;
  tokenBalances: TokenBalances;
  nftExists: boolean;
  selectedPeriod: 1 | 6 | 12;
}> = ({ selectedNetwork, tokenBalances, nftExists, selectedPeriod }) => {
const getPaymentAmount = (
  token: string, 
  network: string, 
  nftExists: boolean,
  period: 1 | 6 | 12
): { amount: string, isSpecialDiscount: boolean } => {
  if (!token || !network) return { amount: "0.00", isSpecialDiscount: false };

  if (network === "osmosis") {
    const isSpecialToken = token === "SIN" || token === "WEIRD";
    // Для Osmosis учитываем период и скидку
    const isDiscount = nftExists && period === 1;
    const price = isDiscount
      ? TOKENS.PRICES.DISPLAY.OSMOSIS_SKIDKA[token]
      : TOKENS.PRICES.DISPLAY.OSMOSIS[period][token];
    

    if(price){
      return {
        amount: price.toFixed(2),
        isSpecialDiscount: isSpecialToken
      };
    }else{
      return {
        amount: 0,
        isSpecialDiscount: isSpecialToken
      };
    }

  } else {
    // Для Solana оставляем старые цены (без периодов)
    return {
      amount: TOKENS.AMOUNTS_SITE[token].toFixed(2),
      isSpecialDiscount: false
    };
  }
};

  return (
    <div className="mt-4">

      <table className="min-w-full table-auto border-collapse text-sm text-white">
        <thead>
          <tr className="text-left border-b border-white/20">
            <th className="py-2">Token</th>
            <th className="py-2">Balance</th>
            <th className="py-2 w-12">Price</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {Object.entries(tokenBalances).map(([token, balance]) => {
            const { amount, isSpecialDiscount } = getPaymentAmount(token, selectedNetwork, nftExists, selectedPeriod);
            
            return (
              <tr key={token}>
                <td className="py-2 flex items-center gap-2">
                  <img
                    src={TOKEN_ICONS[token as keyof TokenBalances] || TOKEN_ICONS.USDC}
                    className="w-5 h-5 rounded-full"
                    alt={`${token} icon`}
                  />
                  <span className="font-medium">{token}</span>
                </td>
                <td className="py-2">{balance.toFixed(token === "SOL" ? 3 : 2)}</td>
                <td className="py-2 max-w-[8rem] truncate">
                  <div className="flex items-center gap-2">
                    <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent font-bold">
                      {amount}
                    </span>
                     {isSpecialDiscount && <span className="discount-badge bg-green-600 rounded-sm">-30%</span>}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const WalletSelector: React.FC<WalletSelectorProps> = ({
  selectedNetwork,
  publicKey,
  tokenBalances,
  selectedPeriod
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isConnected = publicKey ? true : false
  const WalletComponent = CustomWalletSelector

  return (
    <div className="wallet-select-wrapper mb-12">
      <div className="flex items-start gap-2 mb-2">
        <StepIndicator isDone={isConnected} isAvailable={!!selectedNetwork} />
        <label className="custom-select-label">Select Wallet</label>
        {isConnected && (
          <div className="ml-auto w-fit">
            <WalletComponent
            />
          </div>
        )}
      </div>

      {!isConnected ? (
        <>
          <button
            className="custom-select-trigger"
            onClick={() => setIsModalOpen(true)}
          >
            Select Wallet
          </button>
          {isModalOpen && (
            <div
              className="modal-overlay"
              onClick={() => setIsModalOpen(false)}
            >
              <div className="modal-box">
                <WalletComponent
                />
              </div>
            </div>
          )}
        </>
      ) : (
        <WalletBalanceList
          selectedNetwork={selectedNetwork}
          tokenBalances={tokenBalances}
          selectedPeriod={selectedPeriod}
        />
      )}
    </div>
  );
};

export default WalletSelector;