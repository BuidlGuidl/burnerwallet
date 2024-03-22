import React, { useEffect, useState } from "react";
import { formatEther, parseEther } from "viem";
import { useAccount, useBalance, useSendTransaction, useWaitForTransaction } from "wagmi";
import { AddressInput, IntegerInput } from "~~/components/scaffold-eth/Input";
import { useGlobalState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth";

type SendETHModalProps = {
  modalId: string;
};

export const SendETHModal = ({ modalId }: SendETHModalProps) => {
  const { address: connectedAddress } = useAccount();

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
    address: connectedAddress,
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
    <>
      <div>
        <input type="checkbox" id={`${modalId}`} className="modal-toggle" />
        <label htmlFor={`${modalId}`} className="modal cursor-pointer">
          <label className="modal-box relative">
            {/* dummy input to capture event onclick on modal box */}
            <input className="h-0 w-0 absolute top-0 left-0" />
            <label htmlFor={`${modalId}`} className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
              ✕
            </label>
            <div className="space-y-3 py-6">
              <div className="flex space-x-4 flex-col items-center gap-6">
                <p className="font-bold text-2xl">Send</p>
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
                <p>
                  Balance:{" "}
                  {!isErrorGettingEthBalance && !isLoadingGettingEthBalance && ethBalance
                    ? formatEther(ethBalance.value)
                    : "0"}{" "}
                  ETH
                </p>

                <button
                  className={`btn btn-primary w-full mt-4 text-white`}
                  onClick={handleSend}
                  disabled={sendDisabled}
                >
                  Send
                </button>
                {sending && <p>Sending...</p>}
                {isConfirmed && <p>Sent! {transactionHash}</p>}
              </div>
            </div>
          </label>
        </label>
      </div>
    </>
  );
};
