import {
  CaipChainId,
  CaipReference,
  CaipAccountId,
  isCaipNamespace,
  isCaipChainId,
  parseCaipChainId,
} from '@metamask/utils';

// TODO: Remove this after bumping utils
export enum KnownCaipNamespace {
  /** EIP-155 compatible chains. */
  Eip155 = 'eip155',
  Wallet = 'wallet', // Needs to be added to utils
}

export type Scope = CaipChainId | CaipReference;

export type ScopeObject = {
  scopes?: CaipChainId[];
  methods: string[];
  notifications: string[];
  accounts?: CaipAccountId[];
  rpcDocuments?: string[];
  rpcEndpoints?: string[];
};

export type ScopesObject = Record<Scope, ScopeObject>;

export const parseScopeString = (
  scopeString: string,
):
  | {
      namespace: undefined;
      reference: undefined;
    }
  | {
      namespace: string;
      reference: undefined;
    }
  | {
      namespace: string;
      reference: string;
    } => {
  if (isCaipNamespace(scopeString)) {
    return {
      namespace: scopeString,
      reference: undefined,
    };
  }
  if (isCaipChainId(scopeString)) {
    return parseCaipChainId(scopeString);
  }

  return {
    namespace: undefined,
    reference: undefined,
  };
};

export type ScopedProperties = Record<Scope, Record<string, unknown>>;
