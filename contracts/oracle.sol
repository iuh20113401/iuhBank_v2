// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

contract Oracle{
    address public owner;
    uint private etherPrice = 1875 ;
    uint private iuhPrice = 1;
    constructor() public{
        owner = msg.sender;
    }

    function getPrice() external view returns(uint256){
        return etherPrice;
    }
    function setPrice(uint newPrice) external {
        require(msg.sender == owner,"only owner can update the price");
        etherPrice = newPrice;
    }
    function getIuhPrice() external view returns(uint256){
        return iuhPrice;
    }
    function setIuhPrice(uint newPrice) external {
        require(msg.sender == owner,"only owner can update the price");
        iuhPrice = newPrice;
    }
}