"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { parseUri } from "@walletconnect/utils";
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";
import { Web3WalletTypes } from "@walletconnect/web3wallet";
import { useLocalStorage } from "usehooks-ts";
import { Hex, PrivateKeyAccount, createWalletClient, hexToBigInt, hexToString, http, isAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { useSwitchNetwork } from "wagmi";
import { Drawer, DrawerContent, DrawerHeader, DrawerLine, DrawerTitle } from "~~/components/Drawer";
import { EIP155_SIGNING_METHODS } from "~~/data/EIP155Data";
import { SCAFFOLD_CHAIN_ID_STORAGE_KEY, burnerStorageKey } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import { errorResponse } from "~~/utils/RpcErrors";
import { web3wallet } from "~~/utils/WalletConnectUtil";
import { notification } from "~~/utils/scaffold-eth";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

const networks = getTargetNetworks();

export const WalletConnectDrawer = () => {
  const walletConnectUid = useGlobalState(state => state.walletConnectUid);
  const setWalletConnectUid = useGlobalState(state => state.setWalletConnectUid);

  const isWalletConnectOpen = useGlobalState(state => state.isWalletConnectOpen);
  const setIsWalletConnectOpen = useGlobalState(state => state.setIsWalletConnectOpen);

  const walletConnectSession = useGlobalState(state => state.walletConnectSession);
  const setWalletConnectSession = useGlobalState(state => state.setWalletConnectSession);

  const [initialized, setInitialized] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmationData, setConfirmationData] = useState<any>({});
  const [confirmationTitle, setConfirmationTitle] = useState("");
  const [confirmationInfo, setConfirmationInfo] = useState<ReactNode>();

  const setChainId = useLocalStorage<number>(SCAFFOLD_CHAIN_ID_STORAGE_KEY, networks[0].id)[1];

  const { chains, switchNetwork } = useSwitchNetwork({
    onSuccess(data) {
      setChainId(data.id);
    },
  });

  function getAccount() {
    let currentSk: Hex = "0x";
    if (typeof window != "undefined" && window != null) {
      currentSk = (window?.localStorage?.getItem?.(burnerStorageKey)?.replaceAll('"', "") ?? "0x") as Hex;
    }
    const account = privateKeyToAccount(currentSk);
    return account;
  }

  async function onConnect(uri: string) {
    const { topic: pairingTopic } = parseUri(uri);

    const pairingExpiredListener = ({ topic }: { topic: string }) => {
      if (pairingTopic === topic) {
        notification.error("Pairing expired. Please try again with new Connection URI");
        web3wallet.core.pairing.events.removeListener("pairing_expire", pairingExpiredListener);
      }
    };

    async function onSessionProposal({ id, params }: Web3WalletTypes.SessionProposal) {
      try {
        const account: PrivateKeyAccount = getAccount();

        const eip155Chains = chains.map(chain => `eip155:${chain.id}`);
        const accounts = eip155Chains.map(chain => `${chain}:${account.address}`);

        const approvedNamespaces = buildApprovedNamespaces({
          proposal: params,
          supportedNamespaces: {
            eip155: {
              chains: eip155Chains,
              methods: [
                EIP155_SIGNING_METHODS.PERSONAL_SIGN,
                EIP155_SIGNING_METHODS.ETH_SIGN,
                EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA,
                EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3,
                EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4,
                EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION,
                EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION,
              ],
              // TODO: support these events
              events: ["accountsChanged", "chainChanged"],
              accounts: accounts,
            },
          },
        });

        const newSession = await web3wallet.approveSession({
          id,
          namespaces: approvedNamespaces,
        });
        setWalletConnectSession(newSession);
        setWalletConnectUid("");
      } catch (error) {
        notification.error((error as Error).message);
        await web3wallet.rejectSession({
          id: id,
          reason: getSdkError("USER_REJECTED"),
        });
      }
    }

    async function onSessionRequest(event: Web3WalletTypes.SessionRequest) {
      const { topic, params, id } = event;
      const { chainId, request } = params;
      const requestParamsMessage = request.params[0];

      const currentChainId = window?.localStorage?.getItem?.(SCAFFOLD_CHAIN_ID_STORAGE_KEY);

      if (!chainId || !currentChainId) {
        return await web3wallet.respondSessionRequest({
          topic,
          response: errorResponse(id, "Invalid chain"),
        });
      }

      const chainIdNumber = parseInt(chainId.split(":")[1]);
      const chainFromRequest = chains.find(c => c.id === chainIdNumber);

      if (!chainFromRequest) {
        return await web3wallet.respondSessionRequest({
          topic,
          response: errorResponse(id, "Invalid chain from request"),
        });
      }

      if (chainIdNumber !== parseInt(currentChainId)) {
        if (!switchNetwork) {
          return await web3wallet.respondSessionRequest({
            topic,
            response: errorResponse(id, "Can not switch network"),
          });
        }

        try {
          if (confirm(`Do you want to switch to ${chainFromRequest.name}?`)) {
            switchNetwork(chainIdNumber);
          } else {
            return await web3wallet.respondSessionRequest({
              topic,
              response: errorResponse(id, "User rejected network switch"),
            });
          }
        } catch (error: any) {
          return await web3wallet.respondSessionRequest({
            topic,
            response: errorResponse(id, error.message),
          });
        }
      }

      switch (request.method) {
        case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
        case EIP155_SIGNING_METHODS.ETH_SIGN:
          const messageToSign = hexToString(requestParamsMessage);
          setConfirmationData({
            id,
            topic,
            chain: chainFromRequest,
            method: request.method,
            data: messageToSign,
          });
          setIsModalOpen(true);
          return;
        case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
        case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
        case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
          let data = request.params.filter((p: any) => !isAddress(p))[0];

          if (typeof data === "string") {
            data = JSON.parse(data);
          }
          setConfirmationData({
            id,
            topic,
            chain: chainFromRequest,
            method: request.method,
            data: data,
          });
          setIsModalOpen(true);
          return;
        case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
        case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
          const fieldsToCheck = ["value", "gas"];
          for (const field of fieldsToCheck) {
            if (typeof requestParamsMessage[field] === "string") {
              if (requestParamsMessage[field].endsWith("n")) {
                requestParamsMessage[field] = BigInt(requestParamsMessage[field].slice(0, -1));
              } else {
                requestParamsMessage[field] = hexToBigInt(requestParamsMessage[field]);
              }
            }
          }
          setConfirmationData({
            id,
            topic,
            chain: chainFromRequest,
            method: request.method,
            data: requestParamsMessage,
          });
          setIsModalOpen(true);
          return;
        default:
          console.error("Invalid Method");
          return await web3wallet.respondSessionRequest({
            topic,
            response: errorResponse(id, "Invalid Method"),
          });
      }
    }

    try {
      setLoading(true);

      web3wallet.core.pairing.events.on("pairing_expire", pairingExpiredListener);
      web3wallet.once("session_proposal", () => {
        web3wallet.core.pairing.events.removeListener("pairing_expire", pairingExpiredListener);
      });

      if (!initialized) {
        web3wallet.on("session_proposal", onSessionProposal);
        web3wallet.on("session_request", onSessionRequest);

        web3wallet.on("session_delete", async data => {
          console.log("session_delete event received", data);
          setWalletConnectSession(null);
          notification.success("Disconnected from WalletConnect");
        });
        setInitialized(true);
      }

      await web3wallet.pair({ uri });

      notification.success("Connected to WalletConnect");
      setIsWalletConnectOpen(false);
    } catch (error) {
      notification.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function disconnect() {
    setLoading(true);
    if (walletConnectSession) {
      await web3wallet.disconnectSession({
        topic: walletConnectSession.topic,
        reason: getSdkError("USER_DISCONNECTED"),
      });
      setWalletConnectSession(null);
      notification.success("Disconnected from WalletConnect");
      setIsWalletConnectOpen(false);
    }
    setLoading(false);
  }

  async function onConfirmTransaction() {
    try {
      setLoading(true);
      const account: PrivateKeyAccount = getAccount();
      const wallet = createWalletClient({
        chain: confirmationData.chain,
        account: account,
        transport: http(),
      });
      switch (confirmationData.method) {
        case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
        case EIP155_SIGNING_METHODS.ETH_SIGN:
          const signedMessage = await wallet.signMessage({ message: confirmationData.data });
          const responseSign = { id: confirmationData.id, result: signedMessage, jsonrpc: "2.0" };

          await web3wallet.respondSessionRequest({ topic: confirmationData.topic, response: responseSign });
          break;
        case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
        case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
        case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
          const { domain, types, message, primaryType } = confirmationData.data;

          const signedData = await wallet.signTypedData({ domain, types, message, primaryType });
          const responseSignData = { id: confirmationData.id, result: signedData, jsonrpc: "2.0" };

          await web3wallet.respondSessionRequest({ topic: confirmationData.topic, response: responseSignData });
          break;
        case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
          const hash = await wallet.sendTransaction(confirmationData.data);
          const responseSendTransaction = { id: confirmationData.id, result: hash, jsonrpc: "2.0" };

          await web3wallet.respondSessionRequest({ topic: confirmationData.topic, response: responseSendTransaction });
          break;
        case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
          const signature = await wallet.signTransaction(confirmationData.data);
          const responseSignTransaction = { id: confirmationData.id, result: signature, jsonrpc: "2.0" };

          await web3wallet.respondSessionRequest({ topic: confirmationData.topic, response: responseSignTransaction });
          break;
      }
    } catch (error: any) {
      notification.error((error as Error).message);
      console.error(error);
      setIsModalOpen(false);
      return await web3wallet.respondSessionRequest({
        topic: confirmationData.topic,
        response: errorResponse(confirmationData.id, error.message),
      });
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  }

  async function onRejectTransaction() {
    setLoading(true);
    let message = "User rejected ";
    if (confirmationData.method === EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION) {
      message += "send transaction";
    }
    if (confirmationData.method === EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION) {
      message += "sign transaction";
    }
    await web3wallet.respondSessionRequest({
      topic: confirmationData.topic,
      response: errorResponse(confirmationData.id, message),
    });
    setLoading(false);
    setIsModalOpen(false);
  }

  useEffect(() => {
    if (!confirmationData || !confirmationData.method) {
      setConfirmationTitle("");
    } else {
      switch (confirmationData.method) {
        case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
        case EIP155_SIGNING_METHODS.ETH_SIGN:
          setConfirmationTitle("Do you want to sign this message?");
          setConfirmationInfo(
            <div>
              <dt>Message:</dt>
              <dd>{confirmationData.data}</dd>
            </div>,
          );
          break;
        case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
        case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
        case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
          setConfirmationTitle("Do you want to sign this message?");
          setConfirmationInfo(
            <div>
              <dt>Message:</dt>
              <dd>{JSON.stringify(confirmationData.data.message)}</dd>
            </div>,
          );
          break;
        case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
        case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
          let action = "send";
          if (confirmationData.method === EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION) {
            action = "sign";
          }
          setConfirmationTitle(`Do you want to ${action} this transaction?`);
          setConfirmationInfo(
            <div>
              <p>
                <dt className="inline mr-2">From:</dt>
                <dd className="inline">{confirmationData.data.from}</dd>
              </p>
              <p>
                <dt className="inline mr-2">To:</dt>
                <dd className="inline">{confirmationData.data.to}</dd>
              </p>
              <p>
                <dt className="inline mr-2">Value:</dt>
                <dd className="inline">{confirmationData.data.value?.toString()}</dd>
              </p>
              <p>
                <dt className="inline mr-2">Data:</dt>
                <dd className="inline">{confirmationData.data.data}</dd>
              </p>
            </div>,
          );
          break;
        default:
          setConfirmationTitle("");
          break;
      }
    }
  }, [confirmationData]);

  return (
    <>
      <Drawer open={isWalletConnectOpen} onOpenChange={setIsWalletConnectOpen}>
        <DrawerContent>
          <DrawerLine />
          <DrawerHeader>
            <DrawerTitle className="mt-1 text-2xl">WalletConnect</DrawerTitle>
          </DrawerHeader>
          <div>
            <div className="max-w-lg mx-auto mb-8 text-center">
              {walletConnectSession ? (
                walletConnectUid ? (
                  <button
                    disabled={!walletConnectUid || loading}
                    className="btn btn-neutral bg-white/50"
                    onClick={async () => {
                      await disconnect();
                      await onConnect(walletConnectUid);
                    }}
                  >
                    {loading ? "Loading..." : "Disconnect and Connect to new Dapp"}
                  </button>
                ) : (
                  <div>
                    <div>Connected to Dapp</div>
                    <button className="btn btn-neutral bg-white/50" disabled={loading} onClick={disconnect}>
                      Disconnect
                    </button>
                  </div>
                )
              ) : (
                <button
                  disabled={!walletConnectUid || loading}
                  className="btn btn-neutral bg-white/50"
                  onClick={() => onConnect(walletConnectUid)}
                >
                  {loading ? "Loading..." : "Connect to Dapp"}
                </button>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
      <dialog id="wallet-connect-confirmation-modal" className="modal overflow-y-auto" open={isModalOpen}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">{confirmationTitle}</h3>
          <p className="py-4">{confirmationInfo}</p>
          <div className="modal-action">
            <button className="btn" disabled={loading} onClick={onRejectTransaction}>
              Reject
            </button>
            <button className="btn" disabled={loading} onClick={onConfirmTransaction}>
              Confirm
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
};
