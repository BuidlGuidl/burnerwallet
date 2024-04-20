import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { getBlockExplorerTxLink } from "~~/utils/scaffold-eth";

type TransactionHashLinkProps = {
  hash: `0x${string}`;
  chainId: number;
};

export function TransactionHashLink({ hash, chainId }: TransactionHashLinkProps) {
  const shortHash = hash.slice(0, 6) + "..." + hash.slice(-4);

  return (
    <p className="flex items-center gap-2 m-0">
      {shortHash}
      <a href={getBlockExplorerTxLink(chainId, hash)} target="_blank">
        <ArrowTopRightOnSquareIcon className="h-4 w-4 cursor-pointer" />
      </a>
    </p>
  );
}
