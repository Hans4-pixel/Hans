import {
  EthAccountType,
  BtcAccountType,
  InternalAccount,
} from '@metamask/keyring-api';
import { AccountsControllerState } from '@metamask/accounts-controller';
import {
  isBtcMainnetAddress,
  isBtcTestnetAddress,
} from '../../shared/lib/multichain';
import { getSelectedInternalAccount, getInternalAccounts } from './selectors';

export type AccountsState = {
  metamask: AccountsControllerState;
};

function isBtcAccount(account: InternalAccount) {
  const { P2wpkh } = BtcAccountType;

  return Boolean(account && account.type === P2wpkh);
}

export function isSelectedInternalAccountEth(state: AccountsState) {
  const account = getSelectedInternalAccount(state);
  const { Eoa, Erc4337 } = EthAccountType;

  return Boolean(account && (account.type === Eoa || account.type === Erc4337));
}

export function isSelectedInternalAccountBtc(state: AccountsState) {
  return isBtcAccount(getSelectedInternalAccount(state));
}

function hasCreatedBtcAccount(
  state: AccountsState,
  isAddress: (address: string) => boolean,
) {
  const accounts = getInternalAccounts(state);
  return accounts.some((account) => {
    return isBtcAccount(account) && isAddress(account.address);
  });
}

export function hasCreatedBtcMainnetAccount(state: AccountsState) {
  return hasCreatedBtcAccount(state, isBtcMainnetAddress);
}

export function hasCreatedBtcTestnetAccount(state: AccountsState) {
  return hasCreatedBtcAccount(state, isBtcTestnetAddress);
}
