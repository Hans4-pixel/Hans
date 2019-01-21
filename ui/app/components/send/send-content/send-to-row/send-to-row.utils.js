const {
  REQUIRED_ERROR,
  INVALID_RECIPIENT_ADDRESS_ERROR,
  KNOWN_RECIPIENT_ADDRESS_ERROR,
} = require('../../send.constants')
const { isValidAddress } = require('../../../../util')
const ethUtil = require('ethereumjs-util')
const contractMap = require('eth-contract-metadata')

function getToErrorObject (to, toError = null, hasHexData = false) {
  if (!to) {
    if (!hasHexData) {
      toError = REQUIRED_ERROR
    }
  } else if (!isValidAddress(to) && !toError) {
    toError = INVALID_RECIPIENT_ADDRESS_ERROR
  } else if (ethUtil.toChecksumAddress(to) in contractMap) {
    toError = KNOWN_RECIPIENT_ADDRESS_ERROR
  }

  return { to: toError }
}

module.exports = {
  getToErrorObject,
}
