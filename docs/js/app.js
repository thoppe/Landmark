var provider_url = 'http://localhost:8545';
var f_deployed_contract = './build/contracts/Landmark.json';
//var mainchain_address = '0x';
var ESUrl = "https://etherscan.io"

function update_result(res) {
    $('#result').text(res.logs[0].args._value);
    $('#transactionHash').text(res.receipt.transactionHash)
    	.attr('href', ESUrl+"/tx/"+res.receipt.transactionHash);
    $('#blockNumber').text(res.receipt.blockNumber)
	.attr('href', ESUrl+"/block/"+res.receipt.blockNumber);
    $('#gasUsed').text(res.receipt.gasUsed);
    console.log("Result was", res.logs[0].args._value);
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
	    App.contracts.LANDMARK = TruffleContract(data);
	    App.contracts.LANDMARK.setProvider(App.web3Provider);
	});

	App.checkNetworkStatus();
	return App.bindEvents();
    },

    getContractDeploy: function() {

	var toggle = $("#mainnet").prop('checked');
	if (toggle) {
	    return App.contracts.LANDMARK.at(mainchain_address);
	}
	else {
	    return App.contracts.LANDMARK.deployed();
	}
    },

    checkNetworkStatus: function() {
	web3.eth.getAccounts(function(error, accounts) {
	    App.getContractDeploy().then(function(vex) {
		$('#contractHash').text(vex.address)
    		    .attr('href', ESUrl+"/address/"+vex.address);
		console.log(vex);
	    }).catch(function(err) {
		report_error(err.message);
	    });
	});
    },

    bindEvents: function() {
	$(document).on('click', '.btn-process-add', App.processButtonAdd);
	$(document).on('click', '.btn-process-multiply', App.processButtonMul);
	$(document).on('click', '.btn-process-subtract', App.processButtonSub);

	$('#mainnet').change(function() {
	    $('#errorbox').empty().hide();
	    App.checkNetworkStatus();
	});

    },

    processButtonAdd: function() {
	App.processButton("network_add");
    },

    processButtonSub: function() {
	App.processButton("network_subtract");
    },

    processButtonMul: function() {
	App.processButton("network_multiply");
    },

    
    processButton: function(func_name) {

	var x = parseInt($("#data_x").val());
	var y = parseInt($("#data_y").val());
	console.log("Button pressed with",x,y);

	web3.eth.getAccounts(function(error, accounts) {

	    /*
            // Call the easy way without costing anything
	    App.getContractDeploy().then(function(vex) {
		return vex.add.call(x,y);
	    }).then(function(result) {
		update_result(result);
	    }).catch(function(err) {
		report_error(err.message);
	    });
	    */
	    
	    App.getContractDeploy().then(function(vex) {
		$('#result').text("Contract executing...");
		return vex[func_name](x,y);
	    }).then(function(result) {
		update_result(result);
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
