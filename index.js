const { Client, 
    PrivateKey, 
    AccountCreateTransaction, 
    AccountBalanceQuery, 
    Hbar, 
    TransferTransaction, 
    AccountId
} = require("@hashgraph/sdk");
require('dotenv').config();


async function environmentSetUp() {

    const node = {"127.0.0.1:50211": new AccountId(3)};
    const client = Client.forNetwork(node).setMirrorNetwork("127.0.0.1:5600");

    client.setOperator(AccountId.fromString("0.0.2"), PrivateKey.fromString("302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137"));


    const newAccount = await new AccountCreateTransaction()
        .setKey(PrivateKey.fromString("302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137"))
        .setInitialBalance(new Hbar(1))
        .execute(client);

    const receipt = await newAccount.getReceipt(client);

    const newAccountId = receipt.accountId;
    console.log("New account created with ID:", newAccountId.toString());


}