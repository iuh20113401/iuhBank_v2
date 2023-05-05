import React from "react";
import HomePage from './homepage';
import Dashboard from './dashboard';
import Market from './market';
import {
    BrowserRouter as Router,
    Route,
    BrowserRouter
}from "react-router-dom"
import { Routes  } from 'react-router-dom'
import EtherDeposit from "./EtherDeposit";
import IuhCoinDeposit from "./iuhCoinDeposit";
import WithdrawEther from "./withdrawEther";
import WithdrawIuhCoin from "./withdrawIuhCoin";
import BorrowEther from "./borrowEther";
import RepayEther from "./repayEther";
import BorroIuhCoin from "./borrowIuhCoin";
import RepayIuhCoin from "./repayIuhCoin";
import PersonalLoan from "./notification";
import AccountInfo from "./AccountInfo";
function App ()  {
      return(
        <div>
        <Router>
          <Routes>
          <Route path ='/' element ={<HomePage/>}/>
          <Route path ='/home' element ={<Dashboard/>}/>
          <Route path ='/market' element ={<Market/>}/>
          <Route path ='/EtherDeposit' element ={<EtherDeposit/>}/>
          <Route path ='/IuhCoinDeposit' element ={<IuhCoinDeposit/>}/>
          <Route path ='/withdrawEther' element ={<WithdrawEther/>}/>
          <Route path ='/withdrawIuhCoin' element ={<WithdrawIuhCoin/>}/>
          <Route path ='/borrowEther' element ={<BorrowEther />}/>
          <Route path ='/borrowIuhCoin' element ={<BorroIuhCoin />}/>
          <Route path ='/repayEther' element ={<RepayEther />}/>
          <Route path ='/repayIuhCoin' element ={<RepayIuhCoin />}/>
          <Route path ='/PersonalLoan' element ={<PersonalLoan />}/>
          <Route path ='/AccountLoanInfo' element ={<AccountInfo />}/>

        </Routes>
        </Router>
        </div>
      )
}

export default App;
