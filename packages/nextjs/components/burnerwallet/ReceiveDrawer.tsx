import { QRCodeSVG } from "qrcode.react";
import { Address as AddressType } from "viem";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "~~/components/Drawer";
import { Address } from "~~/components/scaffold-eth";

type ReceiveDrawerProps = {
  address?: AddressType;
};

export const ReceiveDrawer = ({ address }: ReceiveDrawerProps) => {
  return (
    <Drawer>
      <DrawerTrigger className="btn btn-neutral bg-white/50">
        <ArrowDownTrayIcon className="w-6" /> Receive
      </DrawerTrigger>
      <DrawerContent className="bg-white text-neutral-content">
        <DrawerHeader>
          <DrawerTitle className="mt-1 text-xl md:text-2xl">Receive</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col items-center gap-4 mb-4 px-4">
          {address && <QRCodeSVG value={address} size={256} />}
          <Address address={address} format="short" disableAddressLink isSimpleView />
          <p className="text-center">
            Use this address to receive tokens and NFTs on Ethereum, Base, Optimism, Polygon, and Arbitrum.
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
