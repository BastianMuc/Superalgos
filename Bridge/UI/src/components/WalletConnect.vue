<template>
    <div class="content">
        <div id="connector" align="right">
            {{ walletStatus }}  
            <button v-on:click="connectWallet" :disabled="checkMetamask === 'Install Metamask'">{{ checkMetamask }}</button>
        </div>
        <div>
            <h1>Superalgos Bridge</h1>
        </div>
        <div v-if="connected === false">
            Connect your wallet to continue.
        </div>
        <div v-else-if="chains[chainId] === undefined">
            Please connect to a supported network. This Bridge supports Ethereum and zySync Era.
        </div>
        <div v-else>
            <table border="0" align="center" width="25%">
                <tr style="font-size:0.75vw;"><td></td><td><b>Bridge From</b></td><td></td></tr>
                <tr><td></td><td>{{ chains[chainId] }}</td><td></td></tr>
                <tr><td></td><td><img src="../assets/arrow-down-circle.svg"></td><td></td></tr>
                <tr style="font-size:0.75vw;"><td></td><td><b>Bridge To</b></td><td></td></tr>
                <tr><td></td><td>{{ chains[destChain] }}</td><td></td></tr>
                <tr><td colspan=3><p></p></td></tr>
                <tr style="font-size:0.75vw;"><td></td><td><b>Token to be bridged</b></td><td></td></tr>
                <tr><td></td><td><select :disabled="inProgress === true" class="form-select" id="token" v-model="selectedToken" v-on:change="getBalance(this.tokenAddress[this.selectedToken][this.chainId])">
                    <option value="SA">Superalgos (SA)</option>
                    <option value="ETH">Ethereum (ETH)</option>
                </select></td><td></td></tr>
                <tr><td colspan=3><p></p></td></tr>
                <tr style="font-size:0.75vw;"><td></td><td><b>Balance: </b>{{ balance }} <a href="#" v-on:click="setMaxBalance" onclick="return false;">Max</a></td><td></td></tr>
                <tr><td></td><td><input :disabled="inProgress === true" class="form-input" v-model="bridgeBalance" v-on:input="checkAllowance"></td><td></td></tr>
                <tr><td colspan=3><p></p></td></tr>
                <tr><td></td><td><b v-if="allowedBalance !== 'NA'">Allowance: {{ allowedBalance }}</b></td><td></td></tr>
                <tr><td colspan=3><b style="color:red;">{{ errorText }}</b></td></tr>
                <tr><td colspan=3><button :disabled="isButtonDisabled === true" v-on:click="getAction">{{ getSubmitButtonLabel }}</button></td></tr>
            </table>
            <p><br/></p>

            <div v-if="statusText !== ''" style="width: 50%; margin: auto; border:1px solid white; border-radius:10px;" >
                <p style="font-size:0.75vw;"><b>Transaction status:</b></p>
                <div v-html="statusText" style="font-size:0.66vw;"></div>
            </div>
        </div>
    </div>
</template>

