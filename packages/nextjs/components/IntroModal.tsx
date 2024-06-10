import { DocumentArrowUpIcon, WindowIcon } from "@heroicons/react/20/solid";

const features = [
  {
    name: "Browser Memory",
    description:
      "A Burner Wallet's private key is stored in your browser's memory. You can easily generate a new wallet just by opening a new incognito window!",
    icon: WindowIcon,
  },
  {
    name: "Export Private Key",
    description:
      "From the Settings drawer, you can easily copy your Burner Wallet's private key. Be sure to backup your private key to a secure location.",
    icon: DocumentArrowUpIcon,
  },
];

type IntroModalProps = {
  isLoading: boolean;
  onGenerateWallet: () => void;
};

export const IntroModal = ({ isLoading, onGenerateWallet }: IntroModalProps) => {
  return (
    <div>
      <input type="checkbox" id="intro_modal" className="modal-toggle" checked readOnly />
      <div className="modal" role="dialog">
        <div className="modal-box">
          <h1 className="font-bold text-2xl">Burner Wallet</h1>
          <p className="mt-6">
            A <strong>temporary</strong> crypto wallet to quickly send or receive assets on Ethereum and popular Layer 2
            chains.
          </p>

          <ul>
            {features.map(feature => (
              <li key={feature.name} className="relative mt-6 pl-10">
                <feature.icon className="absolute left-0 top-1 h-5 w-5 text-accent" aria-hidden="true" />{" "}
                {feature.description}
              </li>
            ))}
          </ul>

          <div className="text-center mt-6">
            <button className="btn btn-primary" onClick={onGenerateWallet}>
              {isLoading && <span className="loading loading-spinner"></span>}
              Generate Burner Wallet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
