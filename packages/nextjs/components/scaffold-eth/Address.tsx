"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Address as AddressType, getAddress, isAddress } from "viem";
import { hardhat } from "viem/chains";
import { useEnsAvatar, useEnsName } from "wagmi";
import { ArrowTopRightOnSquareIcon, CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

type AddressProps = {
  address?: AddressType;
  disableAddressLink?: boolean;
  isSimpleView?: boolean;
  format?: "short" | "long";
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
};

/**
 * Displays an address (or ENS) with a Blockie image and option to copy address.
 */
export const Address = ({ address, disableAddressLink, isSimpleView, format, size = "base" }: AddressProps) => {
  const [ens, setEns] = useState<string | null>();
  const [ensAvatar, setEnsAvatar] = useState<string | null>();
  const [addressCopied, setAddressCopied] = useState(false);
  const checkSumAddress = address ? getAddress(address) : undefined;

  const { targetNetwork } = useTargetNetwork();

  const { data: fetchedEns } = useEnsName({
    address: checkSumAddress,
    enabled: isAddress(checkSumAddress ?? ""),
    chainId: 1,
  });
  const { data: fetchedEnsAvatar } = useEnsAvatar({
    name: fetchedEns,
    enabled: Boolean(fetchedEns),
    chainId: 1,
    cacheTime: 30_000,
  });

  // We need to apply this pattern to avoid Hydration errors.
  useEffect(() => {
    setEns(fetchedEns);
  }, [fetchedEns]);

  useEffect(() => {
    setEnsAvatar(fetchedEnsAvatar);
  }, [fetchedEnsAvatar]);

  // Skeleton UI
  if (!checkSumAddress) {
    return (
      <div className="animate-pulse flex flex-col items-center justify-center gap-4">
        {!isSimpleView && <div className="rounded-full bg-slate-300 h-16 w-16"></div>}
        <div className="flex items-center space-y-6">
          <div className="h-6 w-48 bg-slate-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isAddress(checkSumAddress)) {
    return <span className="text-error">Wrong address</span>;
  }

  const blockExplorerAddressLink = getBlockExplorerAddressLink(targetNetwork, checkSumAddress);
  let displayAddress = checkSumAddress?.slice(0, 6) + "..." + checkSumAddress?.slice(-4);

  if (ens) {
    displayAddress = ens;
  } else if (format === "long") {
    displayAddress = checkSumAddress;
  }

  const containerClass = isSimpleView ? "" : "flex flex-col items-center";
  const addressContainerClass = isSimpleView ? "flex items-center" : "flex items-center mt-4";
  const addressClass = isSimpleView ? `text-${size}` : `ml-1.5 text-${size} font-normal`;

  return (
    <div className={containerClass}>
      {!isSimpleView && <BlockieAvatar address={checkSumAddress} ensImage={ensAvatar} size={60} />}
      <div className={addressContainerClass}>
        {disableAddressLink ? (
          <span className={addressClass}>{displayAddress}</span>
        ) : targetNetwork.id === hardhat.id ? (
          <span className={addressClass}>
            <Link href={blockExplorerAddressLink}>{displayAddress}</Link>
          </span>
        ) : (
          <a className={addressClass} target="_blank" href={blockExplorerAddressLink} rel="noopener noreferrer">
            {displayAddress}
          </a>
        )}

        {addressCopied ? (
          <CheckCircleIcon className="ml-1.5 text-xl font-normal h-6 w-6 cursor-pointer" aria-hidden="true" />
        ) : (
          <CopyToClipboard
            text={checkSumAddress}
            onCopy={() => {
              setAddressCopied(true);
              setTimeout(() => {
                setAddressCopied(false);
              }, 800);
            }}
          >
            <DocumentDuplicateIcon className="ml-2 h-6 w-6 cursor-pointer" aria-hidden="true" />
          </CopyToClipboard>
        )}

        <a
          className={`ml-2 text-${size} font-normal`}
          target="_blank"
          href={blockExplorerAddressLink}
          rel="noopener noreferrer"
        >
          <ArrowTopRightOnSquareIcon className="h-6 w-6 cursor-pointer" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
};
