"use client";

import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { NetworksDropdown } from "~~/components/NetworksDropdown";
import { ReceiveDrawer } from "~~/components/burnerwallet/ReceiveDrawer";
import { SendDrawer } from "~~/components/burnerwallet/SendDrawer";
import { SettingsDrawer } from "~~/components/burnerwallet/SettingsDrawer";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useAutoConnect } from "~~/hooks/scaffold-eth";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

const networks = getTargetNetworks();

/**
 * Site header
 */
export const Header = () => {
  useAutoConnect();

  const { address: connectedAddress } = useAccount();
  const { switchNetwork } = useSwitchNetwork();
  const { chain } = useNetwork();

  return (
    <div className="relative overflow-hidden">
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
      <div className="relative z-10 p-6 glass">
        <div className="flex justify-between items-center mb-6">
          <SettingsDrawer />
          <NetworksDropdown
            onChange={option => switchNetwork?.(option.value)}
            value={chain ? chain.id : networks[0].id}
          />
        </div>
        <Address address={connectedAddress} disableAddressLink size="xl" format="short" />
        <div className="mt-4 flex justify-center">
          <Balance className="text-2xl" address={connectedAddress} />
        </div>
        <div className="flex items-center justify-center gap-6 mt-6">
          <ReceiveDrawer address={connectedAddress} />
          <SendDrawer address={connectedAddress} />
        </div>
      </div>
    </div>
  );
};
