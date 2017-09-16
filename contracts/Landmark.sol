pragma solidity ^0.4.4;

contract Landmark {

  // event result(int _value);
  struct postContent {
    string contents;
    address senderAddress;
    uint timestamp;
  }

  address curator;
  postContent[] Messages;

  function Landmark() {
    curator = msg.sender;
  }

  function post(string message) public {
    Messages.push(postContent(message, msg.sender, block.timestamp));
  }
 
  function getMessageCount() public constant returns (uint) {
    return Messages.length;
  }

  function _checkValidIndex(uint i) private constant {
    require(i < getMessageCount());
    require(i >= 0);
  }

  function getMessageContents(uint i) public constant returns (string) {
    _checkValidIndex(i);
    return Messages[i].contents;
  }

  function getMessageAddress(uint i) public constant returns (address) {
    _checkValidIndex(i);
    return Messages[i].senderAddress;
  }

  function getMessageTimestamp(uint i) public constant returns (uint) {
    _checkValidIndex(i);
    return Messages[i].timestamp;
  }

  
  function getCuratorAddress() public constant returns (address) {
    return curator;
  }

  
}
