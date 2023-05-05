import React, { Component } from "react";
import HeaderMarket from './headerMarket';
import "./dashboard.css";
import 'bootstrap/dist/css/bootstrap.css';
import {Container} from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { FaWallet,FaSignal } from "react-icons/fa";
import Web3 from 'web3';
import iuhBank from '../abis/iuhBank.json';
import IuhCoin from '../abis/iuhCoin.json';
import Oracle from '../abis/Oracle.json';
import dai from "../dai.svg";

export default class Dashboard extends Component{
    async componentDidMount() {
        this.loadBlockchainData(this.dispatch);    
    }
    async loadBlockchainData(dispatch) {
        if(typeof window.ethereum !== 'undefined'){
        const web3 = new Web3(window.ethereum)
        await window.ethereum.enable();
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
            let iuhCoinBalance = await iuhCoin.methods.balanceOf(accounts[0]).call();
            if(iuhCoinBalance  ==  0){
                await IuhBank.methods.mintIuhCoin().send({from:this.state.account});
                iuhCoinBalance = await iuhCoin.methods.balanceOf(accounts[0]).call();
            }
            this.setState({token: iuhCoin, iuhBank: IuhBank, iuhBankAddress: iuhBankAddress, iuhCoinBalance: iuhCoinBalance / 10 ** 18})
            await this.getInfo();
        } catch (e) {
                console.log(e)
                window.alert('Contracts not deployed to the current network')
            }
        } else {
        window.alert('Please install MetaMask')
        }
    }
    async getInfo(){
        let userSupply = await this.state.iuhBank.methods.getUserSupplied().call({from: this.state.account});
        let userBorrow = await this.state.iuhBank.methods.getUserBorrow().call({from: this.state.account});
        let etherPool = await this.state.iuhBank.methods.getEtherPoolInfo().call({from: this.state.account});
        let iuhCoinPool = await this.state.iuhBank.methods.getIuhCoinPoolInfo().call({from: this.state.account});
        this.setState({userSupply: userSupply, userBorrow: userBorrow, etherPool: etherPool, iuhCoinPool: iuhCoinPool, connect: true})
    }
    async getInfoUser(){
        const userInfo = await this.state.iuhBank.methods.getUserSupplied().call({from: this.state.account});
        console.log(userInfo)
    }
    constructor(props){
        super(props);
        this.state ={
            web3: null,
            iuhBank: null, 
            token: null,
            iuhBankAddress: null,
            etherPool: null,
            iuhCoinPool: null,
            userSupply: [],
            userBorrow: [],
            account: null,
            balance: 0,
            iuhCoinBalance: 0,
            connect: false
        }
    }
    render(){
        return(
            <>
                {<HeaderMarket/>}
                    <div className="top  text-light">
                        <Container id="dashboardTop">
                            <h2>Iuh Market</h2>
                            <div className="d-flex">
                                <div className="d-flex">
                                    <div>
                                        <FaWallet className="h-100 w-100"/>
                                    </div>
                                    <div style={{width: "1000px", marginLeft: "10px"}}>
                                        <p className="m-0 p-0">Your collater in usd</p>
                                        <h5>$ {(this.state.userSupply['Collateral'] / 10 **18).toLocaleString(undefined, {maximumFractionDigits:8})}</h5>
                                    </div>
                                </div>
                            </div>  
                        </Container>
                    </div>
                    
                  
                    <Container>
                        {this.state.connect == false && <div>
                            <Button variant="btn btn-primary" onClick={(e)=>{
                                e.preventDefault();
                                this.loadBlockchainData(this.props.dispatch)
                            }}>Connect</Button>
                        </div>}
                          {this.state.connect == true && <div>
                        <div className="bottom">
                        <div className="bottomTop d-flex">
                            <div className="left">
                                <h5>Your Supplies</h5>
                                {this.state.userSupply["Collateral"] == 0 && <div>
                                <p>Nothing supplied yet.</p>
                                    </div>}
                                {this.state.userSupply["Collateral"] != 0 && <div>
                                    <table className="table">
                                        <tr>
                                            <td>Asset</td>
                                            <td>Supply</td>
                                        </tr>
                                        {this.state.userSupply["tokenName"][0] != '' && 
                                        <tr>
                                            <td>{this.state.userSupply['tokenName'][0]}</td>
                                            <td>{(this.state.userSupply['LendAmount'][0] / (10**18)).toLocaleString()}</td>
                                            {this.state.userSupply['tokenName'][0] == "Ether" && 
                                                <td className="w-25"><a href="/withdrawEther"><Button>Withdraw</Button></a></td>
                                            }
                                            {this.state.userSupply['tokenName'][0] == "IuhCoin" && 
                                                <td className="w-25"><a href="/withdrawIuhCoin"><Button>Withdraw</Button></a></td>}
                                        </tr>}
                                        {this.state.userSupply["tokenName"][1] != '' && 
                                        <tr>
                                            <td>{this.state.userSupply['tokenName'][1]}</td>
                                            <td>{this.state.userSupply['LendAmount'][1] / (10**18)}</td>
                                            {this.state.userSupply['tokenName'][1] == "Ether" && 
                                                <td className="w-25"><a href="/withdrawEther"><Button>Withdraw</Button></a></td>
                                            }
                                            {this.state.userSupply['tokenName'][1] == "IuhCoin" && 
                                            <td className="w-25"><a href="/withdrawIuhCoin"><Button>Withdraw</Button></a></td>}
                                        </tr>}
                                    </table>
                                </div> }
                            </div>
                            <div className="right">
                                <h5>Your borrows</h5>
                                    {this.state.userBorrow["Borrow"][0] == 0 && <div>
                                <p>Nothing supplied yet.{console.log(this.state.userBorrow)}</p>
                                    </div>}
                                {(this.state.userBorrow["Borrow"][0] != 0 || this.state.userBorrow["Borrow"][1] != 0 ) && <div>
                                    <table className="table">
                                        <tr>
                                            <td>Asset</td>
                                            <td>Borrow</td>
                                            <td>Freze</td>
                                        </tr>
                                        {this.state.userBorrow["Borrow"][0] != 0 && 
                                        <tr>
                                            <td>{this.state.userBorrow['tokenName'][0]}</td>
                                            <td>$ {this.state.userBorrow['Borrow'][0] / (10**18)}</td>
                                            <td>{this.state.userBorrow['frezeAmount'][0] / (10**18)} {this.state.userSupply['tokenName'][0]}</td>
                                           {this.state.userBorrow['tokenName'][0] == "Ether" && 
                                             <td className="w-25"> <a href="/repayEther"><Button>Repay</Button></a></td>
                                            }
                                            {this.state.userBorrow['tokenName'][0] == "IuhCoin" && 
                                           <td className="w-25"><a href="/repayIuhCoin"><Button>Repay</Button></a> </td>}
                                        </tr>}
                                        {this.state.userBorrow["Borrow"][1] != 0 && 
                                        <tr>
                                            <td>{this.state.userBorrow['tokenName'][1]}</td>
                                            <td>{this.state.userBorrow['Borrow'][1] / (10**18)}</td>
                                            <td>{this.state.userBorrow['frezeAmount'][1] / (10**18)}  {this.state.userSupply['tokenName'][1]}</td>
                                            {this.state.userBorrow['tokenName'][1] == "Ether" && 
                                            <td className="w-25"> <a href="/repayEther"><Button>Repay</Button></a></td>
                                            }
                                            {this.state.userBorrow['tokenName'][1] == "IuhCoin" && 
                                            <td className="w-25"><a href="/repayIuhCoin"><Button>Repay</Button></a> </td>}
                                        </tr>}
                                    </table>
                                </div> }
                            </div>
                            </div>
                        <div className="bottomEnd d-flex">
                            <div className="left">
                                <h5>Asset to supply</h5>
                                <table className="w-100">
                                    <tr>
                                        <td >Assets</td>
                                        <td className="text-center">Wallet balance</td>
                                        <td className="text-center">APV</td>
                                        <td className="text-center">Collateral</td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td >
                                            <span className="h6 m-1">Ether</span>
                                        </td>
                                        <td className="text-center"> {this.state.balance.toLocaleString()} </td>
                                        <td className="text-center">{this.state.etherPool.lendRate / 100}%</td>
                                        <td className="text-center">Yes</td>
                                        <td className="text-center">
                                            <a href="/EtherDeposit"><Button variant="outline-primary">Supply</Button>{' '}</a>
                                        </td>
                                    </tr>
                                    <tr className="mt-3" >
                                        <td>
                                            <span className="h6 m-1">IuhCoin</span>
                                        </td>
                                        <td className="text-center"> {this.state.iuhCoinBalance} </td>
                                        <td className="text-center">{this.state.iuhCoinPool.lendRate /100}%</td>
                                        <td className="text-center">Yes</td>
                                        <td className="text-center">
                                            <a href="IuhCoinDeposit"><Button variant="outline-primary">Supply</Button>{' '}</a>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            <div className="right">
                                <h5>Asset to borrow</h5>
                                <table className="w-100">
                                    <tr>
                                        <td>Assets</td>
                                        <td className="text-center">Borrow</td>
                                        <td className="text-center">APB</td>
                                        <td className="text-center">Collateral</td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <span className="h6 m-1">Ether</span>
                                        </td>
                                        <td className="text-center"> {(this.state.etherPool.borrowAmount / 10**18).toLocaleString()} </td>
                                        <td className="text-center">{this.state.etherPool.borrowRate /100}%</td>
                                        <td className="text-center">Yes</td>
                                        <td className="text-center">
                                            <a href="/borrowEther"><Button variant="outline-primary">Borrow</Button>{' '}</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <span className="h6 m-1">IuhCoin</span>
                                        </td>
                                        <td className="text-center">{(this.state.iuhCoinPool.borrowAmount / 10 ** 18).toLocaleString()} </td>
                                        <td className="text-center">{this.state.iuhCoinPool.borrowRate / 100} %</td>
                                        <td className="text-center">Yes</td>
                                        <td className="text-center">
                                            <a href="/borrowIuhCoin"><Button variant="outline-primary">Borrow</Button>{' '}</a>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>

                    </div>}
            </Container>
            </>
        )
    }
}