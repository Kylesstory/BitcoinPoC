const crypto = require('crypto');
const User = require('./src/User');
const utils = require('./src/Utilities');

// global variables
let blockchain;
const users = [];

// general functions
function randomInt(max) { // return an integer between from 0 to max -1
	return Math.floor(Math.random() * Math.floor(max));
}

function print(header, data){
	console.log('\x1b[0m%s {', header);
	for(let i = 0; i < data.length; i++){
		console.log('  \x1b[32m\'' + data[i][0] + '\'\x1b[0m: \x1b[33m' + data[i][1] + ((i === data.length -1) ? '' : '\x1b[0m,'));
	}
	console.log('\x1b[0m}\n')
}

function printBalances(){
	const balances = blockchain.calculateBalances();
	const data = [];
	for(let i = 0; i < users.length; i++){
		data.push([users[i].address, balances[users[i].address] / 100000000]);
	}
	print('Balances', data);
}

function printSettings(){
	const data = [['Block height', blockchain.height], ['PoW difficulty', blockchain.difficulty], ['Current reward', blockchain.reward]];
	print('Settings', data);
}

//// main entrance

/// initialize the blockchain
// create a blockchain object with the difficulty = 1, and mining reward = 50
const satoshi = User.Satoshi();
blockchain = satoshi.blockchain;
/// create  users
// initialize the exchange and it's initialize amount
let user, ulength = 0;
for(let i = 0; i < 5; i++){
	user = new User(blockchain);
	satoshi.transfer(user.address, randomInt(10) + 40, 0.01);
	users.push(user);
	ulength += 1
}
users[randomInt(ulength)].mine();

while (true){
	user = users[randomInt(ulength)];
	action = randomInt(1000);
	if (action < 770){ // transfer
		to = users[randomInt(users.length)].address;
		amount = randomInt(30) + 1;
		tip = (amount / 10000) * (1 + randomInt(9));
		user.transfer(to, amount, tip);
	} else if (action < 890){
		user.mine();
	} else if (action < 920){
		printBalances();
	} else if (action < 950){
		printSettings();
	}
}
