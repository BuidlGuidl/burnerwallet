"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BurnerWalletWrapper } from "~~/components/BurnerWalletWrapper";
import { Header } from "~~/components/Header";
import { History } from "~~/components/burnerwallet/History";
import { useGetHistory } from "~~/hooks/useGetHistory";

const Home: NextPage = () => {
  const { address: connectedAddress = "" } = useAccount();
  const { chainId, isLoading, history, updateHistory } = useGetHistory({ address: connectedAddress });

  return (
    <BurnerWalletWrapper>
      <Header updateHistory={updateHistory} />
      <main>
        <div className="max-w-xl mx-auto">
          <section className="px-6 pb-28 pt-2 divide-y">
            {connectedAddress && <History chainId={chainId} history={history} isLoading={isLoading} />}
          </section>
        </div>
      </main>
    </BurnerWalletWrapper>
  );
};

export default Home;
