"use client";

import { useEffect, useState } from "react";
import { Address as AddressType, formatEther, parseEther } from "viem";
import { useBalance, useSendTransaction, useWaitForTransaction } from "wagmi";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { Drawer, DrawerContent, DrawerHeader, DrawerLine, DrawerTitle, DrawerTrigger } from "~~/components/Drawer";
import { Balance } from "~~/components/scaffold-eth";
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

  const { data: ethBalance } = useBalance({
    address,
  });

  const { data: transactionData, sendTransaction, reset } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransaction({
    hash: transactionData?.hash,
  });

  const handleSend = async () => {
    setSending(true);
    sendTransaction({ to: toAddress, value: parseEther(amount) });
  };

  useEffect(() => {
    if (isConfirmed && transactionData) {
      setSending(false);
      setAmount("");
      setToAddress("");
      reset(); // resets the useSendTransaction data
      notification.success("Sent! " + transactionData.hash);
    }
  }, [isConfirmed, setToAddress, transactionData, reset]);

  const isInsufficientFunds = ethBalance && parseFloat(amount) > parseFloat(formatEther(ethBalance.value || 0n));

  const sendDisabled = sending || isConfirming || !toAddress || !amount || isInsufficientFunds;

  let buttonText = <span>Send</span>;

  if (isInsufficientFunds) {
    buttonText = <span>Insufficient Funds</span>;
  }

  if (sending && !isInsufficientFunds) {
    buttonText = (
      <>
        <span className="loading loading-spinner loading-xs"></span> Sending...
      </>
    );
  }

  return (
    <Drawer>
      <DrawerTrigger id="send-eth-drawer" className="btn btn-neutral bg-white/50">
        <PaperAirplaneIcon className="w-6" /> Send
      </DrawerTrigger>
      <DrawerContent>
        <DrawerLine />
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
              <p className="flex items-center justify-center m-0">
                Balance:
                <Balance address={address} className="text-base" />
              </p>
              <button
                className="btn btn-primary disabled:bg-primary/50 disabled:text-primary-content/50 mt-4"
                onClick={handleSend}
                disabled={sendDisabled}
              >
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
