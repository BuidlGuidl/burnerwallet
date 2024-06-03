"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { useAccount } from "wagmi";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useAccountBalance } from "~~/hooks/scaffold-eth";

const BURNER_WALLET_HIDE_BALANCE_STORAGE_KEY = "scaffoldEth2.hideBalanceWarning";

export const BalanceWarningModal = () => {
  const [hideBalanceWarning, setHideBalanceWarning] = useLocalStorage<boolean>(
    BURNER_WALLET_HIDE_BALANCE_STORAGE_KEY,
    false,
    { initializeWithValue: false },
  );

  const { address } = useAccount();
  const { balance } = useAccountBalance(address);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [isHideWarningChecked, setIsHideWarningChecked] = useState(false);

  useEffect(() => {
    if (balance && balance > 0) {
      setIsWarningModalOpen(true);
    }
  }, [balance]);

  const onToggleHideWarning = () => {
    setIsHideWarningChecked(!isHideWarningChecked);
  };

  const onCloseWarningModal = useCallback(() => {
    if (isHideWarningChecked) {
      setHideBalanceWarning(true);
    }

    setIsWarningModalOpen(false);
  }, [isHideWarningChecked, setHideBalanceWarning]);

  if (hideBalanceWarning) {
    return null;
  }

  return (
    <>
      <input
        readOnly
        type="checkbox"
        id="balance_warning_modal"
        className="modal-toggle"
        checked={isWarningModalOpen}
      />
      <div className="modal" role="dialog">
        <div className="modal-box">
          <div role="alert" className="alert alert-warning">
            <ExclamationTriangleIcon className="w-6 h-6" />
            <span>
              Warning: Your Burner Wallet Has Funds! Be sure to back-up your private key to avoid loss of funds.
            </span>
          </div>
          <div className="mt-6 flex justify-between">
            <div>
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={isHideWarningChecked}
                  onChange={onToggleHideWarning}
                />
                <span className="label-text">Don&apos;t Show Again</span>
              </label>
            </div>
            <button className="btn btn-primary" onClick={onCloseWarningModal}>
              I Understand
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
