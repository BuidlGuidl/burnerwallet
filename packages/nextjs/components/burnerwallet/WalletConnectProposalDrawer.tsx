"use client";

import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerLine, DrawerTitle } from "~~/components/Drawer";
import { useWalletConnectManager } from "~~/hooks/useWalletConnectManager";

export const WalletConnectProposalDrawer = () => {
  const {
    isWalletConnectInitialized,
    isSessionProposalOpen,
    setIsSessionProposalOpen,
    sessionProposalData,
    onSessionProposalAccept,
    onSessionProposalReject,
  } = useWalletConnectManager();

  return (
    <Drawer open={isSessionProposalOpen} onOpenChange={setIsSessionProposalOpen}>
      <DrawerContent>
        <DrawerLine />
        <DrawerHeader>
          <DrawerTitle className="mt-1 text-2xl">WalletConnect</DrawerTitle>
        </DrawerHeader>
        {isWalletConnectInitialized ? (
          <div>
            <div className="flex flex-col items-center px-2">
              {sessionProposalData?.params?.proposer?.metadata?.icons[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt="Dapp Icon"
                  src={sessionProposalData.params.proposer.metadata.icons[0]}
                  width={64}
                  height={64}
                  className="mb-4"
                />
              )}
              <h2 className="text-xl font-bold mb-1">{sessionProposalData?.params?.proposer?.metadata?.name}</h2>
              <p className="mt-1">{sessionProposalData?.params?.proposer?.metadata?.url}</p>
              <p className="text-lg">Wants to connect to your wallet</p>
              <p className="font-bold">Requested permissions</p>
              <ul className="list-disc">
                <li>View your balance and activity</li>
                <li>Send approval requests</li>
              </ul>
            </div>
            <div className="max-w-lg mx-auto m-8 text-center">
              <button
                className="btn btn-secondary mr-8"
                onClick={() => {
                  onSessionProposalReject(sessionProposalData);
                  setIsSessionProposalOpen(false);
                }}
              >
                Reject
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  onSessionProposalAccept(sessionProposalData);
                  setIsSessionProposalOpen(false);
                }}
              >
                Connect
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
