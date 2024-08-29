import { KnownCaipNamespace, parseCaipAccountId } from '@metamask/utils';
import { MESSAGE_TYPE } from '../../../../../shared/constants/app';
import {
  Caip25CaveatType,
  Caip25EndowmentPermissionName,
} from '../../multichain-api/caip25permissions';
import { mergeScopes } from '../../multichain-api/scope';

/**
 * A wrapper for `eth_accounts` that returns an empty array when permission is denied.
 */

const ethereumAccounts = {
  methodNames: [MESSAGE_TYPE.ETH_ACCOUNTS],
  implementation: ethAccountsHandler,
  hookNames: {
    getAccounts: true,
    getCaveat: true,
  },
};
export default ethereumAccounts;

/**
 * @typedef {Record<string, Function>} EthAccountsOptions
 * @property {Function} getAccounts - Gets the accounts for the requesting
 * origin.
 */

/**
 *
 * @param {import('json-rpc-engine').JsonRpcRequest<unknown>} req - The JSON-RPC request object.
 * @param {import('json-rpc-engine').JsonRpcResponse<true>} res - The JSON-RPC response object.
 * @param {Function} _next - The json-rpc-engine 'next' callback.
 * @param {Function} end - The json-rpc-engine 'end' callback.
 * @param {EthAccountsOptions} options - The RPC method hooks.
 */
async function ethAccountsHandler(
  req,
  res,
  _next,
  end,
  { getAccounts, getCaveat },
) {
  if (process.env.BARAD_DUR) {
    let caveat;
    try {
      caveat = getCaveat(
        req.origin,
        Caip25EndowmentPermissionName,
        Caip25CaveatType,
      );
    } catch (err) {
      // noop
    }
    if (!caveat) {
      res.result = [];
      return end();
    }

    const ethAccounts = [];
    const sessionScopes = mergeScopes(
      caveat.value.requiredScopes,
      caveat.value.optionalScopes,
    );

    Object.entries(sessionScopes).forEach(([_, { accounts }]) => {
      accounts?.forEach((account) => {
        const {
          address,
          chain: { namespace },
        } = parseCaipAccountId(account);

        if (namespace === KnownCaipNamespace.Eip155) {
          ethAccounts.push(address);
        }
      });
    });
    res.result = Array.from(new Set(ethAccounts));
    return end();
  }
  res.result = await getAccounts();
  return end();
}
