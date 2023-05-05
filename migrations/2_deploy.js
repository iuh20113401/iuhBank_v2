const Token = artifacts.require("iuhCoin");
const Oracle = artifacts.require("oracle");
const dBank = artifacts.require("iuhBank");
const ERC20 = artifacts.require("ERC20");
const loan = artifacts.require("LoanContract");

module.exports = async function(deployer) {
	//deploy Token
	await deployer.deploy(Token)
	await deployer.deploy(Oracle)

	//assign token into variable to get it's address
	const token = await Token.deployed()
	
	//pass token address for dBank contract(for future minting)
	await deployer.deploy(dBank,Oracle.address, token.address)
	await deployer.deploy(loan,token.address)
	//assign dBank contract into variable to get it's address
	const dbank = await dBank.deployed()

	//change token's owner/minter from deployer to dBank
	await token.passMinterRole(dbank.address)
};