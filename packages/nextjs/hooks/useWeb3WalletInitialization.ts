import { useEffect } from "react";
import { useGlobalState } from "~~/services/store/store";
import { createWeb3Wallet } from "~~/utils/WalletConnectUtil";

export default function useWeb3WalletInitialization() {
  const isWalletConnectInitialized = useGlobalState(state => state.isWalletConnectInitialized);
  const setIsWalletConnectInitialized = useGlobalState(state => state.setIsWalletConnectInitialized);

  const onInitialize = async () => {
    try {
      await createWeb3Wallet("");
      setIsWalletConnectInitialized(true);
    } catch (err: unknown) {
      console.error("Web3 wallet initialization failed", err);
      alert(err);
    }
  };

  useEffect(() => {
    if (!isWalletConnectInitialized) {
      onInitialize();
    }
  }, [isWalletConnectInitialized]);

  return isWalletConnectInitialized;
}
