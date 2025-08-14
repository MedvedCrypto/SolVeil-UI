// components/TransactionLink.tsx
import React from "react";
import StepIndicator from "./StepIndicator";

interface TransactionLinkProps {
  selectedNetwork: string;
  txHash: string;
}

const TransactionLink: React.FC<TransactionLinkProps> = ({
  selectedNetwork,
  txHash,
}) => (
  <div className="tx-link mt-4 flex flex-col" >
    <div className="flex flex-col items-center gap-2 mb-2 relative w-full">
      <div className="flex items-center m-auto">
      <StepIndicator isDone={true} isAvailable={true} />
      <label className="ml-2 font-black text-lg">Payment has been processed!</label>
      </div>

      <label className="">Go to the bot and get your key:</label>
          <a href="https://t.me/vpn_707_bot">Go to bot</a>
      
    </div>
    {/* <span className="font-medium">Transaction:</span>
    <a
      href={` ${selectedNetwork === "solana" ? `https://explorer.solana.com/tx/${txHash}?cluster=mainnet-beta` : `mintscan.io/osmosis/txs/${txHash}`}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-400 hover:text-blue-300 ml-2"
    >
      {txHash.slice(0, 10)}...{txHash.slice(-10)}
    </a> */}
  </div>
);

export default TransactionLink;
