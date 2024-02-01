import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import {
  BackgroundColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
import {
  ButtonLink,
  ButtonLinkSize,
  IconName,
  Text,
} from '../../component-library';
import { MenuItem } from '../../ui/menu';
import ConnectedAccountsListItem from './connected-accounts-list-item';
import ConnectedAccountsListOptions from './connected-accounts-list-options';

export default class ConnectedAccountsList extends PureComponent {
  static contextTypes = {
    t: PropTypes.func.isRequired,
  };

  static defaultProps = {
    accountToConnect: null,
  };

  static propTypes = {
    accountToConnect: PropTypes.shape({
      id: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
      metadata: PropTypes.shape({
        name: PropTypes.string.isRequired,
        keyring: PropTypes.shape({
          type: PropTypes.string.isRequired,
        }).isRequired,
      }).isRequired,
      options: PropTypes.object.isRequired,
      methods: PropTypes.arrayOf(PropTypes.string).isRequired,
      type: PropTypes.string.isRequired,
    }),
    connectedAccounts: PropTypes.arrayOf(
      PropTypes.shape({
        address: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        lastActive: PropTypes.number,
      }),
    ).isRequired,
    connectAccount: PropTypes.func.isRequired,
    selectedAddress: PropTypes.string.isRequired,
    removePermittedAccount: PropTypes.func,
    setSelectedAddress: PropTypes.func.isRequired,
    shouldRenderListOptions: (props, propName, componentName) => {
      if (typeof props[propName] !== 'boolean') {
        return new Error(
          `Warning: Failed prop type: '${propName}' of component '${componentName}' must be a boolean. Received: ${typeof props[
            propName
          ]}`,
        );
      } else if (props[propName] && !props.removePermittedAccount) {
        return new Error(
          `Warning: Failed prop type: '${propName}' of component '${componentName}' requires prop 'removePermittedAccount'.`,
        );
      }
      return undefined;
    },
  };

  state = {
    accountWithOptionsShown: null,
  };

  disconnectAccount = () => {
    this.hideAccountOptions();
    this.props.removePermittedAccount(this.state.accountWithOptionsShown);
  };

  switchAccount = (address) => {
    this.hideAccountOptions();
    this.props.setSelectedAddress(address);
  };

  hideAccountOptions = () => {
    this.setState({ accountWithOptionsShown: null });
  };

  showAccountOptions = (address) => {
    this.setState({ accountWithOptionsShown: address });
  };

  renderUnconnectedAccount() {
    const { accountToConnect, connectAccount } = this.props;
    const { t } = this.context;

    if (!accountToConnect) {
      return null;
    }

    const {
      address,
      metadata: { name },
    } = accountToConnect;
    return (
      <ConnectedAccountsListItem
        className="connected-accounts-list__row--highlight"
        backgroundColor={BackgroundColor.warningMuted}
        address={address}
        name={name}
        status={t('statusNotConnected')}
        action={
          <Text variant={TextVariant.bodyMd}>
            <ButtonLink
              className="connected-accounts-list__account-status-link"
              onClick={() => connectAccount(address)}
              size={ButtonLinkSize.Inherit}
            >
              {t('connect')}
            </ButtonLink>
          </Text>
        }
      />
    );
  }

  renderListItemOptions(address) {
    const { accountWithOptionsShown } = this.state;
    const { t } = this.context;

    return (
      <ConnectedAccountsListOptions
        onHideOptions={this.hideAccountOptions}
        onShowOptions={this.showAccountOptions.bind(null, address)}
        show={accountWithOptionsShown === address}
      >
        <MenuItem iconName={IconName.Logout} onClick={this.disconnectAccount}>
          {t('disconnectThisAccount')}
        </MenuItem>
      </ConnectedAccountsListOptions>
    );
  }

  renderListItemAction(address) {
    const { t } = this.context;

    return (
      <Text variant={TextVariant.bodyMd}>
        <ButtonLink
          className="connected-accounts-list__account-status-link"
          onClick={() => this.switchAccount(address)}
          size={ButtonLinkSize.Inherit}
        >
          {t('switchToThisAccount')}
        </ButtonLink>
      </Text>
    );
  }

  render() {
    const { connectedAccounts, selectedAddress, shouldRenderListOptions } =
      this.props;
    const { t } = this.context;

    return (
      <>
        <main className="connected-accounts-list">
          {this.renderUnconnectedAccount()}
          {connectedAccounts.map(({ address, name }, index) => {
            return (
              <ConnectedAccountsListItem
                key={address}
                address={address}
                name={name}
                status={index === 0 ? t('active') : null}
                options={
                  shouldRenderListOptions
                    ? this.renderListItemOptions(address)
                    : null
                }
                action={
                  address === selectedAddress
                    ? null
                    : this.renderListItemAction(address)
                }
              />
            );
          })}
        </main>
      </>
    );
  }
}
