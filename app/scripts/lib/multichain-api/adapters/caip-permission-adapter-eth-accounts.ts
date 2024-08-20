import { CaipAccountId, Hex, parseCaipAccountId } from '@metamask/utils';
import { Caip25CaveatValue } from '../caip25permissions';
import { KnownCaipNamespace, mergeScopes, parseScopeString, ScopesObject } from '../scope';

export const getEthAccounts = (caip25CaveatValue: Caip25CaveatValue) => {
  const ethAccounts: string[] = [];
  const sessionScopes = mergeScopes(
    caip25CaveatValue.requiredScopes,
    caip25CaveatValue.optionalScopes,
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

  return Array.from(new Set(ethAccounts));
};

const setEthAccountsForScopesObject = (
  scopesObject: ScopesObject,
  accounts: Hex[],
) => {
  let updatedScopesObject: ScopesObject = {}

  Object.entries(scopesObject).forEach(
    ([scopeString, scopeObject]) => {
      const { namespace } = parseScopeString(scopeString);

      const caipAccounts = accounts.map(
        (account) => `${scopeString}:${account}` as CaipAccountId,
      );

      updatedScopesObject[scopeString] = {
        ...scopeObject,
        accounts: namespace === KnownCaipNamespace.Eip155 ? caipAccounts : scopeObject.accounts
      }
    },
  );

  return updatedScopesObject
}

// This helper must be called with existing eip155 scopes
export const setEthAccounts = (
  caip25CaveatValue: Caip25CaveatValue,
  accounts: Hex[],
) => {
  return {
    ...caip25CaveatValue,
    requiredScopes: setEthAccountsForScopesObject(caip25CaveatValue.requiredScopes, accounts),
    optionalScopes: setEthAccountsForScopesObject(caip25CaveatValue.optionalScopes, accounts),
  }
};
