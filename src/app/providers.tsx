"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { NightlyWalletAdapter } from "@solana/wallet-adapter-nightly";
import { COOKIE_RPC, COOKIE_WSS } from "@/lib/cookie-chain";

type NightlySolana = {
  genesisHash?: string;
  changeNetwork?: (network: { genesisHash: string; url?: string }) => Promise<unknown> | unknown;
};

type NightlyWindow = Window & {
  nightly?: {
    solana?: NightlySolana;
  };
};

type NetworkState = "idle" | "checking" | "correct" | "wrong" | "switching" | "error";

function NetworkGate({ children }: { children: React.ReactNode }) {
  const { connection } = useConnection();
  const { connected } = useWallet();
  const [state, setState] = useState<NetworkState>("idle");
  const [expectedGenesisHash, setExpectedGenesisHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkNetwork = useCallback(async () => {
    if (!connected) {
      setState("idle");
      setExpectedGenesisHash(null);
      setError(null);
      return;
    }

    setState("checking");
    setError(null);

    try {
      const genesisHash = await connection.getGenesisHash();
      setExpectedGenesisHash(genesisHash);

      const nightly = (window as NightlyWindow).nightly?.solana;
      if (!nightly?.genesisHash) {
        setState("error");
        setError("Nightly did not expose its active SVM network. Reconnect the wallet and try again.");
        return;
      }

      setState(nightly.genesisHash === genesisHash ? "correct" : "wrong");
    } catch (networkError) {
      setState("error");
      setError(networkError instanceof Error ? networkError.message : "Could not verify the active wallet network.");
    }
  }, [connected, connection]);

  useEffect(() => {
    void checkNetwork();
  }, [checkNetwork]);

  const switchNetwork = useCallback(async () => {
    if (!expectedGenesisHash) return;
    const nightly = (window as NightlyWindow).nightly?.solana;
    if (!nightly?.changeNetwork) {
      setState("error");
      setError("This Nightly version does not expose custom-network switching. Add Cookie Chain manually with the official RPC.");
      return;
    }

    setState("switching");
    setError(null);
    try {
      await nightly.changeNetwork({ genesisHash: expectedGenesisHash, url: COOKIE_RPC });
      await new Promise((resolve) => window.setTimeout(resolve, 350));
      await checkNetwork();
    } catch (switchError) {
      setState("wrong");
      setError(switchError instanceof Error ? switchError.message : "The network switch was cancelled or failed.");
    }
  }, [checkNetwork, expectedGenesisHash]);

  const blocked = connected && state !== "correct";

  return (
    <>
      <div aria-hidden={blocked ? undefined : true} className={blocked ? "network-blocked" : undefined}>
        {children}
      </div>
      {blocked && (
        <div className="network-gate" role="dialog" aria-modal="true" aria-labelledby="network-gate-title">
          <div className="network-gate-card">
            <span className="kicker">Nightly network check</span>
            <h2 id="network-gate-title">
              {state === "checking" || state === "switching" ? "Checking Cookie Chain…" : "Switch Nightly to Cookie Chain"}
            </h2>
            <p>
              OvenBench only signs benchmark transactions after Nightly is connected to the same Cookie Chain genesis as the app RPC.
            </p>
            {error && <div className="notice">{error}</div>}
            <div className="network-gate-actions">
              {state === "wrong" && (
                <button className="run-button network-switch-button" onClick={() => void switchNetwork()}>
                  Switch to Cookie Chain
                </button>
              )}
              {state === "error" && (
                <button className="text-button" onClick={() => void checkNetwork()}>
                  Check again
                </button>
              )}
            </div>
            <small>Official RPC: {COOKIE_RPC}</small>
          </div>
        </div>
      )}
    </>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(() => [new NightlyWalletAdapter()], []);

  return (
    <ConnectionProvider
      endpoint={COOKIE_RPC}
      config={{ commitment: "confirmed", wsEndpoint: COOKIE_WSS }}
    >
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          <NetworkGate>{children}</NetworkGate>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
