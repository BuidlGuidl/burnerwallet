"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { useAccount } from "wagmi";
import { useAccountBalance } from "~~/hooks/scaffold-eth";

const BURNER_WALLET_HIDE_BALANCE_STORAGE_KEY = "scaffoldEth2.hideBalanceWarning";

export const BalanceWarningModal = () => {
  const [hideBalanceWarning, setHideBalanceWarning] = useLocalStorage<boolean>(
    BURNER_WALLET_HIDE_BALANCE_STORAGE_KEY,
    false,
    {
      initializeWithValue: false,
    },
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
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
