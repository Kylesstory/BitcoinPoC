const crypto = require('crypto');
const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const hexToBinary = require('hex-to-binary');

//// This is a proof of concept for Bitcoin.
//// Most code blocks have been finished.
//// The blank area with hint // [ Write code here ] 
//// is left for better realizing the Bitcoin architecture.

// global storage as database
const users = {}, addresses = [], unpackagedTxs = [], txs = [];

// Bitcoin parameters
let admin, exchange, blockchain, height = 1;
const capability = 3;
// Warn. The capability that each block may contain is dynamic is Bitcoin.
// Here it is simplified as a fixed number 3.
const customers = ['User1', 'User2', 'User3', 'User4'];
// edit the customers variable to create your customized users

// general functions
function getRandomInt(max) { // return an integer between from 0 to max -1
    return Math.floor(Math.random() * Math.floor(max));
}

function shortHash(s){ // a short sha256 hash function for clear
    return SHA256(s).toString().slice(0, 16);
}

function createUser(name){ // to create a whole new user
    while(name.length < 10){ // for alignment
        name = ' ' + name;
    }
    const user = new User(name);
    // Warn! balance in Bitcoin is composed of UTXOs, which is much more complex;
    // this is a simplified version for proof of concept
    user.balance = 0; // set the balanace
    users[user.address] = user;
    addresses.push(user.address);
    // the exchange gives customers 50 Bitcoins in the beginning
    if (name !== '     Admin' && name !== '  Exchange'){
        exchange.transfer(user.address, 50, 1);
        const i = getRandomInt(addresses.length - 1) + 1;
        users[addresses[i]].mine();
    }
    return user;
}

function listUsers(){ // to list the users and their balances
    console.log('\n\t\t---- List users ----\n');
    console.log('address \t\t       name \t\t balance\n');
    for (let i = 0; i < addresses.length; i++){
        const user = users[addresses[i]];
        console.log(`${user.address}\t ${user.name}\t\t ${user.balance}`)
    }
    console.log('\n');
}

function listUnpackagedTxs(){ // to show unpackaged transactions
    console.log('\n\t\t---- List unpackaged transactions ----\n');
    console.log('txHash \t\t\t from \t\t\t to \t\t\t amount \t tip\n');
    for (let i = 0; i < unpackagedTxs.length; i++){
        const tx = unpackagedTxs[i];
        console.log(`${tx.hash}\t ${tx.from}\t ${tx.to}\t ${tx.amount}\t\t ${tx.tip}`)
    }
    console.log('\n');
}

function listBlocks(hash){ // to print one or all blocks
    console.log('\n\t\t---- List blocks ----\n');
    if (hash === 'all'){
        console.log(blockchain.chain);
    } else{
        console.log(blockchain.chain[hash]);
    }
    console.log('\n');
}

function listTxs(hash){ // to print one or all transactions
    console.log('\n\t\t---- List transactions ----\n');
    if (hash === 'all'){
        console.log(txs);
    } else{
        console.log(txs[hash]);
    }
    console.log('\n');
}

function generateRandomTxs(times){ // to randomly generate transactions
    let src, dst, size = addresses.length - 2, amount, tip, from, to;
    for(let i = 0; i < times; i++){
        src = getRandomInt(size) + 2;
        dst = src;
        while(dst === src){
            dst = getRandomInt(size) + 2;
        }
        amount = (1 + getRandomInt(10));
        tip = (1 + getRandomInt(10)) * amount / 100;
        from = addresses[src];
        to = addresses[dst];
        users[from].transfer(to, amount, tip);
    }
}

function pay(from, to, amount){ // an easy way for transaction, Bitcoin doesn't work like this.
    amount = Math.round(amount * 100000) / 100000
    users[from].balance -= amount;
    users[to].balance += amount;
}

// objects for Bitcoin PoC

class Block {
    constructor(timestamp, data, previousHash, nonce) { // to build a block
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.nonce = nonce;
        this.hash = shortHash(this.toHashString());
        this.signature = '';
    }
    
    toHashString(){ // to make a block described in a string (exclude signature)
        return this.timestamp + this.data + this.previousHash + this.nonce ;
    }

    toString(){ // to make a block described in a string (include signature)
        return JSON.stringify({'height': this.height, 'timestamp': this.timestamp, 'data': this.data, 'previousHash': this.previousHash, 'nonce': this.nonce, 'blockHash': this.hash, 'signature': this.signature});
    }

    challenge(){ // if the hash value begins with two (defined by varible 'blockchain.difficulty') 0s
        const binary = hexToBinary(this.hash);
        // [ Write code here ] 

        // To ensure the found 'nonce' satisfy the puzzle challenge 
        // of Bitcoin proof of work with 'difficulty'.
        return false;
    }

    verify(){ // to verify a single block
        // [ Write code here ] 

        // To make sure the block is valid.
        
        // 1. Ensure 'this.signature' has been filled by some verifier.

        // 2. Ensure 'this.hash' has been correctly computed. 
        //    This step makes sure the block data hasn't been modified.
        
        // 3. Ensure the found 'this.nonce' in this block satisfies the Bitcoin puzzle.

        // 4. Verify the validation of the digital signature.
        
        return false;
    }

}

