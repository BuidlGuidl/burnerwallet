"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Header } from "~~/components/Header";
import { History } from "~~/components/burnerwallet/History";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <Header />
      <main>
        <div className="max-w-xl mx-auto">
          <section className="px-6 pb-28 pt-2 divide-y">
            {connectedAddress && <History address={connectedAddress} />}
          </section>
        </div>
      </main>
    </>
  );
};

export default Home;
