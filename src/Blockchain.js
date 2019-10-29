const Block = require('./Block');
const Transaction = require('./Transaction');
const UTXO = require('./UTXO');
const utils = require('./Utilities');

class Blockchain{
    constructor(genesis) {
        this.chain = [genesis]; // to build a block list
        const settings = genesis.header.nonce; // several settings were defined in the first block, called genesis block
		this.blockSize = settings.blockSize; // set the block size
        this.interval = settings.interval; // The real interval is set to 10 minutes, we use 2 seconds here.
        this.reward = settings.reward; // set initial mining reward
        this.half = settings.half; // The real reward is reduced to half every 210000 blocks, we use 21 here.
        this.adjust = settings.adjust; // The difficulty is adjusted every 2016 blocks, we use 2 here.
        this.bias = settings.bias; // The received UTXO could be spent after 100 blocks, we use 1 here.
        this.height = genesis.height;
        this.difficulty = genesis.difficulty; // the mining difficulty related to the time interval
        this.uTxs = [];
        this.utxos = [];
        this.txs = {};
        this.blocks = {};
    }

    add(block){ // to add a new block
        // 1. verify the validity of the block
        const validBlock = block.verify(this.last().getHash());
        // 1-1. verify the validity of all transactions
        const txs = block.transactions;
        const validTxs = txs.map(x => x.verify()).reduce((x, y) => x && y);
        const balances = this.balances();
        let enoughBalance = true;
        for (let i = 0; i < txs.length; i++){
            balances[txs[i].from] -= (txs[i].amount + txs[i].tip);
            if (balances[txs[i].from] < 0){
                enoughBalance = false;
                break;
            }
        }

        if (!validBlock){ 
            console.log('Invalid block.')
        } else if (!validTxs){
            console.log('Invalid transaction found.')
        } else if (!enoughBalance){
            console.log('Insufficient balance detected.')
        } else{ // all transactions are verified valid, deal with the payment
            const blockHash = utils.sha256(block);
            // 2-1. modify the difficulty by the time interval
            if (((block.height % this.adjust) === 1) && (block.height > this.adjust)){
                const diff = block.header.timestamp.getTime() - this.chain[block.height - this.adjust].header.timestamp.getTime();
                this.difficulty = diff < (this.interval * this.adjust) ? this.difficulty + 1 : Math.max(this.difficulty - 1, 4)
            }
            // 2-2. increase the block height
            this.height += 1;
            // 2-3. delete packaged txs from uTxs
            this.uTxs.slice(txs.length);
            for (let i = 0; i < txs.length; i++){
                // 2-4. revoke parents utxos and add new utxos
                utils.adjustUTXOs(this.utxos, txs[i], block.signer);
                // 2-5. record txs
                this.txs[txs[i].getHash()] = txs[i];
            }
            // 2-6. adjust the block reward based on the block height
            this.reward = block.height % this.half === 0 ? this.reward / 2 : this.reward;
            this.reward = this.reward < 0.00000001 ? 0 : this.reward;
            // 2-7. record block
            this.blocks[blockHash] = block;
            // 2-8. the block mining reward
            const award = new UTXO(block.signer, [], blockHash, this.reward);
            this.utxos.push(award);
            // 2-8. add the block to the blockchain
            this.chain.push(block);
            // 2-9. record the block to the map
            this.blocks[block.getHash()] = block;
            // 3. print the block header
            console.log(block.header);
            console.log('');
        }
    }

    balances(){ // to return the balances by calculating utxos
        const balances = {};
        for (let i = 0; i < this.utxos.length; i++){
            const utxo = this.utxos[i];
            balances[utxo.owner] = (utxo.owner in balances) ? utxo.amount + balances[utxo.owner] : utxo.amount;
        }
        return balances;
    }

    last(){ // to return the last block of the current blockchain
        return this.chain[this.chain.length - 1];
    }

    verifyAllBlocks() { // to verify all blocks of the blockchain
        for(let i = 1; i < this.chain.length; i++) { // for each block (height > 0)
            const current = this.chain[i];
            const previous = this.chain[i - 1];
            // 1. make sure the hash value of each block is kept in the next block
            // 2. make sure each block (except for the first block, genesis) is valid
            return current.previousHash !== utils.sha256(previous.toString()) ? false : current.verify(previous.getHash());
        }
    }
}
module.exports = Blockchain;