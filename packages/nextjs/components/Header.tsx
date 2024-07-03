"use client";

import { RandomLoadingBackground } from "./RandomLoadingBackground";
import { WalletConnectProposalDrawer } from "./burnerwallet/WalletConnectProposalDrawer";
import { WalletConnectSwitchNetworkDrawer } from "./burnerwallet/WalletConnectSwitchNetworkDrawer";
import { WalletConnectTransactionDrawer } from "./burnerwallet/WalletConnectTransactionDrawer";
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
import { useWalletConnectManager } from "~~/hooks/useWalletConnectManager";
import WalletConnectIcon from "~~/icons/WalletConnectIcon";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

const networks = getTargetNetworks();

type HeaderProps = {
  isGenerateWalletLoading: boolean;
  showIntro: boolean;
  updateHistory: () => void;
};

/**
 * Site header
 */
export const Header = ({ isGenerateWalletLoading, showIntro, updateHistory }: HeaderProps) => {
  useAutoConnect();

  const setChainId = useLocalStorage<number>(SCAFFOLD_CHAIN_ID_STORAGE_KEY, networks[0].id)[1];
  const { address: connectedAddress } = useAccount();
  const { switchNetwork } = useSwitchNetwork({
    onSuccess(data) {
      setChainId(data.id);
    },
  });
  const { chain } = useNetwork();

  const walletConnectManager = useWalletConnectManager();

  return (
    <div className={"relative overflow-hidden"}>
      {connectedAddress && !showIntro && (
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
      {showIntro && <RandomLoadingBackground isLoading={isGenerateWalletLoading} />}
      <div className="relative z-10 p-6 glass">
        <div className="flex justify-between items-center mb-6">
          <SettingsDrawer />
          <div className="flex">
            {walletConnectManager.activeSessions.length > 0 && (
              <button
                className="mr-4"
                onClick={() => {
                  walletConnectManager.setIsWalletConnectOpen(true);
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
          <WalletConnectDrawer walletConnectManager={walletConnectManager} />
          <WalletConnectProposalDrawer walletConnectManager={walletConnectManager} />
          <WalletConnectTransactionDrawer walletConnectManager={walletConnectManager} />
          <WalletConnectSwitchNetworkDrawer walletConnectManager={walletConnectManager} />
        </div>
      </div>
    </div>
  );
};
