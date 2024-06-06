"use client";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiConfig } from "wagmi";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import useWeb3WalletInitialization from "~~/hooks/useWeb3WalletInitialization";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { appChains } from "~~/services/web3/wagmiConnectors";

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  useWeb3WalletInitialization();

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={appChains.chains} avatar={BlockieAvatar}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};
