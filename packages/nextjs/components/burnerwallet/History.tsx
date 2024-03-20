import React, { useEffect, useState } from "react";
import { Address } from "../../components/scaffold-eth";
import { Alchemy, AssetTransfersCategory, AssetTransfersResponse, Network } from "alchemy-sdk";
import { createPublicClient, hexToBigInt, http } from "viem";
import { useNetwork } from "wagmi";
import { ArrowDownTrayIcon, ArrowPathIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import scaffoldConfig from "~~/scaffold.config";

const allCategories = [
  AssetTransfersCategory.EXTERNAL,
  AssetTransfersCategory.ERC1155,
  AssetTransfersCategory.INTERNAL,
  AssetTransfersCategory.ERC20,
  AssetTransfersCategory.ERC721,
  AssetTransfersCategory.SPECIALNFT,
];

const categoryToLabel = {
  [AssetTransfersCategory.EXTERNAL]: "External",
  [AssetTransfersCategory.ERC1155]: "NFT",
  [AssetTransfersCategory.INTERNAL]: "Contract Interaction",
  [AssetTransfersCategory.ERC20]: "TOKEN",
  [AssetTransfersCategory.ERC721]: "NFT",
  [AssetTransfersCategory.SPECIALNFT]: "NFT",
};

type HistoryItem = {
  address: string;
  value: number;
  type: "sent" | "received";
  category: AssetTransfersCategory;
  categoryLabel: string;
  timestamp: bigint;
  icon: JSX.Element;
};

type HistoryItemByDate = {
  date: string;
  items: HistoryItem[];
};

export const History = ({ address }: { address: string }) => {
  const { chain } = useNetwork();

  const config = {
    apiKey: scaffoldConfig.alchemyApiKey,
    network: chain
      ? scaffoldConfig.alchemySDKChains[chain.id as keyof typeof scaffoldConfig.alchemySDKChains]
      : Network.ETH_MAINNET,
  };
  const alchemy = new Alchemy(config);

  const [history, setHistory] = useState<HistoryItemByDate[]>([]);

  const publicClient = createPublicClient({
    chain: chain,
    transport: http(
      chain && chain.rpcUrls
        ? (chain.rpcUrls["default"].http as unknown as string)
        : "https://eth-mainnet.g.alchemy.com/v2",
      { batch: true },
    ),
  });

  const getTransferFrom = async () => {
    const data = await alchemy.core.getAssetTransfers({
      fromBlock: "0x0",
      fromAddress: address,
      category: allCategories,
    });

    return data;
  };

  const getTransfersTo = async () => {
    const data = await alchemy.core.getAssetTransfers({
      fromBlock: "0x0",
      toAddress: address,
      category: allCategories,
    });

    return data;
  };

  useEffect(() => {
    const updateHistory = async () => {
      const dataFrom: AssetTransfersResponse = await getTransferFrom();
      const dataTo: AssetTransfersResponse = await getTransfersTo();

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
            type: "sent",
            category: item.category,
            categoryLabel: item.category === AssetTransfersCategory.EXTERNAL ? "Sent" : categoryToLabel[item.category],
            timestamp:
              blocksData.find(block => block.number === hexToBigInt(item.blockNum as `0x${string}`))?.timestamp || 0,
            icon:
              item.category === AssetTransfersCategory.INTERNAL ? (
                <ArrowPathIcon className="w-8" />
              ) : (
                <PaperAirplaneIcon className="w-8" />
              ),
          } as HistoryItem),
      );
      const historyTo = dataTo.transfers.map(
        item =>
          ({
            address: item.from,
            value: item.value,
            type: "received",
            category: item.category,
            categoryLabel:
              item.category === AssetTransfersCategory.EXTERNAL ? "Received" : categoryToLabel[item.category],
            timestamp:
              blocksData.find(block => block.number === hexToBigInt(item.blockNum as `0x${string}`))?.timestamp || 0,
            icon:
              item.category === AssetTransfersCategory.INTERNAL ? (
                <ArrowPathIcon className="w-8" />
              ) : (
                <ArrowDownTrayIcon className="w-8" />
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
    };
    if (address && chain) {
      updateHistory();
    }
  }, [address, chain]);

  return (
    <>
      {history.map(historyItem => (
        <div key={historyItem.date}>
          <h2 className="text-xl underline">{historyItem.date}</h2>
          <ul>
            {historyItem.items.map((item, index) => (
              <li
                key={`${historyItem.date}-${index}`}
                className="flex justify-between items-center gap-2 p-2 border-b border-gray-300"
              >
                <div>{item.icon}</div>
                <div className="grow text-left flex flex-col ml-2 ">
                  <div>{item.categoryLabel}</div>
                  <div>
                    <Address address={item.address} />
                  </div>
                </div>
                <div>
                  {item.value ? (
                    <>
                      {item.type === "sent" ? "-" : "+"}
                      {item.value}
                    </>
                  ) : (
                    "0"
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
};
