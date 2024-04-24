"use client";

import { useCallback, useState } from "react";
import { InputBase } from "../scaffold-eth";
import { useLocalStorage } from "usehooks-ts";
import { Hex } from "viem";
import { ExclamationTriangleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { burnerStorageKey, isValidSk } from "~~/hooks/scaffold-eth/useBurnerWallet";

export const ImportPrivateKey = () => {
  const [value, setValue] = useState<string | Hex>("");
  const [hasError, setHasError] = useState(false);
  const [, setBurnerSk] = useLocalStorage<Hex>(burnerStorageKey, "0x");

  const onImport = useCallback(() => {
    if (window.confirm("Are you sure you want to REPLACE this burner wallet?") === false) return;

    if (isValidSk(value)) {
      setHasError(false);
      setBurnerSk(value as Hex);
      window.location.reload();
      return;
    }

    setHasError(true);
  }, [setBurnerSk, value]);

  return (
    <div className="collapse collapse-arrow">
      <input type="checkbox" />
      <div className="collapse-title flex justify-between px-0">Import Private Key</div>
      <div className="collapse-content text-sm md:text-base px-0">
        <div role="alert" className="alert alert-warning py-2 px-3 gap-2 md:gap-4 grid-flow-col">
          <ExclamationTriangleIcon className="w-4 h-4 md:w-6 md:h-6" />
          <p className="m-0 text-left">Warning: This will REPLACE your current burner wallet!</p>
        </div>
        <p>Make sure the private key you are importing does not control a substantial amount of assets!</p>
        <InputBase
          value={value}
          placeholder="0xPrivateKey"
          error={hasError}
          onChange={newValue => {
            setValue(newValue);
          }}
        />
        {hasError && (
          <div role="alert" className="alert alert-error mt-4 text-sm">
            <XCircleIcon className="h-6 w-6" />
            <span>Please enter a valid Private Key</span>
          </div>
        )}
        <button className="h-auto py-2 mt-4 btn btn-sm btn-outline btn-error" onClick={onImport}>
          Import Private Key
        </button>
      </div>
    </div>
  );
};
