var LANDMARK = artifacts.require("./Landmark.sol");

// Counting characters in Unicode (and emoji) are hard, see
// http://blog.jonnew.com/posts/poo-dot-length-equals-two
function fancyCount(str){
  return Array.from(str.split(/[\ufe00-\ufe0f]/).join("")).length;
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
	assert(false,"Result should not have completed");
    }
    catch(error) {
	const opIDX = error.toString().indexOf("invalid opcode");
	assert(opIDX != -1, error + "\nExpected error incorrect");
    }
}


contract('Landmark', function(accounts) {

    
    var msg0 = "hello world!";
    var msg1 = "is there a point?";
    var msg2 = "this is the end.";
    var msg3 = "LOL! 💩 Emoji in Landmark 😀😀😀";
    var profileMsg0 = "I am who I say I am.";

    // *********************************************************************
    // Setters
    // *********************************************************************
    
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

    it("Unicode characters in post", async function() {
	await promise_execute("post", msg3);
	const idx  = (await promise_call("getMessageCount")) - 1;
	const msgX = (await promise_call("getMessageContents",idx));
	var post = await promise_execute("post", msg3);
	console.log(idx,msgX);
    });

    // *********************************************************************
    // Getters
    // *********************************************************************

    it("Get curator address", async function() {
	const result = (await promise_call("getCuratorAddress"));
	console.log("Curator address", result);
    });
    
    it("Get post length", async function() {
	const length_eth = (await promise_call("getPostLength",  msg3));
	const length_js  = fancyCount(msg3);
	assert.equal(length_eth, length_js);
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
    // [fail on empty post]
    // [fail on post too long]
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
    

    // *********************************************************************
    // Stress tests
    // [set stress test length == limitLength]
    // *********************************************************************


    it("Stress test (long post)", async function() {
	var k=3000;
	var msg='x'

	var single = await promise_execute("post", msg.repeat(1));
	var multi = await promise_execute("post", msg.repeat(k));

	var cost_single = single.receipt.gasUsed;
	var cost_multi = multi.receipt.gasUsed;
	
	console.log("Single post gasUsed per char", cost_single/msg0.length);
	console.log("Multi  post gasUsed per char", cost_multi/k/msg0.length);
    });
    
    /*
    it("Stress test (N posts)", function() {
	var N=200;
	var promiseList = [];
	for (i = 0; i<N; i++) {
	    promise_execute("post", msg0).then(function(result) {
		//console.log("posted", result.tx, "to", result.receipt.blockNumber);
	    });
	}
    });
    */
    
});
