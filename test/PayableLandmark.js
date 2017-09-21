// Load the helper functions
const helper = require('./helper_funcs.js');
for (var key in helper) global[key] = helper[key];

contract('Landmark', function(accounts) {

    var msg0 = "hello world!";
    var ethCostMsg = 1337;
    var ethCostPro = 927;

    it("Set post message cost", async function() {
	await helper.promise_execute("setCostPostMessage", ethCostMsg);
	const val = await promise_call("getCostPostMessage");
	assert.equal(val.toNumber(), ethCostMsg);
    });

    it("Set post profile cost", async function() {
	await promise_execute("setCostPostProfile", ethCostPro);
	const val = await promise_call("getCostPostProfile");
	assert.equal(val.toNumber(), ethCostPro);
    });
    
    it("Non-curator message cost change", function() {
	testOPCodeFail("setCostPostMessage", ethCostMsg, {from:accounts[1]});
    });

    it("Non-curator profile cost change", function() {
	testOPCodeFail("setCostProfileMessage", ethCostPro, {from:accounts[1]});
    });

    it("Try to post message without ether with cost set", function() {
	testOPCodeFail("postMessage", msg0);
    });

    it("Try to post profile without ether with cost set", function() {
	testOPCodeFail("postProfile", msg0);
    });

    it("Post a message (and pay for it!)", async function() {
	args = {from:accounts[0], value:ethCostMsg};
	await promise_execute("postMessage", msg0, args);
    });

    it("Post a profile (and pay for it!)", async function() {
	args = {from:accounts[0], value:ethCostPro};
	await promise_execute("postProfile", msg0, args);
    });

    it("Check the cost of two previous posts", async function() {
	const val = await promise_call("getContractValue");
	assert.equal(val.toNumber(), ethCostPro + ethCostMsg);
    });

});
