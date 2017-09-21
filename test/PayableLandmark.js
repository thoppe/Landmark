eval(require('fs').readFileSync('test/helper_funcs.js')+'');


contract('Landmark', function(accounts) {

    var ethCost = 1337;

    it("Set post message cost (and reset to zero)", async function() {
	await promise_execute("setCostPostMessage", ethCost);
	const val = await promise_call("getCostPostMessage");
	assert.equal(val.toNumber(), ethCost);
	await promise_execute("setCostPostMessage", 0)
    });

    it("Set post profile cost (and reset to zero)", async function() {
	await promise_execute("setCostPostProfile", ethCost);
	const val = await promise_call("getCostPostProfile");
	assert.equal(val.toNumber(), ethCost);
	await promise_execute("setCostPostProfile", 0)
    });
    
    it("Non-curator message cost change", function() {
	testOPCodeFail("setCostPostMessage", ethCost, {from:accounts[1]});
    });

    it("Non-curator profile cost change", function() {
	testOPCodeFail("setCostProfileMessage", ethCost, {from:accounts[1]});
    });

    
    
});
