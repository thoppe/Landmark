var provider_url = 'http://localhost:8545';
var f_deployed_contract = './build/contracts/Landmark.json';
var ESUrl = "https://etherscan.io"

// Default/Starting contract address
//var contract_address = "0x90a9b125b6e4b22ecb139819778dc01d1339ef5c"
const default_contract_address = {

    // Use 0 as the local testnet fallback
    0:" 0x90a9b125b6e4b22ecb139819778dc01d1339ef5c",

    // Ropsten
    3: "0xae10ae10ae10ae10ae10ae10ae10ae10ae10ae10",
}
var used_default_address = false;

var contract_address = null;
var contract_deploy = null;
var contract_network = null;

const updateInterval = 1000;

const closeButtonHTML = `<button type="button" class="close" data-dismiss="alert" aria-label="Close">
<span aria-hidden="true">&times;</span>`;
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

    $('#errorbox').prepend(div);
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
    $('#contractHash').text(address);

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
    let tr = $("<tr>").attr('id', label).addClass("LandmarkPostRow");
    
    let td_num = $("<td>").text("["+(n+1)+"]").addClass("messageNumber");

    let td_adr = $('<td><a><i class="fa fa-user" aria-hidden="true"></i></a></td>');
    td_adr.addClass("messageAddress");
    

    let td_text = $("<td>").text(result).addClass("messageText");

    let date = $('<div><em></em></div>');
    date.find('em').addClass("messageDate text-muted small");
    td_text.append(date);
    
    body.prepend(tr.append(td_num, td_adr, td_text));
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

function setMessageDate(result, n) {
    let timestamp = result.toNumber();
    let datetime = new Date(timestamp*1000);
    
    let post = $('#LandmarkPost'+n);
    if(post.length == 0)
	return false;

    post.find(".messageDate")
	.attr("title",datetime)
	.text(datetime);
}

