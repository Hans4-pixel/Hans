import { isValidAddress } from 'ethereumjs-util'
import contractMap from 'eth-contract-metadata'
import { checksumAddress } from '../app/helpers/utils/util'

let iconFactory

export default function iconFactoryGenerator(jazzicon) {
  return iconFactory || new IconFactory(jazzicon)
}

function IconFactory(jazzicon) {
  this.jazzicon = jazzicon
  this.cache = {}
}

IconFactory.prototype.iconForAddress = function (address, diameter) {
  const addr = checksumAddress(address)
  if (iconExistsFor(addr)) {
    return imageElFor(addr)
  }

  return this.generateIdenticonSvg(address, diameter)
}

// returns svg dom element
IconFactory.prototype.generateIdenticonSvg = function (address, diameter) {
  const cacheId = `${address}:${diameter}`
  // check cache, lazily generate and populate cache
  const identicon =
    this.cache[cacheId] ||
    (this.cache[cacheId] = this.generateNewIdenticon(address, diameter))
  // create a clean copy so you can modify it
  const cleanCopy = identicon.cloneNode(true)
  return cleanCopy
}

// creates a new identicon
IconFactory.prototype.generateNewIdenticon = function (address, diameter) {
  const numericRepresentation = jsNumberForAddress(address)
  const identicon = this.jazzicon(diameter, numericRepresentation)
  return identicon
}

// util

function iconExistsFor(address) {
  return contractMap[address]?.logo && isValidAddress(address)
}

function imageElFor(address) {
  const contract = contractMap[address]
  const fileName = contract.logo
  const path = `images/contract/${fileName}`
  const img = document.createElement('img')
  img.src = path
  img.style.width = '100%'
  return img
}

function jsNumberForAddress(address) {
  const addr = address.slice(2, 10)
  const seed = parseInt(addr, 16)
  return seed
}
