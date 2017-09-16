var LANDMARK = artifacts.require("./Landmark.sol");


function post_message(message) {
    return LANDMARK.deployed().then(function(instance) {
	return instance.post(message);
    }).then(function(result) { });
}

function test_require(func_name, arg) {

    return LANDMARK.deployed().then(function(instance) {
	return instance[func_name].call(arg);
    }).then(function(result) {
	assert(false, "Call was supposed to fail but didn't");
    }).catch(function(error) {
	// Look for invalid opcode, otherwise fail
	var idx = error.toString().indexOf("invalid opcode");
	if(idx != -1) {}
	else {assert(false, error.toString());}
    });
    
}

contract('Landmark', function(accounts) {

    var msg0 = "hello world!"
    var msg1 = "is there a point?"
    var msg2 = "this is the end."

    it("Simple, single post", function() {
	post_message(msg0);
    });
    

    it("Check post count after posting a few more", function() {
	post_message(msg1);	
	post_message(msg2);
	
	return LANDMARK.deployed().then(function(instance) {
	    return instance.getMessageCount.call();
	}).then(function(result) {
	    assert.equal(result.toNumber(), 3);
	});
    });

    it("Get message contents", function() {
	return LANDMARK.deployed().then(function(instance) {
	    return instance.getMessageContents.call(1);
	}).then(function(result) {
	    assert.equal(result, msg1);
	});
    });

    it("Get a message sender address", function() {
	return LANDMARK.deployed().then(function(instance) {
	    return instance.getMessageAddress.call(1);
	}).then(function(result) {
	    assert.equal(result, accounts[0]);
	});
    });

    it("Ask for a message that doesn't exist (larger than idx)", function() {
	test_require("getMessage", 5);
    });

    it("Ask for a message that doesn't exist (negative)", function() {
	test_require("getMessage", -1);
    });
    
    
});
