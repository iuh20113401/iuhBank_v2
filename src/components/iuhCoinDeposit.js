import React, { Component } from "react";
import HeaderMarket from './headerMarket';
import "./deposit.css";
import 'bootstrap/dist/css/bootstrap.css';
import {Container,Form, InputGroup } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import dai from "../dai.svg";
import {Tab, Tabs, Row} from 'react-bootstrap';
import Web3 from 'web3';
import iuhBank from '../abis/iuhBank.json';
import IuhCoin from '../abis/iuhCoin.json';
import Oracle from '../abis/Oracle.json';
export default class IuhCoinDeposit extends Component{
    async componentDidMount(dispatch) {
        if(typeof window.ethereum !== 'undefined'){
        const web3 = new Web3(window.ethereum)
        const netId = await web3.eth.net.getId()
        const accounts = await web3.eth.getAccounts()
        this.setState({account: accounts[0], web3: web3})
        try {
            const iuhCoin = new web3.eth.Contract(IuhCoin.abi, IuhCoin.networks[netId].address)
            const IuhBank = new web3.eth.Contract(iuhBank.abi, iuhBank.networks[netId].address)
            const iuhBankAddress = iuhBank.networks[netId].address;
            const balance = await iuhCoin.methods.balanceOf(this.state.account).call();
            this.setState({token: iuhCoin, iuhBank: IuhBank, iuhBankAddress: iuhBankAddress, balance: balance / (10**18)})
        } catch (e) {
                console.log(e)
                window.alert('Contracts not deployed to the current network')
            }
        } else {
        window.alert('Please install MetaMask')
        }
    }
    constructor(props){
        super(props);
        this.state ={
            web3: null,
            iuhBank: null, 
            token: null,
            iuhBankAddress: null,
            account: null,
            balance: 0,
            amount: 0,
            activeTab: 1,
            connect: false
        }
    }
    handleSelect = (key) => {
        this.setState({activeTab: key});
    };
    handleNextTab = () => {
            this.setState({activeTab: this.state.activeTab  % 3 +1});
    };
    async depositAmount(amount){
        this.setState({amount: amount, connect: true});
    }
    async Approve(){
        try {
            await this.state.token.methods.approve(this.state.iuhBankAddress, (this.state.amount * 10 **18).toString()).send({from: this.state.account});
            this.handleNextTab();
        } catch (error) {
            console.log(error);
        }
    }
    async depositIuhCoin(){
        
        try {
            await this.state.iuhBank.methods.depositIuhCoin(this.state.amount).send({from: this.state.account});
            this.handleNextTab();
        } catch (error) {
            console.log(error)
        }
    }
    render(){
        return(
            <>
                <div>
                    {<HeaderMarket />}
                </div>
                {this.state.connect == false && <div>
                <div>
                        <div className="deposit">
                            <a href="/home">
                                <Button variant="outline-secondary">Back</Button>{' '}
                            </a>
                            <div className="text-center mt-5">
                                <h4 className="text-primary">
                                    How much would you like to deposit?
                                </h4>
                                <p>
                                    Please enter an amount you would like to deposit. The maxium amount you <br></br> can deposit is shown below
                                </p>
                                <form>
                                    <Form.Label htmlFor="disabledTextInput">Avaliable to deposit: {this.state.balance} IuhCoin</Form.Label>

                                    <InputGroup className="mb-3 w-25 m-auto">
                                        <Button variant="outline-secondary"><img src={dai}
                                        style={{width:"20px", backgroundColor: "White"}}
                                        /></Button>
                                        <Form.Control
                                        id="deposit"
                                        ref={(input) => { this.deposit = input }}
                                        placeholder="Amount"
                                        aria-label="Amout"
                                        aria-describedby="basic-addon1"
                                        />
                                    </InputGroup>
                                    <Button variant=" mt-3 btn btn-primary"
                                    onClick={(e) => {
                                            e.preventDefault()
                                            let amount = this.deposit.value;
                                            this.depositAmount(amount);
                                        }}
                                    >
                                        Deposit
                                    </Button>
                                </form>
                            </div>
                        </div>
                </div></div>}
                {this.state.connect == true && <div>
                    <div>
                        <div className="deposit">
                            <a href="/home">
                                <Button variant="outline-secondary">Back</Button>{' '}
                            </a>
                            <div className="text-center mt-5">
                                <h4 className="text-primary">
                                    Deposit Overview
                                </h4>
                                <p>
                                    There is your transaction details. Make sure to<br></br> check if this is correct before submitting
                                </p>
                                <form>
                                    <Form.Label htmlFor="disabledTextInput">Amount  </Form.Label>
                                </form>
                                <div className="mb-3 w-50 m-auto ">
                                    
                                    <Tabs activeKey={this.state.activeTab} onSelect={this.handleSelect} variant="pills" justify className = 'bg-light w-100 m-auto border'>
                                        <Tab eventKey={1} title="1 Approve" disabled>
                                            <Tab.Content className="row">
                                                <h6 className="p-3 col-9" style={{textAlign: "start"}}><span className="h5 text-primary">1/3 Approve</span> <br/>Please approve before deposit</h6>
                                                <Button onClick={(e) => {
                                                    e.preventDefault()
                                                    this.Approve();
                                                    }}  variant="btn btn-primary h-25 m-auto">Approve</Button>
                                            </Tab.Content>
                                        </Tab>
                                        <Tab eventKey={2} title="2 Deposit" disabled>
                                            <Tab.Content className="row">
                                                <h6 className="p-3 col-9" style={{textAlign: "start"}}><span className="h5 text-primary">2/3 Deposit</span> <br/>Pleasde submit to deposit</h6>
                                                <Button onClick={(e) => {
                                                    e.preventDefault()
                                                    this.depositIuhCoin();
                                                    }} variant="btn btn-primary h-25 m-auto">Deposit</Button>
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
                        </div>
                    </div>
                </div>}
            </>
        )
    }
}
