import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useI18nContext } from '../../../hooks/useI18nContext';
import Button from '../../../components/ui/button';
import PermissionsConnectHeader from '../../../components/app/permissions-connect-header';
import PermissionsConnectFooter from '../../../components/app/permissions-connect-footer';
import AccountList from '../../../components/ui/account-list';

const ChooseAccount = ({
  selectedAccountAddresses,
  addressLastConnectedMap = {},
  accounts,
  selectAccounts,
  selectNewAccountViaModal,
  cancelPermissionsRequest,
  permissionsRequestId,
  targetDomainMetadata,
  nativeCurrency,
}) => {
  const [selectedAccounts, setSelectedAccounts] = useState(
    selectedAccountAddresses,
  );
  const t = useI18nContext();

  const handleAccountClick = (address) => {
    const newSelectedAccounts = new Set(selectedAccounts);
    if (newSelectedAccounts.has(address)) {
      newSelectedAccounts.delete(address);
    } else {
      newSelectedAccounts.add(address);
    }
    setSelectedAccounts(newSelectedAccounts);
  };

  const selectAll = () => {
    const newSelectedAccounts = new Set(
      accounts.map((account) => account.address),
    );
    setSelectedAccounts(newSelectedAccounts);
  };

  const deselectAll = () => {
    setSelectedAccounts(new Set());
  };

  const allAreSelected = () => {
    return accounts.length === selectedAccounts.size;
  };

  return (
    <div className="permissions-connect-choose-account">
      <PermissionsConnectHeader
        icon={targetDomainMetadata?.icon}
        iconName={targetDomainMetadata?.name}
        headerTitle={t('connectWithMetaMask')}
        headerText={
          accounts.length > 0
            ? t('chooseAccounts')
            : t('connectAccountOrCreate')
        }
        siteOrigin={targetDomainMetadata?.origin}
      />
      <AccountList
        accounts={accounts}
        selectNewAccountViaModal={selectNewAccountViaModal}
        addressLastConnectedMap={addressLastConnectedMap}
        nativeCurrency={nativeCurrency}
        selectedAccounts={selectedAccounts}
        allAreSelected={allAreSelected}
        deselectAll={deselectAll}
        selectAll={selectAll}
        handleAccountClick={handleAccountClick}
      />
      <div className="permissions-connect-choose-account__footer-container">
        <PermissionsConnectFooter />
        <div className="permissions-connect-choose-account__bottom-buttons">
          <Button
            onClick={() => cancelPermissionsRequest(permissionsRequestId)}
            type="secondary"
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={() => selectAccounts(selectedAccounts)}
            type="primary"
            disabled={selectedAccounts.size === 0}
          >
            {t('next')}
          </Button>
        </div>
      </div>
    </div>
  );
};

ChooseAccount.propTypes = {
  /**
   * Array of user account objects
   */
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      address: PropTypes.string,
      addressLabel: PropTypes.string,
      lastConnectedDate: PropTypes.string,
      balance: PropTypes.string,
    }),
  ).isRequired,
  /**
   * Function to select an account
   */
  selectAccounts: PropTypes.func.isRequired,
  /**
   * Function to select a new account via modal
   */
  selectNewAccountViaModal: PropTypes.func.isRequired,
  /**
   * Native currency of current chain
   */
  nativeCurrency: PropTypes.string.isRequired,
  /**
   * A map of the last connected addresses
   */
  addressLastConnectedMap: PropTypes.object,
  /**
   * Function to cancel permission request
   */
  cancelPermissionsRequest: PropTypes.func.isRequired,
  /**
   * Permission request Id
   */
  permissionsRequestId: PropTypes.string.isRequired,
  /**
   * Currently selected account addresses
   */
  selectedAccountAddresses: PropTypes.object.isRequired,
  /**
   * Domain data used to display site-origin pill
   */
  targetDomainMetadata: PropTypes.shape({
    extensionId: PropTypes.string,
    icon: PropTypes.string,
    host: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    origin: PropTypes.string.isRequired,
  }),
};

export default ChooseAccount;
