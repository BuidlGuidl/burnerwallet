"use client";

import { useCallback, useState } from "react";
import { IntroModal } from "./IntroModal";
import { useAccount } from "wagmi";
import { setIntroCookie } from "~~/app/actions";
import { BurnerWalletWrapper } from "~~/components/BurnerWalletWrapper";
import { Header } from "~~/components/Header";
import { History } from "~~/components/burnerwallet/History";
import { useGetHistory } from "~~/hooks/useGetHistory";

const Homepage = ({ hasSeenIntro = false }: { hasSeenIntro: boolean }) => {
  const { address: connectedAddress = "" } = useAccount();
  const { chainId, isLoading, history, updateHistory } = useGetHistory({ address: connectedAddress });

  const [showIntro, setShowIntro] = useState(!hasSeenIntro);

  const onGenerateWallet = useCallback(() => {
    setIntroCookie();
    setShowIntro(false);
  }, []);

  return (
    <BurnerWalletWrapper>
      <Header showIntro={showIntro} updateHistory={updateHistory} />
      <main>
        <div className="max-w-xl mx-auto">
          <section className="px-6 pb-28 pt-2 divide-y">
            {connectedAddress && <History chainId={chainId} history={history} isLoading={isLoading} />}
          </section>
        </div>
      </main>
      {showIntro && <IntroModal onGenerateWallet={onGenerateWallet} />}
    </BurnerWalletWrapper>
  );
};

export default Homepage;