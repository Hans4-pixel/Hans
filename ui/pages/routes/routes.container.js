import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import {
  getAllAccountsOnNetworkAreEmpty,
  getIsNetworkUsed,
  getNetworkIdentifier,
  getPreferences,
  isNetworkLoading,
  getTheme,
  getIsTestnet,
  getCurrentChainId,
  getShouldShowSeedPhraseReminder,
  isCurrentProviderCustom,
  ///: BEGIN:ONLY_INCLUDE_IF(keyring-snaps)
  getUnapprovedConfirmations,
  ///: END:ONLY_INCLUDE_IF
  getShowExtensionInFullSizeView,
  getSelectedAccount,
  getSwitchedNetworkDetails,
  getNeverShowSwitchedNetworkMessage,
  getNetworkToAutomaticallySwitchTo,
  getNumberOfAllUnapprovedTransactionsAndMessages,
  getUseRequestQueue,
  getCurrentNetwork,
} from '../../selectors';
import {
  lockMetamask,
  hideImportNftsModal,
  hideIpfsModal,
  setCurrentCurrency,
  setLastActiveTime,
  toggleAccountMenu,
  toggleNetworkMenu,
  hideImportTokensModal,
  hideDeprecatedNetworkModal,
  addPermittedAccount,
  setSurveyLinkLastClickedOrClosed,
  automaticallySwitchNetwork,
  clearSwitchedNetworkDetails,
  neverShowSwitchedNetworkMessage,
  ///: BEGIN:ONLY_INCLUDE_IF(keyring-snaps)
  hideKeyringRemovalResultModal,
  ///: END:ONLY_INCLUDE_IF
  setEditedNetwork,
  hidePermittedNetworkToast,
} from '../../store/actions';
import { pageChanged } from '../../ducks/history/history';
import { prepareToLeaveSwaps } from '../../ducks/swaps/swaps';
import { getSendStage } from '../../ducks/send';
import {
  getIsUnlocked,
  getProviderConfig,
} from '../../ducks/metamask/metamask';
import { DEFAULT_AUTO_LOCK_TIME_LIMIT } from '../../../shared/constants/preferences';
import Routes from './routes.component';

