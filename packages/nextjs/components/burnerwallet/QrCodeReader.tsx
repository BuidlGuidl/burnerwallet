import { Scanner } from "@yudiel/react-qr-scanner";
import { useGlobalState } from "~~/services/store/store";

const QrCodeReader = () => {
  const isQrReaderOpen = useGlobalState(state => state.isQrReaderOpen);
  const setIsQrReaderOpen = useGlobalState(state => state.setIsQrReaderOpen);

  const handleScanRead = (result: string) => {
    console.info("Scan result", result);
    // TODO: handle scan read
  };

  return (
    <>
      {isQrReaderOpen && (
        <div className="max-w-[90%] w-[300px] h-[300px] fixed top-0 left-0 right-0 bottom-0 m-auto z-50">
          <Scanner
            // @ts-ignore
            onScan={(result: string) => {
              if (!!result) {
                console.info("Scan result", result);
                handleScanRead(result);
                setIsQrReaderOpen(false);
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
