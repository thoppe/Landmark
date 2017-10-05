var provider_url = 'http://localhost:8545';
var f_deployed_contract = './build/contracts/Landmark.json';
//var mainchain_address = '0x';
var ESUrl = "https://etherscan.io"

const updateInterval = 1000;

function update_result(res) {
    let data = res.receipt;
    $('#transactionHash').text(data.transactionHash)
    	.attr('href', ESUrl+"/tx/"+data.transactionHash);
    $('#blockNumber').text(data.blockNumber)
	.attr('href', ESUrl+"/block/"+data.blockNumber);
    $('#gasUsed').text(data.gasUsed);
};

function report_error(x) {
    $('#errorbox').show().append(x+"<br>");
    console.log(x);
}

function setVersionNumber(result) {
    $('#versiontag').text(", version "+ result.toNumber());
}

function setPostCount(result) {
    $('#postCount').text(result.toNumber());
}

function setAccountHash(accounts) {
    $('#accountHash').text(accounts[0])
}

function setContractHash(accounts, LM) {
    $('#contractHash').text(LM.address)
    	.attr('href', ESUrl+"/address/"+LM.address);
}

function setAccountBalance(result) {
    let eth = web3.fromWei(result.toNumber());
    $('#accountBalance').text(eth + " ether");
}

function setMessageContents(result, n) {
    let label = 'LandmarkPost'+n;
    if($('#'+label).length)
	return false;
    
    let body = $("#marks").find('tbody');
    let tr = $("<tr>").attr('id', label);
    let td2 = $("<td>").text(result).addClass("messageText");
    let td1 = $("<td>").addClass("messageSender");
    let td0 = $("<td>").text("["+(n+1)+"]").addClass("messageNumber");
    body.append(tr.append(td0, td1, td2));
}

function setMessageAddress(result, n) {
    let post = $('#LandmarkPost'+n);
    if(post.length == 0)
	return false;
    post.find(".messageSender").text(result);
    
}



App = {
    web3Provider: null,
    contracts: {},
    updater: null,

    init: function() {
	return App.initWeb3();
    },

    initWeb3: function() {
	// Initialize web3 and set the provider to the testRPC.
	if (typeof web3 !== 'undefined') {
	    App.web3Provider = web3.currentProvider;
	    web3 = new Web3(web3.currentProvider);
	} else {
	    // set the provider you want from Web3.providers
	    App.web3Provider = new web3.providers.HttpProvider(provider_url);
	    web3 = new Web3(App.web3Provider);
	}
	return App.initContract();
    },

    initContract: function() {	
	
	web3.eth.getAccounts(function(error, accounts) {
	    if (error) { report_error(error); }
	});

	// Load the contract data from file
	$.getJSON(f_deployed_contract, function(data) {
	    App.contracts.Landmark = TruffleContract(data);
	    App.contracts.Landmark.setProvider(App.web3Provider);	    
	});

	App.LandmarkCall(null, {"pre":setContractHash});
	App.loadAccountInfo();
	return App.bindEvents();
    },

    
    LandmarkCall: function(funcname, callFuncs={}, ...args) {
	// Helper function, will run calls on network and then
	// run "pre" and "then" functions afterwards
	
	web3.eth.getAccounts(function(error, accounts) {
	    App.getContractDeploy().then(function(LM) {
		if (callFuncs["pre"] != null)
		    callFuncs["pre"](accounts, LM, ...args);
		if (funcname != null) 
		    return LM[funcname].call(...args);
	    }).catch(function(err) {
		report_error(err.message);
	    }).then(function(result) {
		if (callFuncs["then"] != null)
		    callFuncs["then"](result, ...args);
	    }).catch(function(err) {
		report_error(err.message);

	    })
	})
    },


    getContractDeploy: function() {
	return App.contracts.Landmark.deployed();
    },
  
    bindEvents: function() {
	$(document).on('click', '.btn-process-post', App.processButtonPost);
	
	$('#mainnet').change(function() {
	    $('#errorbox').empty().hide();
	});

	App.LandmarkCall("getVersionNumber", {"then":setVersionNumber});
	App.LandmarkCall("getMessageCount", {"then":setPostCount});

	App.loadAllPosts();
	updater = setInterval(App.loadAllPosts, updateInterval);
    },

    loadAllPosts: function () {
	App.LandmarkCall("getMessageCount", {"then":setPostCount});
	
	try {
	    var n = parseInt($("#postCount").text());
	}
	catch (err) {
	    // Perhaps we aren't ready yet...
	    return false;
	}

	for (i = 0; i < n; i++) {
	    App.LandmarkCall("getMessageContents",
			     {"then":setMessageContents}, i);	    
	}

	for (i = 0; i < n; i++) {
	    App.LandmarkCall("getMessageAddress",
			     {"then":setMessageAddress}, i);	    
	}

	
    },

    loadAccountInfo: function() {
	web3.eth.getAccounts(function(error, accounts) {
	    setAccountHash(accounts);
	    
	    web3.eth.getBalance(accounts[0], function(error, val) {
		setAccountBalance(val);
	    });
	});	
    },

    processButtonPost: function() {
	const text = $('#marktext').val();
	if(!text) return false;
	
	web3.eth.getAccounts(function(error, accounts) {

	    App.getContractDeploy().then(function(cx) {
		console.log("Posting with", text);
		return cx.postMessage(text);
	    }).then(async function(result) {
		console.log("Post complete!", result);
		update_result(result);
		$('#errorbox').empty().hide();
		
	    }).catch(function(err) {
		report_error(err.message);
	    });

	});


    },

};

$(function() {
    $(window).load(function() {
	App.init();
    });
});
