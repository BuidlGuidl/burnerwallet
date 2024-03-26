"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { History } from "~~/components/burnerwallet/History";
import { SendETHModal } from "~~/components/burnerwallet/SendETHModal";
import { AddressQRCodeModal } from "~~/components/scaffold-eth/RainbowKitCustomConnectButton/AddressQRCodeModal";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <div className="flex flex-col gap-2 text-center m-auto overflow-x-hidden">
      {connectedAddress && <History address={connectedAddress} />}
      <SendETHModal modalId="send-eth-modal" />
      {connectedAddress && <AddressQRCodeModal modalId="qrcode-modal" address={connectedAddress} />}
    </div>
  );
};

export default Home;
