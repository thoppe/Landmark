const helperFuncs = require('./helper_funcs.js');
for (var key in helperFuncs)
    global[key] = helperFuncs[key]

//console.log("promise_call");

contract('Landmark', function(accounts) {

    var msg0 = "hello world!";
    var ethCostMsg = 1337;
    var ethCostPro = 927;

    
    it("Create new contract, checks for diff address", async function() {
	const A0 = await getContractAddress();
	await createNewContract();
	const A1 = await getContractAddress();
	assert.notEqual(A0, A1);
    });
    
    it("Set post message cost", async function() {
	await promise_execute("setCostPostMessage", ethCostMsg);
	const val = await promise_call("getCostPostMessage");
	assert.equal(val.toNumber(), ethCostMsg);
    });

    it("Set post profile cost", async function() {
	await promise_execute("setCostPostProfile", ethCostPro);
	const val = await promise_call("getCostPostProfile");
	assert.equal(val.toNumber(), ethCostPro);
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

    it("Non-curator message cost change", function() {
	failExecute("setCostPostMessage", ethCostMsg, {from:accounts[1]});
    });

    it("Try to post message without ether with cost set", function() {
	failExecute("postMessage", msg0);
    });

    it("Try to post profile without ether with cost set", function() {
	failExecute("postProfile", msg0);
    });
    
    it("Non-curator profile cost change", async function() {
	failExecute("setCostPostProfile", ethCostPro, {from:accounts[1]});
    });

});
