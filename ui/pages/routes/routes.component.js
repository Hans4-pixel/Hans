import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { matchPath, Route, Switch } from 'react-router-dom';
import IdleTimer from 'react-idle-timer';

import FirstTimeFlow from '../first-time-flow';
import SendTransactionScreen from '../send';
import Swaps from '../swaps';
import ConfirmTransaction from '../confirm-transaction';
import Home from '../home';
import Settings from '../settings';
import Authenticated from '../../helpers/higher-order-components/authenticated';
import Initialized from '../../helpers/higher-order-components/initialized';
import Lock from '../lock';
import PermissionsConnect from '../permissions-connect';
import RestoreVaultPage from '../keychains/restore-vault';
import RevealSeedConfirmation from '../keychains/reveal-seed';
import MobileSyncPage from '../mobile-sync';
import ImportTokenPage from '../import-token';
import AddCollectiblePage from '../add-collectible';
import ConfirmImportTokenPage from '../confirm-import-token';
import ConfirmAddSuggestedTokenPage from '../confirm-add-suggested-token';
import CreateAccountPage from '../create-account';
import Loading from '../../components/ui/loading-screen';
import LoadingNetwork from '../../components/app/loading-network-screen';
import NetworkDropdown from '../../components/app/dropdowns/network-dropdown';
import AccountMenu from '../../components/app/account-menu';
import { Modal } from '../../components/app/modals';
import Alert from '../../components/ui/alert';
import AppHeader from '../../components/app/app-header';
import UnlockPage from '../unlock-page';
import Alerts from '../../components/app/alerts';
import Asset from '../asset';
import OnboardingAppHeader from '../onboarding-flow/onboarding-app-header/onboarding-app-header';

import {
  IMPORT_TOKEN_ROUTE,
  ASSET_ROUTE,
  CONFIRM_ADD_SUGGESTED_TOKEN_ROUTE,
  CONFIRM_TRANSACTION_ROUTE,
  CONNECT_ROUTE,
  DEFAULT_ROUTE,
  INITIALIZE_UNLOCK_ROUTE,
  LOCK_ROUTE,
  MOBILE_SYNC_ROUTE,
  NEW_ACCOUNT_ROUTE,
  RESTORE_VAULT_ROUTE,
  REVEAL_SEED_ROUTE,
  SEND_ROUTE,
  SWAPS_ROUTE,
  SETTINGS_ROUTE,
  UNLOCK_ROUTE,
  BUILD_QUOTE_ROUTE,
  CONFIRMATION_V_NEXT_ROUTE,
  CONFIRM_IMPORT_TOKEN_ROUTE,
  INITIALIZE_ROUTE,
  ONBOARDING_ROUTE,
  ADD_COLLECTIBLE_ROUTE,
} from '../../helpers/constants/routes';

import {
  ENVIRONMENT_TYPE_NOTIFICATION,
  ENVIRONMENT_TYPE_POPUP,
} from '../../../shared/constants/app';
import { getEnvironmentType } from '../../../app/scripts/lib/util';
import ConfirmationPage from '../confirmation';
import OnboardingFlow from '../onboarding-flow/onboarding-flow';
import QRHardwarePopover from '../../components/app/qr-hardware-popover';

export default class Routes extends Component {
  static propTypes = {
    currentCurrency: PropTypes.string,
    setCurrentCurrencyToUSD: PropTypes.func,
    isLoading: PropTypes.bool,
    loadingMessage: PropTypes.string,
    alertMessage: PropTypes.string,
    textDirection: PropTypes.string,
    isNetworkLoading: PropTypes.bool,
    provider: PropTypes.object,
    frequentRpcListDetail: PropTypes.array,
    alertOpen: PropTypes.bool,
    isUnlocked: PropTypes.bool,
    setLastActiveTime: PropTypes.func,
    history: PropTypes.object,
    location: PropTypes.object,
    lockMetaMask: PropTypes.func,
    isMouseUser: PropTypes.bool,
    setMouseUserState: PropTypes.func,
    providerId: PropTypes.string,
    autoLockTimeLimit: PropTypes.number,
    pageChanged: PropTypes.func.isRequired,
    prepareToLeaveSwaps: PropTypes.func,
    browserEnvironment: PropTypes.object,
  };

  static contextTypes = {
    t: PropTypes.func,
    metricsEvent: PropTypes.func,
  };

