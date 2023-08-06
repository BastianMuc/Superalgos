import { createApp } from 'vue'
import './style.css'
import { ethers } from 'ethers'
import App from './App.vue'

const app = createApp(App)
app.provide('ethers', ethers)
app.mount('#app')

//createApp(App).mount('#app')

