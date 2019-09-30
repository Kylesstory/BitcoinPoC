const utils = require('./Utilities');

class Transaction {
	constructor(from, to, amount, tip){ // to build a transaction
		this.from = from;
		this.to = to;
		this.amount = Math.round(amount * 100000000);
		tip = Math.max(amount / 10000, tip);
		this.tip = Math.round(tip * 100000000);
		this.signature = null; // this line reminds coders to sign it afterward
	}

	getContent(){ // to return the hash value
		return this.from + this.to + this.amount + this.tip;
	}

	getHash(){
		return this.signature === null ? null : utils.sha256(this.toString());
	}

	toString(){ // to describe the transaction in a string (exclude signature)
		return this.getContent() + this.signature ;
	}

	verify(){ // to return whether the transaction is valid.
		// 1. Ensure 'this.signature' has been filled by some verifier.
		// 2. Verify the validation of the digital signature.
		return this.signature === null ? false : utils.ecVerify(this.getContent(), this.signature, this.from);
	}
}
module.exports = Transaction;