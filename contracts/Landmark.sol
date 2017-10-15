pragma solidity ^0.4.17;

contract Landmark {

  // Hard-coded version number (increment on new public deploy)
  uint versionNumber = 1;

  // Curator address fixed on contract creation
  address curator;

  // Post length hard-coded and fixed on contract creation
  uint16 limitPostLength = 496;

  // Once a site is closed, it can never be reopened
  bool isSiteOpen = true;
  
  // Forwarding address can be set to new contract only AFTER closed
  address forwardingAddress;

  struct _postContent {
    string contents;
    address senderAddress;
    uint timestamp;
  }

  string curatorMessage;
  
  _postContent[] Messages;  
  
  function Landmark() public {
    curator = msg.sender;
  }

  
  // ****************** Post functions ******************
  
  function postMessage(string text)
    checkLength(text)
    checkIsOpen()
    public {
    Messages.push(_postContent(text, msg.sender, block.timestamp));
  }

  function postCuratorMessage(string text)
    checkLength(text)
    checkCurator()
    public {
    curatorMessage = text;
  }

  // ****************** Validation funcs *****************

  modifier checkValidIndex(uint i) {
    require(i < getMessageCount());
    require(i >= 0); _;
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
  
  function getMessageCount()
    public view returns (uint) {
    return Messages.length;
  }

  function getMessageContents(uint i) checkValidIndex(i)
    public view returns (string) {
    return Messages[i].contents;
  }

  function getMessageAddress(uint i) checkValidIndex(i)
    public view returns (address) {
    return Messages[i].senderAddress;
  }

  function getMessageTimestamp(uint i) checkValidIndex(i)
    public view returns (uint) {
    return Messages[i].timestamp;
  }

  function getCuratorAddress() public view returns (address) {
    return curator;
  }

  function getForwardingAddress() public view returns (address) {
    return forwardingAddress;
  }

  function getLimitPostLength() public view returns (uint16) {
    return limitPostLength;
  }

  function getIsSiteOpen() public view returns (bool) {
    return isSiteOpen;
  }

  function getCuratorMessage() public view returns (string) {
    return curatorMessage;
  }

  function getVersionNumber() public view returns (uint) {
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
  

  // ****************** Helper funcs   ******************
  
  function getPostLength(string text)
    public pure returns (uint length) {
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
