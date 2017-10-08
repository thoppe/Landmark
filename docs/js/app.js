var provider_url = 'http://localhost:8545';
var f_deployed_contract = './build/contracts/Landmark.json';
var ESUrl = "https://etherscan.io"

var contract_address = "0x90a9b125b6e4b22ecb139819778dc01d1339ef5c"
var contract_deploy = null;

const updateInterval = 1000;

const closeButtonHTML = '<button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true">&times;</span>';
const infoButtonHTML = `<div>
Post successful: "<span class="infoPostMessage"></span>" <br>
Transaction Hash: <a class="alert-link infoTransactionHash">HASH</a> <br>
Block Number: <a class="alert-link infoBlockNumber">BLOCK</a> <br>
Gas Used: <span class="infoGasUsed">GAS</span> <br>
`

function statusError(x, statusType="danger", clickToRemove=true) {
    // Alert types: 
    // primary secondary success danger warning info light dark
    
    let div = $('<div>').addClass("alert alert-"+statusType).text(x);
    if (clickToRemove)
	div.addClass("alert-dismissible").attr("data-dismiss","alert");

    div.append($(closeButtonHTML));

    $('#errorbox').append(div);
    console.log(x);
    return div
}

function setVersionNumber(result) {
    $('#versiontag').text(" (v"+result.toNumber()+") ");
}

function setPostCount(result) {
    $('#postCount').text(result.toNumber());
}

function setAccountHash(accounts) {
    $('#accountHash').text(accounts[0])
}

function setContractHash(accounts, LM) {
    $('#contractHash').text(LM.address)

    // For now, don't link to etherscan
    // 	.attr('href', ESUrl+"/address/"+LM.address);
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
    let td3 = $('<td><a><i class="fa fa-user" aria-hidden="true"></i></a></td>');
    td3.addClass("messageAddress");
    
    let td2 = $("<td>").text(result).addClass("messageText");
    let td0 = $("<td>").text("["+(n+1)+"]").addClass("messageNumber");
    body.append(tr.append(td0, td3, td2));
}

function setMessageAddress(result, n) {
    let post = $('#LandmarkPost'+n);
    if(post.length == 0)
	return false;

    let url = ESUrl + '/address/' + result;
    
    post.find(".messageAddress").find('a')
	.attr("title",result)
	.attr("href",url);
    
    
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
	    if (error) { statusError(error); }
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
		statusError(err.message);
	    }).then(function(result) {
		if (callFuncs["then"] != null)
		    callFuncs["then"](result, ...args);
	    }).catch(function(err) {
		statusError(err.message);

	    })
	})
    },

    getContractDeploy: function() {
	if(contract_deploy == null) {
	    contract_deploy = App.contracts.Landmark.deployed();
	    //contract_deploy = App.contracts.Landmark.at(contract_address);
	}
	return contract_deploy;
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

	$("#modalAddressText").val(contract_address);

	$('#marktext').keydown(function (event) {
	    if ((event.keyCode == 10 || event.keyCode == 13) && event.ctrlKey){
		App.processButtonPost();
	    }
	});

	$('#PostModal').on('shown.bs.modal', function () {
	    $('#marktext').focus();
	});

    },

    loadAllPosts: function () {
	App.LandmarkCall("getMessageCount", {"then":setPostCount});
	
	try {
	    var n = parseInt($("#postCount").text());
	    
	    // Remove status message
	    if(n>0) $('#noMarksFound').remove();
	    else if(n==0)
		$('#noMarksFound').text("Empty Landmark")
		.removeClass("text-muted");
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
		console.log("Attemping to post", text);
		box = statusError("Attemping to post '"+text+"'", "warning")
		    .addClass("post-attempt-box");
		
		return cx.postMessage(text);
	    }).then(async function(result) {
		console.log("Post complete!", result);
		box = statusError("", "success", false);
		$('.post-attempt-box').remove();

		let info=$(infoButtonHTML);

		res = result.receipt;

		info.find(".infoPostMessage").text(text);
		info.find(".infoTransactionHash")
		    .text(res.transactionHash)
		    .attr('href', ESUrl+"/tx/"+res.transactionHash);
		info.find(".infoBlockNumber")
		    .text(res.blockNumber)
		    .attr('href', ESUrl+"/block/"+res.blockNumber);
		info.find(".infoGasUsed")
		    .text(res.gasUsed);
				
		box.append(info);		

		// Clear the results
		$('#marktext').val("");
		
	    }).catch(function(err) {
		statusError(err.message);
	    });

	});


    },

};

$(function() {
    $(window).on('load', function() {
	App.init();
    });

    /*
    statusError("test", "warning");
    statusError("test", "info");
    statusError("xztest", "success");
    statusError("xztest", "danger");
    */
});
