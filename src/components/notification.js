import React, { Component } from "react";
import HeaderMarket from './headerMarket';
import "./deposit.css";
import 'bootstrap/dist/css/bootstrap.css';
import {Container} from 'react-bootstrap';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import {Tabs, Tab, Table} from 'react-bootstrap';
import Web3 from 'web3';
import IuhCoin from '../abis/iuhCoin.json';
import LoanContract from '../abis/LoanContract.json';
import dai from "../dai.svg";
import { render } from "react-dom";

export default class PersonalLoan extends Component{
    async componentDidMount(){
        await this.loadBlockchainData(this.dispatch);
    }

    async loadBlockchainData(dispatch) {
        if(typeof window.ethereum !== 'undefined'){
        const web3 = new Web3(window.ethereum)
        const netId = await web3.eth.net.getId()
        const accounts = await web3.eth.getAccounts()
        if(typeof accounts[0] !== 'undefined'){
            const balance = await web3.eth.getBalance(accounts[0])
            this.setState({account: accounts[0], web3: web3})
        } else {
            window.alert('Please login with MetaMask')
        }
        try {
            const iuhCoin = new web3.eth.Contract(IuhCoin.abi, IuhCoin.networks[netId].address)
            const loanContract = new web3.eth.Contract(LoanContract.abi, LoanContract.networks[netId].address)
            const LoanContractAddress = LoanContract.networks[netId].address;
            this.setState({token: iuhCoin, LoanContract: loanContract, LoanContractAddress: LoanContractAddress})
            await this.getInfoLoans()
        } catch (e) {
                console.log(e)
                window.alert('Contracts not deployed to the current network')
            }
        } else {
        window.alert('Please install MetaMask')
        }
    }
    async getInfoLoans(){
        let LoanAmount = await this.state.LoanContract.methods.getResqestAmount().call({from: this.state.account});
        let TotalLoan = [];
        for (let index = 0; index < LoanAmount; index++) {
            TotalLoan[index] = await this.state.LoanContract.methods.getInfo(index).call({from: this.state.account});
            TotalLoan[index]['index'] = index;
            let str = TotalLoan[index]['owner'];
            TotalLoan[index]['owner'] = TotalLoan[index]['owner'].substring(0, 6) + "......" +TotalLoan[index]['owner'].substring(str.length - 4, str.length);
        }
        this.setState({TotalLoan: TotalLoan})
    }
    async check(){
        let check = [];
        for (let index = 0; index < this.state.TotalLoan.length; index++) {
            check[index] = await this.state.LoanContract.methods.check(index).call({from: this.state.account});
        }

        this.state.TotalLoan[check] = check;
        console.log(this.state.TotalLoan[check]);
    }
    async displayString(str) {
        const prefix = str.substring(0, 6);
        const suffix = str.substring(str.length - 4, str.length);
    }
    async createLoan(amount,
    deposit,
    interestRate,
    loanDuration, 
    token,
    tokenCollateral){
        try{
            await this.state.LoanContract.methods.createLoanRequest(amount,deposit,interestRate * 100,loanDuration, token,tokenCollateral).send({from: this.state.account, value: (amount * 10 ** 18).toString()});
            window.location.reload();
        }catch(e){
            console.log(e);
        }
        
    }
    async createLoanByIuhCoin(amount,
    deposit,
    interestRate,
    loanDuration, 
    token,
    tokenCollateral){
        try{
            await this.state.LoanContract.methods.createLoanRequestByIuhCoin(amount,deposit,interestRate * 100,loanDuration, token,tokenCollateral).send({from: this.state.account});
            window.location.reload();
        }catch(e){
            console.log(e);
        }
        
    }
    async borrow(index){
        this.setState({borrowState: index});
    }
    async Approve(amount){
        try {
            amount *= 10 ** 18;
            await this.state.token.methods.approve(this.state.LoanContractAddress, (amount).toString()).send({from: this.state.account});
            this.handleNextTab();
        } catch (error) {
            console.log(error);
        }
    }
    async depositIuhCoin(id,amount){
        try {
            await this.state.LoanContract.methods.takeLoanByIuhCoin(id,amount/10**18).send({from: this.state.account});
            this.handleNextTab();
        } catch (error) {
            console.log(error)
        }
    }
    async depositEther(id,amount){
        try {
            await this.state.LoanContract.methods.takeLoanByEther(id).send({from: this.state.account, value: (amount).toString()});
            this.handleNextTab();
        } catch (error) {
            console.log(error)
        }
    }
    handleSelect = (key) => {
        this.setState({activeTab: key});
    };
    handleNextTab = () => {
            this.setState({activeTab: this.state.activeTab  % 3 +1});
    };
    
