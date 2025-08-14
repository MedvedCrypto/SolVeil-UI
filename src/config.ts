// config.ts
import { PublicKey } from "@solana/web3.js";

export const TOKENS = {
  // Solana addresses
  TARGET_ADDRESS: new PublicKey("8gLxKWtussxyWpprs3dsQds3a8WshSsWyBj5hLtt2jTy"),
  USDC_MINT: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
  USDT_MINT: new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"),
  TOKEN_PROGRAM_ID: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
  MEMO_PROGRAM_ID: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),

  REG_PROGRAM_ID: new PublicKey("3RVBZDA6dgcjkGJtXRJxLvLh5g8qY6QwGHoribyKPN2E"),

  // Prices in native units (lamports for SOL, uTokens for others)
  AMOUNTS: {
    SOL: 15_000_000, // 0.015 SOL
    USDC: 1_990_000, // 1.99 USDC
    USDT: 1_990_000  // 1.99 USDT
  },
  
  // Prices for display on site
  AMOUNTS_SITE: {
    SOL: 0.015,
    USDC: 1.99,
    USDT: 1.99
  },

  // Osmosis prices in native units (uTokens)
  AMOUNTS_OSMOSIS: {
    USDC: 1_990_000,  // 1.99 USDC
    WEIRD: 75_000_000, // 75 WEIRD
    SIN: 100_000_000   // 100 SIN
  },

  // Osmosis prices for display
  AMOUNTS_SITE_OSMOSIS: {
    USDC: 1.99,
    WEIRD: 75,
    SIN: 100
  },

  // Discounted prices (native units)
  AMOUNTS_OSMOSIS_skidka: {
    USDC: 1_500_000,  // 1.50 USDC
    WEIRD: 50_000_000, // 50 WEIRD
    SIN: 75_000_000    // 75 SIN
  },

  // Discounted prices for display
  AMOUNTS_SITE_OSMOSIS_skidka: {
    USDC: 1.50,
    WEIRD: 50,
    SIN: 75
  },

  // Multi-period pricing (native units)
  PRICES: {
    // Osmosis prices (uTokens)
    OSMOSIS: {
      1: {
        USDC: 1_990_000,
        WEIRD: 75_000_000,
        SIN: 100_000_000
      },
      6: {
        USDC: 10_750_000,   // 1.99 * 6 * 0.9
        WEIRD: 405_000_000,  // 75 * 6 * 0.9
        SIN: 540_000_000     // 100 * 6 * 0.9
      },
      12: {
        USDC: 19_100_000,    // 1.99 * 12 * 0.8
        WEIRD: 720_000_000,  // 75 * 12 * 0.8
        SIN: 960_000_000     // 100 * 12 * 0.8
      }
    },
    
    OSMOSIS_SKIDKA: {
      USDC: 1_500_000,
      WEIRD: 50_000_000,
      SIN: 75_000_000
    },
    
    // Display prices
    DISPLAY: {
      OSMOSIS: {
        1: {
          USDC: 1.99,
          WEIRD: 75,
          SIN: 100
        },
        6: {
          USDC: 10.75,
          WEIRD: 405,
          SIN: 540
        },
        12: {
          USDC: 19.10,
          WEIRD: 720,
          SIN: 960
        }
      },
      OSMOSIS_SKIDKA: {
        USDC: 1.5,
        WEIRD: 50,
        SIN: 75
      }
    }
  },

  // Helper function to get price
  getPrice: (token: string, period: number, isDiscount: boolean): number => {
    if (isDiscount && period === 1) {
      return TOKENS.PRICES.OSMOSIS_SKIDKA[token];
    }
    return TOKENS.PRICES.OSMOSIS[period][token];
  }
};

export const TOKEN_ICONS = {
  SOL: "https://ipfs-gw.stargaze-apis.com/ipfs/Qme551yKU6a5Cptsk8hxcMtWwTrKkHArZtTTwFSvu19eFD",
  USDC: "https://ipfs-gw.stargaze-apis.com/ipfs/QmV17MDKrb3aCQa2a2SzBZaCeAeAFrpFmqCjn351cWApGS",
  USDT: "https://ipfs-gw.stargaze-apis.com/ipfs/QmdUshyLUMRgwy6Wirj6r3dwQsUddmrG2tVVfPXN8XfCjd",
  SIN: "http://ipfs-gw.stargaze-apis.com/ipfs/QmRbHQJvDEStbY94A6AdUzN6gSNVsuK6qgVNakwYYv4wtw",
  WEIRD: "https://ipfs-gw.stargaze-apis.com/ipfs/Qmc3yaWvVL78FQzQJCWCrxkgGNAfprCxbBs5n8bYrtbaE7"
};

export const NETWORKS = [
  { label: "Solana", value: "solana" },
  { label: "Osmosis", value: "osmosis" }
];

export const TOKENS_DENOMS = [
  { label: "SOL", value: "SOL" },
  { label: "USDC", value: "USDC", denom: TOKENS.USDC_MINT },
  { label: "USDT", value: "USDT", denom: TOKENS.USDT_MINT }
];

export const TOKENS_DENOMS_OSMOSIS = [
  { label: "USDC", value: "USDC", denom: "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4" },
  { label: "WEIRD", value: "WEIRD", denom: "ibc/38ADC6FFDDDB7D70B72AD0322CEA8844CB18FAA0A23400DBA8A99D43E18B3748" },
  { label: "SIN", value: "SIN", denom: "ibc/2BF7FB3908B469FA9672767DC74AF8A18E2F47F8B623B0685DE290B828FCBD23" }
];

export type TokenBalances = {
  SOL: number;
  USDC: number;
  USDT: number;
};

export type TokenBalancesCosmos = {
  USDC: number;
  WEIRD: number;
  SIN: number;
};