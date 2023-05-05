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
import { truncate } from "fs";

export default class AccountInfo extends Component{
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
            await this.getInfoLoans();
            await this.check();
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
            if(TotalLoan[index]["owner"] == this.state.account){
                this.setState({TotalLoan: [...this.state.TotalLoan,TotalLoan[index]]});
            }
            if(TotalLoan[index]["borrower"] == this.state.account){
                let amount = TotalLoan[index]['amount'];
                let ineterest = TotalLoan[index]['interestRate'];
                TotalLoan[index]['amountInterest'] = parseInt(amount) + ((parseInt(amount) * parseInt(ineterest)) / 10000);
                this.setState({TotalBorrow: [...this.state.TotalBorrow,TotalLoan[index]]});
            }
        }
        
    }
    async check(){
        let check = [];
        let checkBorrow = [];
        for (let index = 0; index < this.state.TotalLoan.length; index++) {
            check[index] = await this.state.LoanContract.methods.check(index).call({from: this.state.account});
        }
        for (let index = 0; index < this.state.TotalBorrow.length; index++) {
            let checkIndex = this.state.TotalBorrow[index]['index'];
            checkBorrow[checkIndex] = await this.state.LoanContract.methods.check(checkIndex).call({from: this.state.account});
        }
        console.log( await this.state.LoanContract.methods.check(1).call({from: this.state.account}))
        this.setState({check: check});
        this.setState({checkBorrow: checkBorrow});
    }
    async displayString(str) {
        const prefix = str.substring(0, 6);
        const suffix = str.substring(str.length - 4, str.length);
    }

    async borrow(index){
        this.setState({borrowState: index});
    }
    async Approve(amount){
        try {
            await this.state.token.methods.approve(this.state.LoanContractAddress, (amount).toString()).send({from: this.state.account});
            this.handleNextTab();
        } catch (error) {
            console.log(error);
        }
    }
    async widthDraw(id){
        try {
            await this.state.LoanContract.methods.widthdraw(id).send({from: this.state.account});
            window.location.reload();
        } catch (error) {
            console.log(error)
        }
    }
    async cancelLoan(id){
        try {
            await this.state.LoanContract.methods.cancelLoan(id).send({from: this.state.account});
            window.location.reload();
        } catch (error) {
            console.log(error)
        }
    }
    async repayLoanByEther(id, amount){
        try {
            await this.state.LoanContract.methods.repayLoanByEther(id).send({from: this.state.account, value: amount.toString()});
            window.location.reload();
        } catch (error) {
            console.log(error)
        }
    }
    async repayLoanByIuhCoin(id, amount){
        try {
            await this.state.LoanContract.methods.repayLoanByIuhCoin(id, amount.toString()).send({from: this.state.account});
            window.location.reload();
        } catch (error) {
            console.log(error)
        }
    }
    
    constructor(props){
        super(props);
        this.state= {
            web3: null,
            token:null,
            LoanContract: null,
            LoanContractAddress:null,
            TotalLoan: [],
            TotalBorrow: [],
            check: [],
            checkBorrow: [],
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
        setInterval(() => {
            this.check();
        }, 5000);
        return(
            <>
                <div>
                    <HeaderMarket/>
                </div>
                <Container className="border p-4 d-flex">
                    <div className="w-50">
                    <h4 className="bg-secondary p-3">Lend</h4>
                        {this.state.TotalLoan != [] && <div className="deposti">
                            {this.state.TotalLoan.map((loan) => (
                                <div>
                                    {(loan.borrowed == true && this.state.check[loan.index] && loan.returned == false) && <div>
                                        <Card>
                                        <Card.Header className="bg-danger">Over time</Card.Header>
                                        <Card.Body>
                                            <Card.Title>Borrower: {loan.borrower}</Card.Title>
                                            <Card.Text>
                                            <Table className="table m-auto w-50 borderless " borderless>
                                                <tr>
                                                    <td><Form.Label htmlFor="disabledTextInput">Amount to borrow: </Form.Label></td>
                                                    <td><Form.Label>{ loan.amount / 10 ** 18} {loan.token}</Form.Label></td>
                                                </tr>
                                                <tr>
                                                    <td><Form.Label htmlFor="disabledTextInput">Amount to deposit: </Form.Label></td>
                                                    <td><Form.Label>{ loan.deposit / 10 ** 18} {loan.tokenCollateral}</Form.Label></td>
                                                </tr>
                                                <tr>
                                                    <td><Form.Label htmlFor="disabledTextInput">Interest: </Form.Label></td>
                                                    <td><Form.Label>{loan.interestRate / 100 } %</Form.Label></td>
                                                </tr>
                                                <tr>
                                                    <td><Form.Label htmlFor="disabledTextInput">Duration: </Form.Label></td>
                                                    <td><Form.Label>{loan.loanDuration} Seconds</Form.Label></td>
                                                </tr>

                                            </Table>
                                            </Card.Text>
                                            <Card.Footer className="text-center">
                                                    <Button variant="primary" className="m-auto" onClick={(e) =>{
                                                        e.preventDefault();
                                                        this.cancelLoan(loan.index);
                                                    }}>WidthDraw collateral</Button>
                                            </Card.Footer>
                                        </Card.Body>
                                        </Card>
                                        
                                    </div>}
                                    {(loan.borrowed == false && loan.closed == true) && <div>
                                        <Card>
                                        <Card.Header className="bg-light">Aldready widthdraw</Card.Header>
                                        <Card.Body>
                                            <Card.Text>
                                            <Table className="table m-auto w-50 borderless " borderless>
                                                <tr>
                                                    <td><Form.Label htmlFor="disabledTextInput">Amount to borrow: </Form.Label></td>
                                                    <td><Form.Label>{ loan.amount / 10 ** 18} {loan.token}</Form.Label></td>
                                                </tr>
                                                <tr>
                                                    <td><Form.Label htmlFor="disabledTextInput">Amount to deposit: </Form.Label></td>
                                                    <td><Form.Label>{ loan.deposit / 10 ** 18} {loan.tokenCollateral}</Form.Label></td>
                                                </tr>
                                                <tr>
                                                    <td><Form.Label htmlFor="disabledTextInput">Interest: </Form.Label></td>
                                                    <td><Form.Label>{loan.interestRate/ 100 } %</Form.Label></td>
                                                </tr>
                                                <tr>
                                                    <td><Form.Label htmlFor="disabledTextInput">Duration: </Form.Label></td>
                                                    <td><Form.Label>{loan.loanDuration} Seconds</Form.Label></td>
                                                </tr>

                                            </Table>
                                            </Card.Text>
                                        </Card.Body>
                                        </Card>
                                    </div>}

                                    {(loan.borrowed == true && loan.returned == true) && <div>
                                        <Card>
                                        <Card.Header className="bg-primry">Returned </Card.Header>
                                        <Card.Body>
                                            <Card.Title>Borrower: {loan.borrower}</Card.Title>
                                            <Card.Text>
                                            <Table className="table m-auto w-50 borderless " borderless>
                                                <tr>
                                                    <td><Form.Label htmlFor="disabledTextInput">Amount to borrow: </Form.Label></td>
                                                    <td><Form.Label>{ loan.amount / 10 ** 18} {loan.token}</Form.Label></td>
                                                </tr>
                                                <tr>
                                                    <td><Form.Label htmlFor="disabledTextInput">Amount to deposit: </Form.Label></td>
                                                    <td><Form.Label>{ loan.deposit / 10 ** 18} {loan.tokenCollateral}</Form.Label></td>
                                                </tr>
                                                <tr>
                                                    <td><Form.Label htmlFor="disabledTextInput">Interest: </Form.Label></td>
                                                    <td><Form.Label>{loan.interestRate/ 100 } %</Form.Label></td>
                                                </tr>
                                                <tr>
                                                    <td><Form.Label htmlFor="disabledTextInput">Duration: </Form.Label></td>
                                                    <td><Form.Label>{loan.loanDuration} Seconds</Form.Label></td>
                                                </tr>

                                            </Table>
                                            </Card.Text>
                                        </Card.Body>
                                        </Card>
                                    </div>}

                                    {(loan.borrowed == false && loan.closed == false) && <div>
                                        <Card>
                                        <Card.Header className="bg-secondary">Don't borrow</Card.Header>
                                        <Card.Body>
                                            <Card.Title>Borrower: {loan.borrower}</Card.Title>
                                            <Card.Text>
                                            <Table className="table m-auto w-50 borderless " borderless>
                                                <tr>
                                                    <td><Form.Label htmlFor="disabledTextInput">Amount to borrow: </Form.Label></td>
                                                    <td><Form.Label>{ loan.amount / 10 ** 18} {loan.token}</Form.Label></td>
                                                </tr>
                                                <tr>
                                                    <td><Form.Label htmlFor="disabledTextInput">Amount to deposit: </Form.Label></td>
                                                    <td><Form.Label>{ loan.deposit / 10 ** 18} {loan.tokenCollateral}</Form.Label></td>
                                                </tr>
                                                <tr>
                                                    <td><Form.Label htmlFor="disabledTextInput">Interest: </Form.Label></td>
                                                    <td><Form.Label>{loan.interestRate/ 100 } %</Form.Label></td>
                                                </tr>
                                                <tr>
                                                    <td><Form.Label htmlFor="disabledTextInput">Duration: </Form.Label></td>
                                                    <td><Form.Label>{loan.loanDuration} Seconds</Form.Label></td>
                                                </tr>

                                            </Table>
                                            </Card.Text>
                                            <Card.Footer className="text-center">
                                                    <Button variant="primary" className="m-auto" onClick={(e) =>{
                                                        e.preventDefault();
                                                        this.widthDraw(loan.index);
                                                    }}>WidthDraw token</Button>
                                            </Card.Footer>
                                        </Card.Body>
                                        </Card>
                                    </div>}
                                </div>
                            ))}
                    </div>}
                    </div>
                    {/* borrow */}
                    <div style={{width: "49%",marginLeft: "30px"}}>
                        <h4 className="bg-secondary p-3">Borrow</h4>
                        {this.state.TotalBorrow != [] && <div className="deposti">
                            {this.state.TotalBorrow.map((loan) => (
                                <div>

                                    {(this.state.checkBorrow[loan.index] == true && loan.returned == false) && <div>
                                        <Card>
                                        <Card.Header className="bg-danger">Over time</Card.Header>
                                        <Card.Body>
                                            <Card.Title>Borrower: {loan.borrower}</Card.Title>
                                            <Card.Text>
                                            <Table className="table m-auto w-50 borderless " borderless>
                                                <tr>
                                                    <td><Form.Label htmlFor="disabledTextInput">Amount to borrow: </Form.Label></td>
                                                    <td><Form.Label>{ loan.amount / 10 ** 18} {loan.token}</Form.Label></td>
                                                </tr>
                                                <tr>
                                                    <td><Form.Label htmlFor="disabledTextInput">Amount to deposit: </Form.Label></td>
                                                    <td><Form.Label>{ loan.deposit / 10 ** 18} {loan.tokenCollateral}</Form.Label></td>
                                                </tr>
                                                <tr>
                                                    <td><Form.Label htmlFor="disabledTextInput">Interest: </Form.Label></td>
                                                    <td><Form.Label>{loan.interestRate/ 100 } %</Form.Label></td>
                                                </tr>
                                                <tr>
                                                    <td><Form.Label htmlFor="disabledTextInput">Duration: </Form.Label></td>
                                                    <td><Form.Label>{loan.loanDuration} Seconds</Form.Label></td>
                                                </tr>
                                                <tr>
                                                    <td><Form.Label htmlFor="disabledTextInput">Amount to Repay: </Form.Label></td>
                                                    <td><Form.Label>{loan.amountInterest / 10 ** 18}{loan.token}</Form.Label></td>
                                                </tr>

                                            </Table>
                                            </Card.Text>
                                            <Card.Footer className="text-center">
                                                    <Button variant="primary" className="m-auto" onClick={(e) =>{
                                                        e.preventDefault();
                                                        this.cancelLoan(loan.index);
                                                    }} disabled>Repay</Button>
                                            </Card.Footer>
                                        </Card.Body>
                                        </Card>
                                        
                                    </div>}
                                    {(this.state.checkBorrow[loan.index] == false && loan.returned == false) && <div>
                                        <Card>
                                        <Card.Header className="bg-primary">Borrow</Card.Header>
                                        <Card.Body>
                                            <Card.Title>Borrower: {loan.borrower}</Card.Title>
                                            <Card.Text>
                                            <Table className="table m-auto w-50 borderless " borderless>
                                                <tr>
                                                    <td><Form.Label htmlFor="disabledTextInput">Amount to borrow: </Form.Label></td>
                                                    <td><Form.Label>{ loan.amount / 10 ** 18} {loan.token}</Form.Label></td>
                                                </tr>
                                                <tr>
                                                    <td><Form.Label htmlFor="disabledTextInput">Amount to deposit: </Form.Label></td>
                                                    <td><Form.Label>{ loan.deposit / 10 ** 18} {loan.tokenCollateral}</Form.Label></td>
                                                </tr>
                                                <tr>
                                                    <td><Form.Label htmlFor="disabledTextInput">Interest: </Form.Label></td>
                                                    <td><Form.Label>{loan.interestRate/ 100 } %</Form.Label></td>
                                                </tr>
                                                <tr>
                                                    <td><Form.Label htmlFor="disabledTextInput">Duration: </Form.Label></td>
                                                    <td><Form.Label>{loan.loanDuration} Seconds</Form.Label></td>
                                                </tr>
                                                <tr>
                                                    <td><Form.Label htmlFor="disabledTextInput">Amount to Repay: </Form.Label></td>
                                                    <td><Form.Label>{loan.amountInterest / 10 ** 18} {loan.token}</Form.Label></td>
                                                </tr>

                                            </Table>
                                            </Card.Text>
                                            <Card.Footer className="text-center">
                                                    {loan.token  == "IuhCoin" && <Button variant="primary" className="m-auto" onClick={(e) =>{
                                                        e.preventDefault();
                                                        this.Approve(loan.amountInterest);
                                                    }}>Approve</Button>}
                                                    <Button variant="primary" className="m-auto" onClick={(e) =>{
                                                        e.preventDefault();
                                                        let token = loan.token;
                                                        if(token == "IuhCoin"){
                                                            this.repayLoanByIuhCoin(loan.index,loan.amountInterest);
                                                        }else{
                                                            this.repayLoanByEther(loan.index,loan.amountInterest)
                                                        }
                                                    }}>Repay</Button>
                                            </Card.Footer>
                                        </Card.Body>
                                        </Card>
                                        
                                    </div>}
                                    {(loan.returned == true) && <div>
                                        <Card>
                                        <Card.Header className="bg-primary">Repayed</Card.Header>
                                        <Card.Body>
                                            <Card.Title>Borrower: {loan.owner}</Card.Title>
                                            <Card.Text>
                                            <Table className="table m-auto w-50 borderless " borderless>
                                                <tr>
                                                    <td><Form.Label htmlFor="disabledTextInput">Amount to borrow: </Form.Label></td>
                                                    <td><Form.Label>{ loan.amount / 10 ** 18} {loan.token}</Form.Label></td>
                                                </tr>
                                                <tr>
                                                    <td><Form.Label htmlFor="disabledTextInput">Amount to deposit: </Form.Label></td>
                                                    <td><Form.Label>{ loan.deposit / 10 ** 18} {loan.tokenCollateral}</Form.Label></td>
                                                </tr>
                                                <tr>
                                                    <td><Form.Label htmlFor="disabledTextInput">Interest: </Form.Label></td>
                                                    <td><Form.Label>{loan.interestRate/ 100 } %</Form.Label></td>
                                                </tr>
                                                <tr>
                                                    <td><Form.Label htmlFor="disabledTextInput">Duration: </Form.Label></td>
                                                    <td><Form.Label>{loan.loanDuration} Seconds</Form.Label></td>
                                                </tr>
                                                <tr>
                                                    <td><Form.Label htmlFor="disabledTextInput">Amount to Repay: </Form.Label></td>
                                                    <td><Form.Label>{loan.amountInterest / 10 ** 18} {loan.token}</Form.Label></td>
                                                </tr>

                                            </Table>
                                            </Card.Text>
                                        
                                        </Card.Body>
                                        </Card>
                                        
                                    </div>}
                                </div>
                            ))}
                    </div>}
                    </div>
            </Container>
            </>
        )
    }
}