"use client";

import { RandomLoadingBackground } from "./RandomLoadingBackground";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { useLocalStorage } from "usehooks-ts";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { NetworksDropdown } from "~~/components/NetworksDropdown";
import { ReceiveDrawer } from "~~/components/burnerwallet/ReceiveDrawer";
import { SendDrawer } from "~~/components/burnerwallet/SendDrawer";
import { SettingsDrawer } from "~~/components/burnerwallet/SettingsDrawer";
import { WalletConnectDrawer } from "~~/components/burnerwallet/WalletConnectDrawer";
import { Address, Balance } from "~~/components/scaffold-eth";
import { SCAFFOLD_CHAIN_ID_STORAGE_KEY, useAutoConnect } from "~~/hooks/scaffold-eth";
import WalletConnectIcon from "~~/icons/WalletConnectIcon";
import { useGlobalState } from "~~/services/store/store";
import { cn } from "~~/utils/cn";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

const networks = getTargetNetworks();

/**
 * Site header
 */
export const Header = ({ showIntro, updateHistory }: { showIntro: boolean; updateHistory: () => void }) => {
  useAutoConnect();

  const setChainId = useLocalStorage<number>(SCAFFOLD_CHAIN_ID_STORAGE_KEY, networks[0].id)[1];
  const walletConnectSession = useGlobalState(state => state.walletConnectSession);
  const setIsWalletConnectOpen = useGlobalState(state => state.setIsWalletConnectOpen);
  const { address: connectedAddress } = useAccount();
  const { switchNetwork } = useSwitchNetwork({
    onSuccess(data) {
      setChainId(data.id);
    },
  });
  const { chain } = useNetwork();

  return (
    <div className={cn("relative overflow-hidden")}>
      {connectedAddress && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Jazzicon
            diameter={600}
            paperStyles={{
              borderRadius: 0,
            }}
            seed={jsNumberForAddress(connectedAddress)}
          />
        </div>
      )}
      {showIntro && <RandomLoadingBackground />}
      <div className="relative z-10 p-6 glass">
        <div className="flex justify-between items-center mb-6">
          <SettingsDrawer />
          <div className="flex">
            {walletConnectSession && (
              <button
                className="mr-4"
                onClick={() => {
                  setIsWalletConnectOpen(true);
                }}
              >
                <WalletConnectIcon width="40" height="40" />
              </button>
            )}
            <NetworksDropdown
              onChange={option => switchNetwork?.(option.value)}
              value={chain ? chain.id : networks[0].id}
            />
          </div>
        </div>
        <div className="text-white">
          {!showIntro && <Address address={connectedAddress} disableAddressLink size="base" format="short" />}
          <div className="mt-8 mb-10 flex justify-center">
            <Balance className="text-6xl" address={connectedAddress} usdMode />
          </div>
        </div>
        <div className="flex items-center justify-center gap-6 mt-6">
          <ReceiveDrawer address={connectedAddress} />
          <SendDrawer address={connectedAddress} updateHistory={updateHistory} />
          <WalletConnectDrawer />
        </div>
      </div>
    </div>
  );
};
