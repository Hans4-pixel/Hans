import { createSelector } from 'reselect';
import { getAccountName } from '../selectors';
import { AccountsState, getInternalAccounts } from '../accounts';
import { createDeepEqualSelector } from '../../../shared/modules/selectors/util';

/**
 * Get the account name for an address.
 *
 * @param _state -  The Metamask state for the accounts controller.
 * @param address - The address to get the display name for.
 * @returns The account name for the address.
 */
export const getAccountNameFromState = createSelector(
  [getInternalAccounts, (_state: AccountsState, address: string) => address],
  getAccountName,
);

/**
 * Get the memoized account name for an address.
 *
 * @param state - The Metamask state for the accounts controller.
 * @param address - The address to get the display name for.
 * @returns The account name for the address.
 */
export const getMemoizedAccountName = createDeepEqualSelector(
  [getAccountNameFromState],
  (accountName: string) => accountName,
);
