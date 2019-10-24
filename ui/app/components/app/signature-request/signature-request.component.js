import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import Header from './signature-request-header'
import Footer from './signature-request-footer'
import Message from './signature-request-message'
import { ENVIRONMENT_TYPE_NOTIFICATION } from './signature-request.constants'
import { getEnvironmentType } from '../../../../../app/scripts/lib/util'
import Identicon from '../../ui/identicon'

export default class SignatureRequest extends PureComponent {
  static propTypes = {
    txData: PropTypes.object.isRequired,
    accounts: PropTypes.shape(
      PropTypes.shape({
        address: PropTypes.string,
        balance: PropTypes.string,
      })
    ),
    selectedAccount: PropTypes.shape({
      address: PropTypes.string,
      balance: PropTypes.string,
      name: PropTypes.string,
    }).isRequired,

    clearConfirmTransaction: PropTypes.func.isRequired,
    cancel: PropTypes.func.isRequired,
    sign: PropTypes.func.isRequired,
  }

  static contextTypes = {
    t: PropTypes.func,
  }

  componentDidMount () {
    const { clearConfirmTransaction, cancel } = this.props
    const { metricsEvent } = this.context
    if (getEnvironmentType(window.location.href) === ENVIRONMENT_TYPE_NOTIFICATION) {
      window.onbeforeunload = event => {
        metricsEvent({
          eventOpts: {
            category: 'Transactions',
            action: 'Sign Request',
            name: 'Cancel Sig Request Via Notification Close',
          },
        })
        clearConfirmTransaction()
        cancel(event)
      }
    }
  }

  formatWallet (wallet) {
    return `${wallet.slice(0, 8)}...${wallet.slice(wallet.length - 8, wallet.length)}`
  }

  render () {
    const {
      selectedAccount,
      accounts,
      txData: { msgParams: { data, origin, from: senderWallet }},
      cancel,
      sign,
    } = this.props
    const { message } = JSON.parse(data)

    return (
      <div className="signature-request">
        <Header selectedAccount={selectedAccount} accounts={accounts} />
        <div className="signature-request-content">
          <div className="signature-request-content__title">{this.context.t('sigRequest')}</div>
          <div className="signature-request-content__identicon-container">
            <div className="signature-request-content__identicon-initial" >{ message.from.name && message.from.name[0] }</div>
            <div className="signature-request-content__identicon-border" />
            <Identicon
              address={message.from.wallet}
              diameter={70}
            />
          </div>
          <div className="signature-request-content__info--bolded">{message.from.name}</div>
          <div className="signature-request-content__info">{origin}</div>
          <div className="signature-request-content__info">{this.formatWallet(senderWallet)}</div>
        </div>
        <Message data={message} />
        <Footer cancelAction={cancel} signAction={sign} />
      </div>
    )
  }
}
