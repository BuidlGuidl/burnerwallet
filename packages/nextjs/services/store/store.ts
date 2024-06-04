import { SessionTypes } from "@walletconnect/types";
import { create } from "zustand";
import scaffoldConfig from "~~/scaffold.config";
import { ChainWithAttributes } from "~~/utils/scaffold-eth";

/**
 * Zustand Store
 *
 * You can add global state to the app using this useGlobalState, to get & set
 * values from anywhere in the app.
 *
 * Think about it as a global useState.
 */

type GlobalState = {
  nativeCurrencyPrice: number;
  setNativeCurrencyPrice: (newNativeCurrencyPriceState: number) => void;
  targetNetwork: ChainWithAttributes;
  setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => void;
  isQrReaderOpen: boolean;
  setIsQrReaderOpen: (newValue: boolean) => void;
  sendEthToAddress: string;
  setSendEthToAddress: (newValue: string) => void;
  walletConnectUid: string;
  setWalletConnectUid: (newValue: string) => void;
  isWalletConnectInitialized: boolean;
  setIsWalletConnectInitialized: (newValue: boolean) => void;
  isWalletConnectOpen: boolean;
  setIsWalletConnectOpen: (newValue: boolean) => void;
  walletConnectSession: SessionTypes.Struct | null;
  setWalletConnectSession: (newValue: SessionTypes.Struct | null) => void;
  isSendDrawerOpen: boolean;
  setIsSendDrawerOpen: (newValue: boolean) => void;
};

export const useGlobalState = create<GlobalState>(set => ({
  nativeCurrencyPrice: 0,
  setNativeCurrencyPrice: (newValue: number): void => set(() => ({ nativeCurrencyPrice: newValue })),
  targetNetwork: scaffoldConfig.targetNetworks[0],
  setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => set(() => ({ targetNetwork: newTargetNetwork })),
  isQrReaderOpen: false,
  setIsQrReaderOpen: (newValue: boolean): void => set(() => ({ isQrReaderOpen: newValue })),
  sendEthToAddress: "",
  setSendEthToAddress: (newValue: string): void => set(() => ({ sendEthToAddress: newValue })),
  walletConnectUid: "",
  setWalletConnectUid: (newValue: string): void => set(() => ({ walletConnectUid: newValue })),
  isWalletConnectInitialized: false,
  setIsWalletConnectInitialized: (newValue: boolean): void => set(() => ({ isWalletConnectInitialized: newValue })),
  isWalletConnectOpen: false,
  setIsWalletConnectOpen: (newValue: boolean): void => set(() => ({ isWalletConnectOpen: newValue })),
  walletConnectSession: null,
  setWalletConnectSession: (newValue: SessionTypes.Struct | null): void =>
    set(() => ({ walletConnectSession: newValue })),
  isSendDrawerOpen: false,
  setIsSendDrawerOpen: (newValue: boolean): void => set(() => ({ isSendDrawerOpen: newValue })),
}));
