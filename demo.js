
var Web3        = require('web3'),
    contract    = require("truffle-contract"),
    path        = require('path')
    MetaCoin    = require(path.join(__dirname, 'build/contracts/Landmark.json'));

    
var provider    = new Web3.providers.HttpProvider("http://localhost:8545"),    
    filePath    = path.join(__dirname, 'build/contracts/Landmark.json');
 

var MetaCoinContract = contract(MetaCoin);
MetaCoinContract.setProvider(provider);

MetaCoinContract.deployed().then(function(instance) {
    console.log("HI");
    return instance.getBalance.call('0x13a0674c16f6a5789bff26188c63422a764d9a39', {from: '0x13a0674c16f6a5789bff26188c63422a764d9a39'})
    
}).then(function(result) {
    console.log(result);
    
}, function(error) {
    console.log(error);
}); 

/*
process.exit();

var Web3            = require('web3');
var contract        = require("truffle-contract");
var path            = require('path');
var MyContractJSON  = require(path.join(__dirname,
					'build/contracts/Landmark.json'));
// Setup RPC connection   
var provider    = new Web3.providers.HttpProvider("http://localhost:8545");

// Read JSON and attach RPC connection (Provider)
var LANDMARK = contract(MyContractJSON);
LANDMARK.setProvider(provider);

LANDMARK.deployed().then(function(instance) {
    
    //return instance.myFunction.call(arg1, arg2, {from: '0x************************'})
});

//var LANDMARK_instance = LANDMARK.deployed();

//console.log(LANDMARK_instance);
*/

/*


const etherUrl = "http://localhost:8545";
const abi =  require("./build/contracts/Landmark.json");
console.log(abi);

const Web3 = require('web3');
let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(etherUrl));

var contractInstance = web3.eth.contract(abi).at('0x1d379f2ab48ad20319e9f81cb45af415aa6f2966');



var Web3 = require('web3');
var provider = new Web3.providers.HttpProvider("http://localhost:8545");
var contract = require("truffle-contract");
var f_deployed_contract = './build/contracts/Landmark.json';
var config = require(f_deployed_contract);

Landmark = contract.TruffleContract(config);

//const cheerio = require('cheerio')
////const $ = cheerio.load('<h2 class="title">Hello world</h2>')
//var LANDMARK = artifacts.require("./Landmark.sol");
//var LANDMARK_instance = LANDMARK.deployed();
	// Load the contract data from file
//data = JSON.parse(f_deployed_contract)


//, function(error, data) {
    console.log(data);
    //App.contracts.Landmark = TruffleContract(data);
    //App.contracts.Landmark.setProvider(App.web3Provider);	    
});
*/
