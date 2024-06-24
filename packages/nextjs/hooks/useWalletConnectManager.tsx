"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { buildApprovedNamespaces, getSdkError, parseUri } from "@walletconnect/utils";
import { Web3WalletTypes } from "@walletconnect/web3wallet";
import { useLocalStorage } from "usehooks-ts";
import {
  Chain,
  Hex,
  PrivateKeyAccount,
  createWalletClient,
  hexToBigInt,
  hexToString,
  http,
  isAddress,
  isHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { useSwitchNetwork } from "wagmi";
import { EIP155_SIGNING_METHODS } from "~~/data/EIP155Data";
import { SCAFFOLD_CHAIN_ID_STORAGE_KEY, burnerStorageKey } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import { errorResponse } from "~~/utils/RpcErrors";
import { web3wallet } from "~~/utils/WalletConnectUtil";
import { notification } from "~~/utils/scaffold-eth";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

const networks = getTargetNetworks();

export const useWalletConnectManager = () => {
  const isWalletConnectInitialized = useGlobalState(state => state.isWalletConnectInitialized);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);

  const walletConnectUid = useGlobalState(state => state.walletConnectUid);
  const setWalletConnectUid = useGlobalState(state => state.setWalletConnectUid);
  const walletConnectSession = useGlobalState(state => state.walletConnectSession);
  const setWalletConnectSession = useGlobalState(state => state.setWalletConnectSession);

  const isWalletConnectOpen = useGlobalState(state => state.isWalletConnectOpen);
  const setIsWalletConnectOpen = useGlobalState(state => state.setIsWalletConnectOpen);
  const [isSessionProposalOpen, setIsSessionProposalOpen] = useState(false);
  const isTransactionConfirmOpen = useGlobalState(state => state.isTransactionConfirmOpen);
  const setIsTransactionConfirmOpen = useGlobalState(state => state.setIsTransactionConfirmOpen);
  const [isNetworkSwitchOpen, setIsNetworkSwitchOpen] = useState(false);

  const [sessionProposalData, setSessionProposalData] = useState<any>();
  const [confirmationData, setConfirmationData] = useState<any>({});
  const [confirmationTitle, setConfirmationTitle] = useState("");
  const [confirmationInfo, setConfirmationInfo] = useState<ReactNode>();
  const [networkFromRequest, setNetworkFromRequest] = useState<Chain | undefined>();

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

  async function onSessionProposalAccept({ id, params }: Web3WalletTypes.SessionProposal) {
    try {
      const account: PrivateKeyAccount = getAccount();

      const eip155Chains = chains.map(chain => `eip155:${chain.id}`);
      const accounts = eip155Chains.map(chain => `${chain}:${account.address}`);

      const approvedNamespaces = buildApprovedNamespaces({
        // @ts-ignore: TODO: fix types after update WalletConnect to 1.12.1
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
      notification.success("Connected to WalletConnect");
    } catch (error) {
      notification.error((error as Error).message);
      await web3wallet.rejectSession({
        id: id,
        reason: getSdkError("USER_REJECTED"),
      });
    }
  }

  async function onSessionProposalReject({ id }: Web3WalletTypes.SessionProposal) {
    await web3wallet.rejectSession({
      id: id,
      reason: getSdkError("USER_REJECTED"),
    });
  }

  async function onConnect({
    uri = "",
    pair = true,
    pairingTopic = "",
  }: {
    uri?: string;
    pair?: boolean;
    pairingTopic?: string;
  }) {
    if (!pairingTopic && uri) {
      pairingTopic = parseUri(uri).topic;
    }

    const pairingExpiredListener = ({ topic }: { topic: string }) => {
      if (pairingTopic === topic) {
        notification.error("Pairing expired. Please try again with new Connection URI");
        web3wallet.core.pairing.events.removeListener("pairing_expire", pairingExpiredListener);
      }
    };

    async function onSessionProposal({ id, params }: Web3WalletTypes.SessionProposal) {
      setSessionProposalData({ id, params });
      setIsSessionProposalOpen(true);
    }

    async function onSessionRequest(event: Web3WalletTypes.SessionRequest) {
      const { topic, params, id } = event;
      const { chainId, request } = params;
      const requestParamsMessage = request.params[0];

      const currentChainId =
        window?.localStorage?.getItem?.(SCAFFOLD_CHAIN_ID_STORAGE_KEY) ?? networks[0].id.toString();

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

      switch (request.method) {
        case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
        case EIP155_SIGNING_METHODS.ETH_SIGN:
          const messageToSign = isHex(requestParamsMessage) ? hexToString(requestParamsMessage) : requestParamsMessage;
          setConfirmationData({
            id,
            topic,
            chain: chainFromRequest,
            method: request.method,
            data: messageToSign,
          });
          break;
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
          break;
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
          break;
        default:
          console.error("Invalid Method");
          return await web3wallet.respondSessionRequest({
            topic,
            response: errorResponse(id, "Invalid Method"),
          });
      }

      if (chainIdNumber !== parseInt(currentChainId)) {
        if (!switchNetwork) {
          return await web3wallet.respondSessionRequest({
            topic,
            response: errorResponse(id, "Can not switch network"),
          });
        }

        setNetworkFromRequest(chainFromRequest);
        setIsNetworkSwitchOpen(true);
      } else {
        setIsTransactionConfirmOpen(true);
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

      if (pair) {
        await web3wallet.pair({ uri });
      }
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

  async function onNetworkSwitchReject() {
    setIsNetworkSwitchOpen(false);
    return await web3wallet.respondSessionRequest({
      topic: confirmationData.topic,
      response: errorResponse(confirmationData.id, "User rejected network switch"),
    });
  }

  async function onNetworkSwitchAccept() {
    if (!switchNetwork || !networkFromRequest) {
      return;
    }
    switchNetwork(networkFromRequest.id);
    setIsNetworkSwitchOpen(false);
    setIsTransactionConfirmOpen(true);
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
      setIsTransactionConfirmOpen(false);
      return await web3wallet.respondSessionRequest({
        topic: confirmationData.topic,
        response: errorResponse(confirmationData.id, error.message),
      });
    } finally {
      setLoading(false);
      setIsTransactionConfirmOpen(false);
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
    setIsTransactionConfirmOpen(false);
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
            <div className="break-words" style={{ width: "90%" }}>
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

  useEffect(() => {
    if (walletConnectUid) {
      if (walletConnectSession) {
        // if there is a current session, show the option to disconnect and connect to new dapp
        setIsWalletConnectOpen(true);
      } else {
        if (isWalletConnectInitialized) {
          // if there is no session and WC is initialized, show the confirmation data to connect to dapp
          onConnect({ uri: walletConnectUid });
        } else {
          // if there is no session and WC is not initialized, show a loading message
          setIsSessionProposalOpen(true);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletConnectUid, walletConnectSession, isWalletConnectInitialized]);

  useEffect(() => {
    if (!isWalletConnectInitialized || !web3wallet) {
      return;
    }

    const activeSession = Object.values(web3wallet.getActiveSessions())[0];

    if (activeSession && !walletConnectSession) {
      if (!initialized) {
        onConnect({ pair: false, pairingTopic: activeSession.pairingTopic });
      }
      setWalletConnectSession(activeSession);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [web3wallet, isWalletConnectInitialized, initialized]);

  return {
    onConnect,
    disconnect,
    isWalletConnectOpen,
    setIsWalletConnectOpen,
    isWalletConnectInitialized,
    isSessionProposalOpen,
    setIsSessionProposalOpen,
    sessionProposalData,
    loading,
    isTransactionConfirmOpen,
    setIsTransactionConfirmOpen,
    isNetworkSwitchOpen,
    setIsNetworkSwitchOpen,
    confirmationTitle,
    confirmationInfo,
    onConfirmTransaction,
    onRejectTransaction,
    walletConnectSession,
    walletConnectUid,
    onSessionProposalAccept,
    onSessionProposalReject,
    onNetworkSwitchAccept,
    onNetworkSwitchReject,
    networkFromRequest,
  };
};