<script>
let provider
let signer
let zksProvider
import { markRaw } from 'vue'
export default {
    inject: ['ethers', 'Contract', 'Web3Provider', 'Provider', 'L1Signer', 'utils'],
    data() {
        return {
           walletStatus: '',
           connected: false,
           allowanceRequired: true,
           inProgress: false,
           //provider: {},
           //zksProvider: {},
           //signer: undefined,
           chainId: 0,
           destChain: 0,
           chains: {
            1: "Ethereum",
            5: "Goerli",
            280: "zkSync Era Testnet",
            324: "zkSync Era"
           },
           tokens: {
            "SA": "Superalgos",
            "ETH": "Ethereum"
           },
           tokenAddress: {
            "SA": {
                1: "0xc17272C3e15074C55b810bCebA02ba0C4481cd79",
                5: "0x8aE982180b1D3e5Ef4dAe4fc17B51ca485d5888D",
                280: "0xD0d62F64CC9763c01a094359E49ab59cAFF968D9",
                324: "0xe3d85Bd3363B6f0F91351591f9a8fD0d0a1145Ed"
            },
            "ETH": {
                1: "0x0000000000000000000000000000000000000000",
                5: "0x0000000000000000000000000000000000000000",
                280: "0x000000000000000000000000000000000000800A",
                324: "0x000000000000000000000000000000000000800A"
            }
            },
            proxyContracts: {},
            scanURL: {
                1: "https://etherscan.io/tx/",
                5: "https://goerli.etherscan.io/tx/",
                280: "https://goerli.explorer.zksync.io/tx/",
                324: "https://explorer.zksync.io/tx/"
            },
            ABI: '[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"unpause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"account","type":"address"},{"name":"amount","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_value","type":"uint256"}],"name":"burn","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"paused","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_subtractedValue","type":"uint256"}],"name":"decreaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"listAddress","type":"address"},{"name":"isBlackListed","type":"bool"}],"name":"blackListAddress","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"pause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_addedValue","type":"uint256"}],"name":"increaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_name","type":"string"},{"name":"_symbol","type":"string"},{"name":"_decimals","type":"uint256"},{"name":"_supply","type":"uint256"},{"name":"tokenOwner","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"burner","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"blackListed","type":"address"},{"indexed":false,"name":"value","type":"bool"}],"name":"Blacklist","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]',
            balance: "loading...",
            selectedToken: "SA",
            bridgeBalance: '',
            allowedBalance: "loading...",
            errorText: '',
            statusText: ''
    
        }
    },
    computed: {
        checkMetamask() {
            if (typeof window.ethereum !== 'undefined' && this.connected === false) {
                return 'Connect Wallet'
            } else if (this.connected === true) {
                return 'Disconnect'
            } else {
                return 'Install Metamask'
            }
        },
        getSubmitButtonLabel() {
            if (this.inProgress) {
                return "Working..."
            }
            else if (this.allowanceRequired) {
                return "Enable Bridge"
            } else {
                return "Bridge Now"
            }
        },
        isButtonDisabled() {
            // Block button if any blockchain transaction is pending
            if (this.inProgress) {
                return true
            }
            // Block button if field is empty or contains invalid value
            if (isNaN(this.bridgeBalance) || this.bridgeBalance === '' || parseFloat(this.bridgeBalance) === 0) {
                return true
            }
            // Block button if loading of balances is not yet complete
            if (isNaN(this.allowedBalance)) {
                return true
            }
            // Block button for bridging transactions when entry is smaller than balance
            if (!this.allowanceRequired && this.balance < this.bridgeBalance) {
                return true
            } else {
                return false
            }
        }
    },
    methods: {
        setMaxBalance() {
            if (!this.inProgress) {
                this.bridgeBalance = this.balance
            }
        },
        checkAllowance() {
            this.errorText = ''
            this.statusText = ''
            if (this.selectedToken === "ETH") {
                this.allowanceRequired = false
            } else if (this.bridgeBalance !== '' && !isNaN(this.bridgeBalance) && !isNaN(this.allowedBalance) && this.bridgeBalance <= this.allowedBalance) {
                this.allowanceRequired = false
            } else {
                this.allowanceRequired = true
            }
        },
        async connectWallet() {
            if (!this.connected) {
                provider = new this.ethers.providers.Web3Provider(window.ethereum, "any")
                //provider = new this.Web3Provider(window.ethereum, "any")
                const accounts = await provider.send('eth_requestAccounts', [])
                this.walletStatus = accounts[0]

                const network = await provider.getNetwork()
                if (this.chains[network.chainId] !== undefined) {
                    this.chainId = network.chainId
                    this.srcChainLabel = this.chains[this.chainId]
                    switch (this.chainId) {
                        case 1:
                            this.destChain = 324
                            break
                        case 5:
                            this.destChain = 280
                            break
                        case 280:
                            this.destChain = 5
                            break
                        case 324:
                            this.destChain = 1
                            break
                        default:
                            this.destChain = 0
                    }   
                } else {
                    this.chainId = 0
                }
                if (this.walletStatus !== undefined) { 
                    this.connected = true
                    provider.on("network", (newNetwork, oldNetwork) => {
                        if (oldNetwork) {
                            window.location.reload()
                        }
                    })
                    window.ethereum.on("accountsChanged", function(accounts) {
                        console.log("Accounts changed!")
                        window.location.reload()
                    })

                    // Determine zkSync Provider, depending on Testnet or Mainnet
                    if (this.chainId === 1 || this.chainId === 324) {
                        zksProvider = new this.Provider('https://mainnet.era.zksync.io')
                    } else if (this.chainId === 5 || this.chainId === 280) {
                        zksProvider = new this.Provider('https://testnet.era.zksync.dev')
                    }

                    // Determine Signer
                    signer = provider.getSigner();
                    //this.signer = this.L1Signer.from(this.provider.getSigner(), this.zksProvider)

                    // Determine Bridge Contracts, depending on Testnet or Mainnet
                    let bridgeContracts = await zksProvider.getDefaultBridgeAddresses()
                    if (bridgeContracts === undefined) {
                        console.log("ERROR loading zkSync Bridge Contract Addresses")
                    }
                    if (this.chainId === 1 || this.chainId === 324) {
                        this.proxyContracts = {
                            1: bridgeContracts.erc20L1,
                            324: bridgeContracts.erc20L2
                        }
                    } else if (this.chainId === 5 || this.chainId === 280) {
                        this.proxyContracts = {
                            5: bridgeContracts.erc20L1,
                            280: bridgeContracts.erc20L2
                        }
                    }
                    await this.getBalance(this.tokenAddress[this.selectedToken][this.chainId])
                }
            } else {
                provider = undefined
                zksProvider = undefined
                signer = undefined
                this.proxyContracts = undefined
                this.walletStatus = ''
                this.connected = false
                this.chainId = 0
                
            }
        },
        async getBalance(token) {
            this.balance = "loading..."
            let tempBalance
            if (token === "0x0000000000000000000000000000000000000000" || token === '0x000000000000000000000000000000000000800A') {
                tempBalance = await provider.getBalance(this.walletStatus)
                this.allowedBalance = "NA"
                this.allowanceRequired = false
            } else {
                const erc20 = new this.ethers.Contract(token, this.ABI, provider)
                tempBalance = await erc20.balanceOf(this.walletStatus)
                this.getAllowance(token, this.walletStatus, this.proxyContracts[this.chainId])
            }
            this.balance = parseFloat(this.ethers.utils.formatEther(tempBalance))
        },
        async getAllowance(token, owner, spender) {
            const erc20 = new this.ethers.Contract(token, this.ABI, provider)
            let tempAllowedBalance = await erc20.allowance(owner, spender)
            this.allowedBalance = parseFloat(this.ethers.utils.formatEther(tempAllowedBalance))
        },
        getAction() {
            this.inProgress = true
            this.errorText = ''
            this.statusText = ''
            if (this.allowanceRequired) {
                this.executeAllowance()
            } else {
                if ((this.chainId === 1 || this.chainId === 5)) {
                    this.executeDeposit()
                } else if (this.chainId === 280 || this.chainId === 324) {
                    this.executeWithdrawal()
                }
            }
        },
        async executeAllowance() {
            try {
                const amount = this.ethers.utils.parseEther(this.bridgeBalance)
                const erc20 = new this.Contract(this.tokenAddress["SA"][this.chainId], this.ABI, signer)
                let txHandle = await erc20.approve(this.proxyContracts[this.chainId], amount.toString())
                console.log(txHandle)
                if (txHandle.hash !== undefined) {
                    this.statusText = 'Transaction <a href="' + this.scanURL[this.chainId] + txHandle.hash + '" target="_blank">' + txHandle.hash + '</a> posted to blockchain, awaiting finalization...'
                }
                let receipt = await txHandle.wait()
                console.log(receipt)
                if (receipt.blockNumber !== undefined) {
                    this.statusText = 'Transaction <a href="' + this.scanURL[this.chainId] + txHandle.hash + '" target="_blank">' + txHandle.hash + '</a> successfully included in block ' + receipt.blockNumber
                } else {
                    this.statusText = 'Transaction <a href="' + this.scanURL[this.chainId] + txHandle.hash + '" target="_blank">' + txHandle.hash + '</a> finalized, please check status on Blockchain Explorer.'
                }
            } catch(err) {
                console.log("ERROR: ", err)
                if (err.code === 'ACTION_REJECTED') {
                    this.errorText = "Aborted: Transaction approval was denied."
                } else {
                    this.errorText = "Transaction not successful."
                }
            }
            this.inProgress = false
            this.getAllowance(this.tokenAddress[this.selectedToken][this.chainId], this.walletStatus, this.proxyContracts[this.chainId])
            this.checkAllowance()
        },
        async executeDeposit() {
            //this.provider = new this.Web3Provider(window.ethereum, "any")
            let signer = this.L1Signer.from(provider.getSigner(), zksProvider)
            //this.signer = this.provider.getSigner();
            const amount = this.ethers.utils.parseEther(this.bridgeBalance)
            try {
                let txHandle = await signer.deposit({
                    token: this.tokenAddress[this.selectedToken][this.chainId],
                    amount: amount.toString()
                })
                console.log(txHandle)
                if (txHandle.hash !== undefined) {
                    this.statusText = 'Transaction <a href="' + this.scanURL[this.chainId] + txHandle.hash + '" target="_blank">' + txHandle.hash + '</a> posted to blockchain, awaiting finalization...'
                }
                let receipt = await txHandle.waitL1Commit()
                console.log("L1 Commit complete")
                console.log(receipt)
                this.statusText = 'Transaction <a href="' + this.scanURL[this.chainId] + txHandle.hash + '" target="_blank">' + txHandle.hash + '</a> successfully included to L1 Block ' + receipt.blockNumber + '<br/>Awaiting L2 processing (this may take several minutes)...<br/><br/>'
                receipt = await txHandle.wait()
                console.log("Transaction fully completed")
                console.log(receipt)
                this.statusText = 'Transaction executed successfully.<br/><br/>'
                this.statusText += 'L1 transaction: <a href="' + this.scanURL[this.chainId] + txHandle.hash + '" target="_blank">' + txHandle.hash + '</a><br/>'
                this.statusText += 'L2 transaction: <a href="' + this.scanURL[this.destChain] + receipt.transactionHash + '" target="_blank">' + receipt.transactionHash + '</a><br/>'
            } catch(err) {
                console.log("ERROR: ", err)
                this.errorText = "Transaction not successful. Check the Javascript Console for details."
            }
            this.inProgress = false
        },
        async executeWithdrawal() {
            //provider = new this.Web3Provider(window.ethereum, "any")
            //let signer = this.L1Signer.from(provider.getSigner(), zksProvider)
            let signer = provider.getSigner();
            const bridgeABI = this.utils.L2_BRIDGE_ABI
            const amount = this.ethers.utils.parseEther(this.bridgeBalance)
            /*
            let tx = "0x85df71f3f855cd1efac85a13e4bd20ae3639680b8f269c72cf46016921a04911"
            console.log("DETAILS:")
            console.log(await provider.getTransactionDetails(tx))
            console.log("RECEIPT:")
            console.log(await provider.getTransactionReceipt(tx))
            console.log("STATUS:")
            console.log(await provider.getTransactionStatus(tx))
            console.log("FINALIZED: ")
            console.log(await signer.isWithdrawalFinalized(tx))
            */
        
            try {
                const bridge = new this.ethers.Contract(this.proxyContracts[this.chainId], bridgeABI, signer)
                let txHandle = await bridge.withdraw(
                    this.walletStatus,
                    this.tokenAddress[this.selectedToken][this.chainId],
                    amount.toString()
                )
                console.log(txHandle)
                if (txHandle.hash !== undefined) {
                    this.statusText = 'Transaction <a href="' + this.scanURL[this.chainId] + txHandle.hash + '" target="_blank">' + txHandle.hash + '</a> posted to blockchain, awaiting finalization...'
                }
                let receipt = await txHandle.wait()
                console.log("L2 Transaction complete")
                console.log(receipt)
                /*
                Waiting for finalization will only make sense once it's automatic and the 24h delay will have disappeared
                receipt = await txHandle.waitFinalize()
                */
                this.statusText = 'Withdrawal initiated successfully.<br/><br/>'
                this.statusText += 'L2 transaction: <a href="' + this.scanURL[this.chainId] + receipt.transactionHash + '" target="_blank">' + receipt.transactionHash + '</a><br/><br/>'
                this.statusText += 'Please note zkSync withdrawals require >24 hours for security reasons.<br/>'
                this.statusText += 'The current status can be monitored at <a href="https://portal.zksync.io/bridge/withdraw/" target="_blank">bridge.zksync.io</a>'
            } catch(err) {
                console.log("ERROR: ", err)
                this.errorText = "Transaction not successful. Check the Javascript Console for details."
            }
            this.inProgress = false
        },
    }
}
</script>
<style>
    .content {
        position: relative;
        margin-top: 25px;
    }

    .form-input {
        width: 100%;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;  
        box-sizing: border-box;
    }

    .form-select {
        width: 100%;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
        box-sizing: border-box;
    }

</style>