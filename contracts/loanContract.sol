// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;
pragma experimental ABIEncoderV2;
import "./IuhCoin.sol";

contract LoanContract {
    
    // Struct to represent a loan request
    struct LoanRequest {
        address payable owner;
        address payable borrower;
        uint256 amount;
        uint256 deposit;
        uint256 interestRate;
        uint256 loanDuration;
        uint256 timestamp;
        string token;
        string tokenCollateral;
        bool borrowed;
        bool returned;
        bool closed;
    }
    
    mapping(uint256 => LoanRequest) public loanRequests;
    uint256 public requestIndex = 0;
    iuhCoin private IuhCoin;
    event LoanRequested(uint256 indexed requestId);
    event LoanTaken(uint256 indexed requestId, address indexed borrower, address indexed lender, uint256 amount, uint256 deposit);
    event LoanRepaid(uint256 indexed requestId, address indexed borrower, address indexed lender, uint256 amount);
    event LoanClosed(uint256 indexed requestId, address indexed borrower, address indexed lender);
    
    constructor(iuhCoin _iuhcoin) public{
        IuhCoin = _iuhcoin;
    }

    function createLoanRequest(
        uint256 _amount, 
        uint256 _deposit, 
        uint256 _interestRate, 
        uint256 _loanDuration,
        string memory _token,
        string memory _tokenCollateral) public payable {
        _amount *= 10**18;
        _deposit *= 10**18;
        require(_amount > 0, "Loan amount must be greater than zero.");
        require(_deposit > 0, "Deposit amount must be greater than zero.");
        require(_interestRate > 0, "Interest rate must be greater than zero.");
        require(_loanDuration > 0, "Loan duration must be greater than zero.");
        require(msg.value >= _amount, "Deposit amount must be sent with the request.");
        loanRequests[requestIndex] = LoanRequest({
            owner: payable (msg.sender),
            borrower: address(0),
            amount: _amount,
            deposit: _deposit,
            interestRate: _interestRate,
            loanDuration: _loanDuration,
            timestamp: 0,
            token: _token,
            tokenCollateral: _tokenCollateral,
            borrowed:false,
            returned: false,
            closed: false}
        );
        emit LoanRequested(requestIndex);
        requestIndex++;
    }
    function createLoanRequestByIuhCoin(
        uint256 _amount, 
        uint256 _deposit, 
        uint256 _interestRate, 
        uint256 _loanDuration,
        string memory _token,
        string memory _tokenCollateral) public {
        _amount *= 10**18;
        _deposit *= 10**18;
        require(_amount > 0, "Loan amount must be greater than zero.");
        require(_deposit > 0, "Deposit amount must be greater than zero.");
        require(_interestRate > 0, "Interest rate must be greater than zero.");
        require(_loanDuration > 0, "Loan duration must be greater than zero.");
        require(IuhCoin.transferFrom(msg.sender, address(this), _amount), "Deposit amount must be sent with the request.");
        loanRequests[requestIndex] = LoanRequest({
            owner: payable (msg.sender),
            borrower: address(0),
            amount: _amount,
            deposit: _deposit,
            interestRate: _interestRate,
            loanDuration: _loanDuration,
            timestamp: 0,
            token: _token,
            tokenCollateral: _tokenCollateral,
            borrowed:false,
            returned: false,
            closed: false}
        );
        emit LoanRequested(requestIndex);
        requestIndex++;
    }
    function takeLoanByIuhCoin(uint256 requestId, uint amount) public payable {
        LoanRequest storage loan = loanRequests[requestId];
        amount *= 10 **18;
        require(!loan.borrowed, "Loan request is already closed.");
        require(amount == loan.deposit, "Deposit amount does not match loan request.");
        require(msg.sender != loan.owner, "Borrower cannot take their own loan.");
        require(IuhCoin.transferFrom(msg.sender, address(this), amount), "You don't have enough collateral");
        if(keccak256(abi.encodePacked(loan.token)) == keccak256(abi.encodePacked("IuhCoin"))){
            require(IuhCoin.transfer(msg.sender,loan.amount));
        }else{
            msg.sender.transfer(loan.amount);
        }
        loan.borrower = msg.sender;
        loan.timestamp = block.timestamp;
        loan.borrowed = true;
        emit LoanTaken(requestId, loan.borrower, msg.sender, loan.amount, loan.deposit);
    }
    function takeLoanByEther(uint256 requestId) public payable {
        LoanRequest storage loan = loanRequests[requestId];
        require(!loan.borrowed, "Loan request is already closed.");
        require(msg.value == loan.deposit, "Deposit amount does not match loan request.");
        require(msg.sender != loan.owner, "Borrower cannot take their own loan.");
        if(keccak256(abi.encodePacked(loan.token)) == keccak256(abi.encodePacked("IuhCoin"))){
            require(IuhCoin.transfer(msg.sender,loan.amount));
        }else{
            msg.sender.transfer(loan.amount);
        }
        loan.borrower = msg.sender;
        loan.borrowed = true;
        loan.timestamp = block.timestamp;
        emit LoanTaken(requestId, loan.borrower, msg.sender, loan.amount, loan.deposit);
        
    }
    function repayLoanByEther(uint256 requestId) public payable {
        LoanRequest storage loan = loanRequests[requestId];
        uint256 duration = block.timestamp - loan.timestamp;
        require(duration <= loan.loanDuration, "Time over");
        require(msg.sender == loan.borrower, "Only borrower can repay the loan.");
        uint interest = (loan.interestRate * loan.amount) / 10000;
        require(msg.value == loan.amount + interest, "Amount repaid does not match loan amount and interest rate.");
        
        loan.owner.transfer(msg.value);

        if(keccak256(abi.encodePacked(loan.tokenCollateral)) == keccak256(abi.encodePacked("IuhCoin"))){
            require(IuhCoin.transfer(loan.borrower,loan.deposit));
        }else{
            loan.borrower.transfer(loan.deposit);
        }
        loan.closed = true;
        loan.returned = true;
        emit LoanRepaid(requestId, loan.borrower, loan.owner, loan.amount);
        emit LoanClosed(requestId, loan.borrower, loan.owner);
    }
    function repayLoanByIuhCoin(uint256 requestId, uint amount) public payable {
        LoanRequest storage loan = loanRequests[requestId];
        uint256 duration = block.timestamp - loan.timestamp;
        require(duration <= loan.loanDuration, "Time over");
        require(msg.sender == loan.borrower, "Only borrower can repay the loan.");
        uint interest = (loan.interestRate * loan.amount) / 10000;
        require(amount == (loan.amount + interest), "Amount repaid does not match loan amount and interest rate.");
        require(IuhCoin.transferFrom(msg.sender, loan.owner, amount),"Tranfer wrong");

        if(keccak256(abi.encodePacked(loan.tokenCollateral)) == keccak256(abi.encodePacked("IuhCoin"))){
            require(IuhCoin.transfer(loan.borrower,loan.deposit));
        }else{
            loan.borrower.transfer(loan.deposit);
        }
        loan.closed = true;
        loan.returned = true;
        emit LoanRepaid(requestId, loan.borrower, loan.owner, loan.amount);
        emit LoanClosed(requestId, loan.borrower, loan.owner);
    }
    function cancelLoan(uint256 requestId) public {
        LoanRequest storage loan = loanRequests[requestId];
        uint256 duration = block.timestamp - loan.timestamp;
        require(duration >= loan.loanDuration, "Don't enough time");
        require(!loan.closed, "Loan request is already closed.");
        
        if(keccak256(abi.encodePacked(loan.tokenCollateral)) == keccak256(abi.encodePacked("Ether"))){
            loan.owner.transfer(loan.deposit);
        }else{
            IuhCoin.transfer(msg.sender, loan.deposit);
        }
        loan.closed = true;
        
        emit LoanClosed(requestId, loan.borrower, address(0));
    }
    function widthdraw(uint256 requestId) public{
        LoanRequest storage loan = loanRequests[requestId];
        require(msg.sender == loan.owner,"Only owner can widthdraw");
        require(!loan.closed, "Loan request is already closed.");
        require(!loan.borrowed, "Loan request is already borrow");
        if(keccak256(abi.encodePacked(loan.token)) == keccak256(abi.encodePacked("Ether"))){
            loan.owner.transfer(loan.amount);
        }else{
            IuhCoin.transfer(msg.sender, loan.amount);
        }
        loan.closed = true;
        emit LoanClosed(requestId, loan.owner, address(0));
    }

    function check(uint256 requestId) public view returns (bool){
        LoanRequest storage loan = loanRequests[requestId];
        uint256 duration = block.timestamp - loan.timestamp;
        return duration >= loan.loanDuration;
    }
    function getInfo(uint index) public view returns (
        address owner,
        address borrower,
        uint256 amount,
        uint256 deposit,
        uint256 interestRate,
        uint256 loanDuration,
        uint256 timestamp,
        string memory token,
        string memory tokenCollateral,
        bool returned,
        bool borrowed,
        bool closed
    ){
        LoanRequest storage loan = loanRequests[index];
        owner = loan.owner; 
        borrower = loan.borrower; 
        amount = loan.amount;
        deposit = loan.deposit;
        interestRate = loan.interestRate;
        loanDuration = loan.loanDuration;
        timestamp = loan.timestamp;
        token = loan.token; 
        tokenCollateral = loan.tokenCollateral;
        returned = loan.returned;
        borrowed = loan.borrowed;
        closed = loan.closed;
    }
    function getResqestAmount()public view returns(uint){
        return requestIndex;
    }
    }