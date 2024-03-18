"use client";

import React from "react";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { ArrowDownTrayIcon, Cog6ToothIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { NetworksDropdown } from "~~/components/NetworksDropdown";
import { Address } from "~~/components/scaffold-eth";
import { Balance } from "~~/components/scaffold-eth";
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
  console.log("chain", chain);
  console.log("connectedAddress", connectedAddress);

  return (
    <>
      <div className="flex flex-col items-center gap-2 pt-2">
        <>
          <div className="flex justify-between items-center mb-6 gap-4 w-[100%]">
            <Cog6ToothIcon className="w-8" />
            <NetworksDropdown
              onChange={option => switchNetwork?.(option.value)}
              value={chain ? chain.id : networks[0].id}
            />
          </div>
          <div className="flex flex-col items-center border border-[#000] rounded-full w-[90%] pt-4 pb-4">
            <Balance className="pr-1 text-2xl" address={connectedAddress} />
          </div>
          <div className="mt-2">
            <Address address={connectedAddress} />
          </div>
          <div className="flex gap-6 justify-around mb-8">
            <label htmlFor="qrcode-modal" className="flex items-center bg-white text-custom-black rounded-2xl p-4">
              <ArrowDownTrayIcon className="w-8 mr-2" />
              <span className="font-bold">Receive</span>
            </label>
            <label htmlFor="send-eth-modal" className="flex items-center bg-white text-custom-black rounded-2xl p-4">
              <PaperAirplaneIcon className="w-8 mr-2" />
              <span className="font-bold">Send</span>
            </label>
          </div>
        </>
      </div>
    </>
  );
};
