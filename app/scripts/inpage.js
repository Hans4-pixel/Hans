/*global Web3*/
cleanContextForImports()
require('web3/dist/web3.min')
const log = require('loglevel')
const LocalMessageDuplexStream = require('post-message-stream')
const setupDappAutoReload = require('./lib/auto-reload')
const MetamaskInpageProvider = require('./lib/inpage-provider')
restoreContextAfterImports()

log.setDefaultLevel(process.env.METAMASK_DEBUG ? 'debug' : 'warn')

//
// setup plugin communication
//

// setup background connection
const metamaskStream = new LocalMessageDuplexStream({
  name: 'inpage',
  target: 'contentscript',
})

// compose the inpage provider
const inpageProvider = new MetamaskInpageProvider(metamaskStream)

//
// setup web3
//

if (typeof window.web3 !== 'undefined') {
  throw new Error(`MetaMask detected another web3.
     MetaMask will not work reliably with another web3 extension.
     This usually happens if you have two MetaMasks installed,
     or MetaMask and another web3 extension. Please remove one
     and try again.`)
}
const web3 = new Web3(inpageProvider)
web3.setProvider = function () {
  log.debug('MetaMask - overrode web3.setProvider')
}
log.debug('MetaMask - injected web3')
// export global web3, with usage-detection
setupDappAutoReload(web3, inpageProvider.publicConfigStore)

// set web3 defaultAccount

inpageProvider.publicConfigStore.subscribe(function (state) {
  web3.eth.defaultAccount = state.selectedAddress
})

// clear subscriptions
function clearSubscriptions () {
  if (inpageProvider.subscriptions) {
    inpageProvider.sendAsync({
      jsonrpc: '2.0',
      method: 'eth_unsubscribe',
      params: inpageProvider.subscriptions,
    }, () => {
      console.log('cleared subscriptions')
    })
  }
}
window.onbeforeunload = clearSubscriptions

//
// util
//

// need to make sure we aren't affected by overlapping namespaces
// and that we dont affect the app with our namespace
// mostly a fix for web3's BigNumber if AMD's "define" is defined...
let __define

function cleanContextForImports () {
  __define = global.define
  try {
    global.define = undefined
  } catch (_) {
    console.warn('MetaMask - global.define could not be deleted.')
  }
}

function restoreContextAfterImports () {
  try {
    global.define = __define
  } catch (_) {
    console.warn('MetaMask - global.define could not be overwritten.')
  }
}
