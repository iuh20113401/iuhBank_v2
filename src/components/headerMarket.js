import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Dropdown from 'react-bootstrap/Dropdown';
import { useState, useEffect } from 'react';
import iuh from "../iuh.png"
import Web3 from 'web3';
import iuhBank from '../abis/iuhBank.json';
import IuhCoin from '../abis/iuhCoin.json';
import Oracle from '../abis/Oracle.json';
import dai from "../dai.svg";

export default class HeaderMarket extends Component {
    async componentDidMount(){
        this.loadBlockchainData(this.props.dispatch);
    }
    async loadBlockchainData(dispatch) {
        if(typeof window.ethereum !== 'undefined'){
        const web3 = new Web3(window.ethereum)
        const netId = await web3.eth.net.getId()
        const accounts = await web3.eth.getAccounts()
        if(typeof accounts[0] !== 'undefined'){
            const balance = await web3.eth.getBalance(accounts[0])
            let account = accounts[0];
            account = account.substring(0, 6) + "......" +account.substring(account.length - 4, account.length);
            this.setState({account: account, balance: balance / 10 **18, web3: web3})
        }
            const iuhCoin = new web3.eth.Contract(IuhCoin.abi, IuhCoin.networks[netId].address)
            const IuhBank = new web3.eth.Contract(iuhBank.abi, iuhBank.networks[netId].address)
            const iuhBankAddress = iuhBank.networks[netId].address;
            this.setState({token: iuhCoin, iuhBank: IuhBank, iuhBankAddress: iuhBankAddress})
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
        }
    }
    render(){
        return(
            <>
                <Navbar  expand="lg"  sticky="top" className='text-light p-0' id='headerMarket'> 
                    <Container fluid className='row' >
                        <Navbar.Brand href="/" className='text-light'>
                            <img
                            alt=""
                            src= {iuh}
                            width="25"
                            height="25"
                            className="d-inline-block align-top"
                            />{' '}
                            <span className='h4 p-2'>IuhBank</span>
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="navbarScroll" />
                        <Navbar.Collapse id="navbarScroll" >
                            <Nav
                                className="me-auto my-2 my-lg-0 w-75 text-center row  text-lght justify-content-start"
                                style={{ maxHeight: '100px',justifyContent: 'center'}}
                                navbarScroll
                            >
                                <Nav.Link href="/home" className='col-3  m-auto text-light h6'>Dashboard</Nav.Link>
                                <Nav.Link href="/market" className='col-3 m-auto text-light h6'>Market</Nav.Link>
                                <Nav.Link href="/PersonalLoan" className='col-4 m-0 text-light h6'>Personal Loan</Nav.Link>
                            </Nav>
                            <div className="d-flex justify-content-end  w-100">
                                <Dropdown>
                                    <Dropdown.Toggle variant="dark m-0 p-1" id="dropdown-basic" className='btn border'>
                                        {this.state.account}
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        <Dropdown.Item href="/AccountLoanInfo">Account loan infor</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>   
            </>
        )
       }
}