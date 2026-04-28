import "dotenv/config";
import algosdk from "algosdk";

const server = process.env.ALGORAND_SERVER || "https://testnet-api.algonode.cloud";
const port = process.env.ALGORAND_PORT || "";
const token = process.env.ALGORAND_TOKEN || "";
const mnemonic = process.env.ALGORAND_MNEMONIC;

if (!mnemonic) {
  console.warn("ALGORAND_MNEMONIC is not set. Algorand logging will fail.");
}

const algodClient = new algosdk.Algodv2(token, server, port);

export const sendAuditLogToAlgorand = async (data: {
  action: string;
  entityType: string;
  entityId: number;
  userId?: number;
}) => {
  if (!mnemonic) {
    throw new Error("ALGORAND_MNEMONIC is missing from .env");
  }

  const account = algosdk.mnemonicToSecretKey(mnemonic);

  const suggestedParams = await algodClient.getTransactionParams().do();

  const noteObject = {
    app: "UCMS",
    ...data,
    timestamp: new Date().toISOString(),
  };

  const note = new TextEncoder().encode(JSON.stringify(noteObject));

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: account.addr,
    receiver: account.addr,
    amount: 0,
    note,
    suggestedParams,
  });

  const signedTxn = txn.signTxn(account.sk);

  const result = await algodClient.sendRawTransaction(signedTxn).do();

  const txId = result.txid;

  await algosdk.waitForConfirmation(algodClient, txId, 4);

  return txId;
};