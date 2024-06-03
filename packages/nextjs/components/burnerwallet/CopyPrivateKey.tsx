"use client";

import { loadBurnerSK } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export const CopyPrivateKey = ({ size = "sm" }: { size?: "sm" | "md" }) => {
  const handlePrivateKeyCopy = () => {
    if (window.confirm("Are you sure you want to copy your private key to the clipboard?") === false) return;

    const sk = loadBurnerSK();
    if (sk) {
      navigator.clipboard.writeText(sk);
      notification.success("Private key copied to clipboard");
    }
  };

  return (
    <button
      className={`btn h-auto py-2 btn-outline btn-error btn-${size} leading-normal`}
      onClick={handlePrivateKeyCopy}
    >
      Copy Private Key To Clipboard
    </button>
  );
};
