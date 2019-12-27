import JsonRpcEngine from 'json-rpc-engine'
import asMiddleware from 'json-rpc-engine/src/asMiddleware'
import ObservableStore from 'obs-store'
import log from 'loglevel'
import { CapabilitiesController as RpcCap } from 'rpc-cap'
import { ethErrors } from 'eth-json-rpc-errors'
import getRestrictedMethods from './restrictedMethods'
import createMethodMiddleware from './methodMiddleware'
import createLoggerMiddleware from './loggerMiddleware'

// Methods that do not require any permissions to use:
import SAFE_METHODS from './permissions-safe-methods.json'

// some constants
const METADATA_STORE_KEY = 'domainMetadata'
const LOG_STORE_KEY = 'permissionsLog'
const HISTORY_STORE_KEY = 'permissionsHistory'
const WALLET_METHOD_PREFIX = 'wallet_'
const ACCOUNTS_CHANGED_NOTIFICATION = 'wallet_accountsChanged'

export const CAVEAT_NAMES = {
  exposedAccounts: 'exposedAccounts',
}

export class PermissionsController {

  constructor (
    {
      platform, notifyDomain, notifyAllDomains, keyringController,
    } = {},
    restoredPermissions = {},
    restoredState = {}) {
    this.store = new ObservableStore({
      [METADATA_STORE_KEY]: restoredState[METADATA_STORE_KEY] || {},
      [LOG_STORE_KEY]: restoredState[LOG_STORE_KEY] || [],
      [HISTORY_STORE_KEY]: restoredState[HISTORY_STORE_KEY] || {},
    })
    this.notifyDomain = notifyDomain
    this.notifyAllDomains = notifyAllDomains
    this.keyringController = keyringController
    this._platform = platform
    this._restrictedMethods = getRestrictedMethods(this)
    this._initializePermissions(restoredPermissions)
  }

  createMiddleware ({ origin, extensionId }) {

    if (extensionId) {
      this.store.updateState({
        [METADATA_STORE_KEY]: {
          ...this.store.getState()[METADATA_STORE_KEY],
          [origin]: { extensionId },
        },
      })
    }

    const engine = new JsonRpcEngine()

    engine.push(createLoggerMiddleware({
      walletPrefix: WALLET_METHOD_PREFIX,
      restrictedMethods: Object.keys(this._restrictedMethods),
      ignoreMethods: [ 'wallet_sendDomainMetadata' ],
      store: this.store,
      logStoreKey: LOG_STORE_KEY,
      historyStoreKey: HISTORY_STORE_KEY,
    }))

    engine.push(createMethodMiddleware({
      store: this.store,
      storeKey: METADATA_STORE_KEY,
      getAccounts: this.getAccounts.bind(this, origin),
      requestAccountsPermission: this._requestPermissions.bind(
        this, origin, { eth_accounts: {} }
      ),
    }))

    engine.push(this.permissions.providerMiddlewareFunction.bind(
      this.permissions, { origin }
    ))
    return asMiddleware(engine)
  }

  /**
   * Returns the accounts that should be exposed for the given origin domain,
   * if any. This method exists for when a trusted context needs to know
   * which accounts are exposed to a given domain.
   *
   * @param {string} origin - The origin string.
   */
  getAccounts (origin) {
    return new Promise((resolve, _) => {

      const req = { method: 'eth_accounts' }
      const res = {}
      this.permissions.providerMiddlewareFunction(
        { origin }, req, res, () => {}, _end
      )

      function _end () {
        if (res.error || !Array.isArray(res.result)) {
          resolve([])
        } else {
          resolve(res.result)
        }
      }
    })
  }

  /**
   * Submits a permissions request to rpc-cap. Internal use only.
   *
   * @param {string} origin - The origin string.
   * @param {IRequestedPermissions} permissions - The requested permissions.
   */
  _requestPermissions (origin, permissions) {
    return new Promise((resolve, reject) => {

      const req = { method: 'wallet_requestPermissions', params: [permissions] }
      const res = {}
      this.permissions.providerMiddlewareFunction(
        { origin }, req, res, () => {}, _end
      )

      function _end (err) {
        if (err || res.error) {
          reject(err || res.error)
        } else {
          resolve(res.result)
        }
      }
    })
  }

  /**
   * User approval callback. The request can fail if the request is invalid.
   *
   * @param {object} approved - the approved request object
   * @param {Array} accounts - The accounts to expose, if any
   */
  async approvePermissionsRequest (approved, accounts) {

    const { id } = approved.metadata
    const approval = this.pendingApprovals[id]

    if (!approval) {
      log.warn(`Permissions request with id '${id}' not found`)
      return
    }

    try {

      // attempt to finalize the request and resolve it
      await this.finalizePermissionsRequest(approved.permissions, accounts)
      approval.resolve(approved.permissions)

    } catch (err) {

      // if finalization fails, reject the request
      approval.reject(ethErrors.rpc.invalidRequest({
        message: err.message, data: err,
      }))
    }

    delete this.pendingApprovals[id]
  }

  /**
   * User rejection callback.
   *
   * @param {string} id the id of the rejected request
   */
  async rejectPermissionsRequest (id) {
    const approval = this.pendingApprovals[id]

    if (!approval) {
      log.warn(`Permissions request with id '${id}' not found`)
      return
    }

    approval.reject(ethErrors.provider.userRejectedRequest())
    delete this.pendingApprovals[id]
  }

