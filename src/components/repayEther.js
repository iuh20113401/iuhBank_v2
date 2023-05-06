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
export default class RepayEther extends Component{
    async componentDidMount(dispatch) {
        if(typeof window.ethereum !== 'undefined'){
        const web3 = new Web3(window.ethereum)
        const netId = await web3.eth.net.getId()
        const accounts = await web3.eth.getAccounts()
        if(typeof accounts[0] !== 'undefined'){
            const balance = await web3.eth.getBalance(accounts[0])
            this.setState({account: accounts[0], balance: balance / 10 **18, web3: web3})
        } else {
            window.alert('Please login with MetaMask')
        }
        try {
            const iuhCoin = new web3.eth.Contract(IuhCoin.abi, IuhCoin.networks[netId].address)
            const IuhBank = new web3.eth.Contract(iuhBank.abi, iuhBank.networks[netId].address)
            const iuhBankAddress = iuhBank.networks[netId].address;
            let userBorrow = await IuhBank.methods.getUserBorrow().call({from: this.state.account});
            let etherPool = await IuhBank.methods.getEtherPoolInfo().call({from: this.state.account});
            for (let index = 0; index < userBorrow['tokenName'].length; index++) {
            const element =  userBorrow['tokenName'][index];
            if(element == "Ether"){
                this.setState({Repay: ((userBorrow['Borrow'][index])/ etherPool['price'])/ 10 **18 })
            }
            }
            this.setState({token: iuhCoin, iuhBank: IuhBank, iuhBankAddress: iuhBankAddress})
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
            Repay: 0.0,
            account: null,
            balance: 0,
            amount: 0,
            activeTab: 1,
            connect: true
        }
    }
    handleSelect = (key) => {
        this.setState({activeTab: key});
    };
    handleNextTab = () => {
            this.setState({activeTab: this.state.activeTab  % 2 +1});
    };
    async repayAmount(amount){
        this.setState({amount: amount, connect: true});
    }
    async repayEther(){
        try {
            await this.state.iuhBank.methods.repayEther().send({from: this.state.account, value:(this.state.Repay * 10 ** 18).toString()});
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
                {this.state.connect == true && <div>
                    <div>
                        <div className="deposit">
                            <a href="/home">
                                <Button variant="outline-secondary">Back</Button>{' '}
                            </a>
                            <div className="text-center mt-5">
                                <h4 className="text-primary">
                                    Reapy Overview
                                </h4>
                                <p>
                                    These are your transaction details. Make sure to check <br></br> if this is correct before submitting
                                </p>
                                <form>
                                    <Form.Label htmlFor="disabledTextInput">Amount to Repay: {this.state.Repay != null && this.state.Repay.toLocaleString()} Ether</Form.Label>
                                </form>
                                <div className="mb-3 w-50 m-auto ">
                                    <Tabs activeKey={this.state.activeTab} onSelect={this.handleSelect} variant="pills" justify className = 'bg-light w-100 m-auto border'>
                                        <Tab eventKey={1} title="1 Repay" disabled>
                                            <Tab.Content className="row">
                                                <h6 className="p-3 col-9" style={{textAlign: "start"}}><span className="h5 text-primary">1/2 Repay</span> <br/>Pleasde submit to repay</h6>
                                                <Button onClick={(e) => {
                                                    e.preventDefault()
                                                    this.repayEther();
                                                    }} 
                                                variant="btn btn-primary h-25 m-auto">Repay</Button>
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
                        </div>
                        </div>
                        </div>}
            </>
        )
    }
}
