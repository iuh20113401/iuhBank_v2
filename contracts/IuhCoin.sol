// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import { ERC20 } from "./ERC20_Contract.sol";

contract iuhCoin is ERC20 {
  address public minter;

  event MinterChanged(address indexed from, address to);

  constructor() public payable ERC20("IUH Bank Currency", "IUHC") {
    minter = msg.sender; //only initially
  }

  function passMinterRole(address dBank) public returns (bool) {
  	require(msg.sender==minter, 'Error, only owner can change pass minter role');
  	minter = dBank;

    emit MinterChanged(msg.sender, dBank);
    return true;
  }

  function mint(address account, uint256 amount) public {
		require(msg.sender==minter, 'Error, msg.sender does not have minter role'); //dBank
		_mint(account, amount);
	}
  
}