    constructor(props){
        super(props);
        this.state= {
            web3: null,
            token:null,
            LoanContract: null,
            LoanContractAddress:null,
            TotalLoan: [],
            check: [],
            account: 0,
            loanDuration: 30,
            tokenCollateral: "Ether",
            tokenDeposit: "Ether",
            borrowState: null,
            state: false,
            activeTab: 1
        }
    }
    render(){
        return(
            <>
                <div>
                    <HeaderMarket/>
                </div>
                <div className="deposti">
                    <Container className="border p-4">
                        {(this.state.state == false && this.state.borrowState == null )  && <div>
                            <h3>Personal loan area</h3>
                        <Button variant="btn btn-primary" onClick={(e) =>{
                            e.preventDefault();
                            this.setState({state: true})
                        }}>
                            Create new loan
                        </Button>
                        <Row xs={1} md={3} className="g-4">
                            {this.state.TotalLoan.map((loan) => (
                                (loan.borrowed == false && loan.closed == false) && <Col>
                                <Card border="primary" className="mt-3 ">
                                    <Card.Body>
                                    <Card.Title>Owner: {loan.owner} </Card.Title>
                                    <Card.Text className="w-100">
                                        Lend: {loan.amount / 10 ** 18} {loan.token} <br/>
                                        Collateral: {loan.deposit / 10 ** 18} {loan.tokenCollateral}<br/>
                                        Time: {loan.loanDuration} seconds<br/>
                                    </Card.Text>
                                    </Card.Body>
                                    <Card.Footer>
                                        <Button variant="btn w-100 btn-primary" onClick={(e) =>{
                                            this.setState({borrowState: loan.index});
                                        }}>
                                            Borrow    
                                        </Button>
                                    </Card.Footer>
                                </Card>
                                </Col>
                            ))}
                        </Row></div>}
                        {(this.state.state == true && this.state.borrowState == null)&& <div>
                            <Form>
                                <Row className="mb-3">
                                    <Form.Group as={Col} controlId="formGridEmail">
                                    <Form.Label>Token</Form.Label>
                                    <select className="w-100 h-50 m-auto" value={this.state.tokenDeposit} onChange={(e) => {
                                        let value = e.target.value;
                                        this.setState({tokenDeposit: value});
                                    }}>
                                        <option value={"Ether"}>Ether</option>
                                        <option value={"IuhCoin"}>IuhCoin</option>
                                    </select>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formGridPassword">
                                    <Form.Label>Amount</Form.Label>
                                    <Form.Control type="number" placeholder="Amount" id="amount"
                                    ref={(input) => { this.amount = input }}/>
                                    </Form.Group>
                                </Row>
                                <Row className="mb-3">
                                    <Form.Group as={Col} controlId="formGridEmail">
                                    <Form.Label>Token collateral</Form.Label>
                                    <select className="w-100 h-50 m-auto" value={this.state.tokenCollateral} onChange={(e) => {
                                        let value = e.target.value;
                                        this.setState({tokenCollateral: value});
                                    }}>
                                        <option value={"Ether"}>Ether</option>
                                        <option value={"IuhCoin"}>IuhCoin</option>
                                    </select>
                                    </Form.Group>

                                    <Form.Group as={Col} controlId="formGridPassword">
                                    <Form.Label>Amount</Form.Label>
                                    <Form.Control type="number" placeholder="Amount" id="deposit"
                                    ref={(input) => { this.deposit = input }}/>
                                    </Form.Group>
                                </Row>
                                <Row>
                                    <Form.Group as={Col}  controlId="formGridState">
                                    <Form.Label>Time</Form.Label><br></br>
                                    <select className="w-100 h-50 m-auto" value={this.state.loanDuration} onChange={(e) => {
                                        let value = e.target.value;
                                        this.setState({loanDuration: value});
                                    }}>
                                        <option value={30}>30 second</option>
                                        <option value={60}>60 second</option>
                                        <option value={120}>120 second</option>
                                    </select>
                                    </Form.Group>
                                    <Form.Group as={Col}  controlId="formGridState">
                                    <Form.Label>Interest</Form.Label><br></br>
                                    <Form.Control type="number" placeholder="Interest" id="interestRate"
                                    ref={(input) => { this.interestRate = input }} />
                                    </Form.Group>
                                </Row>
                                {this.state.tokenDeposit == "IuhCoin" && 
                                    <Button variant="primary" style={{marginRight: "30px"}} type="submit" 
                                onClick={(e) =>{
                                    e.preventDefault();
                                    let amount = this.amount.value;
                                    this.Approve(amount);
                                }}
                                >
                                    Approve
                                </Button> }
                                <Button variant="primary" type="submit" 
                                onClick={(e) =>{
                                    e.preventDefault();
                                    let amount = this.amount.value;
                                    let deposit = this.deposit.value;
                                    let interestRate = this.interestRate.value;
                                    let loanDuration = this.state.loanDuration;  
                                    let token = this.state.tokenDeposit;
                                    let tokenCollateral = this.state.tokenCollateral;
                                    if(token == "Ether"){
                                        try {
                                            this.createLoan(amount,deposit,interestRate,loanDuration, token,tokenCollateral);
                                        } catch (error) {
                                            console.log(error)
                                        }
                                    }else{
                                        try {
                                        this.createLoanByIuhCoin(amount,deposit,interestRate,loanDuration, token,tokenCollateral);
                                        } catch (error) {
                                            console.log(error)
                                        }
                                    }
                                }}
                                >
                                    Submit
                                </Button>
                            </Form>
                        </div>}
                        {this.state.borrowState != null && <div>
                            {this.state.TotalLoan[this.state.borrowState]['tokenCollateral'] == "Ether" && <div>
                                <Button variant="outline-secondary" onClick={(e) =>{
                                            this.setState({borrowState: null});
                                        }}>Back</Button>{' '}
                            <div className="text-center mt-5">
                                <h4 className="text-primary">
                                    Borrow Overview
                                </h4>
                                <p>
                                    There is your transaction details. Make sure to<br></br> check if this is correct before submitting
                                </p>
                                <form>
                                    <Table className="table m-auto w-50 borderless " borderless>
                                    <tr>
                                        <td><Form.Label htmlFor="disabledTextInput">Amount to borrow: </Form.Label></td>
                                        <td><Form.Label>{ this.state.TotalLoan[this.state.borrowState]['amount'] / 10 ** 18} iuhCoin</Form.Label></td>
                                    </tr>
                                    <tr>
                                        <td><Form.Label htmlFor="disabledTextInput">Amount to deposit: </Form.Label></td>
                                        <td><Form.Label>{ this.state.TotalLoan[this.state.borrowState]['deposit'] / 10 ** 18} Ether</Form.Label></td>
                                    </tr>
                                    <tr>
                                        <td><Form.Label htmlFor="disabledTextInput">Interest: </Form.Label></td>
                                        <td><Form.Label>{this.state.TotalLoan[this.state.borrowState]['interestRate'] / 100 } %</Form.Label></td>
                                    </tr>
                                    <tr>
                                        <td><Form.Label htmlFor="disabledTextInput">Duration: </Form.Label></td>
                                        <td><Form.Label>{ this.state.TotalLoan[this.state.borrowState]['loanDuration'] } Seconds</Form.Label></td>
                                    </tr>

                                    </Table>
                                </form>
                                <div className="mb-3 w-50 m-auto ">
                                    <Tabs activeKey={this.state.activeTab} onSelect={this.handleSelect} variant="pills" justify className = 'bg-light w-100 m-auto border'>
                                        <Tab eventKey={1} title="1 Deposit" disabled>
                                            <Tab.Content className="row">
                                                <h6 className="p-3 col-9" style={{textAlign: "start"}}><span className="h5 text-primary">1/2 Deposit</span> <br/>Pleasde submit to borrow</h6>
                                                <Button onClick={(e) => {
                                                    e.preventDefault();
                                                    let requestId = this.state.borrowState;
                                                    this.depositEther(requestId, this.state.TotalLoan[this.state.borrowState]['deposit']);
                                                    }} 
                                                variant="btn btn-primary h-25 m-auto">Deposit</Button>
                                            </Tab.Content>
                                        </Tab>
                                        <Tab eventKey={2} title="2 Pending" disabled>
                                            <Tab.Content className="row">
                                                <h6 className="p-3 col-9" style={{textAlign: "start"}}><span className="h5 text-primary">2/2 Finishes</span> <br/>Press button to back to home</h6>
                                                <a href="/home" className="m-auto"><Button onClick={this.handleNextTab} variant="btn btn-primary m-auto">Dashboard</Button></a>
                                            </Tab.Content>
                                    </Tab>
                                    </Tabs>
                                </div>
                            </div>
                        </div>}
                        { this.state.TotalLoan[this.state.borrowState]['tokenCollateral'] == "IuhCoin" &&<div><a href="/home">
                                <Button variant="outline-secondary">Back</Button>{' '}
                            </a>
                            <div className="text-center mt-5">
                                <h4 className="text-primary">
                                    Borrow Overview
                                </h4>
                                <p>
                                    There is your transaction details. Make sure to<br></br> check if this is correct before submitting
                                </p>
                                <form>
                                    <Table className="table m-auto w-50 borderless " borderless>
                                    <tr>
                                        <td><Form.Label htmlFor="disabledTextInput">Amount to borrow: </Form.Label></td>
                                        <td><Form.Label>{ this.state.TotalLoan[this.state.borrowState]['amount'] / 10 ** 18} Ether</Form.Label></td>
                                    </tr>
                                    <tr>
                                        <td><Form.Label htmlFor="disabledTextInput">Amount to deposit: </Form.Label></td>
                                        <td><Form.Label>{ this.state.TotalLoan[this.state.borrowState]['deposit'] / 10 ** 18} IuhCoin</Form.Label></td>
                                    </tr>
                                    <tr>
                                        <td><Form.Label htmlFor="disabledTextInput">Interest: </Form.Label></td>
                                        <td><Form.Label>{this.state.TotalLoan[this.state.borrowState]['interestRate'] / 100 } %</Form.Label></td>
                                    </tr>
                                    <tr>
                                        <td><Form.Label htmlFor="disabledTextInput">Duration: </Form.Label></td>
                                        <td><Form.Label>{ this.state.TotalLoan[this.state.borrowState]['loanDuration'] } Seconds</Form.Label></td>
                                    </tr>

                                    </Table>
                                </form>
                                <div className="mb-3 w-50 m-auto ">
                                    <Tabs activeKey={this.state.activeTab} onSelect={this.handleSelect} variant="pills" justify className = 'bg-light w-100 m-auto border'>
                                        <Tab eventKey={1} title="1 Approve" disabled>
                                            <Tab.Content className="row">
                                                <h6 className="p-3 col-9" style={{textAlign: "start"}}><span className="h5 text-primary">1/3 Approve</span> <br/>Please approve before deposit</h6>
                                                <Button onClick={(e) => {
                                                    e.preventDefault();
                                                    this.Approve(this.state.TotalLoan[this.state.borrowState]['deposit'] / 10 ** 18);
                                                    }}  variant="btn btn-primary h-25 m-auto">Approve</Button>
                                            </Tab.Content>
                                        </Tab>
                                        <Tab eventKey={2} title="2 Deposit" disabled>
                                            <Tab.Content className="row">
                                                <h6 className="p-3 col-9" style={{textAlign: "start"}}><span className="h5 text-primary">2/3 Deposit</span> <br/>Pleasde submit to deposit</h6>
                                                <Button onClick={(e) => {
                                                    e.preventDefault();
                                                    let requestId = this.state.borrowState;
                                                    this.depositIuhCoin(requestId, this.state.TotalLoan[this.state.borrowState]['deposit']);
                                                    }} variant="btn btn-primary h-50 m-auto">Deposit</Button>
                                            </Tab.Content>
                                        </Tab>
                                    
                                        <Tab eventKey={3} title="3 Pending" disabled>
                                            <Tab.Content className="row">
                                                <h6 className="p-3 col-9" style={{textAlign: "start"}}><span className="h5 text-primary">3/3 Finishes</span> <br/>Press button to back to home</h6>
                                                <a href="/home"><Button onClick={this.handleNextTab} variant="btn btn-primary h-50 m-auto">Dashboard</Button></a>
                                            </Tab.Content>
                                        </Tab>
                                    </Tabs>
                                </div>
                            </div>
                        </div>}
                        </div>
                        }
                    </Container>
                </div>
            </>
        )
    }
}