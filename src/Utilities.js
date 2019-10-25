const cryptojs = require('crypto-js')
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const UTXO = require('./UTXO');
const ripemd160 = require('ripemd160');
const base58 = require('bs58');

function adjustUTXOs(utxos, tx, miner){ // to generate UTXOs from the transaction
    const digits = tx.getHash();
    const sources = collectUTXOs(utxos, tx.from, tx.amount + tx.tip);
    const left = sources.map(e => e.amount).reduce((x, y) => x + y) - tx.amount - tx.tip;
    let package = {'pointer': 0, 'left': 0};
    // pay the tip, payment and change in order
    package = allocate(utxos, sources, package, digits, miner, tx.tip);
    package = allocate(utxos, sources, package, digits, tx.to, tx.amount);
    package = allocate(utxos, sources, package, digits, tx.from, left);
}

function allocate(utxos, sources, package, digits, receiver, amount) {
    // to allocate new UTXOs from old ones 
    let total = package.left;
    const parants = [];
    while (total < amount){
        parants.push(sources[package.pointer].hash);
        total += sources[package.pointer].amount;
        package.pointer += 1;
    }
    package.left = total - amount;
    utxos.push(new UTXO(receiver, parants, digits, Math.round(amount) / 100000000));
    return package;
}

function collectUTXOs(utxos, address, amount){
    const index = [], set = [];
    let total = 0;
    for (let i = 0; i < utxos.length; i++){
        if (utxos[i].owner === address){
            index.push(i);
            total = total + utxos[i].amount;
        }
        if (total >= amount){
            break;
        }
    }
    for (let i = index.length - 1; i >= 0; i--){
		set.push(utxos.splice(index[i], 1)[0]);
	}
    return set;
}

function ecSign(message, key){ // ECDSA
	const signature = key.sign(sha256(message));
	const recoveryParam = signature.recoveryParam;
	return signature.toDER('hex') + recoveryParam;
}

function ecVerify(message, signature, address){
	const length = signature.length - 1;
	const recoveryParam = parseInt(signature[length]);
	signature = signature.slice(0, length);
	const msgHash = sha256(message);
	const msgDecimal = ec.keyFromPrivate(msgHash, "hex").getPrivate().toString(10);
	const point = ec.recoverPubKey(msgDecimal, signature, recoveryParam, 'hex');
	const publicKey = ec.keyFromPublic(point);
	return (address === publicToAddress(publicKey.getPublic('hex'))) && publicKey.verify(msgHash, signature);
}

function merkleRoot(data){
	if (data.length === 0){
		return null;
	}
	let children = [];
	let parents = [];
	for (let i = 0; i < data.length; i ++){
		children.push(data[i].getHash());
	}
	while (children.length !== 1){
		const length = children.length
		for (let i = 0; i < length; i++){
			if (i % 2 === 0){
				if (i + 1 < length){
					parents.push(sha256(children[i] + children[i + 1]));
				} else if (i === length - 1){
					parents.push(sha256(children[i]));
				}
			}
		}
		children = parents;
		parents = [];
	}
	return children[0];
}

function publicToAddress(public){
	// from https://en.bitcoin.it/wiki/Technical_background_of_version_1_Bitcoin_addresses
	const hashPK = sha256(public)
	const ripemd = '00' + (new ripemd160().update(Buffer.from(hashPK, 'hex')).digest().toString('hex'));
	const checksum = sha256(sha256(ripemd)).substring(0, 8); // sha256 third times
	return base58.encode(Buffer.from(ripemd + checksum, 'hex'));
}

function sha256(str){
	return cryptojs.SHA256(str).toString();
}

module.exports = {
	adjustUTXOs: adjustUTXOs,
	allocate: allocate,
	collectUTXOs: collectUTXOs,
	ecSign: ecSign,
	ecVerify: ecVerify,
	merkleRoot: merkleRoot,
	publicToAddress: publicToAddress,
	sha256: sha256
}