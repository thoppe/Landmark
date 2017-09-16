pragma solidity ^0.4.4;

contract Landmark {

  // event result(int _value);

  string  [] messageContents;
  address [] messageAddress;

  function post(string message) public {
    messageContents.push(message);
    messageAddress.push(msg.sender);
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
  
}