  UNSAFE_componentWillMount() {
    const {
      currentCurrency,
      pageChanged,
      setCurrentCurrencyToUSD,
      history,
    } = this.props;
    if (!currentCurrency) {
      setCurrentCurrencyToUSD();
    }

    history.listen((locationObj, action) => {
      if (action === 'PUSH') {
        pageChanged(locationObj.pathname);
      }
    });
  }

  renderRoutes() {
    const { autoLockTimeLimit, setLastActiveTime } = this.props;
    const routes = (
      <Switch>
        {process.env.ONBOARDING_V2 && (
          <Route path={ONBOARDING_ROUTE} component={OnboardingFlow} />
        )}
        <Route path={LOCK_ROUTE} component={Lock} exact />
        <Route path={INITIALIZE_ROUTE} component={FirstTimeFlow} />
        <Initialized path={UNLOCK_ROUTE} component={UnlockPage} exact />
        <Initialized
          path={RESTORE_VAULT_ROUTE}
          component={RestoreVaultPage}
          exact
        />
        <Authenticated
          path={REVEAL_SEED_ROUTE}
          component={RevealSeedConfirmation}
          exact
        />
        <Authenticated
          path={MOBILE_SYNC_ROUTE}
          component={MobileSyncPage}
          exact
        />
        <Authenticated path={SETTINGS_ROUTE} component={Settings} />
        <Authenticated
          path={`${CONFIRM_TRANSACTION_ROUTE}/:id?`}
          component={ConfirmTransaction}
        />
        <Authenticated
          path={SEND_ROUTE}
          component={SendTransactionScreen}
          exact
        />
        <Authenticated path={SWAPS_ROUTE} component={Swaps} />
        <Authenticated
          path={IMPORT_TOKEN_ROUTE}
          component={ImportTokenPage}
          exact
        />
        {process.env.COLLECTIBLES_V1 ? (
          <Authenticated
            path={ADD_COLLECTIBLE_ROUTE}
            component={AddCollectiblePage}
            exact
          />
        ) : null}
        <Authenticated
          path={CONFIRM_IMPORT_TOKEN_ROUTE}
          component={ConfirmImportTokenPage}
          exact
        />
        <Authenticated
          path={CONFIRM_ADD_SUGGESTED_TOKEN_ROUTE}
          component={ConfirmAddSuggestedTokenPage}
          exact
        />
        <Authenticated
          path={CONFIRMATION_V_NEXT_ROUTE}
          component={ConfirmationPage}
        />
        <Authenticated path={NEW_ACCOUNT_ROUTE} component={CreateAccountPage} />
        <Authenticated
          path={`${CONNECT_ROUTE}/:id`}
          component={PermissionsConnect}
        />
        <Authenticated path={`${ASSET_ROUTE}/:asset`} component={Asset} />
        <Authenticated path={DEFAULT_ROUTE} component={Home} />
      </Switch>
    );

    if (autoLockTimeLimit > 0) {
      return (
        <IdleTimer onAction={setLastActiveTime} throttle={1000}>
          {routes}
        </IdleTimer>
      );
    }

    return routes;
  }

  onInitializationUnlockPage() {
    const { location } = this.props;
    return Boolean(
      matchPath(location.pathname, {
        path: INITIALIZE_UNLOCK_ROUTE,
        exact: true,
      }),
    );
  }

  onConfirmPage() {
    const { location } = this.props;
    return Boolean(
      matchPath(location.pathname, {
        path: CONFIRM_TRANSACTION_ROUTE,
        exact: false,
      }),
    );
  }

  onSwapsPage() {
    const { location } = this.props;
    return Boolean(
      matchPath(location.pathname, { path: SWAPS_ROUTE, exact: false }),
    );
  }

  onSwapsBuildQuotePage() {
    const { location } = this.props;
    return Boolean(
      matchPath(location.pathname, { path: BUILD_QUOTE_ROUTE, exact: false }),
    );
  }

