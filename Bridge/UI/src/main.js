import { createApp } from 'vue'
import './style.css'
import { ethers } from 'ethers'
//import { zksync } from 'zksync-web3'
import { Contract, Web3Provider, Provider, L1Signer, utils } from 'zksync-web3'
import App from './App.vue'

const app = createApp(App)
app.provide('ethers', ethers)
//app.provide('zksync', zksync)
app.provide('Contract', Contract)
app.provide('Web3Provider', Web3Provider)
app.provide('Provider', Provider)
app.provide('L1Signer', L1Signer)
app.provide('utils', utils)
app.mount('#app')

//createApp(App).mount('#app')

