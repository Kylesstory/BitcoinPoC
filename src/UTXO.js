const utils = require('./Utilities');

class UTXO{
	constructor(owner, parents, txHash, amount){
		const utils = require('./Utilities');
		this.owner = owner
		this.parents = parents;
		this.txHash = txHash;
		this.amount = Math.round(amount * 100000000);
		this.hash = utils.sha256(this.toString());
	}

	toString(){ // return the content
		return this.owner + this.parents + this.txHash + this.amount;
	}
}

module.exports = UTXO;