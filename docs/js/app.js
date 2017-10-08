var provider_url = 'http://localhost:8545';
var f_deployed_contract = './build/contracts/Landmark.json';
var ESUrl = "https://etherscan.io"

var contract_address = "0x90a9b125b6e4b22ecb139819778dc01d1339ef5c"

var contract_deploy = null;
var contract_deploy2 = null;

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
    return div
}

function setVersionNumber(n) {
    $('#versiontag').text(" (v"+n+") ");
}

function setPostCount(n) {
    $('#postCount').text(n);
}

function setAccountHash(accounts) {
    $('#accountHash').text(accounts[0])
}

function setContractHash(address) {
    $('#contractHash').text(address)

    // For now, don't link to etherscan
    // 	.attr('href', ESUrl+"/address/"+LM.address);
}

function setAccountBalance(result) {
    let eth = web3.fromWei(result.toNumber());
    $('#accountBalance').text(eth + " ether");
}

function doesMessageRowExist(n) {
    return $('#LandmarkPost'+n).length > 0
}

function setMessageContents(result, n) {
    let label = 'LandmarkPost'+n;

    if (doesMessageRowExist(n)) return false;
    
    let body = $("#marks").find('tbody');
    let tr = $("<tr>").attr('id', label);
    
    let td0 = $("<td>").text("["+(n+1)+"]").addClass("messageNumber");
    let td1 = $('<td><a><i class="fa fa-user" aria-hidden="true"></i></a></td>');
    td1.addClass("messageAddress");
    
    let td2 = $("<td>").text(result).addClass("messageText");
    
    body.append(tr.append(td0, td1, td2));
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
	    
	    return App.bindEvents();
	});

    },

    
    LandmarkCall2: async function(funcname, ...args) {
	await App.getContractDeploy2();

	try {
	    return  (await contract_deploy2[funcname].call(...args));
	}
	catch (err) {
	    statusError(err.message);
	}
    },

    getContractDeploy2: async function() {
	contract_deploy2 = App.contracts.Landmark.at(contract_address);
    },
  
    bindEvents: function() {
	$(document).on('click', '.btn-process-post', App.processButtonPost);
	
	$('#mainnet').change(function() {
	    $('#errorbox').empty().hide();
	});

	return App.setInfo();
    },

    setInfo: async function () {

	var vn = parseInt(await App.LandmarkCall2("getVersionNumber"));
	setVersionNumber(vn);

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

	setContractHash(contract_deploy2.address);
	App.loadAccountInfo();

    },

    loadAllPosts: async function () {
	var n = parseInt(await App.LandmarkCall2("getMessageCount"));
	setPostCount(n);
	
	try {
	    
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
	    if (doesMessageRowExist(i))
		continue;
	    
	    let msg = await App.LandmarkCall2("getMessageContents", i);
	    let address = await App.LandmarkCall2("getMessageAddress", i);
	    setMessageContents(msg, i);
	    setMessageAddress(address, i);
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

	// Show the status of the post attempt
	console.log("Attemping to post", text);
	box = statusError("Attemping to post '"+text+"'", "warning")
	    .addClass("post-attempt-box");

	// Hide the modal since we are showing status
	$("#PostModal").modal("hide");
	
	web3.eth.getAccounts(function(error, accounts) {

	    //App.getContractDeploy().then(function(cx) {
	    contract_deploy2.then(function(cx) {

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
