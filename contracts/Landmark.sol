pragma solidity ^0.4.4;

contract Landmark {

  // Hard-coded version number (increment on new public deploy)
  uint versionNumber = 1;

  // Curator address fixed on contract creation
  address curator;

  // Post length hard-coded and fixed on contract creation
  uint16 limitPostLength = 720;

  // Once a site is closed, it can never be reopened
  bool isSiteOpen = true;
  
  // Forwarding address can be set to new contract only AFTER closed
  address forwardingAddress;

  // Posting/Profiles are free by default
  bool permissionNeededToMessage;
  bool permissionNeededToProfile;
  uint costPrivilege;

  struct _postContent {
    string contents;
    address senderAddress;
    uint timestamp;
  }

  struct _profileContent {
    string contents;
    uint timestamp;
    bool isPrivileged;
  }

  _postContent[] Messages;  
  mapping (address => _profileContent) public Profiles;

  function Landmark() {
    curator = msg.sender;
    grantPrivilege(curator);
  }

  
  // ****************** Post functions ******************
  
  function postMessage(string text)
    checkLength(text)
    checkIsOpen()
    checkPrivilegePostMessage()
    public {
    Messages.push(_postContent(text, msg.sender, block.timestamp));
  }

  function postProfile(string text)
    checkLength(text)
    checkIsOpen()
    checkPrivilegePostProfile()
    public {

    Profiles[msg.sender] = _profileContent(text,
					   block.timestamp,
					   getIsPrivileged(msg.sender));
  }

  function grantPrivilege(address target) checkCurator() public {
    Profiles[target].isPrivileged = true;
  }

  function setPermissionProfile(bool value) checkCurator() public {
    permissionNeededToProfile = value;
  }

  function setPermissionMessage(bool value) checkCurator() public {
    permissionNeededToMessage = value;
  }
  

  // For a free and open network, do not include this function
  // function revokePrivilege(address target) checkCurator() public {
  //  Profiles[target].isPrivileged = false;
  // }

  // ****************** Validation funcs *****************

  modifier checkPrivilegePostProfile() {
    if(permissionNeededToProfile) 
      require(Profiles[msg.sender].isPrivileged == true);
    _;
  }

  modifier checkPrivilegePostMessage() {
    if(permissionNeededToMessage) 
      require(Profiles[msg.sender].isPrivileged == true);
    _;
  }
  
  modifier checkValidIndex(uint i) {
    require(i < getMessageCount());
    require(i >= 0); _;
  }

  modifier checkValidProfile(address target) {
    // Timestamp will be set to non-zero if profile ever set
    require(Profiles[target].timestamp>0); _;
  }

  modifier checkLength(string text) {
    require(getPostLength(text) <= limitPostLength); _;
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

  function getPermissionNeededToMessage() public constant returns (bool) {
    return permissionNeededToMessage;
  }

  function getPermissionNeededToProfile() public constant returns (bool) {
    return permissionNeededToProfile;
  }
      
  function getProfileContent(address target) checkValidProfile(target)
    public constant returns (string) {
    return Profiles[target].contents;
  }

  function getIsPrivileged (address target)
    public constant returns (bool) {
    return Profiles[target].isPrivileged;
  }

  function getVersionNumber() public constant returns (uint) {
    return versionNumber;
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
  
  function getContractValue() public 
    constant returns (uint) {
    return this.balance;
  }

  function getCostPrivilege() public constant returns (uint) {
    return costPrivilege;
  }

  function purchasePrivilege() public payable checkIsOpen() {

    // Require that the min cost has been paid
    require(msg.value>=costPrivilege);

    // Can't purchase twice!
    require(Profiles[msg.sender].isPrivileged == false);

    // Set the flag to true
    Profiles[msg.sender].isPrivileged = true;

    // Refund overpayment
    if(msg.value > costPrivilege)
      msg.sender.transfer(msg.value - costPrivilege);

  }

  function setCostPrivilege(uint newcost) public checkCurator() {
    costPrivilege = newcost;
  }
  
  function withdrawValue() public checkCurator() returns (bool) {
    if(this.balance > 0) {
      // Only transfer if the balance is > 0
      curator.transfer(this.balance);
    }
    return true;
  }

  // ****************** Helper funcs   ******************
  
  function getPostLength(string text)
    public constant returns (uint length) {
    // This is complicated since unicode takes up a different amount of space
    uint i=0;
    bytes memory string_rep = bytes(text);
	
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
