<template>
    <div id="connector" align="right">
        {{ walletStatus }}
        <button disabled>{{ networkStatus }}</button>
        <button v-on:click="connectWallet">{{ checkMetamask }}</button>
    </div>
</template>

<script>
import { isProxy, markRaw, toRaw } from 'vue'
export default {
    inject: ['ethers'],
    data() {
        return {
           walletStatus: '',
           networkStatus: '',
           connected: false,
           provider: {},
           signer: undefined
        }
    },
    computed: {
        checkMetamask() {
            if (typeof window.ethereum !== undefined && this.connected === false) {
                this.provider = new this.ethers.providers.Web3Provider(window.ethereum, "any")
                this.provider.on("network", (newNetwork, oldNetwork) => {
                    if (oldNetwork) {
                        console.log("Event triggered!")
                        window.location.reload()
                    }
                })
                return 'Connect Wallet'
            } else if (this.connected === true) {
                return 'Disconnect'
            } else {
                return 'Install Metamask'
            }
        }
    },
    methods: {
        async connectWallet() {
            if (!this.connected) {
                const accounts = await this.provider.send('eth_requestAccounts', [])
                //const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
                this.walletStatus = accounts[0]
                //this.signer = this.provider.getSigner()
                const network = await this.provider.getNetwork()
                switch (network.chainId) {
                    case 1:
                        this.networkStatus = 'Ethereum'
                        break
                    case 5:
                        this.networkStatus = 'Goerli'
                        break
                    case 324:
                        this.networkStatus = 'zkSync Era'
                        break
                    case 280:
                        this.networkStatus = 'zkSync Era Testnet'
                        break
                    default:
                        this.networkStatus = 'Unsupported Network'
                }
                if (this.walletStatus !== undefined) { 
                    this.connected = true
                }
            } else {
                this.provider = undefined
                this.walletStatus = ''
                this.networkStatus = ''
                this.connected = false
            }
            return true
        }
    }
}
</script>
<style>
</style>