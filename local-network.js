const { Client, 
    PrivateKey, 
    AccountCreateTransaction,  
    Hbar, 
    AccountId
} = require("@hashgraph/sdk");
require('dotenv').config();


async function environmentSetUp() {

    const node = {"127.0.0.1:50211": new AccountId(3)};
    const client = Client.forNetwork(node).setMirrorNetwork("127.0.0.1:5600");

    client.setOperator(AccountId.fromString("0.0.2"), PrivateKey.fromString("3030020100300706052b8104000a042204200bad03fb5e325502c8de72b7a738469cf49ecbdd8f063282e682fe7557e94da1"));


    const newAccount = await new AccountCreateTransaction()
        .setKey(PrivateKey.fromString("3030020100300706052b8104000a042204200bad03fb5e325502c8de72b7a738469cf49ecbdd8f063282e682fe7557e94da1"))
        .setInitialBalance(new Hbar(1))
        .execute(client);

    const receipt = await newAccount.getReceipt(client);

    const newAccountId = receipt.accountId;
    console.log("New account created with ID:", newAccountId.toString());


}