import { useEffect, useState } from "react";
import { createWeb3Wallet } from "~~/utils/WalletConnectUtil";

export default function useWeb3WalletInitialization() {
  const [initialized, setInitialized] = useState(false);

  const onInitialize = async () => {
    try {
      setInitialized(true);
      await createWeb3Wallet("");
    } catch (err: unknown) {
      console.error("Web3 wallet initialization failed", err);
      alert(err);
    }
  };

  useEffect(() => {
    if (!initialized) {
      onInitialize();
    }
  }, [initialized]);

  return initialized;
}
