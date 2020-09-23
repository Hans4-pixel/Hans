import EventEmitter from 'events'
import React, { useContext, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { useHistory } from 'react-router-dom'
import { I18nContext } from '../../../contexts/i18n'
import { useTransactionTimeRemaining } from '../../../hooks/useTransactionTimeRemaining'
import { usePrevious } from '../../../hooks/usePrevious'
import Mascot from '../../../components/ui/mascot'
import PulseLoader from '../../../components/ui/pulse-loader'
import { getBlockExplorerUrlForTx } from '../../../helpers/utils/transactions.util'
import CountdownTimer from '../countdown-timer'
import {
  QUOTES_EXPIRED_ERROR,
  SWAP_FAILED_ERROR,
  ERROR_FETCHING_QUOTES,
  QUOTES_NOT_AVAILABLE_ERROR,
} from '../../../helpers/constants/swaps'
import { ASSET_ROUTE, DEFAULT_ROUTE } from '../../../helpers/constants/routes'
import {
  fetchQuotesAndSetQuoteState,
  getDestinationTokenInfo,
  navigateBackToBuildQuote,
  prepareForRetryGetQuotes,
} from '../../../ducks/swaps/swaps'
import SwapsFooter from '../swaps-footer'
import SwapFailureIcon from './swap-failure-icon'
import SwapSuccessIcon from './swap-success-icon'
import QuotesTimeoutIcon from './quotes-timeout-icon'

export default function AwaitingSwap ({
  swapComplete,
  errorKey,
  symbol,
  txHash,
  networkId,
  tokensReceived,
  rpcPrefs,
  submittingSwap,
  tradeTxData,
  usedGasPrice,
  inputValue,
  maxSlippage,
}) {
  const t = useContext(I18nContext)
  const history = useHistory()
  const dispatch = useDispatch()
  const animationEventEmitter = useRef(new EventEmitter())

  const destinationToken = useSelector(getDestinationTokenInfo)

  const [timeRemainingExpired, setTimeRemainingExpired] = useState(false)

  let headerText
  let statusImage
  let descriptionText
  let submitText

  if (errorKey === SWAP_FAILED_ERROR) {
    headerText = t('swapFailedErrorTitle')
    descriptionText = t('swapFailedErrorDescription')
    submitText = t('tryAgain')
    statusImage = <SwapFailureIcon />
  } else if (errorKey === QUOTES_EXPIRED_ERROR) {
    headerText = t('swapQuotesExpiredErrorTitle')
    descriptionText = t('swapQuotesExpiredErrorDescription')
    submitText = t('tryAgain')
    statusImage = <QuotesTimeoutIcon />
  } else if (errorKey === ERROR_FETCHING_QUOTES) {
    headerText = t('swapFetchingQuotesErrorTitle')
    descriptionText = t('swapFetchingQuotesErrorDescription')
    submitText = t('back')
    statusImage = <SwapFailureIcon />
  } else if (errorKey === QUOTES_NOT_AVAILABLE_ERROR) {
    headerText = t('swapQuotesNotAvailableErrorTitle')
    descriptionText = t('swapQuotesNotAvailableErrorDescription')
    submitText = t('tryAgain')
    statusImage = <SwapFailureIcon />
  } else if (!errorKey && !swapComplete) {
    headerText = t('swapProcessing')
    statusImage = <PulseLoader />
    submitText = t('close')
    descriptionText = t('swapOnceTransactionHasProcess', [<span key="swapOnceTransactionHasProcess-1" className="awaiting-swap__amount-and-symbol">{symbol}</span>])
  } else if (!errorKey && swapComplete) {
    headerText = t('swapTransactionComplete')
    statusImage = <SwapSuccessIcon />
    submitText = t('swapViewToken', [symbol])
    descriptionText = t('swapTokenAvailable', [<span key="swapTokenAvailable-2" className="awaiting-swap__amount-and-symbol">{`${tokensReceived} ${symbol}`}</span>])
  }

  const timeRemaining = useTransactionTimeRemaining(true, true, tradeTxData?.submittedTime, usedGasPrice, true, true)
  const estimatedTransactionWaitTime = timeRemaining * 1000 * 60
  const previousEstimatedWaitTime = usePrevious(estimatedTransactionWaitTime)
  const estimatedWaitIsNumber = typeof estimatedTransactionWaitTime === 'number' && !isNaN(estimatedTransactionWaitTime)
  const previousEstimatedWaitIsNumber = typeof previousEstimatedWaitTime === 'number' && !isNaN(estimatedTransactionWaitTime)
  if (!estimatedWaitIsNumber && previousEstimatedWaitIsNumber && !timeRemainingExpired) {
    setTimeRemainingExpired(true)
  }

  let countdownText
  if (estimatedWaitIsNumber && tradeTxData?.submittedTime) {
    countdownText = <CountdownTimer timeStarted={tradeTxData?.submittedTime} timerBase={estimatedTransactionWaitTime} timeOnly />
  } else if (timeRemainingExpired) {
    countdownText = t('swapsAlmostDone')
  } else {
    countdownText = t('swapEstimatedTimeCalculating')
  }

  const blockExplorerUrl = getBlockExplorerUrlForTx(networkId, txHash, rpcPrefs)
  const showBlockExplorterLink = blockExplorerUrl && (!errorKey || errorKey === SWAP_FAILED_ERROR)

  return (
    <div className="awaiting-swap">
      <div className="awaiting-swap__content">
        {!(swapComplete || errorKey) && (
          <Mascot
            animationEventEmitter={animationEventEmitter.current}
            width="90"
            height="90"
          />
        )}
        <div className="awaiting-swap__status-image">
          {statusImage}
        </div>
        <div className="awaiting-swap__header">
          {headerText}
        </div>
        <div className="awaiting-swap__main-descrption">
          {descriptionText}
        </div>
        {!swapComplete && txHash && (
          <div className="awaiting-swap__time-estimate">
            {t('swapEstimatedTimeFull', [
              <span className="awaiting-swap__time-estimate-text" key="swapEstimatedTime-1">{t('swapEstimatedTime')}</span>,
              countdownText,
            ])}
          </div>
        )}
        {showBlockExplorterLink && (
          <div
            className={classnames('awaiting-swap__view-on-etherscan', {
              'awaiting-swap__view-on-etherscan--visible': txHash,
              'awaiting-swap__view-on-etherscan--invisible': !txHash,
            })}
            onClick={() => global.platform.openTab({ url: blockExplorerUrl })}
          >
            {rpcPrefs.blockExplorerUrl ? t('viewOnCustomBlockExplorer', [blockExplorerUrl]) : t('viewOnEtherscan')}
          </div>
        )}
      </div>
      <SwapsFooter
        onSubmit={async () => {
          if (errorKey === QUOTES_EXPIRED_ERROR) {
            dispatch(prepareForRetryGetQuotes())
            await dispatch(fetchQuotesAndSetQuoteState(history, inputValue, maxSlippage))
          } else if (errorKey) {
            await dispatch(navigateBackToBuildQuote(history))
          } else if (destinationToken.symbol === 'ETH') {
            history.push(DEFAULT_ROUTE)
          } else {
            history.push(`${ASSET_ROUTE}/${destinationToken.address}`)
          }
        }}
        submitText={submitText}
        disabled={submittingSwap}
        hideCancel={errorKey !== QUOTES_EXPIRED_ERROR}
      />
    </div>
  )
}

AwaitingSwap.propTypes = {
  swapComplete: PropTypes.bool,
  symbol: PropTypes.string.isRequired,
  networkId: PropTypes.string.isRequired,
  txHash: PropTypes.string.isRequired,
  tokensReceived: PropTypes.string,
  rpcPrefs: PropTypes.object.isRequired,
  errorKey: PropTypes.oneOf([
    QUOTES_EXPIRED_ERROR,
    SWAP_FAILED_ERROR,
    ERROR_FETCHING_QUOTES,
    QUOTES_NOT_AVAILABLE_ERROR,
  ]),
  submittingSwap: PropTypes.bool,
  tradeTxData: PropTypes.object,
  usedGasPrice: PropTypes.number,
  inputValue: PropTypes.oneOf([PropTypes.number, PropTypes.string]),
  maxSlippage: PropTypes.number,
}
