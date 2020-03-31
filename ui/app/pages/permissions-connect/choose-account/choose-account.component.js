import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Identicon from '../../../components/ui/identicon'
import Button from '../../../components/ui/button'
import CheckBox from '../../../components/ui/check-box'
import Tooltip from '../../../components/ui/tooltip-v2'
import { PRIMARY } from '../../../helpers/constants/common'
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

  handleAccountClick (address) {
    const { selectedAccounts } = this.state

    const newSelectedAccounts = new Set(selectedAccounts)

    if (newSelectedAccounts.has(address)) {
      newSelectedAccounts.delete(address)
    } else {
      newSelectedAccounts.add(address)
    }

    this.setState({ selectedAccounts: newSelectedAccounts })
  }

  selectAll () {
    const { accounts } = this.props

    const newSelectedAccounts = new Set()

    accounts.forEach((account) => newSelectedAccounts.add(account.address))

    this.setState({ selectedAccounts: newSelectedAccounts })
  }

  deSelectAll () {
    this.setState({ selectedAccounts: new Set() })
  }

  allAreSelected () {
    const { accounts } = this.props
    const { selectedAccounts } = this.state

    return accounts.every(({ address }) => selectedAccounts.has(address))
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
                    checked={ selectedAccounts.has(address) }
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
          <div className="permissions-connect-choose-account__text-grey">{ this.context.t('selectAll') }</div>
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
          className="permissions-connect-choose-account__text-blue"
          onClick={() => selectNewAccountViaModal(this.handleAccountClick.bind(this))}
        >
          { this.context.t('newAccount') }
        </div>
      </div>
    )
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
