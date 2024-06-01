import { DocumentArrowUpIcon, PaintBrushIcon, WindowIcon } from "@heroicons/react/20/solid";

const features = [
  {
    name: "Browser Memory",
    description:
      "A Burner Wallet's private key is stored in your browser's memory. This means you can easily generate a new wallet just by opening a new incognito window!",
    icon: WindowIcon,
  },
  {
    name: "Export Private Key",
    description:
      "From the Settings drawer, you can easily copy your Burner Wallet's private key from the browser. To avoid losing your assets, be sure to backup your private key to a secure location.",
    icon: DocumentArrowUpIcon,
  },
  {
    name: "New Wallet, New Colors",
    description:
      "Every time you generate a new Burner Wallet, the gradient colors will change. The colors are generated from the private key, so they're unique to each Burner Wallet.",
    icon: PaintBrushIcon,
  },
];

export const IntroModal = ({ onGenerateWallet }: { onGenerateWallet: () => void }) => {
  return (
    <div>
      <input type="checkbox" id="my_modal_6" className="modal-toggle" checked />
      <div className="modal" role="dialog">
        <div className="modal-box">
          <h1 className="font-bold text-2xl">Burner Wallet</h1>
          <p className="mt-6">
            A <strong>temporary</strong> crypto wallet to quickly send or receive assets on Ethereum and popular Layer 2
            chains.
          </p>

          <p className="mt-6">
            With Burner Wallet, a private key is generated and stored in your browser. Be sure to securely backup your
            private key if you receive real funds or assets!
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
              Generate Burner Wallet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
