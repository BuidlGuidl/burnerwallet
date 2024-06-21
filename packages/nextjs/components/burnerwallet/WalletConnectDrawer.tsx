"use client";

import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerLine, DrawerTitle } from "~~/components/Drawer";
import { useWalletConnectManager } from "~~/hooks/useWalletConnectManager";

export const WalletConnectDrawer = () => {
  const {
    activeSessions,
    disconnect,
    isWalletConnectOpen,
    setIsWalletConnectOpen,
    isWalletConnectInitialized,
    loading,
  } = useWalletConnectManager();

  return (
    <Drawer open={isWalletConnectOpen} onOpenChange={setIsWalletConnectOpen}>
      <DrawerContent>
        <DrawerLine />
        <DrawerHeader>
          <DrawerTitle className="mt-1 text-2xl">WalletConnect</DrawerTitle>
        </DrawerHeader>
        <div>
          <div className="max-w-lg mx-auto">
            {isWalletConnectInitialized &&
              activeSessions.length > 0 &&
              activeSessions.map(session => (
                <div key={session.topic} className="flex justify-between items-center">
                  <div className="m-2">Connected to {session.peer.metadata.name}</div>
                  <button
                    className="btn btn-primary m-2"
                    disabled={loading}
                    onClick={async () => await disconnect(session)}
                  >
                    Disconnect
                  </button>
                </div>
              ))}
            {!isWalletConnectInitialized && <div>Loading WalletConnect...</div>}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
