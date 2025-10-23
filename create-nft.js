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
    TokenAssociateTransaction,
    TokenMintTransaction
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


    // CREATE NFT
    const supplyKey = PrivateKey.generate();

    const nftCreate = await new TokenCreateTransaction()
        .setTokenName("Diploma")
        .setTokenSymbol("GRAD")
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(myAccountId)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(250)
        .setSupplyKey(supplyKey)
        .freezeWith(client);

    console.log(`- Supply Key: ${supplyKey} \n`);


    const nftCreateTxSign = await nftCreate.sign(PrivateKey.fromString(myPrivateKey));

    const nftCreateSubmit = await nftCreateTxSign.execute(client);

    const nftCreateRx = await nftCreateSubmit.getReceipt(client);

    const tokenId = nftCreateRx.tokenId;

    console.log(`- Create NFT with Token ID: ${tokenId} \n`);

    //IPFS content identifiers for which we will create an NFT
    const CID = [
            Buffer.from(
                "ipfs://bafyreiao6ajgsfji6qsgbqwdtjdu5gmul7tv2v3pd6kjgcw5o65b2ogst4/metadata.json"
            ),
            Buffer.from(
                "ipfs://bafyreic463uarchq4mlufp7pvfkfut7zeqsqmn3b2x3jjxwcjqx6b5pk7q/metadata.json"
            ),
            Buffer.from(
                "ipfs://bafyreihhja55q6h2rijscl3gra7a3ntiroyglz45z5wlyxdzs6kjh2dinu/metadata.json"
            ),
            Buffer.from(
                "ipfs://bafyreidb23oehkttjbff3gdi4vz7mjijcxjyxadwg32pngod4huozcwphu/metadata.json"
            ),
            Buffer.from(
                "ipfs://bafyreie7ftl6erd5etz5gscfwfiwjmht3b52cevdrf7hjwxx5ddns7zneu/metadata.json"
            )
        ];
        
    // MINT NEW NATCH OF NFTs
    const mintTx = await new TokenMintTransaction()
        .setTokenId(tokenId)
        .setMetadata(CID)
        .freezeWith(client);
    

    // SIGN THE TRANSACTION WITH SUPPLY KEY
    const mintTxSign = await mintTx.sign(supplyKey);

    const mintTxSubmit = await mintTxSign.execute(client);

    const mintRx = await mintTxSubmit.getReceipt(client);

    console.log(`Create NFT ${tokenId} with serial number: ${mintRx.serials.toString()} \n`);

    // Create the associate transaction
    const associateAccountTx = await new TokenAssociateTransaction()
        .setAccountId(newAccountId)
        .setTokenIds([tokenId])
        .freezeWith(client)
        .sign(newAccountPrivateKey);

    const associateAccountTxSubmit = await associateAccountTx.execute(client);

    const associateAccountRx = await associateAccountTxSubmit.getReceipt(client);

    console.log(`- NFT association with Private Account: ${associateAccountRx.status} \n`);

    var balanceCheckTx = await new AccountBalanceQuery().setAccountId(myAccountId).execute(client);
    console.log(`- Treasury balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} units of token ID ${tokenId}`);
    var balanceCheckTx = await new AccountBalanceQuery().setAccountId(newAccountId).execute(client);
    console.log(`- New balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} units of token ID ${tokenId}`);

    const tokenTransferTx = await new TransferTransaction()
        .addNftTransfer(tokenId, 1, myAccountId, newAccountId)
        .freezeWith(client)
        .sign(PrivateKey.fromString(myPrivateKey));

    const tokenTransferSubmit = await tokenTransferTx.execute(client);
    const tokenTransferRx = await tokenTransferSubmit.getReceipt(client);

    console.log(`\n- NFT transfer from Treasury to New Account: ${tokenTransferRx.status} \n`);

    var balanceCheckTx = await new AccountBalanceQuery().setAccountId(myAccountId).execute(client);
    console.log(`- Treasury balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} units of token ID ${tokenId}`);
    var balanceCheckTx = await new AccountBalanceQuery().setAccountId(newAccountId).execute(client);
    console.log(`- New balance: ${balanceCheckTx.tokens.__map.get(tokenId.toString())} units of token ID ${tokenId}`);
}
environmentSetUp();
