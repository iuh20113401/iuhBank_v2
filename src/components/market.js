import React, { Component } from "react";
import HeaderMarket from './headerMarket';
import "./dashboard.css";
import 'bootstrap/dist/css/bootstrap.css';
import {Container} from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { FaChartPie,FaLongArrowAltDown,FaLongArrowAltUp } from "react-icons/fa";
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
            this.setState({token: iuhCoin, iuhBank: IuhBank, iuhBankAddress: iuhBankAddress})
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
        let etherPool = await this.state.iuhBank.methods.getEtherPoolInfo().call({from: this.state.account});
        let iuhCoinPool = await this.state.iuhBank.methods.getIuhCoinPoolInfo().call({from: this.state.account});
        let etherTotal = etherPool['totalAmountInUsd'] / 10 ** 18;
        let iuhCoinTotal = iuhCoinPool['totalAmountInUsd']/ 10 ** 18;
        let etherTotalBorrow = etherPool['borrowAmountInUsd']/ 10 ** 18;
        let iuhCoinTotalBorrow = iuhCoinPool['borrowAmountInUsd'] / 10 ** 18;
        let totalMarket = etherTotal + iuhCoinTotal +  etherTotalBorrow + iuhCoinTotalBorrow;
        let totalSupply = etherTotal + iuhCoinTotal;
        let totalBorrow = etherTotalBorrow + iuhCoinTotalBorrow;
        this.setState({etherPool: etherPool, iuhCoinPool: iuhCoinPool, etherTotal:etherTotal,iuhCoinTotal:iuhCoinTotal,etherTotalBorrow:etherTotalBorrow, iuhCoinTotalBorrow:iuhCoinTotalBorrow, totalMarket:totalMarket, totalSupply:totalSupply,totalBorrow:totalBorrow,connect: true})
    }
    constructor(props){
        super(props);
        this.state ={
            web3: null,
            iuhBank: null, 
            token: null,
            iuhBankAddress: null,
            account: null,
            etherPool: null,
            iuhCoinPool: null,
            etherTotal: null,
            iuhCoinTotal: null,
            etherTotalBorrow: null,
            iuhCoinTotalBorrow: null,
            totalBorrow: null,
            totalSupply: null,
            totalMarket: null,
            connect: false
        }
    }
    render(){
        console.log(this.state)
        return(
            <>
                {<HeaderMarket/>}
                {this.state.connect == true && <div>
                    <div className="top  text-light">
                    <Container id="dashboardTop">
                        <h2>Iuh Market</h2>
                        <div className="d-flex">
                            <div className="d-flex">
                                <div>
                                    <FaChartPie className="h-75 w-75"/>
                                </div>
                                <div style={{width: "150px", marginLeft: "10px"}}>
                                    <p className="m-0 p-0">Total market size</p>
                                    <h5>$ {this.state.totalMarket.toLocaleString()}</h5>
                                </div>
                            </div>
                            <div style={{paddingLeft: 30}} className="d-flex">
                                <div>
                                    <FaLongArrowAltUp className="h-75 w-75" />
                                </div>
                                <div style={{width: "150px", marginLeft: "10px"}}>
                                <p className="m-0 p-0" >Total avaliable</p>
                                <h5>$ {this.state.totalSupply.toLocaleString()}</h5>
                                </div>
                            </div>
                            <div style={{paddingLeft: 30}} className="d-flex">
                                <div>
                                    <FaLongArrowAltDown className="h-75 w-75" />
                                </div>
                                <div style={{width: "150px", marginLeft: "10px"}}>
                                <p className="m-0 p-0" >Total borrows</p>
                                <h5>$ {this.state.totalBorrow.toLocaleString()}</h5>
                                </div>
                            </div>
                        </div>  
                    </Container>
                </div>
                <Container>
                    <div className="bottom">
                        <div className="market">
                            <h5>Iuh assets</h5>
                            <table className="w-100">
                                <tr>
                                    <td>Asset</td>
                                    <td>Price</td>
                                    <td>Total Supplied</td>
                                    <td>Supply APB</td>
                                    <td>Total borrowed</td>
                                    <td>Borrow APB</td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td>
                                        <span className="h6 m-1">Ether</span>
                                    </td>
                                    <td>
                                        <h6>$ {(this.state.etherPool['price'])}</h6>
                                    </td>
                                    <td>
                                        <h6>{(this.state.etherPool['totalAmount'] / 10 ** 18).toLocaleString()}</h6>
                                        <p>$ {this.state.etherTotal}</p>
                                    </td>
                                    <td> 
                                        <h6>{this.state.etherPool['lendRate'] / 100}%</h6>
                                    </td>
                                    <td>
                                         <h6>{(this.state.etherPool['borrowAmount'] / 10 ** 18).toLocaleString()}</h6>
                                        <p>$ {this.state.etherTotalBorrow}</p>
                                    </td>
                                    <td>
                                        <h6>{this.state.etherPool['borrowRate'] / 100}%</h6>
                                    </td>
                                    <td>
                                        <a>      <Button variant="outline-secondary">Detail</Button>{' '}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <span className="h6 m-1">IuhCoin</span>
                                    </td>
                                    <td>
                                        <h6>$ {(this.state.iuhCoinPool  ['price'])}</h6>
                                    </td>
                                    <td>
                                        <h6>{(this.state.iuhCoinPool['totalAmount'] / 10 ** 18).toLocaleString()}</h6>
                                        <p>$ {this.state.iuhCoinTotal}</p>
                                    </td>
                                    
                                    <td> 
                                        <h6>{this.state.iuhCoinPool['lendRate'] / 100}%</h6>
                                    </td>
                                    <td>
                                         <h6>{(this.state.iuhCoinPool['borrowAmount'] / 10 ** 18).toLocaleString()}</h6>
                                        <p>$ {this.state.iuhCoinTotalBorrow}</p>
                                    </td>
                                    <td>
                                        <h6>{this.state.iuhCoinPool['borrowRate'] / 100}%</h6>
                                    </td>
                                    <td>
                                        <a><Button variant="outline-secondary">Detail</Button>{' '}</a>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </Container></div>}
            </>
        )
    }
}