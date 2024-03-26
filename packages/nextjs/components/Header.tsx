"use client";

import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { ArrowDownTrayIcon, Cog6ToothIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { NetworksDropdown } from "~~/components/NetworksDropdown";
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
    <div className="p-6 bg-pink-200">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Cog6ToothIcon className="w-8" />
          <NetworksDropdown
            onChange={option => switchNetwork?.(option.value)}
            value={chain ? chain.id : networks[0].id}
          />
        </div>
        <div>
          <Address address={connectedAddress} disableAddressLink size="xl" format="short" />
        </div>
        <div className="mt-4 flex justify-center">
          <Balance className="text-2xl" address={connectedAddress} />
        </div>
        <div className="flex items-center justify-center gap-6 mt-6">
          <label
            htmlFor="qrcode-modal"
            className="flex items-center bg-white text-custom-black dark:text-black rounded-full px-4 py-2"
          >
            <ArrowDownTrayIcon className="w-8 mr-2" />
            <span className="font-bold">Receive</span>
          </label>
          <label
            htmlFor="send-eth-modal"
            className="flex items-center bg-white text-custom-black dark:text-black rounded-full px-4 py-2"
          >
            <PaperAirplaneIcon className="w-8 mr-2" />
            <span className="font-bold">Send</span>
          </label>
        </div>
      </div>
    </div>
  );
};
