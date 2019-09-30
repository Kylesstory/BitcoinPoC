const crypto = require('crypto');
const User = require('./src/User');
const utils = require('./src/Utilities');


// general functions
function randomInt(max) { // return an integer between from 0 to max -1
	return Math.floor(Math.random() * Math.floor(max));
}

//// main entrance

/// initialize the blockchain
// create a blockchain object with the difficulty = 1, and mining reward = 50
const satoshi = User.Satoshi();
const blockchain = satoshi.blockchain;
const users = [];
/// create  users
// initialize the exchange and it's initialize amount
let user, addressbook = [satoshi.address], ulength = 0;
// const tips = [9, 3, 2, 5, 6]
for(let i = 0; i < 5; i++){
	user = new User(blockchain);
	satoshi.transfer(user.address, randomInt(10) + 40, 0.01);
	users.push(user);
	addressbook.push(user.address);
	ulength += 1
}
users[randomInt(ulength)].mine();

while (true){
	user = users[randomInt(ulength)];
	action = randomInt(1000);
	if (action < 870){ // transfer
		to = users[randomInt(users.length)].address;
		amount = randomInt(30) + 1;
		tip = parseInt(amount / 10) + 1;
		user.transfer(to, amount, tip);
	} else if (action < 970){
		user.mine();
	} 
}
