pragma solidity ^0.4.4;

contract Landmark {

  event result(int _value);

  string [] messages;

  function post(string message) public {
    messages.push(message);
  }

  function getMessageCount() public constant returns (uint) {
    return messages.length;
  }

  function getMessage(uint i) public constant returns (string) {
    require(i < getMessageCount());
    require(i >= 0);
    //getMessageCount();
    return messages[i];
  }

  

  /*
  function network_multiply(int x, int y) public {
    result(multiply(x,y));
  }
  */
  
}
