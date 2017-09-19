pragma solidity ^0.4.4;

contract Landmark {

  // event result(int _value);

  struct _postContent {
    string contents;
    address senderAddress;
    uint timestamp;
  }

  struct _profileContent {
    string contents;
    uint timestamp;
  }

  address curator;
  
  _postContent[] Messages;
  mapping (address => _profileContent) public Profiles;

  uint16 limitPostLength = 720; 

  function Landmark() {
    curator = msg.sender;
  }

  function postMessage(string message) checkLength(message) public {
    Messages.push(_postContent(message, msg.sender, block.timestamp));
  }
 
  function getMessageCount() public constant returns (uint) {
    return Messages.length;
  }

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

  modifier checkValidIndex(uint i) {
    require(i < getMessageCount());
    require(i >= 0);
    _;
  }

  modifier checkLength(string message) {
    require(getPostLength(message) <= limitPostLength);
    _;
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

  function getLimitPostLength() public constant returns (uint16) {
    return limitPostLength;
  }
    
  function postProfile(string message) checkLength(message) public {
    Profiles[msg.sender] = _profileContent(message, block.timestamp);
  }

  function getProfileContent(address target) public constant returns (string) {

    // Timestamp will be set to non-zero if profile ever set
    require(Profiles[target].timestamp>0);
    return Profiles[target].contents;
  }

  
}
