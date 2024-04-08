import { ChevronLeftIcon, Cog6ToothIcon, HeartIcon } from "@heroicons/react/24/outline";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~~/components/Drawer";
import { BuidlGuidlLogo } from "~~/components/assets/BuidlGuidlLogo";

export const SettingsDrawer = () => {
  return (
    <Drawer direction="left">
      <DrawerTrigger className="btn btn-sm btn-ghost">
        <Cog6ToothIcon className="w-6" />
      </DrawerTrigger>
      <DrawerContent className="flex flex-col h-full w-[80%] md:w-[400px] mt-24 fixed bottom-0 left-0">
        <DrawerHeader>
          <DrawerClose className="btn btn-sm btn-circle btn-ghost">
            <ChevronLeftIcon className="w-6 h-6" />
          </DrawerClose>
          <DrawerTitle className="text-xl md:text-2xl">Settings</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col items-center gap-4 mb-4 px-4"></div>
        <DrawerFooter>
          <div className="flex justify-center items-center gap-2">
            <p className="m-0 text-center">
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