  /**
   * Grants the given origin the eth_accounts permission for the given account(s).
   * This method should ONLY be called as a result of direct user action in the UI,
   * with the intention of supporting legacy dapps that don't support EIP 1102.
   *
   * @param {string} origin - The origin to expose the account(s) to.
   * @param {Array<string>} accounts - The account(s) to expose.
   */
  async legacyExposeAccounts (origin, accounts) {

    const permissions = {
      eth_accounts: {},
    }

    await this.finalizePermissionsRequest(permissions, accounts)

    let error
    try {
      await new Promise((resolve, reject) => {
        this.permissions.grantNewPermissions(origin, permissions, {}, err => (err ? resolve() : reject(err)))
      })
    } catch (err) {
      error = err
    }

    if (error) {
      if (error.code === 4001) {
        throw error
      } else {
        throw ethErrors.rpc.internal({
          message: `Failed to add 'eth_accounts' to '${origin}'.`,
          data: {
            originalError: error,
            accounts,
          },
        })
      }
    }
  }

  /**
   * Update the accounts exposed to the given origin.
   * Throws error if the update fails.
   *
   * @param {string} origin - The origin to change the exposed accounts for.
   * @param {string[]} accounts - The new account(s) to expose.
   */
  async updateExposedAccounts (origin, accounts) {

    await this.validateExposedAccounts(accounts)

    this.permissions.updateCaveatFor(
      origin, 'eth_accounts', CAVEAT_NAMES.exposedAccounts, accounts
    )

    this.notifyDomain(origin, {
      method: ACCOUNTS_CHANGED_NOTIFICATION,
      result: accounts,
    })
  }

  /**
   * Finalizes a permissions request.
   * Throws if request validation fails.
   *
   * @param {Object} requestedPermissions - The requested permissions.
   * @param {string[]} accounts - The accounts to expose, if any.
   */
  async finalizePermissionsRequest (requestedPermissions, accounts) {

    const { eth_accounts: ethAccounts } = requestedPermissions

    if (ethAccounts) {

      await this.validateExposedAccounts(accounts)

      if (!ethAccounts.caveats) {
        ethAccounts.caveats = []
      }

      // caveat names are unique, and we will only construct this caveat here
      ethAccounts.caveats = ethAccounts.caveats.filter(c => (
        c.name !== CAVEAT_NAMES.exposedAccounts
      ))

      ethAccounts.caveats.push(
        {
          type: 'filterResponse',
          value: accounts,
          name: CAVEAT_NAMES.exposedAccounts,
        },
      )
    }
  }

  /**
   * Validate an array of accounts representing accounts to be exposed
   * to a domain. Throws error if validation fails.
   *
   * @param {string[]} accounts - An array of addresses.
   */
  async validateExposedAccounts (accounts) {

    if (!Array.isArray(accounts) || accounts.length === 0) {
      throw new Error('Must provide non-empty array of account(s).')
    }

    // assert accounts exist
    const allAccounts = await this.keyringController.getAccounts()
    accounts.forEach(acc => {
      if (!allAccounts.includes(acc)) {
        throw new Error(`Unknown account: ${acc}`)
      }
    })
  }

  /**
   * Removes the given permissions for the given domain.
   * @param {object} domains { origin: [permissions] }
   */
  removePermissionsFor (domains) {

    Object.entries(domains).forEach(([origin, perms]) => {

      this.permissions.removePermissionsFor(
        origin,
        perms.map(methodName => {

          if (methodName === 'eth_accounts') {
            this.notifyDomain(
              origin,
              { method: ACCOUNTS_CHANGED_NOTIFICATION, result: [] }
            )
          }

          return { parentCapability: methodName }
        })
      )
    })
  }

  /**
   * Removes all known domains and their related permissions.
   */
  clearPermissions () {
    this.permissions.clearDomains()
    this.notifyAllDomains({
      method: ACCOUNTS_CHANGED_NOTIFICATION,
      result: [],
    })
  }

  /**
   * A convenience method for retrieving a login object
   * or creating a new one if needed.
   *
   * @param {string} origin = The origin string representing the domain.
   */
  _initializePermissions (restoredState) {

    // these permission requests are almost certainly stale
    const initState = { ...restoredState, permissionsRequests: [] }

    this.pendingApprovals = {}

    this.permissions = new RpcCap({

      // Supports passthrough methods:
      safeMethods: SAFE_METHODS,

      // optional prefix for internal methods
      methodPrefix: WALLET_METHOD_PREFIX,

      restrictedMethods: this._restrictedMethods,

      /**
       * A promise-returning callback used to determine whether to approve
       * permissions requests or not.
       *
       * Currently only returns a boolean, but eventually should return any
       * specific parameters or amendments to the permissions.
       *
       * @param {string} req - The internal rpc-cap user request object.
       */
      requestUserApproval: async (req) => {
        const { metadata: { id } } = req

        this._platform.openExtensionInBrowser(`connect/${id}`)

        return new Promise((resolve, reject) => {
          this.pendingApprovals[id] = { resolve, reject }
        })
      },
    }, initState)
  }
}

export function addInternalMethodPrefix (method) {
  return WALLET_METHOD_PREFIX + method
}
