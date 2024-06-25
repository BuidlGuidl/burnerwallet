"use client";

import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerLine, DrawerTitle } from "~~/components/Drawer";

export const WalletConnectTransactionDrawer = ({ walletConnectManager }: { walletConnectManager: any }) => {
  return (
    <Drawer
      open={walletConnectManager.isTransactionConfirmOpen}
      onOpenChange={walletConnectManager.setIsTransactionConfirmOpen}
    >
      <DrawerContent>
        <DrawerLine />
        <DrawerHeader>
          <DrawerTitle className="mt-1 text-2xl">{walletConnectManager.confirmationTitle}</DrawerTitle>
        </DrawerHeader>
        {walletConnectManager.isWalletConnectInitialized ? (
          <div>
            <div className="flex flex-col items-center px-2">{walletConnectManager.confirmationInfo}</div>
            <div className="max-w-lg mx-auto m-8 text-center">
              <button
                className="btn btn-secondary mr-8"
                disabled={walletConnectManager.loading}
                onClick={walletConnectManager.onRejectTransaction}
              >
                Reject
              </button>
              <button
                className="btn btn-primary"
                disabled={walletConnectManager.loading}
                onClick={walletConnectManager.onConfirmTransaction}
              >
                Accept
              </button>
            </div>
          </div>
        ) : (
          <div>Loading WalletConnect...</div>
        )}
      </DrawerContent>
    </Drawer>
  );
};
