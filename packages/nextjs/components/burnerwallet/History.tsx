import { TransactionHashLink } from "./TransactionHashLink";
import type { HistoryItemByDate } from "~~/hooks/useGetHistory";

type HistoryProps = {
  chainId: number;
  isLoading: boolean;
  history: HistoryItemByDate[];
};

export const History = ({ chainId, isLoading, history }: HistoryProps) => {
  if (isLoading) {
    return (
      <p className="flex items-center justify-center gap-2">
        <span className="loading loading-spinner loading-sm"></span> Loading...
      </p>
    );
  }

  if (history.length === 0) {
    return <p className="text-center">No history</p>;
  }

  return (
    <>
      {history.map(historyItem => (
        <div key={historyItem.date} className="py-4 border-border-muted">
          <h2 className="m-0 font-semibold leading-none">{historyItem.date}</h2>
          <ul>
            {historyItem.items.map((item, index) => (
              <li key={`${historyItem.date}-${index}`} className="flex justify-between items-center gap-4 pt-4">
                <div className="flex flex-shrink-0 items-center justify-center w-10 h-10 bg-secondary text-secondary-content rounded-full">
                  {item.icon}
                </div>
                <div className="grow text-left flex flex-col">
                  <p className="text-md font-medium m-0">{item.categoryLabel}</p>
                  <TransactionHashLink hash={item.hash} chainId={chainId} />
                </div>
                <div>
                  {item.value ? (
                    <>
                      {item.type === "sent" ? "-" : "+"}
                      {item.value.toFixed(4)} {item.asset}
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
