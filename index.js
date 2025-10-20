const { Client, 
    PrivateKey, 
    AccountCreateTransaction, 
    AccountBalanceQuery, 
    Hbar, 
    TransferTransaction 
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

    //Set my account as client operator
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

    const accountBalance = await new AccountBalanceQuery()
        .setAccountId(newAccountId)
        .execute(client);

        console.log("The new account balance is: " +accountBalance.hbars.toTinybars() +" tinybar.");

        const sendHbar = await new TransferTransaction()
            .addHbarTransfer(myAccountId, Hbar.fromTinybars(-1000))
            .addHbarTransfer(newAccountId, Hbar.fromTinybars(1000))
            .execute(client);

        const transactionReceipt = await sendHbar.getReceipt(client);
        console.log("The transfer transaction from my account to the new account was: " + transactionReceipt.status.toString());
        
}

environmentSetUp();




