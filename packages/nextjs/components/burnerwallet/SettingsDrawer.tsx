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
      <DrawerTrigger className="btn btn-sm btn-ghost text-white">
        <Cog6ToothIcon className="w-6" />
      </DrawerTrigger>
      <DrawerContent className="flex flex-col h-full w-[80%] md:w-[400px] fixed bottom-0 left-0 rounded-tl-none">
        <DrawerHeader className="gap-0">
          <DrawerClose className="btn btn-sm btn-circle btn-ghost">
            <ChevronLeftIcon className="w-6 h-6" />
          </DrawerClose>
          <DrawerTitle className="text-xl md:text-2xl">Settings</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-4 mb-4 px-8 mt-4">
          <div className="flex items-center justify-between">
            Dark Mode <SwitchTheme />
          </div>
          <div>
            <div className="collapse collapse-arrow">
              <input type="checkbox" />
              <div className="collapse-title flex justify-between px-0">Private Key</div>
              <div className="collapse-content text-sm px-0">
                <div role="alert" className="alert alert-warning py-2 px-3">
                  <p className="m-0 text-sm">Warning: Never Share Your Private Key With Anyone!</p>
                </div>
                <p>
                  Your Private Key provides <strong>full access</strong> to your entire wallet and funds. This is
                  currently stored <strong>temporarily</strong> in your browser.
                </p>
                <p>
                  Be sure to securely import your Private Key into a more secure wallet if you have a substantial amount
                  of assets.
                </p>
                <button className="btn btn-sm btn-outline btn-error" onClick={handlePrivateKeyCopy}>
                  <ExclamationTriangleIcon className="w-4 h-4" /> Copy Private Key To Clipboard
                </button>
              </div>
            </div>
          </div>
          {/* <div className="flex items-center justify-between mt-4">
            Private Key
            <button className="btn btn-sm btn-ghost" onClick={handlePrivateKeyCopy}>
              Copy to Clipboard
            </button>
          </div> */}
        </div>
        <DrawerFooter className="pb-6 gap-4">
          {nativeCurrencyPrice > 0 && (
            <div>
              <div className="btn btn-primary btn-sm font-normal gap-1 cursor-auto">
                <CurrencyDollarIcon className="h-4 w-4" />
                <span>{nativeCurrencyPrice}</span>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <p className="m-0">
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