class Transaction {
    constructor(from, to, amount, tip){ // to build a transaction
        this.from = from;
        this.to = to;
        this.amount = amount;
        this.tip = tip;
        if (this.tip <= 0) {
            this.tip = this.amount / 10000;
        }
        this.hash = shortHash(this.toHashString);
        this.signature = '';
    }

    toHashString(){ // to describe the transaction in a string (exclude signature)
        return this.from + this.to + this.amount + this.tip;
    }

    toString(){ // to describe the transaction in a string (include signature)
        return JSON.stringify({'from': this.from, 'to': this.to, 'amount': this.amount, 'tip': this.tip, 'txHash': this.hash, 'signature': this.signature});
    }

    verify(){ // to verify a transaction
        // [ Write code here ] 

        // To make sure the transaction is valid.
        
        // 1. Ensure 'this.signature' has been filled by some verifier.

        // 2. Verify the validation of the digital signature.
    }
}

class User {
    constructor(name){ // to create a new user with name, secret key, public key, address and balance
        // P.S. name doesn't exist in Bitcoin, it is for easily distinguishable here.
        this.name = name
        // create public key and secret key
        this.key = ec.genKeyPair();
        // Note. In Bitcoin and Etherum, there are mechanisms to avoid secret key losing.
        // In Bitcoin improvement proposal 39, their is a technique called mnemonic which
        // encodes the secret key into English words, users can write it down as the cold storage of secret key.
        // Still that sentence, we omit it for clear.
        const publicKey = this.key.getPublic();
        
        // [ Write code here ] 

        // To set 'this.address' as the result of a shortHash function and the public key
    }

    transfer(to, amount, tip){ // to transfer money to someone
        // [ Write code here ] 

        // 1. make sure users' balance if enough to transfer

        // 2. create a transaction

        // 3. sign the transaction

        // 4. save the created transaction to 'unpackagedTxs'
    }

    mine(){
        // This is the proof of work, keep trying different nonces until satisfying the block challenge (puzzle)
        
        // [ Write code here ] 

        // 1. collect the timestamp
        // const timestamp = new Date()


        // 2. pick several transactions (defined by variable 'capability')  
        // Warning. Bitcoin deals with transactions using Merkle tree data structure.
        // In this PoC case, merkle tree is omitted for easy understanding.
        
        // 3. collect the hash value of previous block

        // 4. try different nonces until solve the puzzle.

        // 5. sign the solved block

        // 6. add the block using 'blockchain.addblock()' 
        
    }
}

class Blockchain{
    constructor(difficulty, reward) { // to build a block list and an address lookup table
        this.chain = [this.createGenesis()];
        // set the difficulty
        this.difficulty = difficulty;
        // set mining reward
        this.reward = reward;
        // Warn. The real reward is reduced to half every four years.
        // In this case, we fix it for simple.
    }

    createGenesis() { // to create a new genesis block as the beginning of a blockchain
        // rewrite a beautiful genesis block
        const genesis = new Block(new Date(), "Bitcoin proof of concept", "819fab60d0b8e5d5", "nonce");
        genesis.height = 0;
        genesis.signature = admin.key.sign(genesis.toHashString());
        return genesis;
    }

    latestBlock() { // to return the last block
        return this.chain[this.chain.length - 1]
    }

    addBlock(block){ // to add a new block
        // this part is quite complex so that many details are simplified

        // [ Write code here ] 

        // 1. verify the validity of the block

        // 2. deal with the transactions
    }

    verifyAllBlocks() { // to verify all blocks of the chain
        
        // [ Write code here ] 

        // 1. write a loop to verify all blocks

        // 1-1. make sure the hash value of each block is kept in the next block

        // 1-2. make sure each block (except for the first block, genesis) is valid
    }
}

//// main entrance

/// initialize the blockchain
// create an admin user
admin = createUser('Admin');
// initialize the balance of the official user
// only this one is cheated; other's Bitcoin should be obtained by transactions. 
users[admin.address]['balance'] = 15000000
// create a blockchain object with the difficulty = 3, and mining reward = 50
blockchain = new Blockchain(3, 50);
// initialize the exchange and it's initialize amount
exchange = createUser('Exchange');
admin.transfer(exchange.address, 99941, 9);
exchange.mine();

/// create some users
for (let i = 0; i < customers.length; i++){
    createUser(customers[i]);
}

while(true){ 
    // randomly generate some transactions
    generateRandomTxs(50);

    // mining
    while(unpackagedTxs.length > 0){
        const i = getRandomInt(addresses.length - 2) + 2;
        const address = addresses[i];
        users[address].mine();
    }
    // listUsers();
    // listUnpackagedTxs();
}
// listBlocks('all');
// listTxs('all');
blockchain.verifyAllBlocks();
