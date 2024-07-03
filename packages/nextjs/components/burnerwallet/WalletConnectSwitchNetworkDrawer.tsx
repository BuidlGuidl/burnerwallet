"use client";

import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerLine, DrawerTitle } from "~~/components/Drawer";

export const WalletConnectSwitchNetworkDrawer = ({ walletConnectManager }: { walletConnectManager: any }) => {
  return (
    <Drawer open={walletConnectManager.isNetworkSwitchOpen} onOpenChange={walletConnectManager.setIsNetworkSwitchOpen}>
      <DrawerContent>
        <DrawerLine />
        <DrawerHeader>
          <DrawerTitle className="mt-1 text-2xl">WalletConnect Switch Network</DrawerTitle>
        </DrawerHeader>
        <div>
          <div className="flex flex-col items-center px-2">
            Do you want to switch to {walletConnectManager.networkFromRequest?.name}?
          </div>
          <div className="max-w-lg mx-auto m-8 text-center">
            <button
              className="btn btn-secondary mr-8"
              disabled={walletConnectManager.loading}
              onClick={walletConnectManager.onNetworkSwitchReject}
            >
              Reject
            </button>
            <button
              className="btn btn-primary"
              disabled={walletConnectManager.loading}
              onClick={walletConnectManager.onNetworkSwitchAccept}
            >
              Accept
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
