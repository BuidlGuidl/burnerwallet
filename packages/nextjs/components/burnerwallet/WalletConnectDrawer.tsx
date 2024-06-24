"use client";

import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerLine, DrawerTitle } from "~~/components/Drawer";
import { useWalletConnectManager } from "~~/hooks/useWalletConnectManager";

export const WalletConnectDrawer = () => {
  const {
    onConnect,
    disconnect,
    isWalletConnectOpen,
    setIsWalletConnectOpen,
    isWalletConnectInitialized,
    loading,
    walletConnectSession,
    walletConnectUid,
  } = useWalletConnectManager();

  return (
    <Drawer open={isWalletConnectOpen} onOpenChange={setIsWalletConnectOpen}>
      <DrawerContent>
        <DrawerLine />
        <DrawerHeader>
          <DrawerTitle className="mt-1 text-2xl">WalletConnect</DrawerTitle>
        </DrawerHeader>
        <div>
          <div className="max-w-lg mx-auto mb-8 text-center">
            {walletConnectSession ? (
              walletConnectUid ? (
                <button
                  disabled={!walletConnectUid || loading}
                  className="btn btn-neutral bg-white/50"
                  onClick={async () => {
                    await disconnect();
                    await onConnect({ uri: walletConnectUid });
                  }}
                >
                  {loading ? "Loading..." : "Disconnect and Connect to new Dapp"}
                </button>
              ) : (
                <div>
                  <div>Connected to {walletConnectSession.peer.metadata.name}</div>
                  <button className="btn btn-neutral bg-white/50" disabled={loading} onClick={disconnect}>
                    Disconnect
                  </button>
                </div>
              )
            ) : isWalletConnectInitialized ? (
              <button
                disabled={!walletConnectUid || loading}
                className="btn btn-neutral bg-white/50"
                onClick={() => onConnect({ uri: walletConnectUid })}
              >
                {loading ? "Loading..." : "Connect to Dapp"}
              </button>
            ) : (
              <div>Loading WalletConnect...</div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
