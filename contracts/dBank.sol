// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;
pragma experimental ABIEncoderV2;
import "./oracle.sol";
import "./IuhCoin.sol";

contract iuhBank {
  iuhCoin private iuhcoin;
  uint8 constant exchangeLendRate = 20;
  uint8 constant exchangeBorrowRate = 21;
    struct pool{
      uint totalAmount;
      uint borrowAmount;
      uint price;
      uint8 lendRate;
      uint8 borrowRate;
    }
    struct UserInfo{
      uint8 index;
      uint Collateral;
      uint[2] LendAmount;
      uint[2] frezeAmount;
      uint[2] Borrow;
      string[2] tokenName;
      mapping(string => uint8) token;
      mapping(string => bool) isToken;
      mapping(string => bool) isBorrowed;
    }
    address[] userAddress;
    mapping(address => UserInfo) user;
    mapping(address => bool) isDeposited;
   
    Oracle public oracle;
     
    constructor(Oracle _oracle, iuhCoin _iuhcoin) public{
      oracle = _oracle;
      iuhcoin = _iuhcoin;
      EtherToken.price = oracle.getPrice();
      IuhToken.price = oracle.getIuhPrice();
    }
    pool EtherToken = pool({
          totalAmount:0 ,
          borrowAmount: 0 ,
          price: 0,
          lendRate: 20,
          borrowRate: 21});
      pool IuhToken = pool({
          totalAmount:0 ,
          borrowAmount: 0 ,
          price: 0,
          lendRate: 20,
          borrowRate: 21});
    
    event Deposit(address indexed user, uint etherAmount, uint timeStart);
    event Withdraw(address indexed user, uint etherAmount);
    event Borrowing(address indexed user, uint amount);
    event Repay(address indexed user);

    modifier depositor{
      require(isDeposited[msg.sender],"You aren't depositor");
      _;
    }

    function depositEther()  payable public {
    require(msg.value>=1e16, 'Error, deposit must be >= 0.01 ETH');
    uint8 index;

    if (!isDeposited[msg.sender]) {
        userAddress.push(msg.sender);
    }

    if (!user[msg.sender].isToken["Ether"]) {
        index = user[msg.sender].index;
        user[msg.sender].token["Ether"] = index;
        user[msg.sender].index++;
        user[msg.sender].isToken["Ether"] = true;
    } else {
        index = user[msg.sender].token["Ether"];
    }
    uint price = oracle.getPrice();
    uint value = msg.value;
    uint collateral = (value * price * 8) / 10;
    EtherToken.totalAmount += value;
    user[msg.sender].LendAmount[index] += value;
    user[msg.sender].tokenName[index] = "Ether";
    user[msg.sender].Collateral += collateral;
    updateRate();
    isDeposited[msg.sender] = true;

    emit Deposit(msg.sender, value, block.timestamp);
  }
  function depositIuhCoin( uint amount)  payable public {
    amount = amount * 10 **18;
    require(amount>=1e16, 'Error, deposit must be >= 0.01 ETH');
    uint8 index;
    if(!isDeposited[msg.sender]){
      userAddress.push(msg.sender);
    }
    if(!user[msg.sender].isToken["IuhCoin"]){
      index = user[msg.sender].index;
      user[msg.sender].token["IuhCoin"] = index;
      user[msg.sender].index +=1;
      user[msg.sender].isToken["IuhCoin"] =true;
    }else{
        index =user[msg.sender].token["IuhCoin"];
    }
      
    require(iuhcoin.transferFrom(msg.sender,address(this),amount), "transfer fail");
    IuhToken.totalAmount += amount;
    user[msg.sender].LendAmount[index] += amount;
    user[msg.sender].tokenName[index] = "IuhCoin";
    user[msg.sender].Collateral += (msg.value * oracle.getIuhPrice() * 80 ) / 100;
    updateRate();
    isDeposited[msg.sender] = true;
    emit Deposit(msg.sender, amount, block.timestamp);
  }
  function updateRate() public {
    uint etherPrice = oracle.getPrice();
    uint iuhCoinPrice = oracle.getIuhPrice();
    for (uint8 i = 0; i < userAddress.length ; i++) 
    {
      if(user[userAddress[i]].Collateral <= 0){
        if(user[userAddress[i]].isBorrowed["Ether"]){ 
        uint8 etherIndex = user[userAddress[i]].token["Ether"];
        uint freze =  user[userAddress[i]].frezeAmount[etherIndex];
        EtherToken.totalAmount += freze;
        EtherToken.borrowAmount -= freze;
        }
        
        if(user[userAddress[i]].isBorrowed["IuhCoin"]){ 
        uint8 iuhIndex = user[userAddress[i]].token["IuhCoin"];
        uint freze =  user[userAddress[i]].frezeAmount[iuhIndex];
        IuhToken.totalAmount += freze;
        IuhToken.borrowAmount -= freze;  
        }
        delete user[userAddress[i]];
        }else{
      for(uint j = 0; j < user[userAddress[i]].index ;j++){
        uint value1 =((user[userAddress[i]].LendAmount[j] * exchangeLendRate) / 1000);
        user[userAddress[i]].LendAmount[j] += value1;
        string memory tokenName = user[userAddress[i]].tokenName[j];
        if (keccak256(abi.encodePacked(tokenName)) == keccak256(abi.encodePacked("Ether"))) {
          user[userAddress[i]].Collateral += (value1 * etherPrice * 80 ) / 100;
        } else{
          user[userAddress[i]].Collateral += (value1 * iuhCoinPrice * 80 ) / 100;
        }
      }
      uint addBorrow = 0;
      if(user[userAddress[i]].isBorrowed["Ether"] && user[userAddress[i]].isBorrowed["IuhCoin"]  ){
        uint value1 = ((user[userAddress[i]].Borrow[0] * exchangeBorrowRate) / 1000);
        uint value2 = ((user[userAddress[i]].Borrow[1] * exchangeBorrowRate) / 1000);
        user[userAddress[i]].Borrow[0] += value1;
        user[userAddress[i]].Borrow[1] += value2;
        addBorrow = value1 + value2;
      }else{
        user[userAddress[i]].Borrow[0] +=((user[userAddress[i]].Borrow[0] * exchangeBorrowRate) / 1000);
        addBorrow = ((user[userAddress[i]].Borrow[0] * exchangeBorrowRate) / 1000);
      }
      user[userAddress[i]].Collateral -= addBorrow;
      if(user[userAddress[i]].Collateral <= 0){
        if(user[userAddress[i]].isBorrowed["Ether"]){ 
        uint8 etherIndex = user[userAddress[i]].token["Ether"];
        uint freze =  user[userAddress[i]].frezeAmount[etherIndex];
        EtherToken.totalAmount += freze;
        EtherToken.borrowAmount -= freze;
        }
        
        if(user[userAddress[i]].isBorrowed["IuhCoin"]){ 
        uint8 iuhIndex = user[userAddress[i]].token["IuhCoin"];
        uint freze =  user[userAddress[i]].frezeAmount[iuhIndex];
        IuhToken.totalAmount += freze;
        IuhToken.borrowAmount -= freze;  
        }
        delete user[userAddress[i]];
        }
    }}
  }
    function withdrawEther(uint amount) depositor public {
    // thực hiện rút
    UserInfo storage user = user[msg.sender];
    uint index = user.token["Ether"]; 
    require(EtherToken.totalAmount >= amount, "Now liquidity don't have enough token");
    require(amount <= user.LendAmount[index], "You don't have enoough token to widthdraw");
    uint widthdraw = (amount * oracle.getPrice() * 80 ) / 100;
    if( widthdraw > user.Collateral){
        user.Collateral = 0;
    }else{
        user.Collateral -= widthdraw;
    }
    //cài đặt trạng thái pool
    EtherToken.totalAmount -= amount;
    user.LendAmount[index] -= amount;
    msg.sender.transfer(amount);
    updateRate();
    emit Withdraw(msg.sender, amount);
  }
  function withdrawIuh(uint amount) depositor  public {
    UserInfo storage user = user[msg.sender];
    // thực hiện rút
    uint index = user.token["IuhCoin"]; 
    require(IuhToken.totalAmount >= amount,"Now liquidity don't have enough token");
    require(amount <= user.LendAmount[index], "You don't have enough token");

    require(iuhcoin.balanceOf(address(this)) >= amount, "Smart contract balance not enough.");

    require(iuhcoin.transfer(msg.sender, amount), "Token transfer failed.");

    uint widthdraw = (amount * oracle.getIuhPrice() * 80 ) / 100;
    if( widthdraw > user.Collateral){
        user.Collateral = 0;
    }else{
        user.Collateral -= widthdraw;
    }
    IuhToken.totalAmount -= amount;
    user.LendAmount[index] -= amount;
    updateRate();
    emit Withdraw(msg.sender, amount);
  }
  
  function borrowingEth(uint amount) depositor public {
    uint index = user[msg.sender].token["Ether"]; 
    uint etherPrice = oracle.getPrice();
    amount = amount * 10 **18;
    require(EtherToken.totalAmount >= amount, "Pool is not enough token to lend you");

    amount = amount  * etherPrice; 
    require(user[msg.sender].Collateral >= amount, "You don't have enough collateral to borrow");

    user[msg.sender].Collateral -= amount;
    user[msg.sender].Borrow[index] += amount;
    user[msg.sender].frezeAmount[index] += ((amount * 100)/80) / etherPrice;
    user[msg.sender].LendAmount[index] -= ((amount * 100)/80) / etherPrice;
    user[msg.sender].isBorrowed["Ether"] = true;

    EtherToken.totalAmount -= ((amount * 100)/80) / etherPrice;
    EtherToken.borrowAmount += ((amount * 100)/80) / etherPrice;

    msg.sender.transfer(amount / etherPrice);
    updateRate();
    emit Borrowing(msg.sender, amount);
  }

  function borrowingIuhCoin(uint amount) depositor public {
    uint index = user[msg.sender].token["IuhCoin"]; 
    uint price = oracle.getIuhPrice();
    amount = amount * 10 **18;
    require(IuhToken.totalAmount >= amount, "Pool is not enough token to lend you");
    amount = amount * price; 

    require(user[msg.sender].Collateral>= amount, "You don't have enough collateral to borrow");
    user[msg.sender].Collateral -= amount;
    user[msg.sender].Borrow[index] += amount;
    user[msg.sender].frezeAmount[index] += ((amount * 100)/80) / price;
    user[msg.sender].isBorrowed["IuhCoin"] = true;

    IuhToken.totalAmount -= ((amount * 100)/80) / price;
    IuhToken.borrowAmount += ((amount * 100)/80) / price;
    iuhcoin.transfer(msg.sender, amount / price);
    updateRate();
    emit Borrowing(msg.sender, amount);
  }

  function repayEther() payable public {
    require(user[msg.sender].isBorrowed["Ether"] == true, 'Error, loan not active');
    uint price = oracle.getPrice();
    uint index = user[msg.sender].token["Ether"];
    uint payAmount = msg.value * price;
    uint freze = user[msg.sender].frezeAmount[index];
    require(payAmount == user[msg.sender].Borrow[index], "Don't enough");

    user[msg.sender].Borrow[index] = 0;
    user[msg.sender].LendAmount[index] +=  freze;
    user[msg.sender].Collateral += (freze * price * 80) / 100;
    user[msg.sender].frezeAmount[index] = 0;

    user[msg.sender].isBorrowed["Ether"] = false;

    EtherToken.totalAmount += freze;
    EtherToken.borrowAmount -= freze;

    updateRate();
    emit Repay(msg.sender);
  }

  function repayIuhCoin(uint amount) payable public {
    require(user[msg.sender].isBorrowed["IuhCoin"] == true, 'Error, loan not active');
    uint price = oracle.getIuhPrice();
    uint index = user[msg.sender].token["IuhCoin"];
    uint payAmount = amount * price ;
    uint freze = user[msg.sender].frezeAmount[index];
    require(payAmount == user[msg.sender].Borrow[index], "Don't enough");
    
    user[msg.sender].Borrow[index] = 0;
    user[msg.sender].Collateral += (freze * price *80) /100 ;
    user[msg.sender].frezeAmount[index] = 0;
    user[msg.sender].isBorrowed["IuhCoin"] = false;

    IuhToken.totalAmount += freze;
    IuhToken.borrowAmount -= freze;
    updateRate();
    emit Repay(msg.sender);
  }
  // lấy thông tin người dùng

  function getUserSupplied() public view returns(uint  index,uint[2] memory LendAmount, uint  Collateral, string[2] memory tokenName ){
    index = user[msg.sender].index;
    LendAmount = user[msg.sender].LendAmount;
    Collateral = user[msg.sender].Collateral;
    tokenName = user[msg.sender].tokenName;
  }
  function getUserBorrow() public view returns(uint  index,uint[2] memory Borrow,uint[2] memory frezeAmount, string[2] memory tokenName ){
    index = user[msg.sender].index;
    Borrow = user[msg.sender].Borrow;
    frezeAmount = user[msg.sender].frezeAmount;
    tokenName = user[msg.sender].tokenName;
  }

  // Lấy thông tin hồ
  function getEtherPoolInfo() public view returns (uint  totalAmount, 
  uint borrowAmount, uint  price, uint lendRate, uint borrowRate,uint totalAmountInUsd , uint borrowAmountInUsd) {
    totalAmount = EtherToken.totalAmount;
    borrowAmount = EtherToken.borrowAmount;
    totalAmountInUsd = EtherToken.totalAmount * oracle.getPrice();
    borrowAmountInUsd = EtherToken.borrowAmount * oracle.getPrice();
    price = EtherToken.price;
    lendRate = EtherToken.lendRate;
    borrowRate = EtherToken.borrowRate;
  }
  function getIuhCoinPoolInfo() external view returns (uint  totalAmount, 
  uint borrowAmount, uint  price, uint lendRate, uint borrowRate, uint totalAmountInUsd, uint borrowAmountInUsd) {
    totalAmount = IuhToken.totalAmount;
    borrowAmount = IuhToken.borrowAmount;
    totalAmountInUsd = IuhToken.totalAmount * oracle.getIuhPrice();
    borrowAmountInUsd = IuhToken.borrowAmount * oracle.getIuhPrice();
    price = IuhToken.price;
    lendRate = IuhToken.lendRate;
    borrowRate = IuhToken.borrowRate;
  }
  function getTotalLiquidInUsd() external view returns(uint){
    return (address(this).balance * oracle.getPrice()) + (iuhcoin.balanceOf(address(this)) * oracle.getIuhPrice());
  }
  function updatePrice() public {
    oracle.setPrice(2000);
    updateRate();
  }
  function mintIuhCoin() public{
    iuhcoin.mint(msg.sender, 100 *10 **18);
  }
}


