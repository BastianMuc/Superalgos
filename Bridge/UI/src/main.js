import { createApp } from 'vue'
import './style.css'
import { ethers } from 'ethers'
import { zksync } from 'zksync-web3'
import App from './App.vue'

const app = createApp(App)
app.provide('ethers', ethers)
app.provide('zksync', zksync)
app.mount('#app')

//createApp(App).mount('#app')

