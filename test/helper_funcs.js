var LANDMARK = artifacts.require("./Landmark.sol");
var LANDMARK_instance = LANDMARK.deployed();

// Create a fresh instance of the contract
async function createNewContract() {
    const new_address = (await LANDMARK.new()).address;
    LANDMARK_instance = LANDMARK.at(new_address);

}

transactionLog = [];
function logGas(title, ...transactions) {
    var tx = {gasCost:0, title:title};
    for (var i=0, len=transactions.length; i<len; i++) {
	tx["gasCost"] += transactions[i].receipt.cumulativeGasUsed;
    }
    transactionLog.push(tx);
}

function getContractAddress() {
    return LANDMARK_instance.then(function(instance) {
	return instance.contract.address;
    });
}

// Execute a function that writes to the chain
function promise_execute(func_name, ...args) {
    return LANDMARK_instance.then(function(instance) {
	return instance[func_name](...args);
    })
}

// Call a read-only function, returns a promise
function promise_call(func_name, ...args) {
    return LANDMARK_instance.then(function(instance) {
	return instance[func_name].call(...args);
    });
}

function failCall(func_name, ...args) {
    _testOPCodeFail(func_name, promise_call, ...args);
}

function failExecute(func_name, ...args) {
    _testOPCodeFail(func_name, promise_execute, ...args);
}

// Looks for the test to fail with the words "invalid opcode"
async function _testOPCodeFail(func_name, callFunc, ...args) {
    try {
	const result = await callFunc(func_name, ...args);
	assert(false,"Expected a throw (but no throw detected)");
    }
    catch(error) {
	const opIDX = error.toString().indexOf("invalid opcode");
	assert(opIDX != -1, error + "\nExpected error incorrect");
    }
}


// Counting characters in Unicode (and emoji) are hard, see
// http://blog.jonnew.com/posts/poo-dot-length-equals-two
function fancyCount(str){
  return Array.from(str.split(/[\ufe00-\ufe0f]/).join("")).length;
}

// Simple sleep promise to check timing
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports.promise_execute = promise_execute;
module.exports.promise_call = promise_call
module.exports.failExecute = failExecute;
module.exports.failCall = failCall;

module.exports.sleep = sleep;
module.exports.fancyCount = fancyCount;

module.exports.createNewContract = createNewContract;

//module.exports.LANDMARK = LANDMARK;

module.exports.LANDMARK_instance = LANDMARK_instance;
module.exports.getContractAddress = getContractAddress;

module.exports.logGas = logGas;
module.exports.transactionLog = transactionLog;



