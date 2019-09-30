class BlockHeader{
	constructor(previousHash, merkleRoot, nonce){
		this.timestamp = new Date();
		this.previousHash = previousHash;
		this.merkleRoot = merkleRoot;
		this.nonce = nonce;
	}

	toString(){
		return this.timestamp + this.previousHash + this.merkleRoot + this.nonce;
	}
}
module.exports = BlockHeader;
