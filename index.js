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

    // CREATE FUNGIBLE TOKEN (STABLECOIN)
    const supplyKey = PrivateKey.generateED25519();
    let tokenCreateTx = await new TokenCreateTransaction()
        .setTokenName("USD Bar")
        .setTokenSymbol("USDB")
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(2)
        .setInitialSupply(10000)
        .setTreasuryAccountId(myAccountId)
        .setSupplyType(TokenSupplyType.Infinite)
        .setSupplyKey(supplyKey)
        .freezeWith(client);

    // SIGN WITH TREASURY KEY
    let tokenCreateSign = await tokenCreateTx.sign(PrivateKey.fromString(myPrivateKey));

    // SUBMIT TRANSACTION
    let tokenCreateSubmit = await tokenCreateSign.execute(client);

    // GET THE RECEIPT
    let tokenCreateRx = await tokenCreateSubmit.getReceipt(client);

    // GET TOKEN ID
    let tokenId = tokenCreateRx.tokenId;

    // LOG THE ID TO CONSOLE
    console.log(`- Create token with ID: ${tokenId} \n`);

    const transaction = await new TokenAssociateTransaction()
        .setAccountId(newAccountId)
        .setTokenIds([tokenId])
        .freezeWith(client);

    
    const signTx = await transaction.sign(newAccountPrivateKey)

    const txResponse = await signTx.execute(client)

    const associationReceipt = await txResponse.getReceipt(client)

    const transactionStatus = associationReceipt.status

    console.log("Transaction of association was: "+transactionStatus)


    // BALANCE CHECK
    var balanceCheckTx = await new AccountBalanceQuery().setAccountId(myAccountId).execute(client);
    console.log(`- Treasury balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} units of token ID ${tokenId}`);
    var balanceCheckTx = await new AccountBalanceQuery().setAccountId(newAccountId).execute(client);
    console.log(`- New balance: ${balanceCheckTx.tokens.__map.get(tokenId.toString())} units of token ID ${tokenId}`);

    const transferTransaction = await new TransferTransaction()
        .addTokenTransfer(tokenId, myAccountId, -10)
        .addTokenTransfer(tokenId, newAccountId, 10)
        .freezeWith(client)

    const signTransferTx = await transferTransaction.sign(PrivateKey.fromString(myPrivateKey))

    const transferTxResponse = await signTransferTx.execute(client)

    const transferReceipt = await transferTxResponse.getReceipt(client)

    const transferStatus = transferReceipt.status

    console.log("the status of the token transfer is: " + transferStatus)

    // BALANCE CHECK
    var balanceCheckTx = await new AccountBalanceQuery().setAccountId(myAccountId).execute(client);
    console.log(`- Treasury balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} units of token ID ${tokenId}`);
    var balanceCheckTx = await new AccountBalanceQuery().setAccountId(newAccountId).execute(client);
    console.log(`- New balance: ${balanceCheckTx.tokens.__map.get(tokenId.toString())} units of token ID ${tokenId}`);
    

    // const accountBalance = await new AccountBalanceQuery()
    //     .setAccountId(newAccountId)
    //     .execute(client);

    //     console.log("The new account balance is: " +accountBalance.hbars.toTinybars() +" tinybar.");

    //     const sendHbar = await new TransferTransaction()
    //         .addHbarTransfer(myAccountId, Hbar.fromTinybars(-1000))
    //         .addHbarTransfer(newAccountId, Hbar.fromTinybars(1000))
    //         .execute(client);

    //     const transactionReceipt = await sendHbar.getReceipt(client);
    //     console.log("The transfer transaction from my account to the new account was: " + transactionReceipt.status.toString());
        
}

environmentSetUp();




