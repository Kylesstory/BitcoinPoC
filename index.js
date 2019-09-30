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
		console.log('  \x1b[32m\'%s\'\x1b[0m: \x1b[33m%s%s', data[i][0], data[i][1], ((i === data.length -1) ? '' : '\x1b[0m,'));
	}
	console.log('\x1b[0m}\n')
}

//// main entrance

/// initialize the blockchain
const satoshi = User.Satoshi();
const blockchain = satoshi.blockchain;
const users = [];
let user, ulength = 0;
for(let i = 0; i < 5; i++){ // create 5 users
	user = new User(blockchain);
	satoshi.transfer(user.address, randomInt(10) + 40, 0.01);
	users.push(user);
	ulength += 1
}
users[randomInt(ulength)].mine();

while (true){ // flip a dice to decide the next action
	user = users[randomInt(ulength)];
	action = randomInt(100);
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
	} else if (action < 95){ // print settings
		const data = [['Block height', blockchain.height], ['PoW difficulty', blockchain.difficulty], ['Current reward', blockchain.reward]];
		print('Settings', data);
	}
}
