var LANDMARK = artifacts.require("./Landmark.sol");

// Execute a function that writes to the chain
function promise_execute(func_name, ...args) {
    return LANDMARK.deployed().then(function(instance) {
	return instance[func_name](...args);
    }).then(function(result) { });
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
	assert(false,"Result should not have completed");
    }
    catch(error) {
	const opIDX = error.toString().indexOf("invalid opcode");
	assert(opIDX != -1, error + "\nExpected error incorrect");
    }
}


contract('Landmark', function(accounts) {

    var msg0 = "hello world!"
    var msg1 = "is there a point?"
    var msg2 = "this is the end."
    var profileMsg0 = "I am who I say I am."

    it("Get curator address", async function() {
	const result = (await promise_call("getCuratorAddress"));
	console.log("Curator address", result);
    });
    
    it("Simple, single post", function() {
	promise_execute("post", msg0);
    });

    it("Set profile", function() {
	promise_execute("postProfile", profileMsg0);
    });
    
    it("Check post count after posting a few more", async function() {
	promise_execute("post", msg1);
	promise_execute("post", msg2);
	const result = (await promise_call("getMessageCount")).toNumber();
	assert.equal(result, 3);
    });

    it("Post profile", function() {
	promise_execute("postProfile", profileMsg0);
    });

    it("Get profile contents", async function() {
	const result = (await promise_call("getProfileContent", accounts[0]));
	assert.equal(result, profileMsg0);
    });

    it("Get message contents", async function() {
	const result = (await promise_call("getMessageContents", 1));
	assert.equal(result, msg1);
    });

    it("Get message sender address", async function() {
	const result = (await promise_call("getMessageAddress", 1));
	assert.equal(result, accounts[0]);
	console.log("Message sender address", result);
    });

    it("Get message timestamp", async function() {

	const t0 = (await promise_call("getMessageTimestamp", 0));
	const t2 = (await promise_call("getMessageTimestamp", 2));

	// require that the later message is >= the first message
	// since testrpc is so quick, this never really gets checked
	assert(t0.toNumber() <= t2.toNumber(), "timestamps out of order");
    });

    // *********************************************************************
    // Bounds checking
    // *********************************************************************

    it("Ask for a message that doesn't exist (larger than idx)", function() {
	testOPCodeFail("getMessageContents", 27);
    });

    it("Ask for a message that doesn't exist (negative)", function() {
	testOPCodeFail("getMessageContents", -1);
    });

    it("Ask for a profile that doesn't exist", function() {
	testOPCodeFail("getProfileContent", accounts[1]);
    });

    

});
