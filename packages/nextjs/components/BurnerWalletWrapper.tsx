"use client";

import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Footer } from "~~/components/Footer";
import { QrCodeReader } from "~~/components/burnerwallet/QrCodeReader";
import { useNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";

export const BurnerWalletWrapper = ({ children }: { children: React.ReactNode }) => {
  const price = useNativeCurrencyPrice();
  const setNativeCurrencyPrice = useGlobalState(state => state.setNativeCurrencyPrice);

  useEffect(() => {
    if (price > 0) {
      setNativeCurrencyPrice(price);
    }
  }, [setNativeCurrencyPrice, price]);

  return (
    <>
      <div className="max-w-xl mx-auto min-h-screen h-full bg-base-200 md:border-x border-base-100 shadow-lg">
        {children}
        <Footer />
      </div>
      <Toaster />
      <QrCodeReader />
    </>
  );
};
