import * as Sentry from '@sentry/browser';
import { Dedupe, ExtraErrorData } from '@sentry/integrations';

import { FilterEvents } from './sentry-filter-events';
import extractEthjsErrorMessage from './extractEthjsErrorMessage';

/* eslint-disable prefer-destructuring */
// Destructuring breaks the inlining of the environment variables
const METAMASK_DEBUG = process.env.METAMASK_DEBUG;
const METAMASK_ENVIRONMENT = process.env.METAMASK_ENVIRONMENT;
const SENTRY_DSN_DEV =
  process.env.SENTRY_DSN_DEV ||
  'https://f59f3dd640d2429d9d0e2445a87ea8e1@sentry.io/273496';
const METAMASK_BUILD_TYPE = process.env.METAMASK_BUILD_TYPE;
const IN_TEST = process.env.IN_TEST;
/* eslint-enable prefer-destructuring */

export const ERROR_URL_ALLOWLIST = {
  CRYPTOCOMPARE: 'cryptocompare.com',
  COINGECKO: 'coingecko.com',
  ETHERSCAN: 'etherscan.io',
  CODEFI: 'codefi.network',
  SEGMENT: 'segment.io',
};

// This describes the subset of background controller state attached to errors
// sent to Sentry These properties have some potential to be useful for
// debugging, and they do not contain any identifiable information.
export const SENTRY_BACKGROUND_STATE = {
  AccountTracker: {
    currentBlockGasLimit: true,
  },
  PermissionLogController: {
    // double-check if contains PID?
    permissionHistory: true,
    // double-check if contains PID?
    permissionActivityLog: true,
  },
  AnnouncementController: {
    announcements: true,
  },
  GasFeeController: {
    gasFeeEstimates: true,
    estimatedGasFeeTimeBounds: true,
    gasEstimateType: true,
  },
  TokenListController: {
    // double-check if contains PID?
    tokenList: true,
    tokensChainsCache: true,
    preventPollingOnNetworkRestart: true,
  },
  TokensController: {
    // double-check if contains PID?
    tokens: true,
    // double-check if contains PID?
    ignoredTokens: true,
    // double-check if contains PID?
    detectedTokens: true,
    // double-check if contains PID?
    allTokens: true,
    // double-check if contains PID?
    allIgnoredTokens: true,
    // double-check if contains PID?
    allDetectedTokens: true,
  },
  SmartTransactionsController: {
    smartTransactions: false,
    userOptIn: true,
    liveness: true,
    fees: {
      approvalTxFees: true,
      tradeTxFees: true,
    },
  },
  NotificationController: {
    // double-check if contains PID?
    notifications: true,
  },
  AlertController: {
    alertEnabledness: true,
  },
  AppMetadataController: {
    currentAppVersion: true,
    previousAppVersion: true,
    previousMigrationVersion: true,
    currentMigrationVersion: true,
  },
  AppStateController: {
    timeoutMinutes: true,
    connectedStatusPopoverHasBeenShown: true,
    defaultHomeActiveTabName: true,
    browserEnvironment: true,
    popupGasPollTokens: true,
    notificationGasPollTokens: true,
    fullScreenGasPollTokens: true,
    recoveryPhraseReminderHasBeenShown: true,
    recoveryPhraseReminderLastShown: true,
    outdatedBrowserWarningLastShown: true,
    nftsDetectionNoticeDismissed: true,
    showTestnetMessageInDropdown: true,
    showBetaHeader: true,
    showProductTour: true,
    trezorModel: true,
    currentPopupId: false,
    qrHardware: true,
    nftsDropdownState: true,
    usedNetworks: true,
    serviceWorkerLastActiveTime: true,
  },
  CurrencyController: {
    conversionDate: true,
    conversionRate: true,
    currentCurrency: true,
    nativeCurrency: true,
    pendingCurrentCurrency: true,
    pendingNativeCurrency: true,
    usdConversionRate: true,
  },
  DecryptMessageController: {
    unapprovedDecryptMsgCount: true,
  },
  EncryptionPublicKeyController: {
    unapprovedEncryptionPublicKeyMsgCount: true,
  },
  KeyringController: {
    isUnlocked: true,
  },
  MetaMetricsController: {
    metaMetricsId: true,
    participateInMetaMetrics: true,
    eventsBeforeMetricsOptIn: true,
  },
  NetworkController: {
    networkStatus: true,
    selectedNetworkClientId: false,
    networkId: true,
    providerConfig: {
      rpcUrl: false,
      type: true,
      chainId: false,
      ticker: true,
      nickname: true,
      rpcPrefs: false,
      id: false,
    },
    networkConfigurations: false,
    networksMetadata: {
      EIPS: true,
      status: true,
    },
  },
  NftController: {
    allNftContracts: false,
    allNfts: false,
    ignoredNfts: false,
  },
  OnboardingController: {
    completedOnboarding: true,
    firstTimeFlowType: true,
    seedPhraseBackedUp: true,
  },
  PreferencesController: {
    featureFlags: true,
    // double-check if contains PID?
    ipfsGateway: true,
    identities: false,
    lostIdentities: false,
    selectedAddress: false,
    useTokenDetection: true,
    useNftDetection: true,
    openSeaEnabled: true,
    isMultiAccountBalancesEnabled: true,
    disabledRpcMethodPreferences: true,
    showTestNetworks: true,
    isIpfsGatewayEnabled: true,
    useBlockie: true,
    useNonceField: true,
    usePhishDetect: true,
    dismissSeedBackUpReminder: true,
    useMultiAccountBalanceChecker: true,
    use4ByteResolution: true,
    useCurrencyRateCheck: true,
    advancedGasFee: true,
    incomingTransactionsPreferences: true,
    // double-check if contains PID?
    knownMethodData: true,
    currentLocale: true,
    forgottenPassword: true,
    preferences: {
      autoLockTimeLimit: true,
      showFiatInTestnets: true,
      showTestNetworks: true,
      useNativeCurrencyAsPrimaryCurrency: true,
      hideZeroBalanceTokens: true,
    },
    useAddressBarEnsResolution: true,
    infuraBlocked: true,
    ledgerTransportType: true,
    snapRegistryList: true,
    transactionSecurityCheckEnabled: true,
    theme: true,
    isLineaMainnetReleased: true,

    securityAlertsEnabled: false,
    snapsAddSnapAccountModalDismissed: true,
  },
  SignatureController: {
    unapprovedMsgs: false,
    unapprovedPersonalMsgs: false,
    unapprovedTypedMessages: false,
    unapprovedMsgCount: true,
    unapprovedPersonalMsgCount: true,
    unapprovedTypedMessagesCount: true,
  },
  SwapsController: {
    swapsState: {
      // double-check if contains PID?
      quotes: false,
      quotesPollingLimitEnabled: true,
      fetchParams: true,
      // double-check if contains PID?
      tokens: true,
      tradeTxId: false,
      approveTxId: false,
      quotesLastFetched: true,
      customMaxGas: true,
      customGasPrice: true,
      customMaxFeePerGas: true,
      customMaxPriorityFeePerGas: true,
      swapsUserFeeLevel: true,
      selectedAggId: true,
      customApproveTxData: true,
      errorKey: true,
      topAggId: false,
      routeState: true,
      swapsFeatureIsLive: true,
      saveFetchedQuotes: true,
      swapsQuoteRefreshTime: true,
      swapsQuotePrefetchingRefreshTime: true,
      swapsStxBatchStatusRefreshTime: true,
      swapsStxGetTransactionsRefreshTime: true,
      swapsStxMaxFeeMultiplier: true,
      swapsFeatureFlags: true,
    },
  },
  SnapController: {
    // double-check if contains PID?
    snaps: true,
    snapStates: true,
    snapErrors: true,
  },
  CronjobController: {
    jobs: true,
  },
  DesktopController: {
    desktopEnabled: true,
  },
  // we're not sending any data to Sentry from the following controllers
  // PermissionController
  // TransactionController
  // AddressBookController
  // CachedBalancesController
  // SubjectMetadataController
  // PhishingController
  // SnapsRegistry
};

