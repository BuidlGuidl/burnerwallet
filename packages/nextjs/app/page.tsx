"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { History } from "~~/components/burnerwallet/History";
import { SendETHModal } from "~~/components/burnerwallet/SendETHModal";
import { AddressQRCodeModal } from "~~/components/scaffold-eth/RainbowKitCustomConnectButton/AddressQRCodeModal";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <div>
      <section className="p-4">{connectedAddress && <History address={connectedAddress} />}</section>
      <SendETHModal modalId="send-eth-modal" />
      {connectedAddress && <AddressQRCodeModal modalId="qrcode-modal" address={connectedAddress} />}
    </div>
  );
};

export default Home;
