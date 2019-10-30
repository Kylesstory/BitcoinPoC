const utils = require('./Utilities');
const BlockHeader = require('./BlockHeader');
const Transaction = require('./Transaction');
const hexToBinary = require('hex-to-binary');

class Block {
    static genesis(tx){ // to return the genesis block
        const nonce = {'blockSize': 1000, 'interval': 2000, 'half': 21, 'adjust': 2, 'offset': 1}; 
        return new Block([tx], utils.sha256(nonce), utils.merkleRoot([tx]), 0, 8, 50, nonce);
    }

    constructor(transactions, previousHash, merkleRoot, height, difficulty, reward, nonce) { // to build a block
        this.header = new BlockHeader(previousHash, merkleRoot, nonce);
        this.transactions = transactions;
        this.height = height;
        this.difficulty = difficulty;
        this.reward = reward;
        this.signature = null; // these two lines remind coders to sign the block afterward
        this.signer = null;
    }

    getHash(){
        return utils.sha256(this.header.toString());
    }
	
	puzzleFixed(){ // to return whether the hash value begins with dynamic 0s (defined by varible 'blockchain.difficulty')
        const binary = hexToBinary(this.getHash()).slice(0, this.difficulty);
		return parseInt(binary) === 0;
	}

    toString(){
        return this.header.toString() + this.height + this.difficulty + this.reward + this.signer + this.signature;
    }

    verify(previousHash){ // to verify a single block
        // 1. Ensure the merkle root of transactions is valid.
        let valid = (this.header.merkleRoot === utils.merkleRoot(this.transactions))
        // 2. Ensure the found 'this.nonce' in this block satisfies the Bitcoin puzzle.
        valid = valid && this.puzzleFixed();
        // 3.  Ensure 'this.signature' and this.signer exists.
        valid = valid && (this.signature !== null && this.signer !== null);
        // 4. Verify the validation of the digital signature.
        return valid && (this.header.previousHash === previousHash) ? utils.ecVerify(this.header.toString(), this.signature, this.signer) : false;
    }
}
module.exports = Block;