const flattenedBackgroundStateMask = Object.values(
  SENTRY_BACKGROUND_STATE,
).reduce((partialBackgroundState, controllerState) => {
  return {
    ...partialBackgroundState,
    ...controllerState,
  };
}, {});

// This describes the subset of Redux state attached to errors sent to Sentry
// These properties have some potential to be useful for debugging, and they do
// not contain any identifiable information.
export const SENTRY_UI_STATE = {
  gas: true,
  history: true,
  metamask: {
    ...flattenedBackgroundStateMask,
    // This property comes from the background but isn't in controller state
    isInitialized: true,
    // These properties are in the `metamask` slice but not in the background state
    customNonceValue: true,
    isAccountMenuOpen: true,
    nextNonce: true,
    welcomeScreenSeen: true,
  },
  unconnectedAccount: true,
};

/**
 * Returns whether MetaMetrics is enabled, given the application state.
 *
 * @param {{ state: unknown} | { persistedState: unknown }} appState - Application state
 * @returns `true` if MetaMask's state has been initialized, and MetaMetrics
 * is enabled, `false` otherwise.
 */
function getMetaMetricsEnabledFromAppState(appState) {
  // during initialization after loading persisted state
  if (appState.persistedState) {
    return getMetaMetricsEnabledFromPersistedState(appState.persistedState);
    // After initialization
  } else if (appState.state) {
    // UI
    if (appState.state.metamask) {
      return Boolean(appState.state.metamask.participateInMetaMetrics);
    }
    // background
    return Boolean(
      appState.state.MetaMetricsController?.participateInMetaMetrics,
    );
  }
  // during initialization, before first persisted state is read
  return false;
}

