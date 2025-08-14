import React, { useState, useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export const CustomWalletSelector: React.FC = () => {
  const { wallets, select, disconnect, connected, publicKey, wallet } =
    useWallet();
  const [opened, setOpened] = useState(false);

  const selectorRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  const installed = wallets.filter((w) => w.readyState === "Installed");
  const notInstalled = wallets.filter((w) => w.readyState !== "Installed");

  const toggleSelector = () => setOpened((prev) => !prev);

  useEffect(() => {
    if (connected) setOpened(false);
  }, [connected]);

  // Закрытие при клике вне меню
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        selectorRef.current &&
        !selectorRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setOpened(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      {!connected ? (
        <>
          <div
            ref={buttonRef}
            className="flex items-center gap-2 cursor-pointer"
            onClick={toggleSelector}
          >
            <div className="wallet-button mt-0 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
              ✦ <span className="font-medium">Connect your wallet!</span>
            </div>
          </div>

          {opened && (
            <div
              ref={selectorRef}
              className="wallet-selector payment-card absolute top-12 left-0 bg-white shadow-lg rounded-md p-4 z-10 !ml-auto !mr-0"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Select wallet:</span>
                <button
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                  onClick={() => setOpened(false)}
                >
                  ✕
                </button>
              </div>

              {installed.length > 0 ? (
                installed.map(({ adapter }) => (
                  <button
                    key={adapter.name}
                    className="wallet-button flex items-center gap-2 w-full text-left px-3 py-2 rounded-md hover:bg-gray-100"
                    onClick={() => select(adapter.name)}
                  >
                    <img
                      src={adapter.icon}
                      alt={adapter.name}
                      className="w-6 h-6"
                    />
                    {adapter.name}
                  </button>
                ))
              ) : (
                <p className="text-gray-500">No installed wallets found</p>
              )}

              {notInstalled.length > 0 && (
                <>
                  <span className="font-medium text-gray-500">
                    Not installed:
                  </span>
                  {notInstalled.map(({ adapter }) => (
                    <button
                      key={adapter.name}
                      className="wallet-button flex items-center gap-2 w-full text-left px-3 py-2 rounded-md text-gray-400 cursor-not-allowed"
                      disabled
                    >
                      <img
                        src={adapter.icon}
                        alt={adapter.name}
                        className="w-6 h-6"
                      />
                      {adapter.name} (Not Installed)
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center gap-2">
          <div
            className="wallet-button mt-0 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 cursor-pointer"
            onClick={disconnect}
          >
            {wallet && (
              <img
                src={wallet.adapter.icon}
                alt={wallet.adapter.name}
                className="w-6 h-6 rounded-bl-md"
              />
            )}
            <span className="font-medium">
              {publicKey?.toBase58().slice(0, 6)}...
              {publicKey?.toBase58().slice(-4)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
