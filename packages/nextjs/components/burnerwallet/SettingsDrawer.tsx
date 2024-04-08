import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "~~/components/Drawer";

export const SettingsDrawer = () => {
  return (
    <Drawer direction="left">
      <DrawerTrigger className="btn btn-sm btn-ghost">
        <Cog6ToothIcon className="w-6" />
      </DrawerTrigger>
      <DrawerContent className="flex flex-col h-full w-[80%] md:w-[400px] mt-24 fixed bottom-0 left-0">
        <DrawerHeader>
          <DrawerTitle className="mt-1 text-xl md:text-2xl">Settings</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col items-center gap-4 mb-4 px-4"></div>
      </DrawerContent>
    </Drawer>
  );
};
