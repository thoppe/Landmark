var f_deployed_contract = './build/contracts/Landmark.json';

var FLAG_hidenavbar = false;
var FLAG_showDates = true;
var FLAG_showPostID= true;
var FLAG_metamask_enabled=true;

// Default/Starting contract address
const default_contract_address = {

    // Use 0 as the local testnet fallback
    0: "0x90a9b125b6e4b22ecb139819778dc01d1339ef5c",

    // Mainnet
    1: "0xD38e005a28fae8D8c4238444BC08E7Da83902310",

    // Test contract for LV memorial
    //1: "0x1B11aC23fbB37B1F943c2b36a566fc77f64BB8a9",
        
    // Ropsten
    3: "0xA334472B88830Dac9BD4d800e4366e9Ce584631a",
}

var used_default_address = false;
var contract_address = null;
var contract_deploy = null;
var contract_network = null;
const updateInterval = 1500;

// Please don't steal this key! Get your own at https://infura.io/
var provider_url = 'https://mainnet.infura.io/rk62RV4O5kpptwlDiV69'
//var provider_url = 'http://localhost:8545';


function changeURIAddress(address, reload=false) {
    var loc = new URI($(location).attr('href'));
    loc.removeSearch("address").addSearch("address", address);
    window.history.pushState(null, null, loc);

    if(reload)
	location.reload();
}

function getURIAddress() {
    return URI($(location).attr('href')).search(true)["address"];
}



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

function getESUrl() {

    if(contract_network == 3)
	subdomain = "ropsten."
    else
	subdomain = ""
    
    return "https://" + subdomain + "etherscan.io/";
}

function setVersionNumber(n) {
    $('#versiontag').text(" (v"+n+") ");
}

function setPostCount(n) {
    $('#postCount').text(n);
}

function setAccountHash(accounts) {
   
    $('#accountHash').text(accounts[0])
	.attr('href', getESUrl() + "address/"+accounts[0]);
}

function setContractHash(address) {
    $('#contractHash').text(address);

    $('#adminContractHash').text(address)
    	.attr('href', getESUrl() + "address/"+address);
}

function setAccountBalance(result) {
    let eth = web3.fromWei(result.toNumber());
    $('#accountBalance').text(eth + " ether");
}

function getMessageTD(n) {
    return $('[data-nonce='+n+']')
}

function doesMessageRowExist(n) {
    return getMessageTD(n).length > 0;
}


const messageTemplateHTML = `
<tr class="LandmarkPostRow">
<!---      <td class="messageAvatar"></td> --->
      <td>
<div class="row row-no-padding">
<div class="col-xs-3">
      <span class="messageAvatar"></span>
</div>
<div class="col-xs-9">
      <div class="messageText"></div>
      <div class="text-muted small">
       <span class="messageNumber"></span>
       <span class="messageDate font-italic"></span>
       <div class="messageAddress"></div>
      </div>
<div>
</div>

</td>
</tr>`


function setMessageContents(result, n) {
    let label = 'LandmarkPost'+n;
    
    if (doesMessageRowExist(n)) return false;
  
    let post = $(messageTemplateHTML);

    post.attr("data-nonce", n);
    post.find('.messageNumber').text("#"+(n+1)+"");
    post.find('.messageText').text(result);

    $("#marks").find('tbody').prepend(post);
}

function setMessageAddress(result, n) {
    if(!FLAG_showPostID)
	return false;
    
    let post = getMessageTD(n);
    if(post.length == 0)
	return false;

    let url = getESUrl() + 'address/' + result;

    var div = $('<span class=""><a> \
		 <i class="fa fa-user" aria-hidden="true"></i></a></span>');
    
    div.find('a')
	.attr("title",result)
	.attr("href",url)
	.append(" "+result)
	.addClass("no-underline")
	.addClass("ellipsis");

    img = $("<img></img>");
    img.attr("src", "https://robohash.org/"+result+"?size=80x80");
    img.addClass("img-responsive").addClass("avatar").addClass("center-block");
    post.find('.messageAvatar')
	.append(img);

    
    post.find(".messageAddress").append(div);
    
}

