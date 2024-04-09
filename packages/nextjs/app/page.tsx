"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { History } from "~~/components/burnerwallet/History";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <div className="max-w-xl mx-auto">
      <section className="px-6 pb-28 pt-2 divide-y">
        {connectedAddress && <History address={connectedAddress} />}
      </section>
    </div>
  );
};

export default Home;
