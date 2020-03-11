import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Identicon from '../../../components/ui/identicon'
import Button from '../../../components/ui/button'
import CheckBox from '../../../components/ui/check-box'
import Tooltip from '../../../components/ui/tooltip-v2'
import { PRIMARY } from '../../../helpers/constants/common'
import AlertMessage from '../../../components/ui/alert-message'
import UserPreferencedCurrencyDisplay from '../../../components/app/user-preferenced-currency-display'

export default class ChooseAccount extends Component {
  static propTypes = {
    accounts: PropTypes.arrayOf(PropTypes.shape({
      address: PropTypes.string,
      addressLabel: PropTypes.string,
      lastConnectedDate: PropTypes.string,
      balance: PropTypes.string,
    })).isRequired,
    originName: PropTypes.string.isRequired,
    selectAccounts: PropTypes.func.isRequired,
    selectNewAccountViaModal: PropTypes.func.isRequired,
    nativeCurrency: PropTypes.string.isRequired,
    addressLastConnectedMap: PropTypes.object,
    cancelPermissionsRequest: PropTypes.func.isRequired,
    permissionsRequestId: PropTypes.string.isRequired,
    selectedAccountAddresses: PropTypes.object,
  }

  state = {
    selectedAccounts: this.props.selectedAccountAddresses,
  }

  static defaultProps = {
    addressLastConnectedMap: {},
    selectedAccountAddresses: {},
  }

  static contextTypes = {
    t: PropTypes.func,
  }

  compone

  handleAccountClick (address) {
    const { selectedAccounts: currentSelectedAccounts } = this.state

    const newSelectedAccounts = {
      ...currentSelectedAccounts,
      [address]: !currentSelectedAccounts[address],
    }

    this.setState({ selectedAccounts: newSelectedAccounts })
  }

  selectAll () {
    const { accounts } = this.props

    const newSelectedAccounts = accounts.reduce((accountsObject, account) => {
      const { address } = account
      return {
        ...accountsObject,
        [address]: true,
      }
    }, {})

    this.setState({ selectedAccounts: newSelectedAccounts })
  }

  deSelectAll () {
    const { accounts } = this.props

    const newSelectedAccounts = accounts.reduce((accountsObject, account) => {
      const { address } = account
      return {
        ...accountsObject,
        [address]: false,
      }
    }, {})

    this.setState({ selectedAccounts: newSelectedAccounts })
  }

  allAreSelected () {
    const { accounts } = this.props
    const { selectedAccounts } = this.state

    return accounts.every(({ address }) => selectedAccounts[address])
  }

  multipleAreSelected () {
    const { selectedAccounts } = this.state

    return Object.values(selectedAccounts).filter((selected) => selected).length > 1
  }

  renderAccountsList = () => {
    const { accounts, nativeCurrency, addressLastConnectedMap } = this.props
    const { selectedAccounts } = this.state
    return (
      <div className="permissions-connect-choose-account__accounts-list">
        {
          accounts.map((account, index) => {
            const { address, addressLabel, balance } = account
            return (
              <div
                key={`permissions-connect-choose-account-${index}`}
                onClick={ () => this.handleAccountClick(address) }
                className="permissions-connect-choose-account__account"
              >
                <div className="permissions-connect-choose-account__account-info-wrapper">
                  <CheckBox
                    className="permissions-connect-choose-account__list-check-box"
                    checked={ selectedAccounts[address] }
                  />
                  <Identicon
                    diameter={34}
                    address={address}
                  />
                  <div className="permissions-connect-choose-account__account__info">
                    <div className="permissions-connect-choose-account__account__label">{ addressLabel }</div>
                    <UserPreferencedCurrencyDisplay
                      className="permissions-connect-choose-account__account__balance"
                      type={PRIMARY}
                      value={balance}
                      style={{ color: '#6A737D' }}
                      suffix={nativeCurrency}
                      hideLabel
                    />
                  </div>
                </div>
                { addressLastConnectedMap[address]
                  ? (
                    <div className="permissions-connect-choose-account__account__last-connected">
                      <span>{ this.context.t('lastConnected') }</span>
                      { addressLastConnectedMap[address] }
                    </div>
                  )
                  : null
                }
              </div>
            )
          })
        }
      </div>
    )
  }

  renderAccountsListHeader () {
    const { t } = this.context
    const { selectNewAccountViaModal } = this.props
    return (
      <div className="permissions-connect-choose-account__accounts-list-header">
        <div className="permissions-connect-choose-account__select-all">
          <CheckBox
            className="permissions-connect-choose-account__header-check-box"
            checked={this.allAreSelected()}
            onClick={() => (this.allAreSelected() ? this.deSelectAll() : this.selectAll())}
          />
          <div className="permissions-connect-choose-account__text--grey">{ this.context.t('selectAll') }</div>
          <Tooltip
            position="bottom"
            html={(
              <div style={{ width: 129, height: 112, padding: 4 }}>
                {t('selectingAllWillAllow')}
              </div>
            )}
          >
            <i className="fa fa-info-circle" />
          </Tooltip>
        </div>
        <div
          className="permissions-connect-choose-account__text--blue"
          onClick={() => selectNewAccountViaModal(this.handleAccountClick.bind(this))}
        >
          { this.context.t('newAccount') }
        </div>
      </div>
    )
  }

  renderSelectAllWarning () {
    const { t } = this.context

    return this.multipleAreSelected()
      ? (
        <AlertMessage
          type="warning"
          width="428px"
        >
          { t('selectMultipleAccountWarning') }
        </AlertMessage>
      )
      : null
  }

  render () {
    const { originName, selectAccounts, permissionsRequestId, cancelPermissionsRequest } = this.props
    const { selectedAccounts } = this.state
    const { t } = this.context

    return (
      <div className="permissions-connect-choose-account">
        <div className="permissions-connect-choose-account__title">
          { t('selectYourAccounts') }
        </div>
        <div className="permissions-connect-choose-account__text">
          { t('toConnectWith', [originName]) }
        </div>
        { this.renderAccountsListHeader() }
        { this.renderAccountsList() }
        { this.renderSelectAllWarning() }
        <div className="permissions-connect-choose-account__bottom-buttons">
          <Button
            onClick={ () => cancelPermissionsRequest(permissionsRequestId) }
            type="default"
          >
            { t('cancel') }
          </Button>
          <Button
            onClick={ () => selectAccounts(selectedAccounts) }
            type="primary"
            disabled={false}
          >
            { t('next') }
          </Button>
        </div>
      </div>
    )
  }
}
