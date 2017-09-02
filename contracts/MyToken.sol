pragma solidity ^0.4.14;

import "./MiniMeToken.sol";


contract MyToken is MiniMeToken {  

    function MyToken(address _tokenFactory) MiniMeToken(   
      _tokenFactory,
      0x0,                    // no parent token
      0,                      // no snapshot block number from parent
      "My Token", // Token name
      18,                     // Decimals
      "TKN",                 // Symbol
      false                   // Enable transfers
      ) 
      {
      }
}