import ScanIcon from "../icons/ScanIcon";
import { useGlobalState } from "~~/services/store/store";

/**
 * Site footer
 */
export const Footer = () => {
  const setIsQrReaderOpen = useGlobalState(state => state.setIsQrReaderOpen);

  return (
    <footer>
      <button
        className="fixed bg-primary inline-block p-4 rounded-full bottom-0 mb-6 left-0 right-0 w-[72px] m-auto"
        onClick={() => setIsQrReaderOpen(true)}
      >
        <ScanIcon width="2.5rem" height="2.5rem" />
      </button>
    </footer>
  );
};
