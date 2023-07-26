<template>
    <div id="connector" align="right">
        {{ walletStatus }}
        <button v-on:click="connectWallet">{{ checkMetamask }}</button>
    </div>
</template>

<script>
import { ethers } from 'ethers'
export default {
    data() {
        return {
           walletStatus: '',
           connected: false,
           provider: undefined,
           signer: undefined
        }
    },
    computed: {
        checkMetamask() {
            if (typeof window.ethereum !== undefined && this.connected === false) {
                this.provider = new ethers.providers.Web3Provider(window.ethereum)
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
            const accounts = await this.provider.send('eth_requestAccounts', [])
            //const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
            this.walletStatus = accounts[0]
            this.signer = this.provider.getSigner()
            if (this.walletStatus !== undefined) { this.connected = true }
            return true
        }
    }
}
</script>
<style>
</style>