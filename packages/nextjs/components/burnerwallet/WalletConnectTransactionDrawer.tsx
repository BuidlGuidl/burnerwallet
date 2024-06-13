"use client";

import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerLine, DrawerTitle } from "~~/components/Drawer";
import { useWalletConnectManager } from "~~/hooks/useWalletConnectManager";

export const WalletConnectTransactionDrawer = () => {
  const {
    loading,
    isTransactionConfirmOpen,
    setIsTransactionConfirmOpen,
    confirmationTitle,
    confirmationInfo,
    onConfirmTransaction,
    onRejectTransaction,
  } = useWalletConnectManager();

  return (
    <Drawer open={isTransactionConfirmOpen} onOpenChange={setIsTransactionConfirmOpen}>
      <DrawerContent>
        <DrawerLine />
        <DrawerHeader>
          <DrawerTitle className="mt-1 text-2xl">{confirmationTitle}</DrawerTitle>
        </DrawerHeader>
        <div>
          <div className="flex flex-col items-center px-2">{confirmationInfo}</div>
          <div className="max-w-lg mx-auto m-8 text-center">
            <button className="btn btn-secondary mr-8" disabled={loading} onClick={onRejectTransaction}>
              Reject
            </button>
            <button className="btn btn-primary" disabled={loading} onClick={onConfirmTransaction}>
              Accept
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
