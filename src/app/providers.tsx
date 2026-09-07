"use client";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { NightlyWalletAdapter } from "@solana/wallet-adapter-nightly";
import { COOKIE_RPC, COOKIE_WSS } from "@/lib/cookie-chain";

export function Providers({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(() => [new NightlyWalletAdapter()], []);

  return (
    <ConnectionProvider
      endpoint={COOKIE_RPC}
      config={{ commitment: "confirmed", wsEndpoint: COOKIE_WSS }}
    >
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
