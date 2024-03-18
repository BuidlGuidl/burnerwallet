"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { History } from "~~/components/burnerwallet/History";
import { SendETHModal } from "~~/components/burnerwallet/SendETHModal";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <div className="flex flex-col gap-2 text-center m-auto overflow-x-hidden">
      {connectedAddress && <History address={connectedAddress} />}
      <SendETHModal modalId="send-eth-modal" />
    </div>
  );
};

export default Home;
