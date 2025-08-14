import React, { useState, useEffect } from "react";
import { getProgram, getProvider, l } from "./common/utils";
import { COMMITMENT } from "./common/config";
import type { Registry } from "./common/schema/types/registry";
import type { DexAdapter } from "./common/schema/types/dex_adapter";
import type { ClmmMock } from "./common/schema/types/clmm_mock";
import RegIdl from "./common/schema/idl/registry.json";
import DexIdl from "./common/schema/idl/dex_adapter.json";
import clmmIdl from "./common/schema/idl/clmm_mock.json";
import { CustomWalletSelector } from "./providers/CustomWalletSelector";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  ComputeBudgetProgram,
  Connection,
  clusterApiUrl,
  SendTransactionError,
  PublicKey,
} from "@solana/web3.js";
import "./index.css";
import { RegistryHelpers, DexAdapterHelpers } from "./common/account";
import { getWallet } from "./chain";
import { AnchorProvider } from "@coral-xyz/anchor";
import { DataRecord, TxParams } from "./common/interfaces";
import { MessageSigningWallet } from "./common/account/encryption";
import { RequestAccountRotationArgs } from "./common/interfaces/registry";

type Notification = {
  id: number;
  message: string;
  type: "success" | "error" | "info";
  timestamp: Date;
};

