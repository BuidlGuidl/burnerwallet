"use client";

import {
  ChevronLeftIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~~/components/Drawer";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { BuidlGuidlLogo } from "~~/components/assets/BuidlGuidlLogo";
import { ImportPrivateKey } from "~~/components/burnerwallet/ImportPrivateKey";
import { loadBurnerSK } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth";

export const SettingsDrawer = () => {
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrencyPrice);

  const handlePrivateKeyCopy = () => {
    if (window.confirm("Are you sure you want to copy your private key to the clipboard?") === false) return;

    const sk = loadBurnerSK();
    if (sk) {
      navigator.clipboard.writeText(sk);
      notification.success("Private key copied to clipboard");
    }
  };

  return (
    <Drawer direction="left">
      <DrawerTrigger className="px-1 btn btn-sm btn-ghost text-white">
        <Cog6ToothIcon className="w-6" />
      </DrawerTrigger>
      <DrawerContent className="flex flex-col h-full w-[85%] md:w-[400px] fixed bottom-0 left-0 rounded-tl-none">
        <DrawerHeader className="grid grid-cols-3 items-center gap-0">
          <DrawerClose className="btn btn-sm btn-circle btn-ghost">
            <ChevronLeftIcon className="w-6 h-6" />
          </DrawerClose>
          <DrawerTitle className="m-0 text-xl md:text-2xl">Settings</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-2 px-6 mt-1 divide-y divide-border-muted bg-base-200">
          <div className="flex items-center justify-between mb-1">
            Dark Mode <SwitchTheme />
          </div>

          <div className="collapse collapse-arrow pt-[0.4rem] rounded-none">
            <input type="radio" name="pk-accordion" className="min-h-0 h-10" />
            <div className="collapse-title flex justify-between py-2 px-0 min-h-0 h-10">Copy Private Key</div>
            <div className="collapse-content text-sm md:text-base px-0">
              <div role="alert" className="alert alert-warning py-2 px-3 gap-2 md:gap-4 grid-flow-col">
                <ExclamationTriangleIcon className="w-4 h-4 md:w-6 md:h-6" />
                <p className="m-0 text-left">Warning: Never Share Your Private Key With Anyone!</p>
              </div>
              <p>
                Your Private Key provides <strong>full access</strong> to your entire wallet and funds. This is
                currently stored <strong>temporarily</strong> in your browser.
              </p>
              <p>
                Be sure to securely import your Private Key into a more secure wallet if you have a substantial amount
                of assets.
              </p>
              <button className="btn btn-sm h-auto py-2 btn-outline btn-error" onClick={handlePrivateKeyCopy}>
                Copy Private Key To Clipboard
              </button>
            </div>
          </div>

          <ImportPrivateKey />
        </div>
        <DrawerFooter className="pb-4 gap-2 bg-base-200">
          {nativeCurrencyPrice > 0 && (
            <div>
              <div className="btn btn-primary btn-sm font-normal gap-1 cursor-auto">
                <CurrencyDollarIcon className="h-4 w-4" />
                <span>{nativeCurrencyPrice}</span>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <p className="m-0 text-sm">
              Built with <HeartIcon className="inline-block h-4 w-4" /> at
            </p>
            <a
              className="flex justify-center items-center gap-1"
              href="https://buidlguidl.com/"
              target="_blank"
              rel="noreferrer"
            >
              <BuidlGuidlLogo className="w-3 h-5 pb-1" />
              <span className="link">BuidlGuidl</span>
            </a>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
