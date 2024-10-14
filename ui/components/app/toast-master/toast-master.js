/* eslint-disable react/prop-types -- TODO: upgrade to TypeScript */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MILLISECOND, SECOND } from '../../../../shared/constants/time';
import {
  PRIVACY_POLICY_LINK,
  SURVEY_LINK,
} from '../../../../shared/lib/ui-utils';
import {
  BorderColor,
  BorderRadius,
  IconColor,
  TextVariant,
} from '../../../helpers/constants/design-system';
import {
  DEFAULT_ROUTE,
  REVIEW_PERMISSIONS,
} from '../../../helpers/constants/routes';
import { getURLHost } from '../../../helpers/utils/util';
import { usePrevious } from '../../../hooks/usePrevious';
import { getShowAutoNetworkSwitchTest } from '../../../pages/routes/utils';
import { getSelectedAccount, getUseNftDetection } from '../../../selectors';
import { hidePermittedNetworkToast } from '../../../store/actions';
import {
  AvatarAccount,
  AvatarAccountSize,
  AvatarNetwork,
  Icon,
  IconName,
} from '../../component-library';
import { Toast, ToastContainer } from '../../multichain';
import { SurveyToast } from '../../ui/survey-toast';
import {
  selectNftDetectionEnablementToast,
  selectShowConnectAccountToast,
  selectShowPrivacyPolicyToast,
  selectShowSurveyToast,
  setNewPrivacyPolicyToastClickedOrClosed,
  setNewPrivacyPolicyToastShownDate,
  setShowNftDetectionEnablementToast,
} from './selectors';

