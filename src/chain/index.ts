import * as buffer from "buffer";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

window.Buffer = buffer.Buffer;

declare global {
  interface Window {
    solana: any;
  }
}

export async function connectWallet(): Promise<PublicKey> {
  if (!window.solana?.isPhantom) {
    throw new Error("Phantom wallet not found");
  }
  const resp = await window.solana.connect();
  return resp.publicKey;
}

export function getWallet(): anchor.Wallet {
  const wallet = window.solana;

  if (!wallet || !wallet.isPhantom) {
    throw new Error("Phantom wallet not found. Please install it.");
  }

  return wallet;
}
