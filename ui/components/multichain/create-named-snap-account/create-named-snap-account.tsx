import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { InternalAccount } from '@metamask/keyring-api';
import { setAccountLabel } from '../../../store/actions';
import { CreateAccount, CreateBtcAccount } from '..';
import { Box, ModalHeader } from '../../component-library';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { getMostRecentOverviewPage } from '../../../ducks/history/history';
import { getAccountName, getKeyringSnapAccounts } from '../../../selectors';
import {
  isBtcMainnetAddress,
  isBtcTestnetAddress,
} from '../../../../shared/lib/multichain';

export type CreateNamedSnapAccountProps = {
  /**
   * Callback called once the account has been created
   */
  onActionComplete: (completed: boolean, reject?: boolean) => Promise<void>;

  /**
   * Address of the account to create
   */
  account: InternalAccount;

  /**
   * Suggested account name from the snap
   */
  snapSuggestedAccountName?: string;
};

export const CreateNamedSnapAccount: React.FC<CreateNamedSnapAccountProps> = ({
  onActionComplete,
  account,
  snapSuggestedAccountName,
}) => {
  const t = useI18nContext();
  const history = useHistory();
  const dispatch = useDispatch();

  const mostRecentOverviewPage = useSelector(getMostRecentOverviewPage);
  const snapAccounts = useSelector(getKeyringSnapAccounts);
  const isBtcAccount = useMemo(
    () =>
      isBtcMainnetAddress(account.address) ||
      isBtcTestnetAddress(account.address),
    [account],
  );
  console.log(
    isBtcMainnetAddress(account.address),
    isBtcTestnetAddress(account.address),
  );
  console.log('isBtcAccount', isBtcAccount);

  const onCreateAccount = useCallback(async (name: string) => {
    dispatch(setAccountLabel(account.address, name));
    await onActionComplete(true);
  }, []);

  const getNextAccountName = useCallback(
    async (accounts: InternalAccount[]): Promise<string> => {
      // if snapSuggestedAccountName exists, return it immediately
      if (snapSuggestedAccountName) {
        return snapSuggestedAccountName;
      }

      // current Snap account has temporarily been created (this
      // allow us to rename it afterward), so we should be able
      // to get his current name:
      const defaultAccountName: string = getAccountName(
        accounts,
        account.address,
      );
      // if defaultAccountName is truthy, return it immediately
      if (defaultAccountName) {
        return defaultAccountName;
      }

      // if we hit that point, this means something went wrong with the Snap
      // account name, we fallback to the classic "naming scheme" we use
      // for Snap accounts (the last account index already refers to this
      // temporary account, hence, no `+ 1` here)
      const accountNumber = snapAccounts.length;
      return `Snap Account ${accountNumber}`;
    },
    [],
  );

  const onClose = useCallback(async () => {
    await onActionComplete(false);
    history.push(mostRecentOverviewPage);
  }, []);

  return (
    <Box padding={4}>
      <ModalHeader padding={4} onClose={onClose}>
        {t('addAccountToMetaMask')}
      </ModalHeader>
      {isBtcAccount ? (
        <CreateBtcAccount
          onActionComplete={onActionComplete}
          onCreateAccount={onCreateAccount}
          account={account}
        />
      ) : (
        <CreateAccount
          onActionComplete={onActionComplete}
          onCreateAccount={onCreateAccount}
          getNextAvailableAccountName={getNextAccountName}
        />
      )}
    </Box>
  );
};