function mapStateToProps(state) {
  const { activeTab, appState } = state;
  const { alertOpen, alertMessage, isLoading, loadingMessage } = appState;
  const { autoLockTimeLimit = DEFAULT_AUTO_LOCK_TIME_LIMIT } =
    getPreferences(state);
  const { completedOnboarding } = state.metamask;

  // If there is more than one connected account to activeTabOrigin,
  // *BUT* the current account is not one of them, show the banner
  const account = getSelectedAccount(state);
  const activeTabOrigin = activeTab?.origin;
  const currentNetwork = getCurrentNetwork(state);

  const networkToAutomaticallySwitchTo =
    getNetworkToAutomaticallySwitchTo(state);
  const switchedNetworkDetails = getSwitchedNetworkDetails(state);

  return {
    alertOpen,
    alertMessage,
    account,
    activeTabOrigin,
    textDirection: state.metamask.textDirection,
    isLoading,
    loadingMessage,
    isUnlocked: getIsUnlocked(state),
    isNetworkLoading: isNetworkLoading(state),
    currentCurrency: state.metamask.currentCurrency,
    autoLockTimeLimit,
    browserEnvironmentOs: state.metamask.browserEnvironment?.os,
    browserEnvironmentContainter: state.metamask.browserEnvironment?.browser,
    providerId: getNetworkIdentifier(state),
    providerType: getProviderConfig(state).type,
    theme: getTheme(state),
    sendStage: getSendStage(state),
    isNetworkUsed: getIsNetworkUsed(state),
    allAccountsOnNetworkAreEmpty: getAllAccountsOnNetworkAreEmpty(state),
    isTestNet: getIsTestnet(state),
    showExtensionInFullSizeView: getShowExtensionInFullSizeView(state),
    currentChainId: getCurrentChainId(state),
    shouldShowSeedPhraseReminder: getShouldShowSeedPhraseReminder(state),
    forgottenPassword: state.metamask.forgottenPassword,
    isCurrentProviderCustom: isCurrentProviderCustom(state),
    completedOnboarding,
    isAccountMenuOpen: state.metamask.isAccountMenuOpen,
    isNetworkMenuOpen: state.metamask.isNetworkMenuOpen,
    isImportTokensModalOpen: state.appState.importTokensModalOpen,
    isBasicConfigurationModalOpen: state.appState.showBasicFunctionalityModal,
    isDeprecatedNetworkModalOpen: state.appState.deprecatedNetworkModalOpen,
    accountDetailsAddress: state.appState.accountDetailsAddress,
    isImportNftsModalOpen: state.appState.importNftsModal.open,
    isIpfsModalOpen: state.appState.showIpfsModalOpen,
    isPermittedNetworkToastOpen: state.appState.showPermittedNetworkToastOpen,
    switchedNetworkDetails,
    networkToAutomaticallySwitchTo,
    currentNetwork,
    totalUnapprovedConfirmationCount:
      getNumberOfAllUnapprovedTransactionsAndMessages(state),
    neverShowSwitchedNetworkMessage: getNeverShowSwitchedNetworkMessage(state),
    currentExtensionPopupId: state.metamask.currentExtensionPopupId,
    useRequestQueue: getUseRequestQueue(state),
    ///: BEGIN:ONLY_INCLUDE_IF(keyring-snaps)
    isShowKeyringSnapRemovalResultModal:
      state.appState.showKeyringRemovalSnapModal,
    pendingConfirmations: getUnapprovedConfirmations(state),
    ///: END:ONLY_INCLUDE_IF
  };
}

function mapDispatchToProps(dispatch) {
  return {
    lockMetaMask: () => dispatch(lockMetamask(false)),
    setCurrentCurrencyToUSD: () => dispatch(setCurrentCurrency('usd')),
    setLastActiveTime: () => dispatch(setLastActiveTime()),
    pageChanged: (path) => dispatch(pageChanged(path)),
    prepareToLeaveSwaps: () => dispatch(prepareToLeaveSwaps()),
    toggleAccountMenu: () => dispatch(toggleAccountMenu()),
    toggleNetworkMenu: () => dispatch(toggleNetworkMenu()),
    hideImportNftsModal: () => dispatch(hideImportNftsModal()),
    hideIpfsModal: () => dispatch(hideIpfsModal()),
    hidePermittedNetworkToast: () => dispatch(hidePermittedNetworkToast()),
    hideImportTokensModal: () => dispatch(hideImportTokensModal()),
    hideDeprecatedNetworkModal: () => dispatch(hideDeprecatedNetworkModal()),
    addPermittedAccount: (activeTabOrigin, address) =>
      dispatch(addPermittedAccount(activeTabOrigin, address)),
    clearSwitchedNetworkDetails: () => dispatch(clearSwitchedNetworkDetails()),
    setSwitchedNetworkNeverShowMessage: () =>
      dispatch(neverShowSwitchedNetworkMessage()),
    automaticallySwitchNetwork: (networkId, selectedTabOrigin) =>
      dispatch(automaticallySwitchNetwork(networkId, selectedTabOrigin)),
    setSurveyLinkLastClickedOrClosed: (time) =>
      dispatch(setSurveyLinkLastClickedOrClosed(time)),
    clearEditedNetwork: () => dispatch(setEditedNetwork()),
    ///: BEGIN:ONLY_INCLUDE_IF(keyring-snaps)
    hideShowKeyringSnapRemovalResultModal: () =>
      dispatch(hideKeyringRemovalResultModal()),
    ///: END:ONLY_INCLUDE_IF
  };
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(Routes);
