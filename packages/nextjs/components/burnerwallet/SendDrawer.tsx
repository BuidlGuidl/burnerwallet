"use client";

import { useEffect, useState } from "react";
import { Address as AddressType, formatEther, parseEther } from "viem";
import { useBalance, useNetwork, useSendTransaction, useWaitForTransaction } from "wagmi";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { Drawer, DrawerContent, DrawerHeader, DrawerLine, DrawerTitle, DrawerTrigger } from "~~/components/Drawer";
import { Balance } from "~~/components/scaffold-eth";
import { AddressInput, IntegerInput } from "~~/components/scaffold-eth/Input";
import { useGlobalState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth";

type SendDrawerProps = {
  address?: AddressType;
  updateHistory: () => void;
};

export const SendDrawer = ({ address, updateHistory }: SendDrawerProps) => {
  const toAddress = useGlobalState(state => state.sendEthToAddress);
  const setToAddress = useGlobalState(state => state.setSendEthToAddress);
  const { chain } = useNetwork();

  const [amount, setAmount] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { data: ethBalance } = useBalance({
    address,
  });

  const {
    data: transactionData,
    sendTransaction,
    reset,
    error,
  } = useSendTransaction({
    chainId: chain?.id,
  });

  if (error) {
    console.log("error", error);
  }

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isIdle,
  } = useWaitForTransaction({
    chainId: chain?.id,
    hash: transactionData?.hash,
  });

  const handleSend = async () => {
    setSending(true);
    sendTransaction({ to: toAddress, value: parseEther(amount) });
  };

  // All the resets that happen once `useWaitForTransaction` is complete
  useEffect(() => {
    if (isConfirmed && transactionData) {
      notification.success("Sent! " + transactionData.hash);
      setSending(false);
      updateHistory();
      setAmount("");
      setToAddress("");
      reset(); // resets the useSendTransaction data
      setIsOpen(false);
    }
  }, [isConfirmed, setToAddress, transactionData, reset, updateHistory]);

  const isInsufficientFunds =
    isIdle && ethBalance && parseFloat(amount) > parseFloat(formatEther(ethBalance.value || 0n));

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
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
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
              <div className="flex items-center justify-center m-0">
                Balance:
                <Balance address={address} className="text-base" />
              </div>
              {!error && (
                <button
                  className="btn btn-primary disabled:bg-primary/50 disabled:text-primary-content/50 mt-4"
                  onClick={handleSend}
                  disabled={sendDisabled}
                >
                  {buttonText}
                </button>
              )}
              {error && (
                <div role="alert" className="alert alert-error">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>There was an error</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
