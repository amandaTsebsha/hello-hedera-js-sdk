const { Client, 
    PrivateKey, 
    AccountCreateTransaction, 
    AccountBalanceQuery, 
    Hbar, 
    TransferTransaction, 
    AccountId,
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    TokenAssociateTransaction
} = require("@hashgraph/sdk");
require('dotenv').config();

async function environmentSetUp() {

    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;


    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");

    }


    //Create Hedera Testnet client
    const client = Client.forTestnet();

    // const node = {"127.0.0.1:50211": new AccountId(3)};
    // const client = Client.forNetwork(node).setMirrorNetwork("127.0.0.1:5600");
  //Set my account as client operator:
    client.setOperator(myAccountId, myPrivateKey);

    //Set default max transaction fee(in Hbar)
    client.setDefaultMaxTransactionFee(new Hbar(100));

    //Set the max payment query(in Hbar)
    client.setDefaultMaxQueryPayment(new Hbar(50));

    const newAccountPrivateKey = PrivateKey.generateED25519();
    const newAccountPublicKey = newAccountPrivateKey.publicKey;

    const newAccount = await new AccountCreateTransaction()
        .setKey(newAccountPublicKey)
        .setInitialBalance(Hbar.fromTinybars(1000))
        .execute(client);

    const receipt = await newAccount.getReceipt(client);
    const newAccountId = receipt.accountId;
    console.log("The new account ID is: " +newAccountId);
}
environmentSetUp();
