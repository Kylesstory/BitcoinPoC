const crypto = require('crypto');
const User = require('./src/User');
const utils = require('./src/Utilities');

// general functions
function randomInt(max) { // return an integer between from 0 to max -1
	return Math.floor(Math.random() * Math.floor(max));
}

function print(header, data){
	console.log('\x1b[0m%s {', header);
	for(let i = 0; i < data.length; i++){
		console.log('  %s: \x1b[33m%s\x1b[0m%s', data[i][0], data[i][1], ((i === data.length -1) ? '' : ','));
	}
	console.log('\x1b[0m}\n')
}

function init(userNumber){ // initialize the blockchain
	const satoshi = User.Satoshi();
	const blockchain = satoshi.blockchain;
	const users = [];
	for(let i = 0; i < userNumber; i++){ // create [userNumber] users
		let user = new User(blockchain);
		satoshi.transfer(user.address, randomInt(10) + 40, 0.01);
		users.push(user);
	}
	users[randomInt(userNumber)].mine();
	return users;
}

function run(user, action){
	blockchain = user.blockchain;
	if (action < 77){ // transfer
		to = users[randomInt(users.length)].address;
		amount = randomInt(30) + 1;
		tip = (amount / 10000) * (1 + randomInt(9));
		user.transfer(to, amount, tip);
	} else if (action < 89){ // mine
		user.mine();
	} else if (action < 92){ // print balances
		const balances = blockchain.balances();
		const data = [];
		for(let i = 0; i < users.length; i++){
			data.push([users[i].address, balances[users[i].address] / 100000000]);
		}
		print('Balances', data);
	} else if (action < 95){ // print stats
		const data = [['Block height', blockchain.height - 1], ['PoW difficulty', blockchain.difficulty], ['Current reward', blockchain.reward]];
		print('Stats', data);
	}
}

// main entrance
const userNumber = 5;
const users = init(userNumber);
let user, action;
while (true){ // flip a dice to decide the next action
	user = users[randomInt(userNumber)];
	action = randomInt(100);
	run(user, action);
}