function setMessageDate(result, n) {
    if(!FLAG_showDates)
	return false;
    
    let timestamp = result.toNumber();
    let dateVal = new Date(timestamp*1000).toDateString();
    let timeVal = new Date(timestamp*1000).toLocaleTimeString();
    let datetime = dateVal + ', ' + timeVal;

    let post = getMessageTD(n);
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
        //return isChecksumAddress(address);
	return true;
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
	    console.log("Using injected url");
	    App.web3Provider = web3.currentProvider;
	} else {
	    console.log("Using provider url");
	    window.web3 = new Web3();
	    App.web3Provider = new web3.providers.HttpProvider(provider_url);

	    // Disable post buttons
	    //$("#navbar-postLink").addClass("disabled");
	    $("#navbar-postLink").attr("data-target", "#cantPostModal");
	    
	    $("#curatorPostMessageBtn").addClass("disabled")
	    FLAG_metamask_enabled = false;	    
	}
	
	web3 = new Web3(App.web3Provider);
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
	    contract_network = await web3.version.network;

	    // Try to load the url param address
	    let url_address = getURIAddress();
	    if(isAddress(url_address)) {
		contract_address = url_address
	    }

	    // If not, set from the default networks
	    else {
	    
		// Load the default address if we know it
		if(contract_network in default_contract_address) {
		    contract_address = default_contract_address[contract_network];
		}
		// Otherwise, assume we are on testnet
		else {
		    contract_address = default_contract_address[0];
		}
	    }
	    
	    used_default_address = true;
	    changeURIAddress(contract_address);
	    setContractHash(contract_address);
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

	    if(FLAG_hidenavbar)
		$('#navbar-isSiteUsable').hide();
	    
	    return false;
	}
	
	return true;

    },

    setInfo: async function () {

	await App.getContractDeploy();

	$("#modalAddressText").val(contract_address);
	
	$('#AddressChangeModal').on('shown.bs.modal', function () {
	    $('#modalAddressText').focus().select();
	});

	$("#accountNetwork").text(web3.version.network);
	
	$('#PostModal').on('shown.bs.modal', function () {
	    $('#marktext').focus();
	});

	$('#AdminModal').on('shown.bs.modal', function (e) {
	    App.processAdminInfo();
	});

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


    },

    loadCuratorMessage: async function() {

	const cMsg = await App.LandmarkCall("getCuratorMessage");

	if(cMsg) {
	    $("#curatorMessage").show();
	    $("#curatorMessageText").text(cMsg);
	}


    },

    loadPost: async function(i) {
	const msg = await App.LandmarkCall("getMessageContents", i);
	const address = await App.LandmarkCall("getMessageAddress", i);
	const date = await App.LandmarkCall("getMessageTimestamp", i);
	setMessageContents(msg, i);
	setMessageAddress(address, i);
	setMessageDate(date, i);
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


	hasLoadedNewPost = false;
	
	for (i = 0; i < n; i++) {
	    if (doesMessageRowExist(i))
		continue;    
	    App.loadPost(i);
	    hasLoadedNewPost = true;
	}

	if(hasLoadedNewPost) 
	    setTimeout(App.sortPosts, 1000);

    },

    sortPosts: function() {
	
	var loadedPosts = $(".LandmarkPostRow").get();
	
	loadedPosts.sort(function(a, b){
	    return $(b).data("nonce")-$(a).data("nonce");
	});

	$("#marks").find("tbody").empty().html(loadedPosts);
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
	box = statusError("WARNING: Attemping to close the site forever!");
	box.addClass("post-attempt-box");

	// Hide the modal since we are showing status
	$("#AdminModal").modal("hide");
	
	web3.eth.getAccounts(function(error, accounts) {
	    contract_deploy.then(function(cx) {
		return cx.closeLandmarkSite();
	    }).then(async function(result) {
		box = statusError("Site closed forever.", "info")
		    .addClass("post-attempt-box");

	    }).catch(function(err) {
		statusError(err.message);
	    });

	})

    },

    processButtonPost: async function() {
	const text = $('#marktext').val();
	if(!text) return false;

	// Check to see if this is a curator post
	const is_curator_post = $("#curatorNote").is(':visible');

	// Hide the modal at this point
	$("#PostModal").modal("hide");

	// Show the status of the post attempt
	msg = "Attemping to post '"+text+"'"

	if (is_curator_post)
	    msg += " to the curator message";
	
	console.log(msg)
	box = statusError(msg, "warning")
	    .addClass("post-attempt-box");

	if(!is_curator_post) {
	    if(!(await App.LandmarkCall("getIsSiteOpen"))) {
		let msg = "Landmark site closed. No further posting allowed."
		statusError(msg, "info");
		return false;
	    }
	}
	
	web3.eth.getAccounts(function(error, accounts) {

	    contract_deploy.then(function(cx) {

		if(is_curator_post) 
		    return cx.postCuratorMessage(text);
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
		    .attr('href', getESUrl()+"tx/"+res.transactionHash);
		info.find(".infoBlockNumber")
		    .text(res.blockNumber)
		    .attr('href', getESUrl()+"block/"+res.blockNumber);
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

	if(FLAG_metamask_enabled)
	    App.loadAccountInfo();

	// Break if address is not found
	if(! await App.checkIfContractDeployed() ) {
	    return false;
	}

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
		   "A valid address must be 42 hexidecimal characters long "+
		   "and begin with 0x");
	    
	    statusError(msg);
	    return false;
	}

	// Hide the modal at this point
	$("#modalAddressText").modal("hide");

	contract_address = address;
	contract_deploy = null;

	// Set the address and reload
	changeURIAddress(address, reload=true);

    },


};

$(function() {

    $(document).ready(function() {App.init()});

    /*
    $(window).on('load', function() {
	App.init();
    });
    */
});