/**
 * Returns whether MetaMetrics is enabled, given the persisted state.
 *
 * @param {unknown} persistedState - Application state
 * @returns `true` if MetaMask's state has been initialized, and MetaMetrics
 * is enabled, `false` otherwise.
 */
function getMetaMetricsEnabledFromPersistedState(persistedState) {
  return Boolean(
    persistedState?.data?.MetaMetricsController?.participateInMetaMetrics,
  );
}

/**
 * Returns whether onboarding has completed, given the application state.
 *
 * @param {Record<string, unknown>} appState - Application state
 * @returns `true` if MetaMask's state has been initialized, and MetaMetrics
 * is enabled, `false` otherwise.
 */
function getOnboardingCompleteFromAppState(appState) {
  // during initialization after loading persisted state
  if (appState.persistedState) {
    return Boolean(
      appState.persistedState.data?.OnboardingController?.completedOnboarding,
    );
    // After initialization
  } else if (appState.state) {
    // UI
    if (appState.state.metamask) {
      return Boolean(appState.state.metamask.completedOnboarding);
    }
    // background
    return Boolean(appState.state.OnboardingController?.completedOnboarding);
  }
  // during initialization, before first persisted state is read
  return false;
}

export default function setupSentry({ release, getState }) {
  if (!release) {
    throw new Error('Missing release');
  } else if (METAMASK_DEBUG && !IN_TEST) {
    /**
     * Workaround until the following issue is resolved
     * https://github.com/MetaMask/metamask-extension/issues/15691
     * The IN_TEST condition allows the e2e tests to run with both
     * yarn start:test and yarn build:test
     */
    return undefined;
  }

  const environment =
    METAMASK_BUILD_TYPE === 'main'
      ? METAMASK_ENVIRONMENT
      : `${METAMASK_ENVIRONMENT}-${METAMASK_BUILD_TYPE}`;

  let sentryTarget;
  if (METAMASK_ENVIRONMENT === 'production') {
    if (!process.env.SENTRY_DSN) {
      throw new Error(
        `Missing SENTRY_DSN environment variable in production environment`,
      );
    }
    console.log(
      `Setting up Sentry Remote Error Reporting for '${environment}': SENTRY_DSN`,
    );
    sentryTarget = process.env.SENTRY_DSN;
  } else {
    console.log(
      `Setting up Sentry Remote Error Reporting for '${environment}': SENTRY_DSN_DEV`,
    );
    sentryTarget = SENTRY_DSN_DEV;
  }

  /**
   * Returns whether MetaMetrics is enabled. If the application hasn't yet
   * been initialized, the persisted state will be used (if any).
   *
   * @returns `true` if MetaMetrics is enabled, `false` otherwise.
   */
  async function getMetaMetricsEnabled() {
    const appState = getState();
    if (appState.state || appState.persistedState) {
      return getMetaMetricsEnabledFromAppState(appState);
    }
    // If we reach here, it means the error was thrown before initialization
    // completed, and before we loaded the persisted state for the first time.
    try {
      const persistedState = await globalThis.stateHooks.getPersistedState();
      return getMetaMetricsEnabledFromPersistedState(persistedState);
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  Sentry.init({
    dsn: sentryTarget,
    debug: METAMASK_DEBUG,
    /**
     * autoSessionTracking defaults to true and operates by sending a session
     * packet to sentry. This session packet does not appear to be filtered out
     * via our beforeSend or FilterEvents integration. To avoid sending a
     * request before we have the state tree and can validate the users
     * preferences, we initiate this to false. Later, in startSession and
     * endSession we modify this option and start the session or end the
     * session manually.
     *
     * In sentry-install we call toggleSession after the page loads and state
     * is available, this handles initiating the session for a user who has
     * opted into MetaMetrics. This script is ran in both the background and UI
     * so it should be effective at starting the session in both places.
     *
     * In the MetaMetricsController the session is manually started or stopped
     * when the user opts in or out of MetaMetrics. This occurs in the
     * setParticipateInMetaMetrics function which is exposed to the UI via the
     * MetaMaskController.
     *
     * In actions.ts, after sending the updated participateInMetaMetrics flag
     * to the background, we call toggleSession to ensure sentry is kept in
     * sync with the user's preference.
     *
     * Types for the global Sentry object, and the new methods added as part of
     * this effort were added to global.d.ts in the types folder.
     */
    autoSessionTracking: false,
    environment,
    integrations: [
      /**
       * Filtering of events must happen in this FilterEvents custom
       * integration instead of in the beforeSend handler because the Dedupe
       * integration is unaware of the beforeSend functionality. If an event is
       * queued in the sentry context, additional events of the same name will
       * be filtered out by Dedupe even if the original event was not sent due
       * to the beforeSend method returning null.
       *
       * @see https://github.com/MetaMask/metamask-extension/pull/15677
       */
      new FilterEvents({ getMetaMetricsEnabled }),
      new Dedupe(),
      new ExtraErrorData(),
    ],
    release,
    beforeSend: (report) => rewriteReport(report, getState),
    beforeBreadcrumb: beforeBreadcrumb(getState),
  });

  /**
   * As long as a reference to the Sentry Hub can be found, and the user has
   * opted into MetaMetrics, change the autoSessionTracking option and start
   * a new sentry session.
   */
  const startSession = async () => {
    const hub = Sentry.getCurrentHub?.();
    const options = hub.getClient?.().getOptions?.() ?? {};
    if (hub && (await getMetaMetricsEnabled()) === true) {
      options.autoSessionTracking = true;
      hub.startSession();
    }
  };

  /**
   * As long as a reference to the Sentry Hub can be found, and the user has
   * opted out of MetaMetrics, change the autoSessionTracking option and end
   * the current sentry session.
   */
  const endSession = async () => {
    const hub = Sentry.getCurrentHub?.();
    const options = hub.getClient?.().getOptions?.() ?? {};
    if (hub && (await getMetaMetricsEnabled()) === false) {
      options.autoSessionTracking = false;
      hub.endSession();
    }
  };

  /**
   * Call the appropriate method (either startSession or endSession) depending
   * on the state of metaMetrics optin and the state of autoSessionTracking on
   * the Sentry client.
   */
  const toggleSession = async () => {
    const hub = Sentry.getCurrentHub?.();
    const options = hub.getClient?.().getOptions?.() ?? {
      autoSessionTracking: false,
    };
    const isMetaMetricsEnabled = await getMetaMetricsEnabled();
    if (
      isMetaMetricsEnabled === true &&
      options.autoSessionTracking === false
    ) {
      await startSession();
    } else if (
      isMetaMetricsEnabled === false &&
      options.autoSessionTracking === true
    ) {
      await endSession();
    }
  };

  return {
    ...Sentry,
    startSession,
    endSession,
    toggleSession,
  };
}

/**
 * Receives a string and returns that string if it is a
 * regex match for a url with a `chrome-extension` or `moz-extension`
 * protocol, and an empty string otherwise.
 *
 * @param {string} url - The URL to check.
 * @returns {string} An empty string if the URL was internal, or the unmodified URL otherwise.
 */
function hideUrlIfNotInternal(url) {
  const re = /^(chrome-extension|moz-extension):\/\//u;
  if (!url.match(re)) {
    return '';
  }
  return url;
}

/**
 * Returns a method that handles the Sentry breadcrumb using a specific method to get the extension state
 *
 * @param {Function} getState - A method that returns the state of the extension
 * @returns {(breadcrumb: object) => object} A method that modifies a Sentry breadcrumb object
 */
export function beforeBreadcrumb(getState) {
  return (breadcrumb) => {
    if (!getState) {
      return null;
    }
    const appState = getState();
    if (
      !getMetaMetricsEnabledFromAppState(appState) ||
      !getOnboardingCompleteFromAppState(appState) ||
      breadcrumb?.category === 'ui.input'
    ) {
      return null;
    }
    const newBreadcrumb = removeUrlsFromBreadCrumb(breadcrumb);
    return newBreadcrumb;
  };
}

/**
 * Receives a Sentry breadcrumb object and potentially removes urls
 * from its `data` property, it particular those possibly found at
 * data.from, data.to and data.url
 *
 * @param {object} breadcrumb - A Sentry breadcrumb object: https://develop.sentry.dev/sdk/event-payloads/breadcrumbs/
 * @returns {object} A modified Sentry breadcrumb object.
 */
export function removeUrlsFromBreadCrumb(breadcrumb) {
  if (breadcrumb?.data?.url) {
    breadcrumb.data.url = hideUrlIfNotInternal(breadcrumb.data.url);
  }
  if (breadcrumb?.data?.to) {
    breadcrumb.data.to = hideUrlIfNotInternal(breadcrumb.data.to);
  }
  if (breadcrumb?.data?.from) {
    breadcrumb.data.from = hideUrlIfNotInternal(breadcrumb.data.from);
  }
  return breadcrumb;
}

/**
 * Receives a Sentry event object and modifies it before the
 * error is sent to Sentry. Modifications include both sanitization
 * of data via helper methods and addition of state data from the
 * return value of the second parameter passed to the function.
 *
 * @param {object} report - A Sentry event object: https://develop.sentry.dev/sdk/event-payloads/
 * @param {Function} getState - A function that should return an object representing some amount
 * of app state that we wish to submit with our error reports
 * @returns {object} A modified Sentry event object.
 */
export function rewriteReport(report, getState) {
  try {
    // simplify certain complex error messages (e.g. Ethjs)
    simplifyErrorMessages(report);
    // remove urls from error message
    sanitizeUrlsFromErrorMessages(report);
    // Remove evm addresses from error message.
    // Note that this is redundent with data scrubbing we do within our sentry dashboard,
    // but putting the code here as well gives public visibility to how we are handling
    // privacy with respect to sentry.
    sanitizeAddressesFromErrorMessages(report);
    // modify report urls
    rewriteReportUrls(report);
    // append app state
    if (getState) {
      const appState = getState();
      if (!report.extra) {
        report.extra = {};
      }
      report.extra.appState = appState;
    }
  } catch (err) {
    console.warn(err);
  }
  return report;
}

/**
 * Receives a Sentry event object and modifies it so that urls are removed from any of its
 * error messages.
 *
 * @param {object} report - the report to modify
 */
function sanitizeUrlsFromErrorMessages(report) {
  rewriteErrorMessages(report, (errorMessage) => {
    let newErrorMessage = errorMessage;
    const re = /(([-.+a-zA-Z]+:\/\/)|(www\.))\S+[@:.]\S+/gu;
    const urlsInMessage = newErrorMessage.match(re) || [];
    urlsInMessage.forEach((url) => {
      try {
        const urlObj = new URL(url);
        const { hostname } = urlObj;
        if (
          !Object.values(ERROR_URL_ALLOWLIST).some(
            (allowedHostname) =>
              hostname === allowedHostname ||
              hostname.endsWith(`.${allowedHostname}`),
          )
        ) {
          newErrorMessage = newErrorMessage.replace(url, '**');
        }
      } catch (e) {
        newErrorMessage = newErrorMessage.replace(url, '**');
      }
    });
    return newErrorMessage;
  });
}

/**
 * Receives a Sentry event object and modifies it so that ethereum addresses are removed from
 * any of its error messages.
 *
 * @param {object} report - the report to modify
 */
function sanitizeAddressesFromErrorMessages(report) {
  rewriteErrorMessages(report, (errorMessage) => {
    const newErrorMessage = errorMessage.replace(/0x[A-Fa-f0-9]{40}/u, '0x**');
    return newErrorMessage;
  });
}

function simplifyErrorMessages(report) {
  rewriteErrorMessages(report, (errorMessage) => {
    // simplify ethjs error messages
    let simplifiedErrorMessage = extractEthjsErrorMessage(errorMessage);
    // simplify 'Transaction Failed: known transaction'
    if (
      simplifiedErrorMessage.indexOf(
        'Transaction Failed: known transaction',
      ) === 0
    ) {
      // cut the hash from the error message
      simplifiedErrorMessage = 'Transaction Failed: known transaction';
    }
    return simplifiedErrorMessage;
  });
}

function rewriteErrorMessages(report, rewriteFn) {
  // rewrite top level message
  if (typeof report.message === 'string') {
    report.message = rewriteFn(report.message);
  }
  // rewrite each exception message
  if (report.exception && report.exception.values) {
    report.exception.values.forEach((item) => {
      if (typeof item.value === 'string') {
        item.value = rewriteFn(item.value);
      }
    });
  }
}

function rewriteReportUrls(report) {
  if (report.request?.url) {
    // update request url
    report.request.url = toMetamaskUrl(report.request.url);
  }

  // update exception stack trace
  if (report.exception && report.exception.values) {
    report.exception.values.forEach((item) => {
      if (item.stacktrace) {
        item.stacktrace.frames.forEach((frame) => {
          frame.filename = toMetamaskUrl(frame.filename);
        });
      }
    });
  }
}

function toMetamaskUrl(origUrl) {
  if (!globalThis.location?.origin) {
    return origUrl;
  }

  const filePath = origUrl?.split(globalThis.location.origin)[1];
  if (!filePath) {
    return origUrl;
  }
  const metamaskUrl = `/metamask${filePath}`;
  return metamaskUrl;
}
