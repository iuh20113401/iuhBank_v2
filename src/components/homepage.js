import React, { Component } from "react";
import Header from './Header';
import "./background.css";
import {Tab, Tabs, Row} from 'react-bootstrap';
import iuhBank from '../abis/iuhBank.json'
import Web3 from 'web3';

export default class Home extends Component{
    async componentDidMount() {
        const web3 = new Web3('HTTP://127.0.0.1:7545');
        const netId = await web3.eth.net.getId();
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        const dbank = new web3.eth.Contract(iuhBank.abi, iuhBank.networks[netId].address);
        const amount =await dbank.methods.getTotalLiquidInUsd().call({from:this.state.account});
        this.setState({account: accounts[0], dbank:dbank, web3: web3, amount: amount / (10 **18)});
    }
    constructor(props){
        super(props);
        this.state ={
            web3: null,
            dbank: null, 
            account: null,
            amount: 10
        }
    }
    render(){
        return(
            <>
            <div>
                {<Header/>}
            </div>
            <div className="bigimg">
                <div className="top1">
                    
                </div>
                <div className="bottom">
                    <div className="number">
                        <h1>$ {this.state.amount.toLocaleString()}</h1>
                        <h5>of liquidity is locked in Aave across 5 networks and over 11 markets.</h5>
                    </div>
                    <div className="function">
                        <div className="tab">
                            <Row className="justify-content-center h6 ">
                            <Tabs
                                justify 
                                defaultActiveKey="Supply"
                                >
                                <Tab eventKey="Supply" title="Supply" className="title-dark">
                                    <p className="content"> Supply into the protocol and watch your assets grow as a liquidity provider</p>
                                </Tab>
                                <Tab eventKey="Borrow" title="Borrow">
                                    <p className="content">Borrow against your collateral from across multiple networks and assets</p>
                                </Tab>
                                <Tab eventKey="Staking" title="Personal lending" >
                                    <p className="content">Deposit your asset and get interest personally</p>
                                </Tab>
                            </Tabs>
                        </Row>
                        </div>
                    </div>
                </div>
            </div>
            </>
        )
    }
}