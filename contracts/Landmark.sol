pragma solidity ^0.4.4;

contract Landmark {

  // Curator address fixed on contract creation
  address curator;

  // Post length hard-coded and fixed on contract creation
  uint16 limitPostLength = 720;

  // Once a site is closed, it can never be reopened
  bool isSiteOpen = true;
  
  // Forwarding address can be set to new contract only AFTER closed
  address forwardingAddress;

  // Costs are initially set to zero
  uint costPostMessage = 0;
  uint costPostProfile = 0;

  struct _postContent {
    string contents;
    address senderAddress;
    uint timestamp;
  }

  struct _profileContent {
    string contents;
    uint timestamp;
  }

  _postContent[] Messages;  
  mapping (address => _profileContent) public Profiles;


  function Landmark() {
    curator = msg.sender;
  }

  
  // ****************** Post functions ******************
  
  function postMessage(string message)
    payable
    checkLength(message)
    checkIsOpen() public {

    if(costPostMessage>0) {
      require(msg.value >= costPostMessage);
    }
    Messages.push(_postContent(message, msg.sender, block.timestamp));
  }

  function postProfile(string message)
    payable
    checkLength(message)
    checkIsOpen() public {

    if(costPostProfile>0) {
      require(msg.value >= costPostProfile);
    }
    Profiles[msg.sender] = _profileContent(message, block.timestamp);
  }

  // ****************** Validation funcs *****************
  
  modifier checkValidIndex(uint i) {
    require(i < getMessageCount());
    require(i >= 0); _;
  }

  modifier checkValidProfile(address target) {
    // Timestamp will be set to non-zero if profile ever set
    require(Profiles[target].timestamp>0); _;
  }

  modifier checkLength(string message) {
    require(getPostLength(message) <= limitPostLength); _;
  }

  modifier checkCurator() {
    require(curator==msg.sender); _;
  }

  modifier checkIsOpen() {
    require(isSiteOpen); _;
  }

  // ****************** Public Getters ******************
  
  function getMessageCount() public constant returns (uint) {
    return Messages.length;
  }

  function getMessageContents(uint i) checkValidIndex(i)
    public constant returns (string) {
    return Messages[i].contents;
  }

  function getMessageAddress(uint i) checkValidIndex(i)
    public constant returns (address) {
    return Messages[i].senderAddress;
  }

  function getMessageTimestamp(uint i) checkValidIndex(i)
    public constant returns (uint) {
    return Messages[i].timestamp;
  }

  function getCuratorAddress() public constant returns (address) {
    return curator;
  }

  function getForwardingAddress() public constant returns (address) {
    return forwardingAddress;
  }

  function getLimitPostLength() public constant returns (uint16) {
    return limitPostLength;
  }

  function getIsSiteOpen() public constant returns (bool) {
    return isSiteOpen;
  }
      
  function getProfileContent(address target) checkValidProfile(target)
    public constant returns (string) {
    return Profiles[target].contents;
  }

  function getCostPostMessage() public constant returns (uint) {
    return costPostMessage;
  }

  function getCostPostProfile() public constant returns (uint) {
    return costPostProfile;
  }

  // ****************** Utility funcs  ******************

  function closeLandmarkSite() public checkCurator() {
    isSiteOpen=false;
  }
  
  function setForwardingAddress(address target) public checkCurator() {
    require(isSiteOpen==false);
    forwardingAddress = target;
  }
  
  // ****************** Payment funcs  ******************
  
  function getContractValue() public checkCurator()
    constant returns (uint) {
    return this.balance;
  }

  function setCostPostMessage(uint newcost) public checkCurator() {
    costPostMessage = newcost;
  }

  function setCostPostProfile(uint newcost) public checkCurator() {
    costPostProfile = newcost;
  }

  function withdrawValue() public checkCurator() returns (bool) {
    if(this.balance > 0) {
      // Only transfer if the balance is > 0
      curator.transfer(this.balance);
    }
    return true;
  }

  // ****************** Helper funcs   ******************
  
  function getPostLength(string message)
    public constant returns (uint length) {
    // This is complicated since unicode takes up a different amount of space
    uint i=0;
    bytes memory string_rep = bytes(message);
	
    while (i<string_rep.length) {
      if (string_rep[i]>>7==0)
	i+=1;
      else if (string_rep[i]>>5==0x6)
	i+=2;
      else if (string_rep[i]>>4==0xE)
	i+=3;
      else if (string_rep[i]>>3==0x1E)
	i+=4;
      else
	 
	i+=1; //For safety
      length++;
    }
  }
  
}
