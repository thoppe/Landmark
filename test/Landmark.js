// Load the helper functions
var fs = require('fs');
const helper = require('./helper_funcs.js');
for (var key in helper) global[key] = helper[key];

const default_limitLength = 720;
const versionNumber = 1;

contract('Landmark', function(accounts) {
    
    var msg0 = "hello world!";
    var msg1 = "LOL! 💩 Emoji in Landmark 😀😀😀";
    var msg2 = "is there a point?";
    var msg3 = "this is the end.";
    var profileMsg0 = "I am who I say I am.";

    var privilegedUser0 = accounts[6];
    var privilegedUser1 = accounts[7];
    var privilegedUser2 = accounts[8];
    var fwdAddress = accounts[9];

    // *********************************************************************
    // Setters
    // *********************************************************************
    
    it("Simple, single post", async function() {
	const x = await promise_execute("postMessage", msg0);
	logGas(this.test.title, x);
	console.log("Contract address", await getContractAddress());
    });

    it("Set profile", async function() {
	const x = await promise_execute("postProfile", profileMsg0);
	logGas(this.test.title, x);
    });

    it("Unicode characters in post", async function() {
	await sleep(100);  // delay in posting to find timing differences
	await promise_execute("postMessage", msg1);
	const idx  = (await promise_call("getMessageCount")) - 1;
	const msgX = (await promise_call("getMessageContents",idx));
	console.log("Emoji test:", msgX);
    });

    // *********************************************************************
    // Getters
    // *********************************************************************

    it("Check post count", async function() {
	// Post a few extra messages
	promise_execute("postMessage", msg2);
	promise_execute("postMessage", msg3);
	const result = await promise_call("getMessageCount");
	assert.equal(result.toNumber(), 4);
    });

    it("Get version number", async function() {
	assert.equal(await promise_call("getVersionNumber"), versionNumber);
    });

    it("Get max post length", async function() {
	const maxlength = (await promise_call("getLimitPostLength"));
	assert.equal(maxlength.toNumber(), default_limitLength);
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

    it("Get curator privilege", async function() {
	const curator = await promise_call("getCuratorAddress");
	const val = await promise_call("getIsPrivileged", curator);
	assert.equal(val, true);
    });

    it("Get message sender address", async function() {
	const result = (await promise_call("getMessageAddress", 1));
	assert.equal(result, accounts[0]);
	console.log("Message sender address", result);
    });

    it("Get message timestamp", async function() {
	const t0 = (await promise_call("getMessageTimestamp", 0));
	const t2 = (await promise_call("getMessageTimestamp", 3));
	assert(t0.toNumber() <= t2.toNumber(), "timestamps out of order");
    });

    // *********************************************************************
    // Bounds checking
    // *********************************************************************

    it("Ask for a message that doesn't exist (larger than idx)",
       async function() {
	const k = (await promise_call("getMessageCount")).toNumber();
	failCall("getMessageContents", k+1);
    });

    it("Ask for a message that doesn't exist (negative)", function() {
	failCall("getMessageContents", -1);
    });

    it("Ask for a profile that doesn't exist", function() {
	failCall("getProfileContent", accounts[1]);
    });

    it("Post a message too long", async function() {
	const k = (await promise_call("getLimitPostLength")).toNumber();
	const msg = 'x'.repeat(k+1)
	failExecute("postMessage", msg);
    });

    it("Post a profile too long", async function() {
	const k = (await promise_call("getLimitPostLength")).toNumber();
	const msg = 'x'.repeat(k+1)
	failExecute("postProfile", msg);
    });


    // *********************************************************************
    // Stress tests
    // *********************************************************************
    
    it("Stress test (longest post)", async function() {
	const k = (await promise_call("getLimitPostLength")).toNumber();
	var msg='x'

	var single = await promise_execute("postMessage", msg.repeat(1));
	var multi = await promise_execute("postMessage", msg.repeat(k));

	var cost_single = single.receipt.gasUsed;
	var cost_multi = multi.receipt.gasUsed;
	
	console.log("Single post gasUsed per char", cost_single);
	console.log("Multi  post gasUsed per char", cost_multi/k);

	logGas(this.test.title, multi);	
    });
    
/*    
    it("Stress test (N posts)", function() {
	var N=200;
	var promiseList = [];
	for (i = 0; i<N; i++) {
	    promise_execute("postMessage", msg0).then(function(result) {
		//console.log("posted", result.tx, "to", result.receipt.blockNumber);
	    });
	}
    });
        
*/   
    // *********************************************************************
    // Shutdown 
    // *********************************************************************

    it("Set forwarding address early before closed", async function() {
	failExecute("setForwardingAddress", fwdAddress);
    });
    
    it("Non-curator shutdown or forwarding", function() {
	failExecute("closeLandmarkSite", {from:accounts[1]});
	failExecute("setForwardingAddress", fwdAddress, {from:accounts[1]});
    });
    
    it("Shutdown and verify closed", async function() {
	const curator = await promise_call("getCuratorAddress");
	assert.equal(await promise_call("getIsSiteOpen"), true);
	var x = await promise_execute("closeLandmarkSite", {from:curator});
	assert.equal(await promise_call("getIsSiteOpen"), false);
	logGas(this.test.title, x);
    });

    it("Post message on shutdown site", async function() {
	failExecute("postMessage", msg0);
    });

    it("Post profile shutdown site", async function() {
	failExecute("postProfile", msg0);
    });

    it("Set forwarding address", async function() {
	const curator = await promise_call("getCuratorAddress");
	var x = await promise_execute("setForwardingAddress",
				      fwdAddress, {from:curator});
	logGas(this.test.title, x);
    });

    it("Get forwarding address", async function() {
	const loc1 = await promise_call("getForwardingAddress",
					{from:accounts[1]});
	assert.equal(fwdAddress, loc1);
    });
    
   
    // *********************************************************************
    // Payment methods (create new contract)
    // *********************************************************************

    var ethCost = web3.toWei(.3);

    it("Deploy new contract", async function() {
	const A0 = await getContractAddress();
	var x = await createNewContract();
	const A1 = await getContractAddress();

	// Check to make sure addresses are now different
	assert.notEqual(A0, A1);
    });
        
    it("Non curator set permissions/cost", async function() {
	args = {from:accounts[1]};
	failExecute("setPermissionProfile", true, args);
	failExecute("setPermissionMessage", true, args);
	failExecute("setCostPrivilege", ethCost, args);
	failExecute("grantPrivilege", accounts[1], args);
	failExecute("withdrawValue", {from:accounts[1]});
    });

    it("Try purchase permission befroe cost is set", function() {
	var args = {from:privilegedUser1, value:ethCost};
	failExecute("purchasePrivilege", args);
    });

    it("Set/Get privilege cost", async function() {
	const tx  = await promise_execute("setCostPrivilege", ethCost);
	const val = await promise_call("getCostPrivilege");
	assert.equal(val.toNumber(), ethCost);
	logGas(this.test.title, tx);
    });

    it("Set/Get permission to Message", async function() {
	const tx  = await promise_execute("setPermissionMessage", true);
	assert.equal(true, await promise_call("getPermissionNeededToMessage"));
	logGas(this.test.title, tx);
    });

    it("Set/Get permission to Profile", async function() {
	const tx  = await promise_execute("setPermissionProfile", true);
	assert.equal(true, await promise_call("getPermissionNeededToProfile"));
	logGas(this.test.title, tx);
    });

    it("Try to post without permission", function() {
	failExecute("postMessage", msg0, {from:privilegedUser0});
	failExecute("postProfile", msg0, {from:privilegedUser0});
    });

    it("Curator grant privilege", async function() {
	const x = await promise_execute("grantPrivilege", privilegedUser0);
	logGas(this.test.title, x);
    });

    it("Post with granted permission", function() {
	promise_execute("postMessage", msg0, {from:privilegedUser0});
	promise_execute("postProfile", msg0, {from:privilegedUser0});
    });
    
    it("Try to under-purchase privilege", async function() {
	args = {from:privilegedUser1, value:ethCost/2};
	failExecute("purchasePrivilege", args);

	// Fails without any value too
	failExecute("purchasePrivilege", {from:privilegedUser1});
    });

    it("Purchase privilege", async function() {
	args = {from:privilegedUser1, value:ethCost*3};
	const x = await promise_execute("purchasePrivilege", args);
	logGas(this.test.title, x);

	// Make sure overpayment was refunded
	const val = (await promise_call("getContractValue")).toNumber();
	assert.equal(ethCost, val);
    });

    it("Post with purchased permission", function() {
	promise_execute("postMessage", msg0, {from:privilegedUser1});
	promise_execute("postProfile", msg0, {from:privilegedUser1});
    });

    it("Try to purchase privilege twice", async function() {
	args = {from:privilegedUser1, value:ethCost};
	failExecute("purchasePrivilege", args);	
    });

    it("Shutdown and try to purchase", async function() {
	args = {from:privilegedUser2, value:ethCost};
	const curator = await promise_call("getCuratorAddress");
	await promise_execute("closeLandmarkSite", {from:curator});
	failExecute("purchasePrivilege", args);
    });
    
    it("Withdraw funds", async function() {

	// Measure the account balance before
	const A0 = web3.eth.accounts[0];
	const val0 = web3.eth.getBalance(A0).toNumber();

	var tx = await promise_execute("withdrawValue");
	logGas(this.test.title, tx);

	// ... and after the transfer
	const val1 = web3.eth.getBalance(A0).toNumber();

	// The difference (up to gas costs)
	var delta = Math.round(web3.fromWei(val1-val0)*1e2)/1e2;
	assert.equal(delta, web3.fromWei(ethCost));

	// Everything should be moved (final amount left should be zero
	const valPost = (await promise_call("getContractValue")).toNumber();

	assert.equal(0, Math.round(valPost));
    });
    

    it("Save the gas costs to file (not a test)", function() {
	var f_json = './test/gasCosts.json';
	fs.writeFileSync(f_json, JSON.stringify(transactionLog,null,2));
    });

    
});
