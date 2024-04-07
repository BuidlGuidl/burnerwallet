"use client";

import { useEffect, useState } from "react";
import { Address as AddressType, formatEther, parseEther } from "viem";
import { useBalance, useSendTransaction, useWaitForTransaction } from "wagmi";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "~~/components/Drawer";
import { AddressInput, IntegerInput } from "~~/components/scaffold-eth/Input";
import { useGlobalState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth";

type SendDrawerProps = {
  address?: AddressType;
};

export const SendDrawer = ({ address }: SendDrawerProps) => {
  const toAddress = useGlobalState(state => state.sendEthToAddress);
  const setToAddress = useGlobalState(state => state.setSendEthToAddress);

  const [amount, setAmount] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>("");

  const {
    data: ethBalance,
    isError: isErrorGettingEthBalance,
    isLoading: isLoadingGettingEthBalance,
  } = useBalance({
    address,
  });

  const { data: transactionData, sendTransaction } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransaction({
    hash: transactionData?.hash,
  });

  const handleSend = async () => {
    setSending(true);
    sendTransaction({ to: toAddress, value: parseEther(amount) });
  };

  useEffect(() => {
    if (isConfirmed && transactionData) {
      setTransactionHash(transactionData.hash);
      setSending(false);
      setAmount("");
      notification.success("Sent! " + transactionData.hash);
    }
  }, [isConfirmed, transactionData]);

  const sendDisabled =
    sending ||
    isConfirming ||
    !toAddress ||
    !amount ||
    (ethBalance && parseFloat(amount) > parseFloat(formatEther(ethBalance.value || 0n)));

  return (
    <Drawer>
      <DrawerTrigger className="btn btn-neutral">
        <PaperAirplaneIcon className="w-6" /> Send
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="mt-1 text-xl md:text-2xl">Send</DrawerTitle>
        </DrawerHeader>
        <div>
          <div className="max-w-lg mx-auto">
            <div className="flex flex-col gap-4 px-6 pb-6">
              <AddressInput
                value={toAddress}
                placeholder="Enter recipient address"
                onChange={value => setToAddress(value)}
              />
              <IntegerInput
                value={amount}
                placeholder="0.00 ETH"
                disableMultiplyBy1e18={true}
                onChange={value => setAmount(value.toString())}
              />
              <p className="m-0 text-center">
                Balance:{" "}
                {!isErrorGettingEthBalance && !isLoadingGettingEthBalance && ethBalance
                  ? formatEther(ethBalance.value)
                  : "0"}{" "}
                ETH
              </p>
              <button className="btn btn-neutral mt-4" onClick={handleSend} disabled={sendDisabled}>
                Send
              </button>
              {sending && <p>Sending...</p>}
              {isConfirmed && <p>Sent! {transactionHash}</p>}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
