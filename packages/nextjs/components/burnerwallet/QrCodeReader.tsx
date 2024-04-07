import dynamic from "next/dynamic";
import { isAddress } from "viem";
import { useGlobalState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth";

// @ts-ignore
const ReactQrReader = dynamic(() => import("react-qr-reader"), { ssr: false });

const QrCodeReader = () => {
  const isQrReaderOpen = useGlobalState(state => state.isQrReaderOpen);
  const setIsQrReaderOpen = useGlobalState(state => state.setIsQrReaderOpen);
  const setToAddress = useGlobalState(state => state.setSendEthToAddress);

  const handleScanRead = (result: string) => {
    if (isAddress(result)) {
      setToAddress(result);
      setIsQrReaderOpen(false);
      document.getElementById("send-eth-drawer")?.click();
    } else {
      notification.error("Invalid address");
    }
  };

  return (
    <>
      {isQrReaderOpen && (
        <div className="max-w-[90%] w-[300px] h-[300px] fixed top-0 left-0 right-0 bottom-0 m-auto z-50">
          <ReactQrReader
            // @ts-ignore
            onScan={(result: string) => {
              if (!!result) {
                console.info("Scan result", result);
                handleScanRead(result);
              }
            }}
            onError={(error: any) => console.log(error)}
            style={{ width: "100%" }}
          />
        </div>
      )}
      {isQrReaderOpen && (
        <div className="fixed inset-0 z-10 bg-white bg-opacity-80" onClick={() => setIsQrReaderOpen(false)} />
      )}
    </>
  );
};

export { QrCodeReader };
