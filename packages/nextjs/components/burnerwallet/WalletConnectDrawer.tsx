"use client";

import React, { useState } from "react";
import { SessionTypes } from "@walletconnect/types";
import { parseUri } from "@walletconnect/utils";
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";
import { Web3WalletTypes } from "@walletconnect/web3wallet";
import { Hex, PrivateKeyAccount, createWalletClient, hexToBigInt, hexToString, http, isAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { useNetwork } from "wagmi";
import { Drawer, DrawerContent, DrawerHeader, DrawerLine, DrawerTitle } from "~~/components/Drawer";
import { EIP155_SIGNING_METHODS } from "~~/data/EIP155Data";
import { burnerStorageKey } from "~~/hooks/scaffold-eth";
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

  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<SessionTypes.Struct | null>(null);

  const { chain } = useNetwork();

  async function onConnect(uri: string) {
    const { topic: pairingTopic } = parseUri(uri);

    const pairingExpiredListener = ({ topic }: { topic: string }) => {
      if (pairingTopic === topic) {
        notification.error("Pairing expired. Please try again with new Connection URI");
        web3wallet.core.pairing.events.removeListener("pairing_expire", pairingExpiredListener);
      }
    };

    function getAccount() {
      let currentSk: Hex = "0x";
      if (typeof window != "undefined" && window != null) {
        currentSk = (window?.localStorage?.getItem?.(burnerStorageKey)?.replaceAll('"', "") ?? "0x") as Hex;
      }
      const account = privateKeyToAccount(currentSk);
      return account;
    }

    async function onSessionProposal({ id, params }: Web3WalletTypes.SessionProposal) {
      try {
        const account: PrivateKeyAccount = getAccount();

        const approvedNamespaces = buildApprovedNamespaces({
          proposal: params,
          supportedNamespaces: {
            eip155: {
              // TODO: Add all supported chains
              chains: [`eip155:${chain ? chain.id : networks[0].id}`],
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
              // TODO: Add the address to all supported chains
              accounts: [`eip155:${chain ? chain.id : networks[0].id}:${account.address}`],
            },
          },
        });

        const newSession = await web3wallet.approveSession({
          id,
          namespaces: approvedNamespaces,
        });
        setSession(newSession);
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
      const { request } = params;
      const requestParamsMessage = request.params[0];

      const account: PrivateKeyAccount = getAccount();

      const wallet = createWalletClient({
        chain,
        account: account,
        transport: http(),
      });

      switch (request.method) {
        case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
        case EIP155_SIGNING_METHODS.ETH_SIGN:
          try {
            const message = hexToString(requestParamsMessage);
            // TODO: improve this
            if (confirm("Do you want to sign this message? Message: " + message)) {
              const signedMessage = await wallet.signMessage({ message });
              const response = { id, result: signedMessage, jsonrpc: "2.0" };

              return await web3wallet.respondSessionRequest({ topic, response });
            } else {
              throw new Error("User rejected signature");
            }
          } catch (error: any) {
            console.error(error);
            return await web3wallet.respondSessionRequest({
              topic,
              response: errorResponse(id, error.message),
            });
          }
        case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
        case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
        case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
          try {
            let data = request.params.filter((p: any) => !isAddress(p))[0];

            // TODO: improve this
            if (confirm("Do you want to sign this message? Message: " + data)) {
              if (typeof data === "string") {
                data = JSON.parse(data);
              }

              const { domain, types, message, primaryType } = data;

              const signedData = await wallet.signTypedData({ domain, types, message, primaryType });
              const response = { id, result: signedData, jsonrpc: "2.0" };

              return await web3wallet.respondSessionRequest({ topic, response });
            } else {
              throw new Error("User rejected signature");
            }
          } catch (error: any) {
            console.error(error);
            return await web3wallet.respondSessionRequest({
              topic,
              response: errorResponse(id, error.message),
            });
          }
        case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
          try {
            // TODO: improve this
            if (confirm("Do you want to send this transaction? Transaction: " + requestParamsMessage)) {
              if (typeof requestParamsMessage.value === "string") {
                if (requestParamsMessage.value.endsWith("n")) {
                  requestParamsMessage.value = BigInt(requestParamsMessage.value.slice(0, -1));
                } else {
                  requestParamsMessage.value = hexToBigInt(requestParamsMessage.value);
                }
              }

              const hash = await wallet.sendTransaction(requestParamsMessage);
              const response = { id, result: hash, jsonrpc: "2.0" };

              return await web3wallet.respondSessionRequest({ topic, response });
            } else {
              throw new Error("User rejected transaction");
            }
          } catch (error: any) {
            console.error(error);
            return await web3wallet.respondSessionRequest({
              topic,
              response: errorResponse(id, error.message),
            });
          }
        // TODO: test
        case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
          try {
            // TODO: improve this
            if (confirm("Do you want to sign this transaction? Transaction: " + requestParamsMessage)) {
              const signature = await wallet.signTransaction(requestParamsMessage);
              const response = { id, result: signature, jsonrpc: "2.0" };

              return await web3wallet.respondSessionRequest({ topic, response });
            } else {
              throw new Error("User rejected sign transaction");
            }
          } catch (error: any) {
            console.error(error);
            return await web3wallet.respondSessionRequest({
              topic,
              response: errorResponse(id, error.message),
            });
          }
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

      web3wallet.on("session_proposal", onSessionProposal);
      web3wallet.on("session_request", onSessionRequest);

      web3wallet.on("session_delete", data => {
        console.log("session_delete event received", data);
        if (session) {
          web3wallet.disconnectSession({ topic: session.topic, reason: getSdkError("USER_DISCONNECTED") });
        }
      });

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
    if (session) {
      await web3wallet.disconnectSession({ topic: session.topic, reason: getSdkError("USER_DISCONNECTED") });
      setSession(null);
      setWalletConnectUid("");
      notification.success("Disconnected from WalletConnect");
      setIsWalletConnectOpen(false);
    }
  }

  return (
    <Drawer open={isWalletConnectOpen} onOpenChange={setIsWalletConnectOpen}>
      <DrawerContent>
        <DrawerLine />
        <DrawerHeader>
          <DrawerTitle className="mt-1 text-2xl">WalletConnect</DrawerTitle>
        </DrawerHeader>
        <div>
          <div className="max-w-lg mx-auto mb-8 text-center">
            {session ? (
              <div>
                <div>Connected to Dapp</div>
                <button className="btn btn-neutral bg-white/50" onClick={disconnect}>
                  Disconnect
                </button>
              </div>
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
  );
};