export function ToastMaster({ props, context }) {
  const { t } = context;
  const {
    activeTabOrigin,
    addPermittedAccount,
    clearSwitchedNetworkDetails,
    setSurveyLinkLastClickedOrClosed,
    setSwitchedNetworkNeverShowMessage,
    switchedNetworkDetails,
    currentNetwork,
  } = props;

  const dispatch = useDispatch();

  const showAutoNetworkSwitchToast = getShowAutoNetworkSwitchTest(props);

  const { showPrivacyPolicyToast, newPrivacyPolicyToastShownDate } =
    useSelector(selectShowPrivacyPolicyToast);

  const autoHideToastDelay = 5 * SECOND;
  const safeEncodedHost = encodeURIComponent(activeTabOrigin);

  const showSurveyToast = useSelector(selectShowSurveyToast);

  const [hideConnectAccountToast, setHideConnectAccountToast] = useState(false);
  const account = useSelector(getSelectedAccount);

  // If the account has changed, allow the connect account toast again
  const prevAccountAddress = usePrevious(account?.address);
  if (account?.address !== prevAccountAddress && hideConnectAccountToast) {
    setHideConnectAccountToast(false);
  }

  const showConnectAccountToast = useSelector((state) =>
    selectShowConnectAccountToast(state, account),
  );

  const showNftEnablementToast = useSelector(selectNftDetectionEnablementToast);
  const useNftDetection = useSelector(getUseNftDetection);

  // If the privacy policy toast is shown, and there is no date set, set it
  if (showPrivacyPolicyToast && !newPrivacyPolicyToastShownDate) {
    setNewPrivacyPolicyToastShownDate(Date.now());
  }

  const isPermittedNetworkToastOpen = useSelector(
    (state) => state.appState.showPermittedNetworkToastOpen,
  );

  if (!onHomeScreen(props)) {
    return null;
  }

  return (
    <ToastContainer>
      <SurveyToast />
      {!hideConnectAccountToast && showConnectAccountToast && (
        <Toast
          dataTestId="connect-account-toast"
          key="connect-account-toast"
          startAdornment={
            <AvatarAccount
              address={account.address}
              size={AvatarAccountSize.Md}
              borderColor={BorderColor.transparent}
            />
          }
          text={t('accountIsntConnectedToastText', [
            account?.metadata?.name,
            getURLHost(activeTabOrigin),
          ])}
          actionText={t('connectAccount')}
          onActionClick={() => {
            // Connect this account
            addPermittedAccount(activeTabOrigin, account.address);
            // Use setTimeout to prevent React re-render from
            // hiding the tooltip
            setTimeout(() => {
              // Trigger a mouseenter on the header's connection icon
              // to display the informative connection tooltip
              document
                .querySelector(
                  '[data-testid="connection-menu"] [data-tooltipped]',
                )
                ?.dispatchEvent(new CustomEvent('mouseenter', {}));
            }, 250 * MILLISECOND);
          }}
          onClose={() => setHideConnectAccountToast(true)}
        />
      )}
      {showSurveyToast && (
        <Toast
          key="survey-toast"
          startAdornment={
            <Icon name={IconName.Heart} color={IconColor.errorDefault} />
          }
          text={t('surveyTitle')}
          actionText={t('surveyConversion')}
          onActionClick={() => {
            global.platform.openTab({
              url: SURVEY_LINK,
            });
            setSurveyLinkLastClickedOrClosed(Date.now());
          }}
          onClose={() => {
            setSurveyLinkLastClickedOrClosed(Date.now());
          }}
        />
      )}
      {showPrivacyPolicyToast && (
        <Toast
          key="privacy-policy-toast"
          startAdornment={
            <Icon name={IconName.Info} color={IconColor.iconDefault} />
          }
          text={t('newPrivacyPolicyTitle')}
          actionText={t('newPrivacyPolicyActionButton')}
          onActionClick={() => {
            global.platform.openTab({
              url: PRIVACY_POLICY_LINK,
            });
            setNewPrivacyPolicyToastClickedOrClosed();
          }}
          onClose={setNewPrivacyPolicyToastClickedOrClosed}
        />
      )}
      {showAutoNetworkSwitchToast && (
        <Toast
          key="switched-network-toast"
          startAdornment={
            <AvatarNetwork
              size={AvatarAccountSize.Md}
              borderColor={BorderColor.transparent}
              src={switchedNetworkDetails?.imageUrl || ''}
              name={switchedNetworkDetails?.nickname}
            />
          }
          text={t('switchedNetworkToastMessage', [
            switchedNetworkDetails.nickname,
            getURLHost(switchedNetworkDetails.origin),
          ])}
          actionText={t('switchedNetworkToastDecline')}
          onActionClick={() => setSwitchedNetworkNeverShowMessage()}
          onClose={() => clearSwitchedNetworkDetails()}
        />
      )}
      {showNftEnablementToast && useNftDetection && (
        <Toast
          key="enabled-nft-auto-detection"
          startAdornment={
            <Icon name={IconName.CheckBold} color={IconColor.iconDefault} />
          }
          text={t('nftAutoDetectionEnabled')}
          borderRadius={BorderRadius.LG}
          textVariant={TextVariant.bodyMd}
          autoHideTime={autoHideToastDelay}
          onAutoHideToast={() =>
            dispatch(setShowNftDetectionEnablementToast(false))
          }
        />
      )}
      {isPermittedNetworkToastOpen && (
        <Toast
          key="switched-permitted-network-toast"
          startAdornment={
            <AvatarNetwork
              size={AvatarAccountSize.Md}
              borderColor={BorderColor.transparent}
              src={currentNetwork?.rpcPrefs.imageUrl || ''}
              name={currentNetwork?.nickname}
            />
          }
          text={t('permittedChainToastUpdate', [
            getURLHost(activeTabOrigin),
            currentNetwork?.nickname,
          ])}
          actionText={t('editPermissions')}
          onActionClick={() => {
            dispatch(hidePermittedNetworkToast());
            props.history.push(`${REVIEW_PERMISSIONS}/${safeEncodedHost}`);
          }}
          onClose={() => dispatch(hidePermittedNetworkToast())}
        />
      )}
    </ToastContainer>
  );
}

function onHomeScreen(props) {
  const { location } = props;
  return location.pathname === DEFAULT_ROUTE;
}
