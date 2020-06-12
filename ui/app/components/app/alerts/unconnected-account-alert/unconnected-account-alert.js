import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  ALERT_STATE,
  switchToAccount,
  dismissAlert,
  dismissAndDisableAlert,
  getAlertState,
} from '../../../../ducks/alerts/unconnected-account'
import {
  // getSelectedIdentity,
  // getOriginOfCurrentTab,
  getPermittedIdentitiesForCurrentTab,
} from '../../../../selectors'
import Popover from '../../../ui/popover'
import Button from '../../../ui/button'
import Dropdown from '../../../ui/dropdown'
import Checkbox from '../../../ui/check-box'
import Tooltip from '../../../ui/tooltip-v2'
import { useI18nContext } from '../../../../hooks/useI18nContext'

const {
  ERROR,
  LOADING,
} = ALERT_STATE

const SwitchConnectedAccountAlert = () => {
  const t = useI18nContext()
  const dispatch = useDispatch()
  const alertState = useSelector(getAlertState)
  const connectedAccounts = useSelector(getPermittedIdentitiesForCurrentTab)
  // const origin = useSelector(getOriginOfCurrentTab)
  // const selectedIdentity = useSelector(getSelectedIdentity)
  const [accountToSwitchTo, setAccountToSwitchTo] = useState(connectedAccounts[0].address)
  const [dontShowThisAgain, setDontShowThisAgain] = useState(false)

  const onClose = async () => {
    return dontShowThisAgain
      ? await dispatch(dismissAndDisableAlert())
      : dispatch(dismissAlert())
  }

  // const accountName = selectedIdentity?.name || t('thisAccount')
  // const siteName = origin || t('thisSite')
  const options = connectedAccounts.map((account) => {
    return { name: account.name, value: account.address }
  })

  return (
    <Popover
      contentClassName="unconnected-account-alert__content"
      footer={(
        <>
          {
            alertState === ERROR
              ? (
                <div className="unconnected-account-alert__error">
                  { t('failureMessage') }
                </div>
              )
              : null
          }
          <div className="unconnected-account-alert__footer-buttons">
            <Button
              disabled={alertState === LOADING}
              onClick={onClose}
              type="secondary"
            >
              { t('dismiss') }
            </Button>
            <Button
              disabled={alertState === LOADING || alertState === ERROR || dontShowThisAgain}
              onClick={() => dispatch(switchToAccount(accountToSwitchTo))}
              type="primary"
            >
              { t('switchAccounts') }
            </Button>
          </div>
        </>
      )}
      footerClassName="unconnected-account-alert__footer"
      onClose={onClose}
      subtitle={t(
        'unconnectedAccountAlertSingleAccountDescription',
        [connectedAccounts[0].name]
      )}
      title={t('notConnected')}
    >
      {
        connectedAccounts.length > 1
          ? (
            <Dropdown
              className="unconnected-account-alert__dropdown"
              title="Switch to account"
              onChange={(address) => setAccountToSwitchTo(address)}
              options={options}
              selectedOption={accountToSwitchTo}
            />
          )
          : null
      }
      <div className="unconnected-account-alert__checkbox-wrapper">
        <Checkbox
          id="unconnectedAccount_dontShowThisAgain"
          checked={dontShowThisAgain}
          className="unconnected-account-alert__checkbox"
          onClick={() => setDontShowThisAgain((checked) => !checked)}
        />
        <label
          className="unconnected-account-alert__checkbox-label"
          htmlFor="unconnectedAccount_dontShowThisAgain"
        >
          { t('dontShowThisAgain') }
          <Tooltip
            position="top"
            title={t('alertDisableTooltip')}
            wrapperClassName="unconnected-account-alert__checkbox-label-tooltip"
          >
            <i className="fa fa-info-circle" />
          </Tooltip>
        </label>
      </div>
    </Popover>
  )
}

export default SwitchConnectedAccountAlert
