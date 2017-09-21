
var LANDMARK = artifacts.require("./Landmark.sol");

// Counting characters in Unicode (and emoji) are hard, see
// http://blog.jonnew.com/posts/poo-dot-length-equals-two
function fancyCount(str){
  return Array.from(str.split(/[\ufe00-\ufe0f]/).join("")).length;
}

// Simple sleep promise to check timing
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Execute a function that writes to the chain
function promise_execute(func_name, ...args) {
    return LANDMARK.deployed().then(function(instance) {
	return instance[func_name](...args);
    })
}

// Call a read-only function, returns a promise
function promise_call(func_name, ...args) {
    return LANDMARK.deployed().then(function(instance) {
	return instance[func_name].call(...args);
    });
}

// Looks for the test to fail with the words "invalid opcode"
async function testOPCodeFail(func_name, ...args) {
    try {
	const result = await promise_call(func_name, ...args);
	assert(false,"Expected a throw (but no throw detected)");
    }
    catch(error) {
	const opIDX = error.toString().indexOf("invalid opcode");
	assert(opIDX != -1, error + "\nExpected error incorrect");
    }
}