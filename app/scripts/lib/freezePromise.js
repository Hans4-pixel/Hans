
/**
 * Freezes the Promise global and prevents its reassignment.
 */
const deepFreeze = require('deep-freeze-strict')

Promise = deepFreeze(Promise)
const { value, enumerable } = Object.getOwnPropertyDescriptor(global, 'Promise')
Object.defineProperty(global, 'Promise', {
   value, enumerable, configurable: false, writable: false
})
