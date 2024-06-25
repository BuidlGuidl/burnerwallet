"use client";

import React from "react";
import { SessionTypes } from "@walletconnect/types";
import { Drawer, DrawerContent, DrawerHeader, DrawerLine, DrawerTitle } from "~~/components/Drawer";

export const WalletConnectDrawer = ({ walletConnectManager }: { walletConnectManager: any }) => {
  return (
    <Drawer open={walletConnectManager.isWalletConnectOpen} onOpenChange={walletConnectManager.setIsWalletConnectOpen}>
      <DrawerContent>
        <DrawerLine />
        <DrawerHeader>
          <DrawerTitle className="mt-1 text-2xl">WalletConnect</DrawerTitle>
        </DrawerHeader>
        <div>
          <div className="max-w-lg mx-auto">
            {walletConnectManager.isWalletConnectInitialized &&
              walletConnectManager.activeSessions.length > 0 &&
              walletConnectManager.activeSessions.map((session: SessionTypes.Struct) => (
                <div key={session.topic} className="flex justify-between items-center">
                  <div className="m-2">Connected to {session.peer.metadata.name}</div>
                  <button
                    className="btn btn-primary m-2"
                    disabled={walletConnectManager.loading}
                    onClick={async () => await walletConnectManager.disconnect(session)}
                  >
                    Disconnect
                  </button>
                </div>
              ))}
            {!walletConnectManager.isWalletConnectInitialized && <div>Loading WalletConnect...</div>}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
