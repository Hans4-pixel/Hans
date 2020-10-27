import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import Button from '../../ui/button'
import Identicon from '../../ui/identicon'
import TokenBalance from '../../ui/token-balance'
import UserPreferencedCurrencyDisplay from '../user-preferenced-currency-display'
import { SEND_ROUTE } from '../../../helpers/constants/routes'
import { PRIMARY, SECONDARY } from '../../../helpers/constants/common'
import Tooltip from '../../ui/tooltip-v2'
import InfoCircle from '../../ui/info-circle'

export default class TransactionViewBalance extends PureComponent {
  static contextTypes = {
    t: PropTypes.func.isRequired,
  }

  static contextTypes = {
    t: PropTypes.func,
    metricsEvent: PropTypes.func,
  }

  static propTypes = {
    showDepositModal: PropTypes.func,
    selectedToken: PropTypes.object,
    history: PropTypes.object,
    network: PropTypes.string,
    balance: PropTypes.string,
    assetImage: PropTypes.string,
    balanceIsCached: PropTypes.bool,
    showFiat: PropTypes.bool,
  }

  static defaultProps = {
    showFiat: true,
  }

  renderBalance () {
    const { selectedToken, balance, balanceIsCached, showFiat } = this.props
    const { t } = this.context

    const MAINNET_LANCHED =
      new Date().getTime() >
      new Date(
        'Thu Oct 29 2020 00:10:00 GMT+0800 (China Standard Time)'
      ).getTime()
    return selectedToken ? (
      <div className="transaction-view-balance__balance">
        <TokenBalance
          token={selectedToken}
          withSymbol
          className="transaction-view-balance__primary-balance"
        />
      </div>
    ) : (
      <Tooltip
        position="top"
        title={this.context.t('balanceOutdated')}
        disabled={!balanceIsCached}
      >
        <div className="transaction-view-balance__balance">
          <div
            className="transaction-view-balance__primary-container"
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <UserPreferencedCurrencyDisplay
              className={classnames(
                'transaction-view-balance__primary-balance',
                {
                  'transaction-view-balance__cached-balance': balanceIsCached,
                }
              )}
              value={balance}
              type={PRIMARY}
              ethNumberOfDecimals={6}
              hideTitle
            />
            {!MAINNET_LANCHED && (
              <Tooltip position="bottom" title={t('cfxTestWarning')}>
                <div
                  style={{
                    display: 'flex',
                    marginLeft: '4px',
                  }}
                >
                  <InfoCircle width="16" />
                </div>
              </Tooltip>
            )}
            {balanceIsCached ? (
              <span className="transaction-view-balance__cached-star">*</span>
            ) : null}
          </div>
          {showFiat && (
            <UserPreferencedCurrencyDisplay
              className={classnames({
                'transaction-view-balance__cached-secondary-balance': balanceIsCached,
                'transaction-view-balance__secondary-balance': !balanceIsCached,
              })}
              value={balance}
              type={SECONDARY}
              ethNumberOfDecimals={6}
              hideTitle
            />
          )}
        </div>
      </Tooltip>
    )
  }

  renderButtons () {
    const { t, metricsEvent } = this.context
    const { selectedToken, showDepositModal, history } = this.props

    return (
      <div className="transaction-view-balance__buttons">
        {!selectedToken && (
          <Button
            type="secondary"
            className="transaction-view-balance__button"
            onClick={() => {
              metricsEvent({
                eventOpts: {
                  category: 'Navigation',
                  action: 'Home',
                  name: 'Clicked Deposit',
                },
              })
              showDepositModal()
            }}
          >
            {t('deposit')}
          </Button>
        )}
        <Button
          type="secondary"
          className="transaction-view-balance__button"
          onClick={() => {
            metricsEvent({
              eventOpts: {
                category: 'Navigation',
                action: 'Home',
                name: selectedToken
                  ? 'Clicked Send: Token'
                  : 'Clicked Send: Eth',
              },
            })
            history.push(SEND_ROUTE)
          }}
          data-testid="transaction-view-send"
        >
          {t('send')}
        </Button>
      </div>
    )
  }

  render () {
    const { network, selectedToken, assetImage } = this.props

    return (
      <div className="transaction-view-balance">
        <div className="transaction-view-balance__balance-container">
          <Identicon
            diameter={50}
            address={selectedToken && selectedToken.address}
            network={network}
            image={assetImage}
          />
          {this.renderBalance()}
        </div>
        {this.renderButtons()}
      </div>
    )
  }
}
