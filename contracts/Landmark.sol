pragma solidity ^0.4.4;

contract Landmark {

  // event result(int _value);

  struct postContent {
    string contents;
    address senderAddress;
    uint timestamp;
  }

  struct profileContent {
    string contents;
    uint timestamp;
  }

  address curator;
  
  postContent[] Messages;
  mapping (address => profileContent) public Profiles;

  uint16 limitPostLength = 720; 

  function Landmark() {
    curator = msg.sender;
  }

  function post(string message) public {
    Messages.push(postContent(message, msg.sender, block.timestamp));
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
    
  function postProfile(string message) public {
    Profiles[msg.sender] = profileContent(message, block.timestamp);
  }

  function getProfileContent(address target) public constant returns (string) {

    // Timestamp will be set to non-zero if profile ever set
    require(Profiles[target].timestamp>0);
    return Profiles[target].contents;
  }

  
}