const App: React.FC = () => {
  const [txHash, setTxHash] = useState<string>("");
  const [rpcUrl, setRpcUrl] = useState<string>(clusterApiUrl("devnet"));
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };
  const [provider, setProvider] = useState<AnchorProvider>(() =>
    getProvider(getWallet(), rpcUrl, COMMITMENT)
  );
  const [program, setProgram] = useState(() =>
    getProgram<Registry>(provider, RegIdl as any)
  );
  const [programDex, setProgramDex] = useState(() =>
    getProgram<DexAdapter>(provider, DexIdl as any)
  );
  const [programClmm, setProgramClmm] = useState(() =>
    getProgram<ClmmMock>(provider, clmmIdl as any)
  );
  const [connection, setConnection] = useState<Connection>(
    new Connection(rpcUrl, COMMITMENT)
  );
  const [balance, setBalance] = useState<number | null>(null);
  const [feeInput, setFeeInput] = useState<number>(5000); // Micro-lamports
  const [maxDataSize, setMaxDataSize] = useState<number>(10000); // Default maxDataSize 
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [configData, setConfigData] = useState<any>(null);
  const [rotationArgs, setRotationArgs] = useState<RequestAccountRotationArgs>({
    newOwner: PublicKey.default,
  });
  const { publicKey, signTransaction, signMessage } = useWallet();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [dataRecord, setDataRecord] = useState<DataRecord>({
    Date: Math.floor(Date.now() / 1000), // Unix timestamp
    label: "pass",
    password: "",
    note: "",
  });

  // Initialize RegistryHelpers
  const registryHelpers = new RegistryHelpers(provider, program);
  const dexHelpers = new DexAdapterHelpers(
    provider,
    programDex,
    new PublicKey("EXcPAkk4fXUpabER61k2KTURT4bL7cgfxTmi6AyDkJLD"),
    programClmm
  );

  // Add notification
  const addNotification = (
    message: string,
    type: "success" | "error" | "info"
  ) => {
    const newNotification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date(),
    };
    setNotifications((prev) => [newNotification, ...prev].slice(0, 5));
    setTimeout(() => {
      setNotifications((prev) =>
        prev.filter((n) => n.id !== newNotification.id)
      );
    }, 5000);
  };

  // Update connection and provider when RPC changes
  useEffect(() => {
    const newConnection = new Connection(rpcUrl, COMMITMENT);
    setConnection(newConnection);
    const newProvider = getProvider(
      getWallet(),
      rpcUrl,
      COMMITMENT,
      newConnection
    );
    setProvider(newProvider);
    setProgram(getProgram<Registry>(newProvider, RegIdl as any));
    setProgramDex(getProgram<DexAdapter>(newProvider, DexIdl as any));
    setProgramClmm(getProgram<ClmmMock>(newProvider, clmmIdl as any));
  }, [rpcUrl]);

  // Fetch balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey) return;

      try {
        const lamports = await connection.getBalance(publicKey);
        setBalance(lamports / 1e9);
      } catch (e) {
        l(e);
        addNotification("Failed to load balance", "error");
      }

      try {
        const userInfo = await registryHelpers.queryUserAccount(
          publicKey,
          false
        );
        console.log(userInfo);
        setUserInfo(userInfo);
      } catch (e) {
        l(e);
        setUserInfo(null);
      }
    };

    fetchBalance();
  }, [publicKey, connection, txHash, rpcUrl]);

  const handleTransaction = async (
    actionName: string,
    createInstruction: () => Promise<anchor.web3.TransactionInstruction>,
    successMessage: string
  ) => {
    if (!publicKey || !signTransaction) {
      addNotification("Connect your wallet!", "error");
      return;
    }
    setIsLoading(true);
    addNotification(`${actionName}...`, "info");
    try {
      const txParams: TxParams = {
        priorityFee: { k: 1, b: feeInput },
        cpu: { k: 1, b: 600_000 },
      };
      const cuLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
        units: 600_000,
      });
      const cuPriceIx = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: feeInput,
      });
      const instruction = await createInstruction();
      const tx = new anchor.web3.Transaction()
        .add(cuPriceIx)
        .add(cuLimitIx)
        .add(instruction);
      tx.feePayer = publicKey;
      const { blockhash } = await connection.getLatestBlockhash("confirmed");
      tx.recentBlockhash = blockhash;
      const signed = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
      });
      setTxHash(sig);
      addNotification(`Transaction sent: ${sig.slice(0, 10)}...`, "info");
      await connection.confirmTransaction(
        {
          signature: sig,
          blockhash,
          lastValidBlockHeight: (await connection.getLatestBlockhash())
            .lastValidBlockHeight,
        },
        "confirmed"
      );
      addNotification(successMessage, "success");
    } catch (err) {
      let errorMessage = `Error: ${err instanceof Error ? err.message : String(err)}`;
      if (err instanceof SendTransactionError) {
        const logs = await err.getLogs(connection);
        errorMessage += `\nLogs: ${JSON.stringify(logs, null, 2)}`;
      }
      addNotification(errorMessage, "error");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuery = async (
    actionName: string,
    queryAction: () => Promise<any>,
    successMessage: string | ((result: any) => string),
    onSuccess?: (result: any) => void
  ) => {
    if (!publicKey) {
      addNotification("Connect your wallet!", "error");
      return;
    }
    setIsLoading(true);
    addNotification(`${actionName}...`, "info");
    try {
      console.log(queryAction);
      const result = await queryAction();

      const message =
        typeof successMessage === "function"
          ? successMessage(result)
          : successMessage;
      if (onSuccess) onSuccess(result);
      addNotification(message, "success");
      return result;
    } catch (err) {
      addNotification(
        `Error: ${err instanceof Error ? err.message : String(err)}`,
        "error"
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestAccountRotation = async () => {
    if (rotationArgs.newOwner.equals(PublicKey.default)) {
      addNotification("Specify the new owner's address!", "error");
      return;
    }
    await handleTransaction(
      "Request account rotation",
      () =>
        registryHelpers.tryRequestAccountRotation(
          rotationArgs,
          { priorityFee: { k: 1, b: feeInput }, cpu: { k: 1, b: 600_000 } },
          true
        ),
      "Account rotation requested!"
    );
  };

  const handleConfirmAccountRotation = async () => {
    await handleTransaction(
      "Confirm account rotation",
      () =>
        registryHelpers.tryConfirmAccountRotation(
          new PublicKey(rotationArgs.newOwner),
          { priorityFee: { k: 1, b: feeInput }, cpu: { k: 1, b: 600_000 } },
          true
        ),
      "Account rotation confirmed!"
    );
  };

  const handleCloseAccount = async () => {
    await handleTransaction(
      "Close account",
      () =>
        registryHelpers.tryCloseAccount(
          { priorityFee: { k: 1, b: feeInput }, cpu: { k: 1, b: 600_000 } },
          true
        ),
      "Account successfully closed!"
    );
  };

  // Read data
  const handleReadData = async () => {
    if (!signMessage) {
      addNotification("Wallet doesn't support message signing!", "error");
      return;
    }
    await handleQuery(
      "Reading data",
      async () => {
        const wallet: MessageSigningWallet = { publicKey, signMessage };
        const userAccount = await registryHelpers.queryUserAccount(
          publicKey,
          true
        );
        if (!userAccount || !userAccount.data) {
          throw new Error("Account data not found!");
        }
        return await registryHelpers.readUserData(
          wallet,
          userAccount.data,
          userAccount.nonce,
          true
        );
      },
      "Data read successfully!",
      (data) => setConfigData(data)
    );
  };

  // Reopen account
  const handleReopenAccount = async () => {
    await handleTransaction(
      "Reopen account",
      () =>
        registryHelpers.tryReopenAccount(
          { maxDataSize: 1_000 },
          { priorityFee: { k: 1, b: feeInput }, cpu: { k: 1, b: 600_000 } },
          true
        ),
      "Account reopened successfully!"
    );
  };

  // Handle simulateCreateAccount
  const handleSimulateCreateAccount = async () => {
    if (maxDataSize <= 0) {
      addNotification("Maximum data size must be greater than 0!", "error");
      return;
    }
    await handleQuery(
      "Simulate account creation",
      () => registryHelpers.simulateCreateAccount(maxDataSize, feeInput, true),
      (result) =>
        `Estimated cost: ${result?.txPrice.toFixed(6)} SOL (CU: ${result?.cu})`
    );
  };

  // Handle createAccount transaction
  const handleCreateAccount = async () => {
    if (maxDataSize <= 0) {
      addNotification("Maximum data size must be greater than 0!", "error");
      return;
    }
    await handleTransaction(
      "Create account",
      async () => {
        const simResult = await registryHelpers.simulateCreateAccount(
          maxDataSize,
          feeInput,
          true
        );
        const txParams: TxParams = {
          priorityFee: { k: 1, b: feeInput },
          cpu: { k: simResult.cu, b: 5000 },
        };
        const revenueMint = new PublicKey(
          "fPcP9vGoowPikgu7oTRCJKHUvSNn9N5WZhYshR4UXyo"
        );
        return await registryHelpers.tryCreateAndActivateAccount(
          maxDataSize,
          revenueMint,
          txParams,
          true
        );
      },
      "Account created successfully!"
    );
  };

  // Handle writeData
  const handleWrite = async () => {
    if (!signMessage) {
      addNotification("Wallet doesn't support message signing!", "error");
      return;
    }
    if (!dataRecord.label || !dataRecord.password || !dataRecord.note) {
      addNotification("Fill all DataRecord fields!", "error");
      return;
    }
    await handleTransaction(
      "Write data",
      async () => {
        const wallet: MessageSigningWallet = { publicKey, signMessage };
        const data: DataRecord[] = [dataRecord];
        return await registryHelpers.tryWriteData(
          wallet,
          data,
          { priorityFee: { k: 1, b: feeInput }, cpu: { k: 1, b: 600_000 } },
          true
        );
      },
      "Data written successfully!"
    );
  };

  return (
    <div className="app">
      {/* Notifications */}
      <div className="notifications-container">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification ${notification.type}`}
          >
            {notification.message}
          </div>
        ))}
      </div>

      <div className="menuTop">
        <div className="flex content-center items-baseline">
          <div className="payment-title">
            <img src="./logo.png"></img>SolVeil
          </div>
          <div className="ml-[42px]">
            Estimate fee for account creation: 0.072 SOL
          </div>
        </div>
        <div className="card">
          <CustomWalletSelector />
        </div>
      </div>

      <div className="qwe !mt-[124px] payment-card p-6 rounded-xl bg-[var(--color-back)] shadow-xl space-y-4 text-[var(--color-text-light)]">
        {/* Account existence information */}
        <div className="text-lg font-semibold mb-4">
          {userInfo !== null
            ? "You have an account"
            : "No account found, create a new one or transfer from your old address using 'Transfer account'"}
        </div>

        {/* If account exists */}
        {userInfo !== null && (
          <>
            {/* 1. Get encrypted data */}
            <div className="button123 border border-[var(--color-accent)] rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection("read")}
                className="w-full text-left px-4 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] transition font-medium"
              >
                Get encrypted data
              </button>
              {openSection === "read" && (
                <div className="p-4 bg-[var(--color-light)] space-y-3">
                  <button
                    onClick={handleReadData}
                    disabled={isLoading}
                    className="w-full bg-[var(--color-info)] hover:bg-blue-700 text-white py-2 rounded-lg transition"
                  >
                    {isLoading ? "Reading..." : "Read data"}
                  </button>

                  {/* Display read data if available */}
                  {configData && (
                    <div className="mt-4 space-y-3">
                      {Array.isArray(configData) ? (
                        configData.map((item, index) => (
                          <div
                            key={index}
                            className="p-3 bg-[var(--color-dark)] rounded-lg"
                          >
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">
                                  <span className="text-sm opacity-70">
                                    Note
                                  </span>
                                  <br></br>
                                  {item.note || "No note"}
                                </span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      item.note || ""
                                    );
                                    addNotification("Note copied!", "success");
                                  }}
                                  className="text-[var(--color-accent)] hover:text-[var(--color-primary)] transition ml-2"
                                  title="Copy note"
                                >
                                  <svg
                                    className="w-4 h-4 cursor-pointer"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="#fff"
                                    viewBox="0 0 16 16"
                                  >
                                    <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
                                    <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
                                  </svg>
                                </button>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="font-mono">
                                  <span className="text-sm opacity-70">
                                    Password
                                  </span>
                                  <br></br>
                                  {item.password || "No password"}
                                </span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      item.password || ""
                                    );
                                    addNotification(
                                      "Password copied!",
                                      "success"
                                    );
                                  }}
                                  className="text-[var(--color-accent)] hover:text-[var(--color-primary)] transition ml-2"
                                  title="Copy password"
                                >
                                  <svg
                                    className="w-4 h-4 cursor-pointer"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="#fff"
                                    viewBox="0 0 16 16"
                                  >
                                    <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
                                    <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 bg-[var(--color-dark)] rounded-lg">
                          <pre className="text-sm overflow-auto max-h-60 p-2 bg-[var(--color-back)] rounded">
                            {JSON.stringify(configData, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Record new data */}
            <div className="button123 border border-[var(--color-accent)] rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection("write")}
                className="w-full text-left px-4 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] transition font-medium"
              >
                Record new data
              </button>
              {openSection === "write" && (
                <div className="p-4 bg-[var(--color-light)] space-y-3">
                  {/* Note field */}
                  <div className="form-group flex flex-col gap-1">
                    <label
                      htmlFor="note"
                      className="text-sm font-medium text-[var(--color-text-light)]"
                    >
                      Note:
                    </label>
                    <input
                      id="note"
                      type="text"
                      value={dataRecord.note}
                      onChange={(e) =>
                        setDataRecord({ ...dataRecord, note: e.target.value })
                      }
                      placeholder="Enter note"
                      className="w-full rounded-lg border border-[var(--color-accent)] bg-[var(--color-light)] px-3 py-2 text-[var(--color-text-light)] placeholder-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition"
                    />
                  </div>

                  {/* Password field */}
                  <div className="form-group flex flex-col gap-1">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-[var(--color-text-light)]"
                    >
                      Password:
                    </label>
                    <input
                      id="password"
                      type="text"
                      value={dataRecord.password}
                      onChange={(e) =>
                        setDataRecord({
                          ...dataRecord,
                          password: e.target.value,
                        })
                      }
                      placeholder="Enter password"
                      className="w-full rounded-lg border border-[var(--color-accent)] bg-[var(--color-light)] px-3 py-2 text-[var(--color-text-light)] placeholder-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition"
                    />
                  </div>

                  <button
                    onClick={handleWrite}
                    disabled={isLoading}
                    className="w-full bg-[var(--color-success)] hover:bg-green-700 text-white py-2 rounded-lg transition"
                  >
                    {isLoading ? "Processing..." : "Write Data"}
                  </button>
                </div>
              )}
            </div>

            {/* 3. Transfer account */}
            <div className="button123 border border-[var(--color-accent)] rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection("transfer")}
                className="w-full text-left px-4 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] transition font-medium"
              >
                Transfer account
              </button>
              {openSection === "transfer" && (
                <div className="p-4 bg-[var(--color-light)] space-y-3">
                  {/* New owner input */}
                  <div className="form-group flex flex-col gap-1">
                    <label
                      htmlFor="newOwner"
                      className="text-sm font-medium text-[var(--color-text-light)]"
                    >
                      New owner (address):
                    </label>
                    <input
                      id="newOwner"
                      type="text"
                      value={rotationArgs.newOwner.toBase58()}
                      onChange={(e) => {
                        try {
                          setRotationArgs({
                            newOwner: new PublicKey(e.target.value),
                          });
                        } catch {
                          addNotification(
                            "Incorrect address of the new owner!",
                            "error"
                          );
                        }
                      }}
                      placeholder="Enter the address of the new owner"
                      className="w-full rounded-lg border border-[var(--color-accent)] bg-[var(--color-light)] px-3 py-2 text-[var(--color-text-light)] placeholder-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition"
                    />
                  </div>
                  {/* Rotation buttons */}
                  <button
                    onClick={handleRequestAccountRotation}
                    disabled={isLoading}
                    className="w-full bg-[var(--color-warning,#f59e0b)] hover:bg-yellow-600 text-white py-2 rounded-lg transition"
                  >
                    {isLoading ? "Processing..." : "Request account rotation"}
                  </button>
                  <button
                    onClick={handleConfirmAccountRotation}
                    disabled={isLoading}
                    className="w-full bg-[var(--color-success)] hover:bg-green-700 text-white py-2 rounded-lg transition"
                  >
                    {isLoading ? "Processing..." : "Confirm account rotation"}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* If account doesn't exist */}
        {userInfo === null && (
          <div className="border border-[var(--color-accent)] rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("create")}
              className="w-full text-left px-4 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] transition font-medium"
            >
              Create account
            </button>
            {openSection === "create" && (
              <div className="p-4 bg-[var(--color-light)]">
                <button
                  onClick={handleCreateAccount}
                  disabled={isLoading}
                  className="w-full bg-[var(--color-success)] hover:bg-green-700 text-white py-2 rounded-lg transition"
                >
                  {isLoading ? "Processing..." : "Create Account"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
