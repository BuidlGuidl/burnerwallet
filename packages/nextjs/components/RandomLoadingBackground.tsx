"use client";

import { useEffect, useState } from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { cn } from "~~/utils/cn";

// Addresses to cycle through
const ADDRESSES = [
  "0x815E0023A28AA56ae60148B3781D783b223953B6",
  "0xa63Bfd6492Ed2098e417fe2A7dE30d39d9CbC102",
  "0xb5C23229fB8462c1658F40d97a11D94feB57e223",
  "0x9E9be8440794f28Ac08e13ec290B688520a5D824",
  "0xf1eBd160b9751632DfFB647d871685885ABDe22D",
  "0xBF791a193565F80276D26962A25b429043aE6253",
  "0xA55bBD4Ddf0C03C53c3F3b6964328c996F0f893d",
  "0xE3F3Acda31De82C4bC3d3070F519906bDFc497e4",
];

export const RandomLoadingBackground = ({ isLoading = false }: { isLoading: boolean }) => {
  const [count, setCount] = useState(0);
  const [time, setTime] = useState(150);

  useEffect(() => {
    // When there is a loading state, cycle through the ADDRESSES above
    // to mimic a burner wallet being generated.
    const interval = setInterval(() => {
      if (isLoading) {
        if (count === 7) {
          setCount(0);
          return;
        }

        if (count === 2) {
          setTime(350);
        }

        if (count === 4) {
          setTime(600);
        }

        setCount(count + 1);
      }
    }, time);

    // Clear the interval
    return () => clearInterval(interval);
  }, [count, isLoading, time]);

  const address = ADDRESSES[count];

  return (
    <div className={cn("absolute inset-0 flex items-center justify-center", isLoading ? "saturate-50" : "saturate-0")}>
      <Jazzicon
        diameter={600}
        paperStyles={{
          borderRadius: 0,
        }}
        seed={jsNumberForAddress(address)}
      />
    </div>
  );
};