var isAddress = function (address) {
    // function isAddress(address) {
        if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
        // check if it has the basic requirements of an address
        return false;
	} else if (/^(0x)?[0-9a-f]{40}$/.test(address) ||
		   /^(0x)?[0-9A-F]{40}$/.test(address)) {
        // If it's all small caps or all all caps, return "true
        return true;
    } else {
        // Otherwise check each case
        return isChecksumAddress(address);
    }
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

    
    LandmarkCall: async function(funcname, ...args) {
	await App.getContractDeploy();

	try {
	    return  (await contract_deploy[funcname].call(...args));
	}
	catch (err) {
	    statusError(err.message);
	}
    },

    getContractDeploy: async function() {

	if(!used_default_address) {
	    // Get the network version
	    contract_network = await web3.version.network;

	    // Load the default address if we know it
	    if(contract_network in default_contract_address) {
		contract_address = default_contract_address[contract_network];
	    }
	    // Otherwise, assume we are on testnet
	    else {
		contract_address = default_contract_address[0];
	    }
	    used_default_address = true;
	}

	contract_deploy  = App.contracts.Landmark.at(contract_address);
    },
  
    bindEvents: function() {
	$(document).on('click', '.btn-process-post',
		       App.processButtonPost);
	$(document).on('click', '.btn-process-closesite',
		       App.processButtonCloseSite);
	$(document).on('click', '.btn-process-curatormsg',
		       App.processButtonCuratorMsg);
	$(document).on('click', '.btn-process-change-address',
		       App.processButtonChangeAddress);

	
	return App.setInfo();
    },

    
    checkIfContractDeployed: async function () {
	
	await App.getContractDeploy();

	var x = await contract_deploy["getVersionNumber"].call();
	if(parseInt(x) == 0) {
	    $('#statusNotFound').show();
	    $('#statusLooking').hide();
	    $("#statusEmpty").hide();
	    $('#navbar-isSiteUsable').hide();
	    return false;
	}

	
	
	return true;

    },

    setInfo: async function () {

	await App.getContractDeploy();

	setContractHash(contract_address);
	$("#modalAddressText").val(contract_address);
	
	$('#AddressChangeModal').on('shown.bs.modal', function () {
	    $('#modalAddressText').focus().select();
	});

	$("#accountNetwork").text(web3.version.network);

	// Break if address is not found
	if(! await App.checkIfContractDeployed() ) {
	    return false;
	}
	
	const vn = parseInt(await App.LandmarkCall("getVersionNumber"));
	setVersionNumber(vn);

	App.loadCuratorMessage();

	App.loadAllPosts();
	updater = setInterval(App.loadAllPosts, updateInterval);


	$('#marktext').keydown(function (event) {
	    if ((event.keyCode == 10 || event.keyCode == 13) && event.ctrlKey){
		App.processButtonPost();
	    }
	});

	$('#PostModal').on('shown.bs.modal', function () {
	    $('#marktext').focus();
	});

	$('#AdminModal').on('shown.bs.modal', function (e) {
	    App.processAdminInfo();
	});


    },

    loadCuratorMessage: async function() {

	const cAdr = await App.LandmarkCall("getCuratorAddress");

	if(await App.LandmarkCall("checkValidProfile", cAdr)) {
	    const cMsg = await App.LandmarkCall("getProfileContent", cAdr);
	    $("#curatorMessage").show();
	    $("#curatorMessageText").text(cMsg);
	}


    },

    loadAllPosts: async function () {

	if(! await App.checkIfContractDeployed() ) {
	    return false;
	}
	
	var n = parseInt(await App.LandmarkCall("getMessageCount"));
	setPostCount(n);

	try {
	    if(n==0) {
		$('#statusNotFound').hide();
		$('#statusLooking').hide();
		$("#statusEmpty").show();
		return true;
	    }
	}
	catch (err) {
	    // Perhaps we aren't ready yet...
	    return false;
	}

	$('#statusNotFound').hide();
	$('#statusLooking').hide();
	$("#statusEmpty").hide();


	for (i = 0; i < n; i++) {
	    if (doesMessageRowExist(i))
		continue;
	    
	    let msg = await App.LandmarkCall("getMessageContents", i);
	    let address = await App.LandmarkCall("getMessageAddress", i);
	    let date = await App.LandmarkCall("getMessageTimestamp", i);
	    setMessageContents(msg, i);
	    setMessageAddress(address, i);
	    setMessageDate(date, i);
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

    processButtonCloseSite: function() {
	box = statusError("<strong>Attemping to close the site forever!</strong>")
	    .addClass("post-attempt-box");

	// Hide the modal since we are showing status
	$("#AdminModal").modal("hide");

	
	web3.eth.getAccounts(function(error, accounts) {
	    contract_deploy.then(function(cx) {
		return cx.closeLandmarkSite();
	    }).then(async function(result) {
		box = statusError("<strong>Site closed forever</strong>", "info")
		    .addClass("post-attempt-box");

	    }).catch(function(err) {
		statusError(err.message);
	    });

	})

    },

    processButtonPost: function() {
	const text = $('#marktext').val();
	if(!text) return false;

	// Check to see if this is a curator post
	const is_curator_post = $("#curatorNote").is(':visible');

	// Hide the modal at this point
	$("#PostModal").modal("hide");

	// Show the status of the post attempt
	msg = "Attemping to post '"+text+"'"

	if (is_curator_post)
	    msg += " to the profile";
	
	console.log(msg)
	box = statusError(msg, "warning")
	    .addClass("post-attempt-box");

	
	web3.eth.getAccounts(function(error, accounts) {

	    contract_deploy.then(function(cx) {

		if(is_curator_post) 
		    return cx.postProfile(text);
		else
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

    processAdminInfo: async function() {

	const Cadr = await App.LandmarkCall("getCuratorAddress");
	const isOpen = await App.LandmarkCall("getIsSiteOpen");
	const n = parseInt(await App.LandmarkCall("getLimitPostLength"));

	let Fadr = await App.LandmarkCall("getForwardingAddress");
	// An empty address is returned when nothing is set
	if(Fadr == "0x0000000000000000000000000000000000000000")
	    Fadr = "";

	$("#siteinfoCuratorAddress").text(Cadr);
	$("#siteinfoForwardingAddress").text(Fadr);

	$("#siteinfoIsOpen").text(isOpen);
	$("#siteinfoMaxPostLength").text(n);

	App.loadAccountInfo();
	
    },

    processButtonCuratorMsg: function() {
	
	// Hide the modal since we are showing status
	$("#AdminModal").modal("hide");

	// Modify the post modal
	$("#curatorNote").show();
	$("#PostModal").modal('show'); 

    },

    processButtonChangeAddress: function() {

	const address = $('#modalAddressText').val();
	if(!address) return false;

	if(!isAddress(address)) {
	    msg = (address + " is not a valid ethereum address. " +
		   +"A valid address must be 42 hexidecimal characters long "+
		   "and begin with 0x");
	    
	    statusError(msg);
	    return false;
	}

	// Hide the modal at this point
	$("#modalAddressText").modal("hide");

	contract_address = address;
	contract_deploy = null;

	// Reset the text
	$('.LandmarkPostRow').find('*').each(function() {
	    this.remove();
	});

	// Allow the user to interact
	$('#navbar-isSiteUsable').show();

	App.getContractDeploy();
	App.setInfo();

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
