pragma solidity ^0.4.4;

contract Landmark {

  // event result(int _value);
  struct postContent {
    string contents;
    address senderAddress;
    uint timestamp;
  }

  postContent[] Messages;

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

  /*
  function post(string message) public {
    messageContents.push(message);
    messageAddress.push(msg.sender);
    messageTimestamp.push(block.timestamp);    
  }

  function getMessageCount() public constant returns (uint) {
    return messageContents.length;
  }

  function _checkValidIndex(uint i) private constant {
    require(i < getMessageCount());
    require(i >= 0);
  }

  function getMessageContents(uint i) public constant returns (string) {
    _checkValidIndex(i);
    return messageContents[i];
  }

  function getMessageAddress(uint i) public constant returns (address) {
    _checkValidIndex(i);
    return messageAddress[i];
  }

  function getMessageTimestamp(uint i) public constant returns (uint) {
    _checkValidIndex(i);
    return messageTimestamp[i];
  }
  */
  
}
