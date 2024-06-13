import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alchemy, AssetTransfersCategory, AssetTransfersResponse, Network } from "alchemy-sdk";
import { createPublicClient, hexToBigInt, http } from "viem";
import * as chains from "viem/chains";
import { useNetwork } from "wagmi";
import { ArrowDownTrayIcon, ArrowPathIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import scaffoldConfig from "~~/scaffold.config";

const categoryToLabel = {
  [AssetTransfersCategory.EXTERNAL]: "External",
  [AssetTransfersCategory.ERC1155]: "NFT",
  [AssetTransfersCategory.INTERNAL]: "Contract Interaction",
  [AssetTransfersCategory.ERC20]: "TOKEN",
  [AssetTransfersCategory.ERC721]: "NFT",
  [AssetTransfersCategory.SPECIALNFT]: "NFT",
};

export type HistoryItem = {
  address: string;
  value: number;
  asset: string | null;
  hash: `0x${string}`;
  type: "sent" | "received";
  category: AssetTransfersCategory;
  categoryLabel: string;
  timestamp: bigint;
  icon: JSX.Element;
};

export type HistoryItemByDate = {
  date: string;
  items: HistoryItem[];
};

export const useGetHistory = ({ address }: { address: string }) => {
  const { chain } = useNetwork();

  const allCategories = useMemo(() => {
    if (!chain) return [];

    const categories = [
      AssetTransfersCategory.ERC1155,
      AssetTransfersCategory.ERC20,
      AssetTransfersCategory.ERC721,
      AssetTransfersCategory.SPECIALNFT,
    ];

    // Only Ethereum mainnet, sepolia and Polygon mainnet have the internal category
    // https://docs.alchemy.com/reference/alchemy-getassettransfers
    if ([chains.mainnet.id as number, chains.sepolia.id, chains.polygon.id].includes(chain.id)) {
      categories.push(AssetTransfersCategory.INTERNAL);
    }

    // Optimism Sepolia and Base mainnet/sepolia do not have the external category (Optimism Sepolia not documented in the previous link)
    if (![chains.optimismSepolia.id as number, chains.base.id, chains.baseSepolia.id].includes(chain.id)) {
      categories.push(AssetTransfersCategory.EXTERNAL);
    }

    return categories;
  }, [chain]);

  const config = useMemo(() => {
    return {
      apiKey: scaffoldConfig.alchemyApiKey,
      network: chain
        ? scaffoldConfig.alchemySDKChains[chain.id as keyof typeof scaffoldConfig.alchemySDKChains]
        : Network.ETH_MAINNET,
    };
  }, [chain]);
  const alchemy = useMemo(() => new Alchemy(config), [config]);

  const [history, setHistory] = useState<HistoryItemByDate[]>([]);

  const publicClient = useMemo(
    () =>
      createPublicClient({
        chain: chain,
        transport: http(
          chain && chain.rpcUrls
            ? (chain.rpcUrls["default"].http as unknown as string)
            : "https://eth-mainnet.g.alchemy.com/v2",
          { batch: true },
        ),
      }),
    [chain],
  );

  const {
    data: dataFromQuery = { transfers: [] },
    isLoading: isDataFromLoading,
    isFetched: isDataFromFetched,
    refetch: refetchDataFrom,
  } = useQuery({
    queryKey: ["historyFrom", address, allCategories, chain?.id],
    queryFn: async () => {
      const data = await alchemy.core.getAssetTransfers({
        fromBlock: "0x0",
        fromAddress: address,
        category: allCategories,
      });

      return data;
    },
    refetchInterval: scaffoldConfig.pollingInterval,
  });

  const {
    data: dataToQuery = { transfers: [] },
    isLoading: isDataToLoading,
    isFetched: isDataToFetched,
    refetch: refetchDataTo,
  } = useQuery({
    queryKey: ["historyTo", address, allCategories, chain?.id],
    queryFn: async () => {
      const data = alchemy.core.getAssetTransfers({
        fromBlock: "0x0",
        toAddress: address,
        category: allCategories,
      });

      return data;
    },
    refetchInterval: scaffoldConfig.pollingInterval,
  });

  const updateHistory = useCallback(
    async (dataFrom: AssetTransfersResponse, dataTo: AssetTransfersResponse) => {
      const dataFromBlockNumbers = dataFrom.transfers.map(item => item.blockNum);
      const dataToBlockNumbers = dataTo.transfers.map(item => item.blockNum);

      const blockNumbers = dataFromBlockNumbers.concat(dataToBlockNumbers);
      const blocksData = await Promise.all(
        blockNumbers.map(blockNumber =>
          publicClient.getBlock({ blockNumber: hexToBigInt(blockNumber as `0x${string}`) }),
        ),
      );

      const historyFrom = dataFrom.transfers.map(
        item =>
          ({
            address: item.to,
            value: item.value,
            asset: item.asset,
            hash: item.hash,
            type: "sent",
            category: item.category,
            categoryLabel: item.category === AssetTransfersCategory.EXTERNAL ? "Sent" : categoryToLabel[item.category],
            timestamp:
              blocksData.find(block => block.number === hexToBigInt(item.blockNum as `0x${string}`))?.timestamp || 0,
            icon:
              item.category === AssetTransfersCategory.INTERNAL ? (
                <ArrowPathIcon className="w-5" />
              ) : (
                <PaperAirplaneIcon className="w-5" />
              ),
          } as HistoryItem),
      );

      const historyTo = dataTo.transfers.map(
        item =>
          ({
            address: item.from,
            value: item.value,
            asset: item.asset,
            hash: item.hash,
            type: "received",
            category: item.category,
            categoryLabel:
              item.category === AssetTransfersCategory.EXTERNAL ? "Received" : categoryToLabel[item.category],
            timestamp:
              blocksData.find(block => block.number === hexToBigInt(item.blockNum as `0x${string}`))?.timestamp || 0,
            icon:
              item.category === AssetTransfersCategory.INTERNAL ? (
                <ArrowPathIcon className="w-5" />
              ) : (
                <ArrowDownTrayIcon className="w-5" />
              ),
          } as HistoryItem),
      );
      const history = historyFrom.concat(historyTo);
      const sortedHistory = history.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
      const historyByDate: HistoryItemByDate[] = [];
      let lastDate = "";
      sortedHistory.forEach(item => {
        const date = new Date(Number(item.timestamp * 1000n)).toDateString();
        if (date !== lastDate) {
          lastDate = date;
          historyByDate.push({ date, items: [] });
        }
        historyByDate[historyByDate.length - 1].items.push(item);
      });
      setHistory(historyByDate);
    },
    [publicClient],
  );

  const refetchQuery = useCallback(() => {
    refetchDataFrom();
    refetchDataTo();
  }, [refetchDataFrom, refetchDataTo]);

  useEffect(() => {
    if (address && chain && isDataFromFetched && isDataToFetched) {
      updateHistory(dataFromQuery, dataToQuery);
    }
  }, [address, chain, dataFromQuery, dataToQuery, isDataFromFetched, isDataToFetched, updateHistory]);

  return {
    chainId: chain?.id || 1,
    history,
    isLoading: isDataFromLoading || isDataToLoading,
    refetchQuery,
  };
};
