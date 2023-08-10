<template>
    <div id="connector" align="right">
        {{ walletStatus }}  
        <button v-on:click="connectWallet">{{ checkMetamask }}</button>
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
            <tr><td></td><td><select class="form-select" id="token" v-model="selectedToken" v-on:change="getBalance(this.tokenAddress[this.selectedToken][this.chainId])">
                <option value="SA">Superalgos (SA)</option>
                <option value="ETH">Ethereum (ETH)</option>
            </select></td><td></td></tr>
            <tr><td colspan=3><p></p></td></tr>
            <tr style="font-size:0.75vw;"><td></td><td><b>Balance: </b>{{ balance }} <a href="#" v-on:click="setMaxBalance" onclick="return false;">Max</a></td><td></td></tr>
            <tr><td></td><td><input class="form-input" v-model="bridgeBalance" v-on:input="checkAllowance"></td><td></td></tr>
            <tr><td colspan=3><p></p></td></tr>
            <tr><td></td><td><b v-if="allowedBalance !== 'NA'">Allowance: {{ allowedBalance }}</b></td><td></td></tr>
            <tr><td colspan=3><button>{{ getSubmitButtonLabel }}</button></td></tr>
        </table>
    </div>
</template>

<script>
export default {
    inject: ['ethers'],
    inject: ['zksync'],
    data() {
        return {
           walletStatus: '',
           connected: false,
           allowanceRequired: true,
           provider: {},
           signer: undefined,
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
                1: "ETH",
                5: "ETH",
                280: "0x000000000000000000000000000000000000800A",
                324: "0x000000000000000000000000000000000000800A"
            }
            },
            proxyContracts: {
                1: "0x57891966931Eb4Bb6FB81430E6cE0A03AAbDe063",
                5: "0x927DdFcc55164a59E0F33918D13a2D559bC10ce7",
                280: "0x00ff932A6d70E2B8f1Eb4919e1e09C1923E7e57b",
                324: "0x11f943b2c77b743AB90f4A0Ae7d5A4e7FCA3E102"
            },
            ABI: '[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"unpause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"account","type":"address"},{"name":"amount","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_value","type":"uint256"}],"name":"burn","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"paused","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_subtractedValue","type":"uint256"}],"name":"decreaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"listAddress","type":"address"},{"name":"isBlackListed","type":"bool"}],"name":"blackListAddress","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"pause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_addedValue","type":"uint256"}],"name":"increaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_name","type":"string"},{"name":"_symbol","type":"string"},{"name":"_decimals","type":"uint256"},{"name":"_supply","type":"uint256"},{"name":"tokenOwner","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"burner","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"blackListed","type":"address"},{"indexed":false,"name":"value","type":"bool"}],"name":"Blacklist","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]',
            balance: "loading...",
            selectedToken: "SA",
            bridgeBalance: '',
            allowedBalance: "loading..."
    
        }
    },
    computed: {
        checkMetamask() {
            if (typeof window.ethereum !== undefined && this.connected === false) {
                this.provider = new this.ethers.providers.Web3Provider(window.ethereum, "any")
                return 'Connect Wallet'
            } else if (this.connected === true) {
                return 'Disconnect'
            } else {
                return 'Install Metamask'
            }
        },
        getSubmitButtonLabel() {
            if (this.allowanceRequired) {
                return "Enable Bridge"
            } else {
                return "Bridge Now"
            }
        }
    },
    methods: {
        setMaxBalance() {
            this.bridgeBalance = this.balance
        },
        checkAllowance() {
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
                const accounts = await this.provider.send('eth_requestAccounts', [])
                //const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
                this.walletStatus = accounts[0]
                //this.signer = this.provider.getSigner()
                const network = await this.provider.getNetwork()
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
                    console.log("I am here!")
                    this.connected = true
                    this.provider.on("network", (newNetwork, oldNetwork) => {
                        if (oldNetwork) {
                            window.location.reload()
                        }
                    })
                    await this.getBalance(this.tokenAddress[this.selectedToken][this.chainId])
                }
            } else {
                this.provider = undefined
                this.walletStatus = ''
                this.connected = false
                this.chainId = 0
                
            }
        },
        async getBalance(token) {
            this.balance = "loading..."
            console.log("GetBalance fired - Token: " + token)
            let tempBalance
            if (token === "ETH" || token === '0x000000000000000000000000000000000000800A') {
                tempBalance = await this.provider.getBalance(this.walletStatus)
                this.allowedBalance = "NA"
                this.allowanceRequired = false
            } else {
                const erc20 = new this.ethers.Contract(token, this.ABI, this.provider)
                tempBalance = await erc20.balanceOf(this.walletStatus)
                this.getAllowance(token, this.walletStatus, this.proxyContracts[this.chainId])
            }
            this.balance = parseFloat(this.ethers.utils.formatEther(tempBalance))
            this.bridgeBalance = ''
        },
        async getAllowance(token, owner, spender) {
            const erc20 = new this.ethers.Contract(token, this.ABI, this.provider)
            let tempAllowedBalance = await erc20.allowance(owner, spender)
            this.allowedBalance = parseFloat(this.ethers.utils.formatEther(tempAllowedBalance))
        }
    }
}
</script>
<style>

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