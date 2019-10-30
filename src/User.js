const crypto = require('crypto');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const Block = require('./Block');
const Blockchain = require('./Blockchain');
const Transaction = require('./Transaction');
const UTXO = require('./UTXO');
const utils = require('./Utilities');

class User {
	static Satoshi(){ // to generate the first unique user and the genesis block
		const user = new User(null);
		const tx = new Transaction(user.address, user.address, 1000, 0);
		tx.signature = utils.ecSign(tx.getContent(), user.key);
		const genesis = Block.genesis(tx);
		genesis.signer = user.address;
		genesis.signature = utils.ecSign(genesis.header.toString(), user.key);
		const blockchain = new Blockchain(genesis);
        const utxo = new UTXO(user.address, [], genesis.getHash(), 1000);
		blockchain.utxos.push(utxo);
		user.blockchain = blockchain;
		console.log(genesis.header);
		return user;
	}

	constructor(blockchain){ // to create a new user with secret key and address
		// 1. create public key and secret key
		this.key = ec.genKeyPair();
		// Note. In Bitcoin and Etherum, there are mechanisms to avoid secret key losing.
		// In Bitcoin improvement proposal 39, their is a technique called mnemonic which conceptually
		// encodes the secret key into English words, users can write it down as the cold storage of secret key.
		// But we omit it here for clear.
		
		// 2. compute the address
		this.address = utils.publicToAddress(this.key.getPublic('hex'));
		// 3. download the blockchain from others
		this.blockchain = blockchain;
	}

	transfer(to, amount, tip){ // to transfer money to someone
		// 1. create a transaction
		let tx = new Transaction(this.address, to, amount, tip);
		// 2. sign the transaction
		tx.signature = utils.ecSign(tx.getContent(), this.key);
		// 3. save the created transaction to 'uTxs'
		this.blockchain.uTxs.push(tx);
	}

	mine(){ // to mine the coins
        // This is the proof of work, it firstly picks up some transactions, and then keeps trying 
        // different nonces until satisfying the block challenge (puzzle).
		const uTxs = this.blockchain.uTxs;
		if (uTxs.length > 0){
	        // 1. pick several transactions  
			const txs = [], balances = this.blockchain.balances(); 
			let txSize = this.blockchain.blockSize, uTxLength = uTxs.length, index = 0;
			let uTx, length; 
			while(index < uTxLength){
				uTx = uTxs[index];
				length = uTx.toString().length;
				if (txSize >= length && balances[uTx.from] > (uTx.amount + uTx.tip)){ // if there is space and enough balance in the block
					txs.push(uTxs.splice(index, 1)[0]);
					txSize -= length
					balances[uTx.from] = balances[uTx.from] - (uTx.amount + uTx.tip)
					uTxLength -= 1
				} else{
					index += 1;
				}
			}
	        // 2. try different nonces until solve the puzzle.
			let nonce, block, previousHash = this.blockchain.last().getHash();
        	const merkleRoot = utils.merkleRoot(txs);
			while (true){ // trying different nonces to satisfy the challenge
				nonce = crypto.randomBytes(32).toString('hex');
				block = new Block(txs, previousHash, merkleRoot, this.blockchain.height, this.blockchain.difficulty, this.blockchain.reward, nonce);
				if (block.puzzleFixed()){
					break;
				}
			}
			// 3. sign the found block
			block.signer = this.address;
			block.signature = utils.ecSign(block.header.toString(), this.key);
	        // 4. add the block to the blockchain
	        this.blockchain.add(block);
	    } 
	}
}
module.exports = User;