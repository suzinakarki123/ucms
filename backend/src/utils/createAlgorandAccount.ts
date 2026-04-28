import algosdk from "algosdk";

const account = algosdk.generateAccount();
const mnemonic = algosdk.secretKeyToMnemonic(account.sk);

console.log("Address:", account.addr.toString());
console.log("Mnemonic:", mnemonic);