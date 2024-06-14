"use client";

import { useCallback, useEffect, useState } from "react";
import { CopyPrivateKey } from "./CopyPrivateKey";
import { useLocalStorage } from "usehooks-ts";
import { useAccount } from "wagmi";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Dialog, DialogContent } from "~~/components/Dialog";
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
    <Dialog open={isWarningModalOpen} onOpenChange={setIsWarningModalOpen}>
      <DialogContent>
        <div>
          <div role="alert" className="alert alert-warning mb-1">
            <ExclamationTriangleIcon className="w-6 h-6" />
            <span>
              Warning: Your Burner Wallet Has Funds! Be sure to back-up your private key to avoid accidentally losing
              your funds.
            </span>
          </div>
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
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <CopyPrivateKey size="md" />
            <button className="btn btn-primary h-auto" onClick={onCloseWarningModal}>
              Close Warning
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
