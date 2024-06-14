"use client";

import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerLine, DrawerTitle } from "~~/components/Drawer";
import { useWalletConnectManager } from "~~/hooks/useWalletConnectManager";

export const WalletConnectSwitchNetworkDrawer = () => {
  const {
    loading,
    isNetworkSwitchOpen,
    setIsNetworkSwitchOpen,
    onNetworkSwitchAccept,
    onNetworkSwitchReject,
    networkFromRequest,
  } = useWalletConnectManager();

  return (
    <Drawer open={isNetworkSwitchOpen} onOpenChange={setIsNetworkSwitchOpen}>
      <DrawerContent>
        <DrawerLine />
        <DrawerHeader>
          <DrawerTitle className="mt-1 text-2xl">WalletConnect Switch Network</DrawerTitle>
        </DrawerHeader>
        <div>
          <div className="flex flex-col items-center px-2">Do you want to switch to {networkFromRequest?.name}?</div>
          <div className="max-w-lg mx-auto m-8 text-center">
            <button className="btn btn-secondary mr-8" disabled={loading} onClick={onNetworkSwitchReject}>
              Reject
            </button>
            <button className="btn btn-primary" disabled={loading} onClick={onNetworkSwitchAccept}>
              Accept
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
