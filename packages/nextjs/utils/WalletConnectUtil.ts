import { Core } from "@walletconnect/core";
import { IWeb3Wallet, Web3Wallet } from "@walletconnect/web3wallet";

export let web3wallet: IWeb3Wallet;

export async function createWeb3Wallet(relayerRegionURL: string) {
  if (web3wallet) {
    return;
  }
  const core = new Core({
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
    relayUrl: relayerRegionURL ?? process.env.NEXT_PUBLIC_RELAY_URL,
    // logger: "trace",
  });

  web3wallet = await Web3Wallet.init({
    core,
    metadata: {
      name: "Burner Wallet",
      description: "A simple Burner Wallet",
      url: "https://burner.buidlguidl.com/",
      icons: ["https://avatars.githubusercontent.com/u/37784886"],
    },
  });

  try {
    const clientId = await web3wallet.engine.signClient.core.crypto.getClientId();
    localStorage.setItem("WALLETCONNECT_CLIENT_ID", clientId);
  } catch (error) {
    console.error("Failed to set WalletConnect clientId in localStorage: ", error);
  }
}
