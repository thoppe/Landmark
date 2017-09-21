eval(require('fs').readFileSync('test/helper_funcs.js')+'');


contract('Landmark', function(accounts) {

    it("Set post message cost (and reset to zero)", async function() {
	await promise_call("setCostPostMessage", 20)
	const val = await promise_call("getCostPostMessage")
	console.log(val);
	assert.equal(val.toNumber(), 20);
	await promise_call("setCostPostMessage", 0)
    });

    
});
