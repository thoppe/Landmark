var provider_url = 'http://localhost:8545';
var f_deployed_contract = './build/contracts/Landmark.json';
//var mainchain_address = '0x';
var ESUrl = "https://etherscan.io"

//require("truffle-contract");
//require("truffle-contracts");
//var LANDMARK = artifacts.require("./Landmark.sol");


function update_result(res) {
    let data = res.receipt;
    //$('#result').text(res.logs[0].args._value);
    $('#transactionHash').text(data.transactionHash)
    	.attr('href', ESUrl+"/tx/"+data.transactionHash);
    $('#blockNumber').text(data.blockNumber)
	.attr('href', ESUrl+"/block/"+data.blockNumber);
    $('#gasUsed').text(data.gasUsed);
};


function report_error(x) {
    $('#errorbox').show().append(x);
    console.log(x);
}


App = {
    web3Provider: null,
    contracts: {},

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

	App.checkNetworkStatus();
	App.loadAccountInfo();
	return App.bindEvents();
    },

    getContractDeploy: function() {

	var toggle = $("#mainnet").prop('checked');
	if (toggle) {
	    return App.contracts.Landmark.at(mainchain_address);
	}
	else {
	    return App.contracts.Landmark.deployed();
	}
    },

    checkNetworkStatus:  function() {
	web3.eth.getAccounts(function(error, accounts) {
	    App.getContractDeploy().then(function(vex) {
		$('#contractHash').text(vex.address)
    		    .attr('href', ESUrl+"/address/"+vex.address);
		console.log(vex);
	    }).catch(function(err) {
		report_error(err.message);
	    });
	});
	/*
	web3.eth.getAccounts(async function(error, accounts) {
    	    let vex = await App.getContractDeploy();
	    $('#contractHash').text(vex.address)
    		.attr('href', ESUrl+"/address/"+vex.address);
	    console.log(vex);

	});
	*/
    },
    
    loadAccountInfo: function() {
	web3.eth.getAccounts(function(error, accounts) {
	    var acc0 = accounts[0];
	    $('#accountHash').text(acc0)
	    
	    web3.eth.getBalance(acc0, function(error, val) {
		let eth = web3.fromWei(val.toNumber());
		$('#accountBalance').text(eth + " ether");
	    });
	});	
    },

    loadPostInfo: function() {
	web3.eth.getAccounts(function(error, accounts) {

            // Call the easy way without costing anything
	    App.getContractDeploy().then(function(vex) {
		return vex.getMessageCount.call();
	    }).then(function(result) {
		$('#postCount').text(result.toNumber());
		console.log(result.toNumber());
	    }).catch(function(err) {
		report_error(err.message);
	    });

	});	
    },

    loadVersionInfo: function() {
	web3.eth.getAccounts(function(error, accounts) {

            // Call the easy way without costing anything
	    App.getContractDeploy().then(function(vex) {
		return vex.getVersionNumber.call();
	    }).then(function(result) {
		$('#versiontag').text(", version "+ result.toNumber());
		console.log(result.toNumber());
	    }).catch(function(err) {
		report_error(err.message);
	    });

	});	
    },

    bindEvents: function() {
	$(document).on('click', '.btn-process-post', App.processButtonPost);
	
	$('#mainnet').change(function() {
	    $('#errorbox').empty().hide();
	    App.checkNetworkStatus();
	});

	App.loadPostInfo();	
	App.loadVersionInfo();
	
    },

    processButtonPost: function() {
	const text = $('#marktext').val();
	if(!text) return false;
	
	console.log("hello", text);
	
	web3.eth.getAccounts(function(error, accounts) {

	    App.getContractDeploy().then(function(cx) {
		console.log("Posting with", text);
		return cx.postMessage(text);
	    }).then(async function(result) {
		console.log("Post complete!", result);
		update_result(result);
		await App.loadPostInfo();
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