  hideAppHeader() {
    const { location } = this.props;

    const isInitializing = Boolean(
      matchPath(location.pathname, {
        path: process.env.ONBOARDING_V2 ? ONBOARDING_ROUTE : INITIALIZE_ROUTE,
        exact: false,
      }),
    );

    if (isInitializing && !this.onInitializationUnlockPage()) {
      return true;
    }

    const windowType = getEnvironmentType();

    if (windowType === ENVIRONMENT_TYPE_NOTIFICATION) {
      return true;
    }

    if (windowType === ENVIRONMENT_TYPE_POPUP && this.onConfirmPage()) {
      return true;
    }

    const isHandlingPermissionsRequest = Boolean(
      matchPath(location.pathname, {
        path: CONNECT_ROUTE,
        exact: false,
      }),
    );

    const isHandlingAddEthereumChainRequest = Boolean(
      matchPath(location.pathname, {
        path: CONFIRMATION_V_NEXT_ROUTE,
        exact: false,
      }),
    );

    return isHandlingPermissionsRequest || isHandlingAddEthereumChainRequest;
  }

  showOnboardingHeader() {
    const { location } = this.props;

    return Boolean(
      matchPath(location.pathname, {
        path: ONBOARDING_ROUTE,
        exact: false,
      }),
    );
  }

  render() {
    const {
      isLoading,
      isUnlocked,
      alertMessage,
      textDirection,
      loadingMessage,
      isNetworkLoading,
      provider,
      frequentRpcListDetail,
      setMouseUserState,
      isMouseUser,
      prepareToLeaveSwaps,
      browserEnvironment,
    } = this.props;
    const loadMessage =
      loadingMessage || isNetworkLoading
        ? this.getConnectingLabel(loadingMessage)
        : null;

    const { os, browser } = browserEnvironment;
    return (
      <div
        className={classnames('app', {
          [`os-${os}`]: os,
          [`browser-${browser}`]: browser,
          'mouse-user-styles': isMouseUser,
        })}
        dir={textDirection}
        onClick={() => setMouseUserState(true)}
        onKeyDown={(e) => {
          if (e.keyCode === 9) {
            setMouseUserState(false);
          }
        }}
      >
        <QRHardwarePopover />
        <Modal />
        <Alert visible={this.props.alertOpen} msg={alertMessage} />
        {!this.hideAppHeader() && (
          <AppHeader
            hideNetworkIndicator={this.onInitializationUnlockPage()}
            disableNetworkIndicator={this.onSwapsPage()}
            onClick={async () => {
              if (this.onSwapsPage()) {
                await prepareToLeaveSwaps();
              }
            }}
            disabled={
              this.onConfirmPage() ||
              (this.onSwapsPage() && !this.onSwapsBuildQuotePage())
            }
          />
        )}
        {process.env.ONBOARDING_V2 && this.showOnboardingHeader() && (
          <OnboardingAppHeader />
        )}
        <NetworkDropdown
          provider={provider}
          frequentRpcListDetail={frequentRpcListDetail}
        />
        <AccountMenu />
        <div className="main-container-wrapper">
          {isLoading ? <Loading loadingMessage={loadMessage} /> : null}
          {!isLoading && isNetworkLoading ? <LoadingNetwork /> : null}
          {this.renderRoutes()}
        </div>
        {isUnlocked ? <Alerts history={this.props.history} /> : null}
      </div>
    );
  }

  toggleMetamaskActive() {
    if (this.props.isUnlocked) {
      // currently active: deactivate
      this.props.lockMetaMask();
    } else {
      // currently inactive: redirect to password box
      const passwordBox = document.querySelector('input[type=password]');
      if (!passwordBox) {
        return;
      }
      passwordBox.focus();
    }
  }

  getConnectingLabel(loadingMessage) {
    if (loadingMessage) {
      return loadingMessage;
    }
    const { provider, providerId } = this.props;

    switch (provider.type) {
      case 'mainnet':
        return this.context.t('connectingToMainnet');
      case 'ropsten':
        return this.context.t('connectingToRopsten');
      case 'kovan':
        return this.context.t('connectingToKovan');
      case 'rinkeby':
        return this.context.t('connectingToRinkeby');
      case 'goerli':
        return this.context.t('connectingToGoerli');
      default:
        return this.context.t('connectingTo', [providerId]);
    }
  }

  getNetworkName() {
    switch (this.props.provider.type) {
      case 'mainnet':
        return this.context.t('mainnet');
      case 'ropsten':
        return this.context.t('ropsten');
      case 'kovan':
        return this.context.t('kovan');
      case 'rinkeby':
        return this.context.t('rinkeby');
      case 'goerli':
        return this.context.t('goerli');
      default:
        return this.context.t('unknownNetwork');
    }
  }
}
